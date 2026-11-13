import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import { Image } from 'expo-image';
import * as Linking from 'expo-linking';

import motherBabyLogo from '@/assets/brand/mother-baby-heart-logo.png';
import { ActionButton } from '@/components/action-button';
import { AppIcon } from '@/components/app-icon';
import { AppText as Text } from '@/components/app-text';
import { useAppState, type AppLanguage, type ChatMessage, type Reminder } from '@/contexts/app-state';
import { classifyOfflineQuestion, getOfflineReply } from '@/utils/chatbot';
import { localeForLanguage, translate, useTranslation } from '@/utils/i18n';
import { messagingChannels } from '@/utils/messaging-channels';
import { getOnlineReply, isOnlineChatConfigured } from '@/utils/online-chatbot';
import { radius, space, typeScale, useAppTheme } from '@/theme';
import { pregnancyWeekFromDueDate } from '@/utils/pregnancy';

function getSuggestedPrompts(
  week: number | null,
  nextReminder: Reminder | undefined,
  language: AppLanguage,
) {
  const stagePrompt = week
    ? `What should I know about week ${week}?`
    : 'How can I estimate my pregnancy week?';
  const visitPrompt = nextReminder
    ? `How can I prepare for ${nextReminder.title}?`
    : 'What should I expect at an ANC visit?';
  const birthPrompt = week && week >= 28
    ? 'How can I prepare for birth?'
    : 'What foods and drinks are helpful?';

  const prompts = [
    stagePrompt,
    week
      ? 'What changes might I notice in my body?'
      : 'What should I expect during pregnancy?',
    visitPrompt,
    'Can I take medicines or supplements?',
    birthPrompt,
    'Which warning signs need urgent care?',
  ];
  return prompts.map((message) => ({ message, label: translate(language, message) }));
}

function getLocalReply(
  message: string,
  week: number | null,
  nextReminder?: Reminder,
  language: AppLanguage = 'en',
) {
  return getOfflineReply(message, week, nextReminder, language);
}

function createMessage(author: ChatMessage['author'], text: string): ChatMessage {
  return {
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    author,
    text,
    createdAt: new Date().toISOString(),
  };
}

