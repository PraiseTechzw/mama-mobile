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
  return message.trim().toLowerCase();
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

export function classifyOfflineQuestion(message: string) {
  const normalized = normalizeMessage(message);
  const prefixed = findLanguagePrefix(normalized);
  const query = prefixed?.message ?? normalized;
  const scores: Record<AppLanguage, number> = { en: 0, sn: 0, nd: 0 };

  for (const intent of chatbotIntents.intents) {
    for (const language of languages) {
      scores[language] += intent.patterns[language].filter((phrase) =>
        query.includes(phrase),
      ).length;
    }
  }

  const detectedLanguage =
    prefixed?.language ??
    languages.reduce((best, language) =>
      scores[language] > scores[best] ? language : best,
    'en');
  const matchedIntent = chatbotIntents.intents.find((intent) =>
    languages.some((language) =>
      intent.patterns[language].some((phrase) => query.includes(phrase)),
    ),
  );

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
  const { intent } = classifyOfflineQuestion(message);
  let responseId = intent;
  const values: Record<string, string> = {};

  if (intent === 'pregnancy_week') {
    responseId = week ? 'pregnancy_week_saved' : 'pregnancy_week_missing';
    if (week) {
      const trimesterId =
        week <= 13 ? 'ordinal_first' : week <= 27 ? 'ordinal_second' : 'ordinal_third';
      values.week = String(week);
      values.trimester = chatbotResponses[trimesterId][language];
    }
  } else if (intent === 'pregnancy_basics') {
    if (week) {
      values.savedWeek = ` ${interpolate(chatbotResponses.saved_week[language], {
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
        localeForLanguage(language),
      );
    } else {
      responseId = 'anc_visit';
    }
  } else if (intent === 'birth') {
    responseId = week && week < 28 ? 'birth_early' : 'birth';
  }

  const safeResponseId = isResponseId(responseId) ? responseId : 'fallback';
  return interpolate(chatbotResponses[safeResponseId][language], values);
}
