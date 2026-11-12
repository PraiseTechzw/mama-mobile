import { useRef, useState } from 'react';
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  TextInput,
  View,
} from 'react-native';
import { Image } from 'expo-image';

import motherBabyLogo from '@/assets/brand/mother-baby-heart-logo.png';
import { AppIcon } from '@/components/app-icon';
import { AppText as Text } from '@/components/app-text';
import { useAppState, type AppLanguage, type ChatMessage, type Reminder } from '@/contexts/app-state';
import { localeForLanguage, translate, useTranslation } from '@/utils/i18n';
import { radius, space, typeScale, useAppTheme } from '@/theme';
import { formatDate, pregnancyWeekFromDueDate } from '@/utils/pregnancy';

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
  const query = message.toLowerCase();
  const reply = (text: string, values?: Record<string, string | number>) =>
    translate(language, text, values);
  const urgentSymptoms =
    /\b(bleeding|severe pain|severe headache|blurred vision|blurry vision|difficulty breathing|trouble breathing|shortness of breath|fainting|seizure|high fever|fluid leaking|water broke|baby not moving|baby hasn.t moved|less baby movement|reduced movement|movement has changed|regular contractions before 37 weeks)\b/;

  if (urgentSymptoms.test(query)) {
    return reply('This could need urgent medical attention. Please contact your local emergency service or go to the nearest health facility now. Do not wait for a reply in this app. If you can, ask someone nearby to help you get care.');
  }
  if (/\b(warning signs|danger signs|urgent care|when .* seek help)\b/.test(query)) {
    return reply('Seek urgent in-person care for heavy bleeding, severe abdominal pain, a severe headache or blurred vision, difficulty breathing, fainting or seizures, high fever, fluid leaking, or reduced baby movement. Contact your local emergency service or nearest health facility now; do not wait for a reply in this app.');
  }
  if (/\b(week \d+|pregnancy week|how far along|estimate.*week|week.*estimate|due date|pregnancy stage|trimester)\b/.test(query)) {
    return week
      ? reply('Your saved profile puts you at around week {week}, in the {trimester} trimester. Pregnancy dates can be adjusted by your provider, so use your ANC visits to confirm your dates and ask which care is right for this stage.', {
          week,
          trimester: week <= 13 ? reply('first') : week <= 27 ? reply('second') : reply('third'),
        })
      : reply('I don’t have your pregnancy dates yet. Your ANC provider can help estimate how far along you are. You can also add your due date or pregnancy week in your profile for more tailored suggestions.');
  }
  if (/\b(expect during pregnancy|pregnancy basics|what happens during pregnancy)\b/.test(query)) {
    return reply('Pregnancy is commonly described in three trimesters: weeks 1–13, 14–27, and 28 onward. Bodies and pregnancies differ, so use regular ANC visits to discuss changes, check-ups, nutrition, medicines, and questions for your stage.{savedWeek} Your provider can confirm your dates and give advice for your situation.', {
      savedWeek: week ? ` ${reply('Your saved profile estimates around week {week}.', { week })}` : '',
    });
  }
  if (/\b(prepare|preparation|next visit|appointment)\b/.test(query) && nextReminder) {
    return reply('Your next saved reminder is “{title}” on {date}. You could note any questions or symptoms and bring your medicines or supplements list. Your clinic can tell you if you need to bring anything else.', {
      title: nextReminder.title,
      date: formatDate(nextReminder.scheduledAt, undefined, localeForLanguage(language)),
    });
  }
  if (/\b(birth plan|prepare for birth|labor|labour|delivery|giving birth)\b/.test(query)) {
    return week && week < 28
      ? reply('It is okay to start collecting questions about birth early. As your pregnancy progresses, ask your ANC provider about your birth plan, where to go when labour starts, transport, support people, and what to do if a concern comes up.')
      : reply('Talk with your ANC provider about where to give birth, how to get there, who can support you, what to bring, and how to contact the facility. Plans may need to change, so ask what to do if labour starts unexpectedly or you have a warning sign.');
  }
  if (/\b(body|changes|nausea|morning sickness|heartburn|back pain|tired|fatigue|swelling|discomfort)\b/.test(query)) {
    return reply('Pregnancy can bring changes such as nausea, tiredness, heartburn, or back discomfort, and experiences differ. Mention symptoms at ANC, especially if they are severe, new, worsening, or worrying. Sudden swelling with a severe headache or vision changes needs urgent assessment.');
  }
  if (/\b(anc|antenatal|appointment|clinic visit|check.?up|provider)\b/.test(query)) {
    return reply('At an antenatal care (ANC) visit, a health worker can talk with you about your health, check on you and your baby, answer questions, and plan care. The checks and visit schedule can vary, so ask your clinic what is planned, when to return, and what to bring. It can help to write down questions and medicines you take.');
  }
  if (/\b(test|scan|ultrasound|blood pressure|blood test|check my baby)\b/.test(query)) {
    return reply('The checks offered at ANC depend on your stage of pregnancy, health history, and local care guidance. Ask what each check is for, what the result means, and when you will hear back. Your provider can explain which tests or scans are recommended for you.');
  }
  if (/\b(food|eat|nutrition|water|drink|meal|diet)\b/.test(query)) {
    return reply('Aim for a varied diet with nourishing foods available to you, and drink safe water. Food needs can differ, so ask your ANC provider about local nutrition support, food safety, or any dietary needs. Avoid starting restrictive diets or supplements without professional advice.');
  }
  if (/\b(medicine|medication|tablet|supplement|vitamin)\b/.test(query)) {
    return reply('Check with a qualified health worker or pharmacist before starting, stopping, or changing any medicine, vitamin, or supplement during pregnancy. Do not stop a prescribed medicine without advice. Bring the package or a list of what you take to ANC.');
  }
  if (/\b(exercise|physical activity|walking|rest|sleep)\b/.test(query)) {
    return reply('If you feel well, gentle everyday movement and rest when needed can support general wellbeing. What is suitable depends on your health and pregnancy; ask your ANC provider before starting a new or strenuous activity, especially if you have symptoms or have been advised to limit activity.');
  }
  if (/\b(alcohol|smoking|smoke|tobacco|vaping|drug use)\b/.test(query)) {
    return reply('Avoiding alcohol, tobacco, vaping, and non-prescribed drugs is the safest choice during pregnancy. If stopping is difficult, tell your ANC provider without fear of judgement; they can help you find support. Ask a health worker before using any medicine or substance.');
  }
  if (/\b(stress|anxious|anxiety|sad|depressed|mental health|feel overwhelmed)\b/.test(query)) {
    return reply('It is okay to ask for support with stress, worry, or low mood during pregnancy. Consider telling someone you trust and speaking with your ANC provider, who can help connect you with support. If you may harm yourself or are in immediate danger, contact local emergency services or go to a health facility now.');
  }
  if (/\b(baby|growth|develop|movement|moving|kick)\b/.test(query)) {
    return reply('Your baby grows and changes throughout pregnancy, and your ANC team can explain what to expect at your stage. Once you are feeling regular movements, contact your maternity care team promptly if movement is noticeably reduced or different from your baby’s usual pattern; do not wait until the next visit.');
  }
  if (/\b(labou?r signs|water breaking|waters break|contractions|labou?r starting)\b/.test(query)) {
    return reply('Signs and timing of labour can differ. Ask your maternity team when and where to contact them, especially if you are before 37 weeks. Contact a health facility urgently for fluid leaking, bleeding, severe pain, or a noticeable change in your baby’s movement.');
  }
  if (/\b(question|ask|prepare|visit|what can i ask)\b/.test(query)) {
    return reply('You can ask your provider how your pregnancy is progressing, which checks are planned, what symptoms to watch for, whether your medicines are suitable, when to return, and how to get help between visits. Write down any personal concerns so you can discuss them.');
  }
  return reply('I’m an offline information guide and don’t have a specific answer for that. Please ask your ANC provider for advice about your situation. If you have severe pain, heavy bleeding, trouble breathing, or another urgent concern, seek in-person care now.');
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
  const [now] = useState(() => Date.now());
  const listRef = useRef<FlatList<ChatMessage>>(null);
  const week =
    pregnancyWeekFromDueDate(data.profile.dueDate) ?? data.profile.pregnancyWeek;
  const nextReminder = data.reminders
    .filter((reminder) => new Date(reminder.scheduledAt).getTime() >= now)
    .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt))[0];
  const prompts = getSuggestedPrompts(week, nextReminder, data.profile.language);
  const greeting: ChatMessage = {
    id: 'welcome',
    author: 'mama',
    text: t('Hi {name}, I’m MamaBot. What would you like help with today?', {
      name: data.profile.name.trim() || t('Mama'),
    }),
    createdAt: new Date(0).toISOString(),
  };
  const messages = data.chatMessages.length ? data.chatMessages : [greeting];

  const sendMessage = (message = draft, replyMessage = message) => {
    const text = message.trim();
    if (!text) return;

    const saved = addChatMessages([
      createMessage('you', text),
      createMessage('mama', getLocalReply(replyMessage, week, nextReminder, data.profile.language)),
    ]);
    if (saved) {
      setDraft('');
      setError('');
    } else {
      setError(t('Your message could not be saved. It is still in the text box—please try again.'));
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
      style={{ flex: 1, backgroundColor: theme.background }}
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
            <View
              style={{
                paddingHorizontal: space.md,
                paddingVertical: space.sm,
                flexDirection: 'row',
                alignItems: 'center',
                gap: space.sm,
                borderRadius: radius.full,
                backgroundColor: theme.surfaceSoft,
              }}>
              <AppIcon name="sparkles" color={theme.primary} size={16} />
              <Text selectable style={{ flex: 1, color: theme.muted, fontSize: typeScale.caption, lineHeight: 16 }}>
                {t('Private offline guide — not a clinician or live AI service.')}
              </Text>
            </View>
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
                  {isMama ? 'MamaBot' : t('You')}
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
          onSubmitEditing={() => sendMessage()}
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
          accessibilityState={{ disabled: !draft.trim() }}
          disabled={!draft.trim()}
          onPress={() => sendMessage()}
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
