import { useEffect, useRef, useState } from 'react';
import { router } from 'expo-router';
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
import { detectChatAction } from '@/utils/chat-actions';
import { classifyOfflineQuestion, getOfflineReply } from '@/utils/chatbot';
import {
  facilityRecordYearRange,
  getNearestHealthcareFacilities,
} from '@/utils/facilities';
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
    : 'What happens during a pregnancy check-up?';
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
    'Show my reminders',
    'Set a reminder',
    'Find health facilities near me',
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

function createMessage(
  author: ChatMessage['author'],
  text: string,
  localOnly = false,
): ChatMessage {
  return {
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    author,
    text,
    createdAt: new Date().toISOString(),
    localOnly,
  };
}

function formatInlineMarkdown(text: string, color: string) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, index) => {
    const isBold = part.startsWith('**') && part.endsWith('**');
    return (
      <Text
        key={`${index}-${part}`}
        style={{ color, fontWeight: isBold ? '800' : '400' }}>
        {isBold ? part.slice(2, -2) : part}
      </Text>
    );
  });
}

function FormattedMessage({ text, color }: { text: string; color: string }) {
  return (
    <View style={{ gap: space.xs }}>
      {text.split('\n').map((rawLine, index) => {
        const line = rawLine.trim();
        if (!line) return <View key={`space-${index}`} style={{ height: 4 }} />;
        const bullet = line.match(/^[-*]\s+(.*)$/);
        const numbered = line.match(/^(\d+[.)])\s+(.*)$/);
        const heading = line.match(/^#{1,3}\s+(.*)$/);
        const content = bullet?.[1] ?? numbered?.[2] ?? heading?.[1] ?? line;
        const prefix = bullet ? '•' : numbered?.[1] ?? '';

        return (
          <View
            key={`${index}-${line}`}
            style={{ flexDirection: 'row', alignItems: 'flex-start', gap: space.xs }}>
            {prefix ? (
              <Text style={{ color, fontSize: typeScale.body, lineHeight: 22 }}>
                {prefix}
              </Text>
            ) : null}
            <Text
              style={{
                flex: 1,
                color,
                fontSize: typeScale.body,
                lineHeight: 22,
                fontWeight: heading ? '800' : '400',
              }}>
              {formatInlineMarkdown(content, color)}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

export default function ChatScreen() {
  const theme = useAppTheme();
  const t = useTranslation();
  const { data, addChatMessages, clearChat } = useAppState();
  const [draft, setDraft] = useState('');
  const [error, setError] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [keyboardInset, setKeyboardInset] = useState(0);
  const [now] = useState(() => Date.now());
  const { height: windowHeight } = useWindowDimensions();
  const listRef = useRef<FlatList<ChatMessage>>(null);
  const initializedScroll = useRef(false);
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
  useEffect(() => {
    if (!initializedScroll.current) {
      initializedScroll.current = true;
      if (data.chatMessages.length > 0) {
        requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: false }));
      }
      return;
    }

    if (isSending || data.chatMessages.length > 0) {
      requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
    }
  }, [data.chatMessages.length, isSending]);
  const recentMessages = data.chatMessages
    .filter((message) => !message.localOnly)
    .slice(-6)
    .map(({ author, text }) => ({ author, text: text.slice(-500) }));
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

  const saveExchange = (userText: string, reply: string, localOnly = false) => {
    const saved = addChatMessages([
      createMessage('you', userText, localOnly),
      createMessage('mama', reply, localOnly),
    ]);
    if (saved) {
      setDraft('');
    } else {
      setError(t('Your message could not be saved. It is still in the text box—please try again.'));
    }
    return saved;
  };

  const formatUpcomingReminders = () => {
    const upcoming = data.reminders
      .filter((reminder) => new Date(reminder.scheduledAt).getTime() >= now)
      .sort((left, right) => left.scheduledAt.localeCompare(right.scheduledAt))
      .slice(0, 5);
    if (!upcoming.length) {
      return t('You don’t have any upcoming reminders saved on this phone. I can open the reminder form for you.');
    }
    const locale = localeForLanguage(data.profile.language);
    return [
      t('Here are your upcoming reminders:'),
      ...upcoming.map((reminder) => {
        const date = new Date(reminder.scheduledAt);
        return `- **${reminder.title}** — ${date.toLocaleDateString(locale)} ${date.toLocaleTimeString(locale, {
          hour: '2-digit',
          minute: '2-digit',
        })}`;
      }),
      '',
      t('Your reminders stay on this phone and are not sent to online AI.'),
    ].join('\n');
  };

  const getNearbyFacilityReply = async () => {
    const Location = await import('expo-location');
    const permission = await Location.requestForegroundPermissionsAsync();
    if (permission.status !== 'granted') {
      return t('Location access was not granted. Please type a town or district, or search facilities in Pregnancy Info.');
    }

    const location = await Location.getCurrentPositionAsync({});
    const nearest = getNearestHealthcareFacilities(
      location.coords.latitude,
      location.coords.longitude,
      5,
    );
    if (!nearest.length) {
      return t('I couldn’t find facilities with location coordinates in the saved list. Search by district in Pregnancy Info or ask a local health worker.');
    }

    const facilityLines = nearest.map(({ facility, distanceKm }) => {
      const area = [facility.district, facility.province].filter(Boolean).join(', ');
      return `- **${facility.name}** — ${area} · ${distanceKm.toFixed(1)} km`;
    });
    const sourceYears = t('Facility records are from {startYear}–{endYear}', {
      startYear: facilityRecordYearRange.startYear,
      endYear: facilityRecordYearRange.endYear,
    });
    return [
      `**${t('Closest facilities in the saved Zimbabwe list')}**`,
      ...facilityLines,
      '',
      t('Distances are approximate. {sourceYears} and do not confirm a facility is currently open. Please confirm locally before traveling. Your location was checked on this phone only.', {
        sourceYears,
      }),
    ].join('\n');
  };

  const sendMessage = async (message = draft, replyMessage = message) => {
    const text = replyMessage.trim();
    if (!text || isSending) return;

    const action = detectChatAction(text);
    if (action === 'show_reminders') {
      setError('');
      saveExchange(message.trim(), formatUpcomingReminders(), true);
      return;
    }
    if (action === 'create_reminder') {
      setError('');
      const saved = saveExchange(
        message.trim(),
        t('I’ll open the reminder form. Check the title, choose the correct date and time, then save it there. Nothing has been saved yet.'),
        true,
      );
      if (saved) router.push('/reminder-form');
      return;
    }

    const isUrgent = classifyOfflineQuestion(text, data.profile.language).intent === 'urgent_symptoms';
    if (action === 'facilities_nearby' && !isUrgent) {
      setIsSending(true);
      setError('');
      try {
        const result = await getNearbyFacilityReply();
        saveExchange(message.trim(), result, true);
      } catch (locationError) {
        setError(
          locationError instanceof Error
            ? `${t('Your location could not be determined. Try again or search facilities in Pregnancy Info.')} ${locationError.message}`
            : t('Your location could not be determined. Try again or search facilities in Pregnancy Info.'),
        );
      } finally {
        setIsSending(false);
      }
      return;
    }

    setIsSending(true);
    setError('');
    try {
      const isSuggestedPrompt = message !== replyMessage;
      const localQuestion = isSuggestedPrompt
        ? `${data.profile.language}: ${replyMessage}`
        : replyMessage;
      let reply = getLocalReply(localQuestion, week, nextReminder, data.profile.language);
      if (isOnlineChatConfigured && !isUrgent) {
        try {
          const onlineResult = await getOnlineReply(replyMessage.trim(), data.profile.language, {
            pregnancyWeek: week,
            recentMessages,
          }, isSuggestedPrompt);
          if (onlineResult.mode === 'online') {
            reply = onlineResult.reply;
          } else if (onlineResult.mode === 'safety') {
            reply = onlineResult.reply;
          }
        } catch {
          setError(t('Could not get a reply right now. Please try again.'));
        }
      }

      saveExchange(message.trim(), reply);
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
          data.chatMessages.length === 0 || isSending ? (
            <View>
              {data.chatMessages.length === 0 ? (
                <View style={{ gap: space.sm, paddingTop: space.sm, paddingBottom: space.lg }}>
                  <Text style={{ color: theme.text, fontSize: typeScale.small, fontWeight: '800' }}>
                    {week ? t('Suggested for around week {week}', { week }) : t('Suggested for you')}
                  </Text>
                  <Text style={{ color: theme.muted, fontSize: typeScale.caption }}>
                    {t('Ask in your own words too — these are just ideas.')}
                  </Text>
                  <FlatList
                    horizontal
                    data={prompts}
                    keyExtractor={(prompt) => prompt.message}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ gap: space.sm, paddingRight: space.lg }}
                    renderItem={({ item: prompt }) => (
                      <Pressable
                        accessibilityRole="button"
                        onPress={() => sendMessage(prompt.label, prompt.message)}
                        style={({ pressed }) => ({
                          maxWidth: 260,
                          minHeight: 44,
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
                        <Text
                          style={{
                            color: theme.primary,
                            fontSize: typeScale.small,
                            fontWeight: '700',
                          }}>
                          {prompt.label}
                        </Text>
                      </Pressable>
                    )}
                  />
                </View>
              ) : null}
              {isSending ? (
                <View
                  accessibilityLiveRegion="polite"
                  style={{
                    flexDirection: 'row',
                    alignItems: 'flex-end',
                    gap: space.sm,
                    paddingTop: space.sm,
                    paddingBottom: space.lg,
                  }}>
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
                  <View
                    style={{
                      minHeight: 44,
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: space.sm,
                      paddingHorizontal: space.md,
                      paddingVertical: space.sm,
                      borderTopLeftRadius: radius.sm,
                      borderTopRightRadius: radius.lg,
                      borderBottomLeftRadius: radius.lg,
                      borderBottomRightRadius: radius.lg,
                      borderCurve: 'continuous',
                      backgroundColor: theme.surface,
                      borderWidth: 1,
                      borderColor: theme.line,
                    }}>
                    <ActivityIndicator size="small" color={theme.primary} />
                    <Text style={{ color: theme.muted, fontSize: typeScale.small }}>
                      {t('MamaBot is replying…')}
                    </Text>
                  </View>
                </View>
              ) : null}
            </View>
          ) : undefined
        }
        renderItem={({ item }) => {
          const isMama = item.author === 'mama';

          return (
            <View
              style={{
                flexDirection: 'row',
                justifyContent: isMama ? 'flex-start' : 'flex-end',
                alignItems: 'flex-end',
                gap: space.sm,
                marginBottom: space.sm,
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
                }}>
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
                    <FormattedMessage
                      text={item.text}
                      color={isMama ? theme.text : theme.white}
                    />
                    {item.id !== 'welcome' ? (
                      <Text
                        style={{
                          alignSelf: 'flex-end',
                          color: isMama ? theme.muted : theme.white,
                          fontSize: typeScale.caption,
                          opacity: 0.82,
                        }}>
                        {new Date(item.createdAt).toLocaleTimeString(
                          localeForLanguage(data.profile.language),
                          {
                            hour: '2-digit',
                            minute: '2-digit',
                          },
                        )}
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
            borderWidth: 1,
            borderColor: theme.line,
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
