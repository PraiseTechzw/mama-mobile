import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useRef, useState, type ComponentRef } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  useReducedMotion,
} from 'react-native-reanimated';

import motherBabyLogo from '@/assets/brand/mother-baby-heart-logo.png';
import { AppIcon } from '@/components/app-icon';
import { AppText as Text } from '@/components/app-text';
import { useAppState, type AppLanguage } from '@/contexts/app-state';
import { radius, space, typeScale, useAppTheme } from '@/theme';
import { translate } from '@/utils/i18n';
import { parseDateInput } from '@/utils/pregnancy';

type ConversationMessage = {
  id: string;
  author: 'mama' | 'you';
  text: string;
};

const languages: { code: AppLanguage; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'sn', label: 'ChiShona' },
  { code: 'nd', label: 'isiNdebele' },
];

export default function WelcomeScreen() {
  const theme = useAppTheme();
  const { data, error: stateError, completeOnboarding } = useAppState();
  const reduceMotion = useReducedMotion();
  const conversationRef = useRef<ComponentRef<typeof ScrollView>>(null);
  const [language, setLanguage] = useState<AppLanguage>(data.profile.language);
  const [started, setStarted] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [name, setName] = useState(data.profile.name);
  const [week, setWeek] = useState(data.profile.pregnancyWeek?.toString() ?? '');
  const [dueDate, setDueDate] = useState(data.profile.dueDate);
  const [weekUnknown, setWeekUnknown] = useState(false);
  const [dueDateUnknown, setDueDateUnknown] = useState(false);
  const [draft, setDraft] = useState('');
  const [error, setError] = useState('');
  const t = (message: string, values?: Record<string, string | number>) =>
    translate(language, message, values);

  const messages: ConversationMessage[] = started
    ? [
        {
          id: 'welcome',
          author: 'mama',
          text: t('I’m MamaBot. Let’s make this feel like your space. I’ll ask a few quick questions so I can tailor the guidance you see.'),
        },
        { id: 'name-question', author: 'mama', text: t('What would you like me to call you?') },
        ...(questionIndex >= 1
          ? [
              {
                id: 'name-answer',
                author: 'you' as const,
                text: name.trim() || t('Skip for now'),
              },
              {
                id: 'week-question',
                author: 'mama' as const,
                text: t('Do you know how many weeks pregnant you are?'),
              },
            ]
          : []),
        ...(questionIndex >= 2
          ? [
              {
                id: 'week-answer',
                author: 'you' as const,
                text: weekUnknown
                  ? t('I’m not sure yet')
                  : t('I’m around week {week}', { week }),
              },
              {
                id: 'due-date-question',
                author: 'mama' as const,
                text: t('Do you know your expected due date?'),
              },
            ]
          : []),
        ...(questionIndex >= 3
          ? [
              {
                id: 'due-date-answer',
                author: 'you' as const,
                text: dueDateUnknown ? t('I don’t know it yet') : dueDate,
              },
              {
                id: 'thanks',
                author: 'mama' as const,
                text: t('Thanks, {name}. I’ll use this to make your MamaBot experience more personal.', {
                  name: name.trim() || t('Mama'),
                }),
              },
              {
                id: 'privacy',
                author: 'mama' as const,
                text: t('Your answers stay on this device. You can change them any time in Settings.'),
              },
            ]
          : []),
      ]
    : [];

  const goBack = () => {
    setError('');
    if (started && questionIndex > 0) {
      setQuestionIndex((current) => current - 1);
      setDraft('');
      return;
    }
    if (started) {
      setStarted(false);
      setQuestionIndex(0);
      return;
    }
    router.back();
  };

  const saveAndOpenApp = () => {
    const profile = {
      ...data.profile,
      language,
      name: name.trim(),
      pregnancyWeek: week.trim() ? Number(week) : null,
      dueDate,
    };
    if (completeOnboarding(profile)) {
      router.replace('/home');
    } else {
      setError(stateError ?? t('Your answers could not be saved. Please try again.'));
    }
  };

  const submitAnswer = () => {
    setError('');
    const answer = draft.trim();

    if (questionIndex === 0) {
      if (!answer) {
        setError(t('Tell me what to call you, or skip this question.'));
        return;
      }
      setName(answer);
    } else if (questionIndex === 1) {
      const pregnancyWeek = Number(answer);
      if (!Number.isInteger(pregnancyWeek) || pregnancyWeek < 1 || pregnancyWeek > 42) {
        setError(t('Enter a week from 1 to 42, or choose “I’m not sure yet”.'));
        return;
      }
      setWeek(String(pregnancyWeek));
      setWeekUnknown(false);
    } else if (questionIndex === 2) {
      if (!parseDateInput(answer)) {
        setError(t('Enter a valid date in YYYY-MM-DD format, or skip for now.'));
        return;
      }
      setDueDate(answer);
      setDueDateUnknown(false);
    }

    setDraft('');
    setQuestionIndex((current) => current + 1);
  };

  const skipQuestion = () => {
    setError('');
    if (questionIndex === 0) setName('');
    if (questionIndex === 1) {
      setWeek('');
      setWeekUnknown(true);
    }
    if (questionIndex === 2) {
      setDueDate('');
      setDueDateUnknown(true);
    }
    setDraft('');
    setQuestionIndex((current) => current + 1);
  };

  const inputStyle = {
    flex: 1,
    minHeight: 50,
    maxHeight: 100,
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
    borderRadius: radius.full,
    borderCurve: 'continuous' as const,
    backgroundColor: theme.surface,
    color: theme.text,
    fontFamily: 'Nunito_400Regular',
    fontSize: typeScale.body,
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar style="dark" />
      <View
        style={{
          minHeight: 64,
          paddingHorizontal: space.lg,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('Go back')}
          onPress={goBack}
          style={({ pressed }) => ({
            minWidth: 48,
            minHeight: 44,
            flexDirection: 'row',
            alignItems: 'center',
            gap: space.xs,
            opacity: pressed ? 0.65 : 1,
          })}>
          <AppIcon name="chevron" color={theme.primary} size={16} />
          <Text style={{ color: theme.primary, fontSize: typeScale.small, fontWeight: '700' }}>
            {t('Back')}
          </Text>
        </Pressable>
        <View style={{ alignItems: 'center', flexDirection: 'row', gap: space.sm }}>
          <Image
            source={motherBabyLogo}
            resizeMode="contain"
            accessibilityLabel="MamaBot"
            style={{ width: 30, height: 30 }}
          />
          <Text style={{ color: theme.text, fontSize: typeScale.body, fontWeight: '800' }}>
            MamaBot
          </Text>
        </View>
        <View style={{ minWidth: 48 }} />
      </View>

      {!started ? (
        <Animated.View
          entering={
            reduceMotion
              ? FadeIn.duration(150)
              : FadeInDown.duration(220).easing(Easing.bezier(0.23, 1, 0.32, 1))
          }
          style={{ flex: 1, justifyContent: 'center', padding: space.xl, gap: space.xl }}>
          <Image
            source={motherBabyLogo}
            resizeMode="contain"
            accessibilityLabel="MamaBot mother and baby"
            style={{ width: 112, height: 112, alignSelf: 'center' }}
          />
          <View style={{ alignItems: 'center', gap: space.sm }}>
            <Text
              style={{
                color: theme.text,
                fontSize: typeScale.title,
                fontWeight: '800',
                textAlign: 'center',
              }}>
              {t('Let’s start with a language that feels like yours.')}
            </Text>
            <Text
              style={{
                color: theme.muted,
                fontSize: typeScale.body,
                lineHeight: 22,
                textAlign: 'center',
              }}>
              {t('Choose a language. Then MamaBot will chat with you, one small question at a time.')}
            </Text>
          </View>
          <View style={{ gap: space.sm }}>
            {languages.map((option) => {
              const selected = language === option.code;
              return (
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  key={option.code}
                  onPress={() => setLanguage(option.code)}
                  style={{
                    minHeight: 54,
                    paddingHorizontal: space.lg,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderRadius: radius.md,
                    borderCurve: 'continuous',
                    borderWidth: 1,
                    borderColor: selected ? theme.primary : theme.line,
                    backgroundColor: selected ? theme.primarySoft : theme.surface,
                  }}>
                  <Text style={{ color: theme.text, fontSize: typeScale.body, fontWeight: '700' }}>
                    {option.label}
                  </Text>
                  {selected ? <AppIcon name="check" color={theme.primary} size={20} /> : null}
                </Pressable>
              );
            })}
          </View>
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              setStarted(true);
              setQuestionIndex(0);
            }}
            style={{
              minHeight: 54,
              paddingHorizontal: space.xl,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: space.sm,
              borderRadius: radius.full,
              backgroundColor: theme.primary,
            }}>
            <Text style={{ color: theme.white, fontSize: typeScale.body, fontWeight: '800' }}>
              {t('Start our chat')}
            </Text>
            <AppIcon name="arrow" color={theme.white} size={18} />
          </Pressable>
        </Animated.View>
      ) : (
        <>
          <View style={{ paddingHorizontal: space.lg, paddingBottom: space.sm, gap: space.sm }}>
            <Text
              style={{
                color: theme.muted,
                fontSize: typeScale.caption,
                fontWeight: '800',
                letterSpacing: 0.8,
              }}>
              {t('A LITTLE ABOUT YOU · {current} OF 3', {
                current: String(Math.min(questionIndex + 1, 3)).padStart(2, '0'),
              })}
            </Text>
            <View style={{ height: 4, flexDirection: 'row', gap: space.xs }}>
              {[0, 1, 2].map((index) => (
                <View
                  key={index}
                  style={{
                    flex: 1,
                    borderRadius: radius.full,
                    backgroundColor: index < questionIndex ? theme.primary : theme.line,
                  }}
                />
              ))}
            </View>
          </View>

          <ScrollView
            ref={conversationRef}
            contentInsetAdjustmentBehavior="automatic"
            keyboardShouldPersistTaps="handled"
            onContentSizeChange={() => conversationRef.current?.scrollToEnd({ animated: true })}
            contentContainerStyle={{
              paddingHorizontal: space.lg,
              paddingTop: space.md,
              paddingBottom: space.lg,
              gap: space.md,
            }}
            style={{ flex: 1 }}>
            {messages.map((message, index) => {
              const isMama = message.author === 'mama';
              return (
                <Animated.View
                  key={message.id}
                  entering={
                    index >= messages.length - 2 && !reduceMotion
                      ? FadeInDown.duration(180).easing(Easing.bezier(0.23, 1, 0.32, 1))
                      : undefined
                  }
                  style={{
                    alignSelf: isMama ? 'flex-start' : 'flex-end',
                    maxWidth: '88%',
                    flexDirection: isMama ? 'row' : 'row-reverse',
                    alignItems: 'flex-end',
                    gap: space.xs,
                  }}>
                  {isMama ? (
                    <Image
                      source={motherBabyLogo}
                      resizeMode="contain"
                      accessibilityLabel="MamaBot"
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: radius.full,
                        backgroundColor: theme.white,
                      }}
                    />
                  ) : null}
                  <View
                    style={{
                      paddingHorizontal: space.md,
                      paddingVertical: space.md,
                      borderRadius: radius.lg,
                      borderCurve: 'continuous',
                      borderTopLeftRadius: isMama ? radius.sm : radius.lg,
                      borderTopRightRadius: isMama ? radius.lg : radius.sm,
                      backgroundColor: isMama ? theme.surface : theme.primary,
                      borderWidth: isMama ? 1 : 0,
                      borderColor: theme.line,
                    }}>
                    <Text
                      selectable
                      style={{
                        color: isMama ? theme.text : theme.white,
                        fontSize: typeScale.body,
                        lineHeight: 22,
                      }}>
                      {message.text}
                    </Text>
                  </View>
                </Animated.View>
              );
            })}
          </ScrollView>

          {questionIndex < 3 ? (
            <View
              style={{
                paddingHorizontal: space.lg,
                paddingTop: space.md,
                paddingBottom: space.md,
                gap: space.sm,
                borderTopWidth: 1,
                borderTopColor: theme.line,
                backgroundColor: theme.background,
              }}>
              {questionIndex === 1 ? (
                <Pressable
                  accessibilityRole="button"
                  onPress={() => {
                    setWeek('');
                    setWeekUnknown(true);
                    setQuestionIndex(2);
                    setDraft('');
                    setError('');
                  }}
                  style={({ pressed }) => ({
                    minHeight: 40,
                    alignSelf: 'flex-start',
                    justifyContent: 'center',
                    paddingHorizontal: space.md,
                    borderRadius: radius.full,
                    backgroundColor: theme.surfaceSoft,
                    opacity: pressed ? 0.75 : 1,
                  })}>
                  <Text style={{ color: theme.primary, fontSize: typeScale.small, fontWeight: '700' }}>
                    {t('I’m not sure yet')}
                  </Text>
                </Pressable>
              ) : null}
              <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: space.sm }}>
                <TextInput
                  accessibilityLabel={
                    questionIndex === 0
                      ? t('Your name')
                      : questionIndex === 1
                        ? t('Pregnancy week')
                        : t('Expected due date')
                  }
                  value={draft}
                  onChangeText={(value) => {
                    setDraft(questionIndex === 1 ? value.replace(/[^0-9]/g, '').slice(0, 2) : value);
                    setError('');
                  }}
                  placeholder={
                    questionIndex === 0
                      ? t('Type your name…')
                      : questionIndex === 1
                        ? t('Type your pregnancy week…')
                        : t('Type your due date: YYYY-MM-DD')
                  }
                  placeholderTextColor={theme.muted}
                  keyboardType={questionIndex === 1 ? 'number-pad' : 'default'}
                  returnKeyType="send"
                  onSubmitEditing={submitAnswer}
                  maxLength={questionIndex === 0 ? 60 : questionIndex === 1 ? 2 : 10}
                  style={inputStyle}
                />
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t('Send answer')}
                  onPress={submitAnswer}
                  style={({ pressed }) => ({
                    width: 50,
                    height: 50,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: radius.full,
                    backgroundColor: theme.primary,
                    opacity: pressed ? 0.8 : 1,
                  })}>
                  <AppIcon name="arrow" color={theme.white} size={20} />
                </Pressable>
              </View>
              {questionIndex !== 1 ? (
                <Pressable
                  accessibilityRole="button"
                  onPress={skipQuestion}
                  style={({ pressed }) => ({
                    minHeight: 44,
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: pressed ? 0.65 : 1,
                  })}>
                  <Text style={{ color: theme.muted, fontSize: typeScale.small, fontWeight: '700' }}>
                    {t('Skip for now')}
                  </Text>
                </Pressable>
              ) : null}
              {error || stateError ? (
                <Text
                  accessibilityLiveRegion="polite"
                  selectable
                  style={{ color: theme.danger, fontSize: typeScale.small, lineHeight: 19 }}>
                  {error || stateError}
                </Text>
              ) : null}
            </View>
          ) : (
            <View style={{ padding: space.lg, gap: space.sm }}>
              {error || stateError ? (
                <Text
                  accessibilityLiveRegion="polite"
                  selectable
                  style={{ color: theme.danger, fontSize: typeScale.small, lineHeight: 19 }}>
                  {error || stateError}
                </Text>
              ) : null}
              <Pressable
                accessibilityRole="button"
                onPress={saveAndOpenApp}
                style={({ pressed }) => ({
                  minHeight: 54,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: space.sm,
                  borderRadius: radius.full,
                  backgroundColor: theme.primary,
                  opacity: pressed ? 0.86 : 1,
                })}>
                <Text style={{ color: theme.white, fontSize: typeScale.body, fontWeight: '800' }}>
                  {t('Save and meet MamaBot')}
                </Text>
                <AppIcon name="arrow" color={theme.white} size={18} />
              </Pressable>
            </View>
          )}
        </>
      )}
    </KeyboardAvoidingView>
  );
}
