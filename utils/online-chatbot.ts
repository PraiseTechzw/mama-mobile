import type { AppLanguage } from '@/contexts/app-state';

export type OnlineReply = {
  reply: string;
  mode: 'online' | 'offline' | 'safety';
};

export type OnlineChatContext = {
  pregnancyWeek: number | null;
  recentMessages: { author: 'mama' | 'you'; text: string }[];
};

const backendUrl = (
  process.env.EXPO_PUBLIC_MAMABOT_API_URL?.trim() || 'https://mama-backend-fg8v.onrender.com'
).replace(/\/+$/, '');

export const isOnlineChatConfigured =
  /^https:\/\/[^/]+(?:\/.*)?$/i.test(backendUrl) ||
  /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?(?:\/.*)?$/i.test(backendUrl);

export async function getOnlineReply(
  message: string,
  language: AppLanguage,
  context: OnlineChatContext,
  forceLanguage = false,
): Promise<OnlineReply> {
  if (!isOnlineChatConfigured) {
    throw new Error('Online MamaBot service is not configured.');
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25_000);
  try {
    const response = await fetch(`${backendUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        language,
        force_language: forceLanguage,
        use_online: true,
        context: {
          pregnancy_week: context.pregnancyWeek,
          recent_messages: context.recentMessages,
        },
      }),
      signal: controller.signal,
    });
    if (!response.ok) {
      throw new Error(`MamaBot service returned ${response.status}.`);
    }

    const data: unknown = await response.json();
    if (
      typeof data !== 'object' ||
      data === null ||
      !('reply' in data) ||
      typeof data.reply !== 'string' ||
      !data.reply.trim() ||
      !('mode' in data) ||
      (data.mode !== 'online' && data.mode !== 'offline' && data.mode !== 'safety')
    ) {
      throw new Error('MamaBot service returned an invalid response.');
    }

    return { reply: data.reply, mode: data.mode };
  } finally {
    clearTimeout(timeout);
  }
}
