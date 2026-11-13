import chatbotIntents from '@/shared/chatbot-intents.json';
import chatbotResponses from '@/shared/chatbot-responses.json';
import type { AppLanguage, Reminder } from '@/contexts/app-state';
import { formatDate } from '@/utils/pregnancy';

const languages: AppLanguage[] = ['en', 'sn', 'nd'];

type ResponseId = keyof typeof chatbotResponses;

function localeForLanguage(language: AppLanguage) {
  return language === 'sn' ? 'sn-ZW' : language === 'nd' ? 'nd-ZW' : 'en-ZW';
}

function isResponseId(value: string): value is ResponseId {
  return Object.prototype.hasOwnProperty.call(chatbotResponses, value);
}

function normalizeMessage(message: string) {
  return message
    .trim()
    .toLowerCase()
    .replace(/[.,!?;:()[\]{}"“”]/g, ' ')
    .replace(/\s+/g, ' ');
}

function tokenize(message: string) {
  return message.toLowerCase().match(/[a-z0-9]+/g) ?? [];
}

function termFrequencies(tokens: string[]) {
  const frequencies = new Map<string, number>();
  tokens.forEach((token) => frequencies.set(token, (frequencies.get(token) ?? 0) + 1));
  return frequencies;
}

const searchDocuments = chatbotIntents.intents.flatMap((intent, order) =>
  languages.map((language) => {
    const tokens = tokenize(intent.patterns[language].join(' '));
    return {
      intentId: intent.id,
      order,
      language,
      frequencies: termFrequencies(tokens),
      length: tokens.length,
    };
  }),
);
const documentFrequencies = termFrequencies(
  searchDocuments.flatMap((document) => [...document.frequencies.keys()]),
);
const averageDocumentLength =
  searchDocuments.reduce((total, document) => total + document.length, 0) /
  Math.max(1, searchDocuments.length);
const bm25K1 = 1.2;
const bm25B = 0.75;

function findLanguagePrefix(message: string) {
  for (const language of languages) {
    const prefix = chatbotIntents.languagePrefixes[language].find((candidate) =>
      message.startsWith(candidate),
    );
    if (prefix) {
      return { language, message: message.slice(prefix.length).trim() };
    }
  }
  return null;
}

export function classifyOfflineQuestion(
  message: string,
  preferredLanguage: AppLanguage = 'en',
) {
  const normalized = normalizeMessage(message);
  const prefixed = findLanguagePrefix(normalized);
  const query = prefixed?.message ?? normalized;
  const urgentIntent = chatbotIntents.intents.find(
    (intent) => intent.id === 'urgent_symptoms',
  );
  const urgentLanguageScores = languages.reduce<Record<AppLanguage, number>>(
    (scores, language) => {
      scores[language] =
        urgentIntent?.patterns[language].filter((phrase) =>
          query.includes(normalizeMessage(phrase)),
        ).length ?? 0;
      return scores;
    },
    { en: 0, sn: 0, nd: 0 },
  );
  const bestUrgentScore = Math.max(...Object.values(urgentLanguageScores));
  if (bestUrgentScore > 0) {
    const urgentLanguages = languages.filter(
      (language) => urgentLanguageScores[language] === bestUrgentScore,
    );
    return {
      intent: 'urgent_symptoms',
      language:
        prefixed?.language ??
        (urgentLanguages.includes(preferredLanguage) ? preferredLanguage : urgentLanguages[0]),
      message: query,
    };
  }

  const queryFrequencies = termFrequencies(tokenize(query));
  if (queryFrequencies.size === 0) {
    return {
      intent: 'fallback',
      language: prefixed?.language ?? preferredLanguage,
      message: query,
    };
  }

  const intentScores = new Map<
    string,
    { order: number; scores: Record<AppLanguage, number> }
  >();
  for (const document of searchDocuments) {
    let score = 0;
    for (const [token, queryFrequency] of queryFrequencies) {
      const frequency = document.frequencies.get(token) ?? 0;
      if (!frequency) continue;

      const documentFrequency = documentFrequencies.get(token) ?? 0;
      const inverseFrequency = Math.log(
        1 + (searchDocuments.length - documentFrequency + 0.5) / (documentFrequency + 0.5),
      );
      const denominator =
        frequency +
        bm25K1 *
          (1 - bm25B + (bm25B * document.length) / averageDocumentLength);
      score +=
        (inverseFrequency * frequency * (bm25K1 + 1) / denominator) *
        Math.min(queryFrequency, 2);
    }

    const intent = chatbotIntents.intents[document.order];
    for (const phrase of intent.patterns[document.language]) {
      const normalizedPhrase = normalizeMessage(phrase);
      if (normalizedPhrase && query.includes(normalizedPhrase)) {
        score += 1 + Math.min(normalizedPhrase.split(' ').length, 3) * 0.25;
      }
    }

    const scores = intentScores.get(document.intentId) ?? {
      order: document.order,
      scores: { en: 0, sn: 0, nd: 0 },
    };
    scores.scores[document.language] = score;
    intentScores.set(document.intentId, scores);
  }

  const rankedIntents = [...intentScores.entries()].sort(
    ([, left], [, right]) =>
      Math.max(...Object.values(right.scores)) -
        Math.max(...Object.values(left.scores)) ||
      left.order - right.order,
  );
  const [matchedIntent, ranked] = rankedIntents[0] ?? [];
  const bestIntentScore = ranked ? Math.max(...Object.values(ranked.scores)) : 0;
  const languageScores = ranked?.scores ?? { en: 0, sn: 0, nd: 0 };
  const bestLanguageScore = Math.max(...Object.values(languageScores));
  const tiedLanguages = languages.filter(
    (language) => languageScores[language] === bestLanguageScore,
  );
  const detectedLanguage =
    prefixed?.language ??
    (bestIntentScore === 0
      ? preferredLanguage
      : tiedLanguages.includes(preferredLanguage)
        ? preferredLanguage
        : tiedLanguages[0]);

  return {
    intent: bestIntentScore > 0 ? matchedIntent : 'fallback',
    language: detectedLanguage,
    message: query,
  };
}

function interpolate(template: string, values: Record<string, string>) {
  return template.replace(/\{(\w+)\}/g, (_placeholder, key: string) => values[key] ?? '');
}

export function getOfflineReply(
  message: string,
  week: number | null,
  nextReminder: Reminder | undefined,
  language: AppLanguage,
) {
  const { intent } = classifyOfflineQuestion(message, language);
  const responseLanguage = language;
  let responseId = intent;
  const values: Record<string, string> = {};

  if (intent === 'pregnancy_week') {
    responseId = week ? 'pregnancy_week_saved' : 'pregnancy_week_missing';
    if (week) {
      const trimesterId =
        week <= 13 ? 'ordinal_first' : week <= 27 ? 'ordinal_second' : 'ordinal_third';
      values.week = String(week);
      values.trimester = chatbotResponses[trimesterId][responseLanguage];
    }
  } else if (intent === 'pregnancy_basics') {
    if (week) {
      values.savedWeek = ` ${interpolate(chatbotResponses.saved_week[responseLanguage], {
        week: String(week),
      })}`;
    }
  } else if (intent === 'visit_preparation') {
    if (nextReminder) {
      responseId = 'next_reminder';
      values.title = nextReminder.title;
      values.date = formatDate(
        nextReminder.scheduledAt,
        undefined,
        localeForLanguage(responseLanguage),
      );
    } else {
      responseId = 'anc_visit';
    }
  } else if (intent === 'birth') {
    responseId = week && week < 28 ? 'birth_early' : 'birth';
  }

  const safeResponseId = isResponseId(responseId) ? responseId : 'fallback';
  return interpolate(chatbotResponses[safeResponseId][responseLanguage], values);
}
