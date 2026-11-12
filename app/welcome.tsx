import { Host } from '@expo/ui';
import { DateTimePicker } from '@expo/ui/community/datetimepicker';
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  cubicBezier,
  Easing,
  FadeIn,
  FadeInDown,
  useReducedMotion,
} from 'react-native-reanimated';

import motherBabyLogo from '@/assets/brand/mother-baby-heart-logo.png';
import { AppIcon } from '@/components/app-icon';
import { AppText as Text } from '@/components/app-text';
import { useAppState, type AppLanguage } from '@/contexts/app-state';
import { localeForLanguage, translate } from '@/utils/i18n';
import { dateInputValue, formatDate, parseDateInput } from '@/utils/pregnancy';
import { radius, space, typeScale, useAppTheme } from '@/theme';

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
  const insets = useSafeAreaInsets();
  const { data, error: stateError, completeOnboarding } = useAppState();
  const reduceMotion = useReducedMotion();
  const conversationRef = useRef<ComponentRef<typeof ScrollView>>(null);
  const [language, setLanguage] = useState<AppLanguage>(data.profile.language);
  const [started, setStarted] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [name, setName] = useState(data.profile.name);
  const [phone, setPhone] = useState(data.profile.phone);
  const [week, setWeek] = useState(data.profile.pregnancyWeek?.toString() ?? '');
  const [dueDate, setDueDate] = useState(data.profile.dueDate);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [draft, setDraft] = useState('');
  const [error, setError] = useState('');
  const [activePress, setActivePress] = useState<string | null>(null);
  const parsedDueDate = parseDateInput(dueDate);
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
                text: name.trim(),
              },
              {
                id: 'phone-question',
                author: 'mama' as const,
                text: t('What phone number can we use to reach you?'),
              },
            ]
          : []),
        ...(questionIndex >= 2
          ? [
              {
                id: 'phone-answer',
                author: 'you' as const,
                text: phone.trim(),
              },
              {
                id: 'week-question',
                author: 'mama' as const,
                text: t('Do you know how many weeks pregnant you are?'),
              },
            ]
          : []),
        ...(questionIndex >= 3
          ? [
              {
                id: 'week-answer',
                author: 'you' as const,
                text: t('I’m around week {week}', { week }),
              },
              {
                id: 'due-date-question',
                author: 'mama' as const,
                text: t('Do you know your expected due date?'),
              },
            ]
          : []),
        ...(questionIndex >= 4
          ? [
              {
                id: 'due-date-answer',
                author: 'you' as const,
                text: dueDate,
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

  const saveAndOpenApp = () => {
    const profile = {
      ...data.profile,
      language,
      name: name.trim(),
      phone: phone.trim(),
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
    const answer =
      questionIndex === 3 && Platform.OS !== 'web' ? dueDate : draft.trim();

    if (!answer) {
      setError(t('Please answer before continuing.'));
      return;
    }

    if (questionIndex === 0) {
      setName(answer);
    } else if (questionIndex === 1) {
      const phoneDigits = answer.replace(/\D/g, '');
      if (!/^\+?[\d\s()-]+$/.test(answer) || phoneDigits.length < 7 || phoneDigits.length > 15) {
        setError(t('Enter a valid phone number.'));
        return;
      }
      setPhone(answer);
    } else if (questionIndex === 2) {
      const pregnancyWeek = Number(answer);
      if (!Number.isInteger(pregnancyWeek) || pregnancyWeek < 1 || pregnancyWeek > 42) {
        setError(t('Enter a pregnancy week from 1 to 42.'));
        return;
      }
      setWeek(String(pregnancyWeek));
    } else if (questionIndex === 3) {
      if (!parseDateInput(answer)) {
        setError(t('Enter a valid date in YYYY-MM-DD format.'));
        return;
      }
      setDueDate(answer);
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
      style={{ flex: 1, paddingTop: insets.top, backgroundColor: theme.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <StatusBar style="dark" />

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
            onPressIn={() => setActivePress('start')}
            onPressOut={() => setActivePress(null)}
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
            <Animated.View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: space.sm,
                opacity: activePress === 'start' ? 0.82 : 1,
                transitionProperty: 'opacity',
                transitionDuration: '120ms',
                transitionTimingFunction: cubicBezier(0.23, 1, 0.32, 1),
              }}>
              <Text style={{ color: theme.white, fontSize: typeScale.body, fontWeight: '800' }}>
                {t('Start our chat')}
              </Text>
              <AppIcon name="arrow" color={theme.white} size={18} />
            </Animated.View>
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
              {t('A LITTLE ABOUT YOU · {current} OF 4', {
                current: String(Math.min(questionIndex + 1, 4)).padStart(2, '0'),
              })}
            </Text>
            <View style={{ height: 4, flexDirection: 'row', gap: space.xs }}>
              {[0, 1, 2, 3].map((index) => (
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
                      ? FadeInDown.duration(220).easing(Easing.bezier(0.23, 1, 0.32, 1))
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

          {questionIndex < 4 ? (
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
              {questionIndex === 3 ? (
                <View style={{ gap: space.sm }}>
                  {Platform.OS === 'web' ? (
                    <TextInput
                      accessibilityLabel={t('Expected due date in YYYY-MM-DD format')}
                      value={draft}
                      onChangeText={(value) => {
                        setDraft(value);
                        setError('');
                      }}
                      placeholder={t('Type your due date: YYYY-MM-DD')}
                      placeholderTextColor={theme.muted}
                      keyboardType="numbers-and-punctuation"
                      maxLength={10}
                      style={inputStyle}
                    />
                  ) : (
                    <>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={t('Choose a date')}
                        accessibilityHint={t('Expected due date')}
                        onPress={() => setShowDatePicker((visible) => !visible)}
                        style={{
                          minHeight: 50,
                          paddingHorizontal: space.lg,
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: space.sm,
                          borderRadius: radius.md,
                          borderCurve: 'continuous',
                          backgroundColor: theme.surface,
                        }}>
                        <AppIcon name="calendar" color={theme.primary} size={18} />
                        <Text style={{ color: theme.text, fontSize: typeScale.body, fontWeight: '700' }}>
                          {parsedDueDate
                            ? formatDate(
                                parsedDueDate.toISOString(),
                                undefined,
                                localeForLanguage(language),
                              )
                            : t('Choose a date')}
                        </Text>
                      </Pressable>
                      {showDatePicker ? (
                        <Host matchContents>
                          <DateTimePicker
                            value={parsedDueDate ?? new Date()}
                            mode="date"
                            display={Platform.OS === 'ios' ? 'inline' : 'default'}
                            presentation={Platform.OS === 'android' ? 'dialog' : 'inline'}
                            minimumDate={new Date()}
                            accentColor={theme.primary}
                            onValueChange={(_event, date) => {
                              setDueDate(dateInputValue(date));
                              setError('');
                              if (Platform.OS === 'android') setShowDatePicker(false);
                            }}
                            onDismiss={() => setShowDatePicker(false)}
                          />
                        </Host>
                      ) : null}
                    </>
                  )}
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={t('Continue')}
                    onPress={submitAnswer}
                    style={({ pressed }) => ({
                      minHeight: 50,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: space.sm,
                      borderRadius: radius.full,
                      backgroundColor: theme.primary,
                      opacity: pressed ? 0.82 : 1,
                    })}>
                    <Text style={{ color: theme.white, fontSize: typeScale.body, fontWeight: '800' }}>
                      {t('Continue')}
                    </Text>
                    <AppIcon name="arrow" color={theme.white} size={18} />
                  </Pressable>
                </View>
              ) : (
                <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: space.sm }}>
                <TextInput
                  accessibilityLabel={
                    questionIndex === 0
                      ? t('Your name')
                      : questionIndex === 1
                        ? t('Phone number')
                        : questionIndex === 2
                          ? t('Pregnancy week')
                          : t('Expected due date')
                  }
                  value={draft}
                  onFocus={() => conversationRef.current?.scrollToEnd({ animated: true })}
                  onChangeText={(value) => {
                    setDraft(
                      questionIndex === 2
                        ? value.replace(/[^0-9]/g, '').slice(0, 2)
                        : value,
                    );
                    setError('');
                  }}
                  placeholder={
                    questionIndex === 0
                      ? t('Type your name…')
                      : questionIndex === 1
                        ? t('Type your phone number…')
                        : questionIndex === 2
                          ? t('Type your pregnancy week…')
                          : t('Type your due date: YYYY-MM-DD')
                  }
                  placeholderTextColor={theme.muted}
                  keyboardType={
                    questionIndex === 1
                      ? 'phone-pad'
                      : questionIndex === 2
                        ? 'number-pad'
                        : 'default'
                  }
                  returnKeyType="send"
                  onSubmitEditing={submitAnswer}
                  maxLength={
                    questionIndex === 0
                      ? 60
                      : questionIndex === 1
                        ? 24
                        : questionIndex === 2
                          ? 2
                          : 10
                  }
                  style={inputStyle}
                />
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t('Send answer')}
                  onPress={submitAnswer}
                  onPressIn={() => setActivePress('send')}
                  onPressOut={() => setActivePress(null)}
                  style={{
                    width: 50,
                    height: 50,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: radius.full,
                    backgroundColor: theme.primary,
                  }}>
                  <Animated.View
                    style={{
                      opacity: activePress === 'send' ? 0.82 : 1,
                      transitionProperty: 'opacity',
                      transitionDuration: '120ms',
                      transitionTimingFunction: cubicBezier(0.23, 1, 0.32, 1),
                    }}>
                    <AppIcon name="arrow" color={theme.white} size={20} />
                  </Animated.View>
                </Pressable>
                </View>
              )}
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