export default function ChatScreen() {
  const theme = useAppTheme();
  const t = useTranslation();
  const { data, addChatMessages, clearChat } = useAppState();
  const [draft, setDraft] = useState('');
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [keyboardInset, setKeyboardInset] = useState(0);
  const [now] = useState(() => Date.now());
  const { height: windowHeight } = useWindowDimensions();
  const listRef = useRef<FlatList<ChatMessage>>(null);
  const week =
    pregnancyWeekFromDueDate(data.profile.dueDate) ?? data.profile.pregnancyWeek;
  const nextReminder = data.reminders
    .filter((reminder) => new Date(reminder.scheduledAt).getTime() >= now)
    .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt))[0];
  const prompts = getSuggestedPrompts(week, nextReminder, data.profile.language);
  useEffect(() => {
    if (Platform.OS !== 'android') return undefined;

    const showSubscription = Keyboard.addListener('keyboardDidShow', ({ endCoordinates }) => {
      setKeyboardInset(Math.max(0, windowHeight - endCoordinates.screenY));
    });
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardInset(0);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, [windowHeight]);
  const recentMessages = data.chatMessages.slice(-6).map(({ author, text }) => ({
    author,
    text: text.slice(-500),
  }));
  const whatsappUrl = messagingChannels.whatsappUrl;
  const smsUrl = messagingChannels.smsUrl;
  const openMessagingChannel = async (url: string, channel: string) => {
    try {
      await Linking.openURL(url);
      setError('');
    } catch {
      setError(t('Could not open {channel}. Check that it is available on your device.', {
        channel,
      }));
    }
  };
  const greeting: ChatMessage = {
    id: 'welcome',
    author: 'mama',
    text: t('Hi {name}, I’m MamaBot. What would you like help with today?', {
      name: data.profile.name.trim() || t('Mama'),
    }),
    createdAt: new Date(0).toISOString(),
  };
  const messages = data.chatMessages.length ? data.chatMessages : [greeting];

  const sendMessage = async (message = draft, replyMessage = message) => {
    const text = message.trim();
    if (!text || isSending) return;

    const isUrgent = classifyOfflineQuestion(text, data.profile.language).intent === 'urgent_symptoms';
    setIsSending(true);
    setError('');
    setStatus(
      isOnlineChatConfigured && !isUrgent
        ? t('Connecting to online AI…')
        : t('MamaBot is replying…'),
    );
    try {
      let reply = getLocalReply(replyMessage, week, nextReminder, data.profile.language);
      if (isOnlineChatConfigured && !isUrgent) {
        try {
          const onlineResult = await getOnlineReply(replyMessage.trim(), data.profile.language, {
            pregnancyWeek: week,
            recentMessages,
          });
          if (onlineResult.mode === 'online') {
            reply = onlineResult.reply;
            setStatus('');
          } else if (onlineResult.mode === 'safety') {
            reply = onlineResult.reply;
            setStatus(t('Safety-critical guidance was answered locally.'));
          } else {
            setStatus(t('Online AI is unavailable; this answer used on-device guidance.'));
          }
        } catch {
          setStatus(t('Could not reach MamaBot; this answer used on-device guidance.'));
        }
      } else if (isUrgent) {
        setStatus(t('Safety-critical guidance was answered locally.'));
      } else {
        setStatus('');
      }

      const saved = addChatMessages([
        createMessage('you', text),
        createMessage('mama', reply),
      ]);
      if (saved) {
        setDraft('');
      } else {
        setError(t('Your message could not be saved. It is still in the text box—please try again.'));
      }
    } finally {
      setIsSending(false);
    }
  };
  const confirmClearChat = () => {
    Alert.alert(t('Clear this chat?'), t('This removes the saved conversation from this device.'), [
      { text: t('Keep chat'), style: 'cancel' },
      {
        text: t('Clear chat'),
        style: 'destructive',
        onPress: () => {
          if (clearChat()) setError('');
          else setError(t('The conversation could not be cleared. Please try again.'));
        },
      },
    ]);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, paddingBottom: keyboardInset, backgroundColor: theme.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(item) => item.id}
        contentInsetAdjustmentBehavior="automatic"
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          padding: space.lg,
          paddingBottom: space.md,
        }}
        ListHeaderComponent={
          <View style={{ gap: space.md, paddingBottom: space.md }}>
            {whatsappUrl || smsUrl ? (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
                {whatsappUrl ? (
                  <ActionButton
                    title={t('WhatsApp')}
                    brandIcon="whatsapp"
                    variant="secondary"
                    onPress={() => void openMessagingChannel(whatsappUrl, t('WhatsApp'))}
                    style={{ flexGrow: 1, flexBasis: 140 }}
                  />
                ) : null}
                {smsUrl ? (
                  <ActionButton
                    title={t('Send by SMS')}
                    icon="sms"
                    variant="outline"
                    onPress={() => void openMessagingChannel(smsUrl, t('SMS'))}
                    style={{ flexGrow: 1, flexBasis: 140 }}
                  />
                ) : null}
              </View>
            ) : null}
            {data.chatMessages.length > 0 ? (
              <Pressable
                accessibilityRole="button"
                onPress={confirmClearChat}
                style={({ pressed }) => ({ alignSelf: 'flex-end', opacity: pressed ? 0.6 : 1 })}>
                <Text style={{ color: theme.primary, fontSize: typeScale.small, fontWeight: '700' }}>
                  {t('Clear chat')}
                </Text>
              </Pressable>
            ) : null}
          </View>
        }
        ListFooterComponent={
          <View style={{ gap: space.sm, paddingTop: space.sm, paddingBottom: space.lg }}>
            <Text style={{ color: theme.text, fontSize: typeScale.small, fontWeight: '800' }}>
              {week ? t('Suggested for around week {week}', { week }) : t('Suggested for you')}
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
              {prompts.map((prompt) => (
                <Pressable
                  accessibilityRole="button"
                  key={prompt.message}
                  onPress={() => sendMessage(prompt.label, prompt.message)}
                  style={({ pressed }) => ({
                    maxWidth: '100%',
                    minHeight: 40,
                    justifyContent: 'center',
                    paddingHorizontal: space.md,
                    paddingVertical: space.sm,
                    borderRadius: radius.lg,
                    borderCurve: 'continuous',
                    borderWidth: 1,
                    borderColor: theme.primarySoft,
                    backgroundColor: theme.surface,
                    opacity: pressed ? 0.76 : 1,
                  })}>
                  <Text style={{ color: theme.primary, fontSize: typeScale.small, fontWeight: '700' }}>
                    {prompt.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        }
        renderItem={({ item }) => {
          const isMama = item.author === 'mama';

          return (
            <View
              style={{
                flexDirection: isMama ? 'row' : 'row-reverse',
                alignItems: 'flex-end',
                gap: space.sm,
                marginBottom: space.md,
              }}>
              {isMama ? (
                <View
                  style={{
                    width: 34,
                    height: 34,
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    borderRadius: radius.full,
                    backgroundColor: theme.white,
                    borderWidth: 1,
                    borderColor: theme.line,
                  }}>
                  <Image
                    source={motherBabyLogo}
                    contentFit="contain"
                    accessibilityLabel="MamaBot assistant"
                    style={{ width: 30, height: 30 }}
                  />
                </View>
              ) : null}
              <View
                style={{
                  maxWidth: isMama ? '78%' : '88%',
                  flexShrink: 1,
                  gap: space.xs,
                }}>
                <Text
                  style={{
                    alignSelf: isMama ? 'flex-start' : 'flex-end',
                    color: isMama ? theme.primary : theme.muted,
                    fontSize: typeScale.caption,
                    fontWeight: '800',
                  }}>
                  {isMama ? 'MamaBot' : data.profile.name.trim() || t('You')}
                </Text>
                <View
                  style={{
                    paddingHorizontal: space.md,
                    paddingVertical: space.md,
                    gap: space.xs,
                    borderTopLeftRadius: isMama ? radius.sm : radius.lg,
                    borderTopRightRadius: isMama ? radius.lg : radius.sm,
                    borderBottomLeftRadius: radius.lg,
                    borderBottomRightRadius: radius.lg,
                    borderCurve: 'continuous',
                    backgroundColor: isMama ? theme.surface : theme.primary,
                    borderWidth: isMama ? 1 : 0,
                    borderColor: theme.line,
                    boxShadow: isMama ? '0 1px 3px rgba(33, 27, 56, 0.06)' : undefined,
                  }}>
                  <Text
                    selectable
                    style={{
                      color: isMama ? theme.text : theme.white,
                      fontSize: typeScale.body,
                      lineHeight: 22,
                    }}>
                    {item.text}
                  </Text>
                  {item.id !== 'welcome' ? (
                    <Text
                      style={{
                        alignSelf: 'flex-end',
                        color: isMama ? theme.muted : theme.white,
                        fontSize: typeScale.caption,
                        opacity: 0.82,
                      }}>
                      {new Date(item.createdAt).toLocaleTimeString(localeForLanguage(data.profile.language), {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                  ) : null}
                </View>
              </View>
            </View>
          );
        }}
        style={{ flex: 1 }}
      />

      {error ? (
        <Text
          accessibilityLiveRegion="polite"
          style={{ paddingHorizontal: space.lg, color: theme.danger, fontSize: typeScale.small }}>
          {error}
        </Text>
      ) : null}
      {status ? (
        <View
          accessibilityLiveRegion="polite"
          style={{
            minHeight: 34,
            paddingHorizontal: space.lg,
            flexDirection: 'row',
            alignItems: 'center',
            gap: space.sm,
          }}>
          {isSending ? <ActivityIndicator size="small" color={theme.primary} /> : null}
          <Text style={{ color: theme.muted, fontSize: typeScale.caption }}>{status}</Text>
        </View>
      ) : null}
      <View
        style={{
          paddingHorizontal: space.lg,
          paddingTop: space.sm,
          paddingBottom: space.md,
          flexDirection: 'row',
          alignItems: 'center',
          gap: space.sm,
          borderTopWidth: 1,
          borderTopColor: theme.line,
          backgroundColor: theme.background,
        }}>
        <TextInput
          accessibilityLabel={t('Message MamaBot')}
          value={draft}
          onChangeText={setDraft}
          onSubmitEditing={() => void sendMessage()}
          placeholder={t('Ask MamaBot…')}
          placeholderTextColor={theme.muted}
          returnKeyType="send"
          multiline
          maxLength={500}
          style={{
            flex: 1,
            minHeight: 48,
            maxHeight: 120,
            paddingHorizontal: space.lg,
            paddingVertical: space.md,
            borderRadius: radius.full,
            borderCurve: 'continuous',
            backgroundColor: theme.surface,
            color: theme.text,
            fontFamily: 'Nunito_400Regular',
            fontSize: typeScale.body,
          }}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('Send message')}
          accessibilityState={{ disabled: !draft.trim() || isSending }}
          disabled={!draft.trim() || isSending}
          onPress={() => void sendMessage()}
          style={({ pressed }) => ({
            width: 48,
            height: 48,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: radius.full,
            backgroundColor: draft.trim() ? theme.primary : theme.line,
            opacity: pressed ? 0.8 : 1,
          })}>
          <AppIcon name="arrow" color={theme.white} size={20} />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
