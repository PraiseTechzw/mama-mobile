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
  const languageScores: Record<AppLanguage, number> = { en: 0, sn: 0, nd: 0 };
  const intentScores = chatbotIntents.intents.map((intent, order) => {
    let score = 0;
    for (const language of languages) {
      for (const phrase of intent.patterns[language]) {
        const normalizedPhrase = normalizeMessage(phrase);
        if (query.includes(normalizedPhrase)) {
          const evidence = Math.max(1, normalizedPhrase.split(' ').length);
          score += evidence + normalizedPhrase.length / 100;
          languageScores[language] += evidence;
        }
      }
    }
    return { intent, order, score };
  });

  const rankedIntents = intentScores.sort((left, right) => {
    if (left.intent.id === 'urgent_symptoms' && left.score > 0) return -1;
    if (right.intent.id === 'urgent_symptoms' && right.score > 0) return 1;
    return right.score - left.score || left.order - right.order;
  });
  const matchedIntent = rankedIntents[0]?.score ? rankedIntents[0].intent : undefined;
  const bestLanguageScore = Math.max(...Object.values(languageScores));
  const tiedLanguages = languages.filter(
    (language) => languageScores[language] === bestLanguageScore,
  );
  const detectedLanguage =
    prefixed?.language ??
    (bestLanguageScore === 0
      ? preferredLanguage
      : tiedLanguages.includes(preferredLanguage)
        ? preferredLanguage
        : tiedLanguages[0]);

  return {
    intent: matchedIntent?.id ?? 'fallback',
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
  const { intent, language: replyLanguage } = classifyOfflineQuestion(message, language);
  const responseLanguage = replyLanguage;
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
