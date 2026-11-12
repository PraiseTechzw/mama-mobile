import { Image } from 'expo-image';
import { Link, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import prenatalCareImage from '@/assets/illustrations/prenatal-care-consultation.png';
import { AppIcon } from '@/components/app-icon';
import { AppText as Text } from '@/components/app-text';
import { useAppState } from '@/contexts/app-state';
import { localeForLanguage, useTranslation } from '@/utils/i18n';
import { formatDate, pregnancyWeekFromDueDate } from '@/utils/pregnancy';
import { radius, space, typeScale, useAppTheme } from '@/theme';

const shortcuts = [
  {
    title: 'Pregnancy',
    subtitle: 'Guidance for your stage',
    icon: 'pregnancy' as const,
    href: '/pregnancy-info' as const,
  },
  {
    title: 'Reminders',
    subtitle: 'Keep visits in view',
    icon: 'bell' as const,
    href: '/reminders' as const,
  },
  {
    title: 'Danger signs',
    subtitle: 'When to seek help',
    icon: 'warning' as const,
    href: '/danger-signs' as const,
  },
  {
    title: 'Ask MamaBot',
    subtitle: 'Get pregnancy guidance',
    icon: 'chat' as const,
    href: '/chat' as const,
  },
];

export default function HomeScreen() {
  const theme = useAppTheme();
  const t = useTranslation();
  const { data } = useAppState();
  const [now, setNow] = useState(() => Date.now());
  const [activePress, setActivePress] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      setNow(Date.now());
    }, []),
  );

  const week =
    pregnancyWeekFromDueDate(data.profile.dueDate) ?? data.profile.pregnancyWeek;
  const trimester = week
    ? week <= 13
      ? 'First trimester'
      : week <= 27
        ? 'Second trimester'
        : 'Third trimester'
    : null;
  const dateLocale = localeForLanguage(data.profile.language);
  const nextReminder = data.reminders
    .filter((reminder) => new Date(reminder.scheduledAt).getTime() >= now)
    .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt))[0];
  const progress = week ? Math.min(week / 40, 1) : 0;

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{
        padding: space.lg,
        paddingBottom: space.xxxl,
        gap: space.xl,
      }}
      style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={{ gap: space.xs }}>
        <Text style={{ color: theme.text, fontSize: typeScale.title, fontWeight: '800', lineHeight: 34 }}>
          {t('Hello, {name}', { name: data.profile.name.trim() || t('Mama') })}
        </Text>
        <Text style={{ color: theme.muted, fontSize: typeScale.body, lineHeight: 22 }}>
          {t('A little support for you and your baby, every day.')}
        </Text>
      </View>

      <View
        style={{
          minHeight: 176,
          overflow: 'hidden',
          flexDirection: 'row',
          alignItems: 'center',
          borderRadius: radius.lg,
          borderCurve: 'continuous',
          backgroundColor: theme.primarySoft,
        }}>
        <View style={{ flex: 1, padding: space.lg, gap: space.sm }}>
          <Text
            style={{
              color: theme.primary,
              fontSize: typeScale.caption,
              fontWeight: '800',
              letterSpacing: 0.8,
            }}>
            {t('YOUR PREGNANCY')}
          </Text>
          {week ? (
            <>
              <Text style={{ color: theme.text, fontSize: typeScale.heading, fontWeight: '800' }}>
                {t('Week {week} of 40', { week })}
              </Text>
              <Text style={{ color: theme.muted, fontSize: typeScale.small, fontWeight: '700' }}>
                {t(trimester ?? '')}
              </Text>
              <View
                accessibilityRole="progressbar"
                accessibilityLabel={t('Pregnancy progress')}
                accessibilityValue={{ min: 1, max: 40, now: Math.min(week, 40) }}
                style={{
                  height: 7,
                  marginTop: space.xs,
                  overflow: 'hidden',
                  borderRadius: radius.full,
                  backgroundColor: 'rgba(81, 37, 184, 0.14)',
                }}>
                <View
                  style={{
                    width: `${progress * 100}%`,
                    height: '100%',
                    borderRadius: radius.full,
                    backgroundColor: theme.primary,
                  }}
                />
              </View>
              <Text style={{ color: theme.muted, fontSize: typeScale.caption, lineHeight: 17 }}>
                {t('Your ANC provider can confirm your dates.')}
              </Text>
            </>
          ) : (
            <>
              <Text style={{ color: theme.text, fontSize: typeScale.heading, fontWeight: '800' }}>
                {t('Make your guidance personal')}
              </Text>
              <Text style={{ color: theme.muted, fontSize: typeScale.small, lineHeight: 19 }}>
                {t('Add your pregnancy week or due date to see guidance for your stage.')}
              </Text>
              <Link href="/settings" asChild>
                <Pressable
                  accessibilityRole="button"
                  accessibilityHint={t('Opens {title}', { title: t('Settings').toLowerCase() })}
                  onPressIn={() => setActivePress('add-dates')}
                  onPressOut={() => setActivePress(null)}
                  style={{
                    minHeight: 40,
                    alignSelf: 'flex-start',
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: space.xs,
                    opacity: activePress === 'add-dates' ? 0.7 : 1,
                  }}>
                  <Text style={{ color: theme.primary, fontSize: typeScale.small, fontWeight: '800' }}>
                    {t('Add pregnancy dates')}
                  </Text>
                  <AppIcon name="arrow" color={theme.primary} size={16} />
                </Pressable>
              </Link>
            </>
          )}
        </View>
        <Image
          source={prenatalCareImage}
          contentFit="contain"
          accessibilityLabel={t('A midwife supporting an expectant mother')}
          style={{
            width: '34%',
            height: 156,
            alignSelf: 'flex-end',
            marginRight: -space.sm,
          }}
        />
      </View>

      <View style={{ gap: space.sm }}>
        <View style={{ gap: space.xs }}>
          <Text style={{ color: theme.text, fontSize: typeScale.heading, fontWeight: '800' }}>
            {t('Your next step')}
          </Text>
          <Text style={{ color: theme.muted, fontSize: typeScale.small }}>
            {t('Keep your antenatal care close at hand.')}
          </Text>
        </View>
        <Link href="/reminders" asChild>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              nextReminder
                ? t('Next reminder: {title}, {date}', {
                    title: nextReminder.title,
                    date: formatDate(nextReminder.scheduledAt, undefined, dateLocale),
                  })
                : t('Add your first ANC reminder')
            }
            accessibilityHint={t('Opens {title}', { title: t('ANC reminders') })}
            onPressIn={() => setActivePress('reminder')}
            onPressOut={() => setActivePress(null)}
            style={{
              minHeight: 88,
              padding: space.md,
              flexDirection: 'row',
              alignItems: 'center',
              gap: space.md,
              borderRadius: radius.lg,
              borderCurve: 'continuous',
              backgroundColor: theme.primary,
              opacity: activePress === 'reminder' ? 0.88 : 1,
            }}>
            <View
              style={{
                width: 46,
                height: 46,
                flexShrink: 0,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: radius.md,
                backgroundColor: 'rgba(255,255,255,0.16)',
              }}>
              <AppIcon name="calendar" color={theme.white} size={24} />
            </View>
            <View style={{ flex: 1, gap: space.xs }}>
              <Text style={{ color: theme.white, fontSize: typeScale.small, fontWeight: '700' }}>
                {nextReminder ? t('Your next ANC reminder') : t('Next ANC appointment')}
              </Text>
              <Text
                numberOfLines={2}
                style={{
                  color: theme.white,
                  fontSize: typeScale.subheading,
                  fontWeight: '800',
                  lineHeight: 22,
                }}>
                {nextReminder ? nextReminder.title : t('Plan your next visit')}
              </Text>
              <Text style={{ color: theme.white, fontSize: typeScale.small, lineHeight: 19 }}>
                {nextReminder
                  ? formatDate(
                      nextReminder.scheduledAt,
                      { weekday: 'short', hour: 'numeric', minute: '2-digit' },
                      dateLocale,
                    )
                  : t('Add a reminder to keep your care on track.')}
              </Text>
            </View>
            <AppIcon name="arrow" color={theme.white} size={20} />
          </Pressable>
        </Link>
      </View>

      <View style={{ gap: space.md }}>
        <View style={{ gap: space.xs }}>
          <Text style={{ color: theme.text, fontSize: typeScale.heading, fontWeight: '800' }}>
            {t('What can we help with?')}
          </Text>
          <Text style={{ color: theme.muted, fontSize: typeScale.body, lineHeight: 21 }}>
            {t('Find trusted guidance for you and your baby.')}
          </Text>
        </View>

        {[shortcuts.slice(0, 2), shortcuts.slice(2, 4)].map((row) => (
          <View key={row[0].title} style={{ flexDirection: 'row', gap: space.md }}>
            {row.map((shortcut) => {
              const isUrgent = shortcut.icon === 'warning';

              return (
                <View key={shortcut.title} style={{ flex: 1, minWidth: 0 }}>
                  <Link href={shortcut.href} asChild>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityHint={t('Opens {title}', { title: t(shortcut.title).toLowerCase() })}
                      onPressIn={() => setActivePress(shortcut.title)}
                      onPressOut={() => setActivePress(null)}
                      style={{
                        minHeight: 112,
                        padding: space.md,
                        alignItems: 'flex-start',
                        justifyContent: 'center',
                        gap: space.sm,
                        borderRadius: radius.lg,
                        borderCurve: 'continuous',
                        backgroundColor: isUrgent ? theme.dangerSoft : theme.surface,
                        borderWidth: isUrgent ? 0 : 1,
                        borderColor: theme.line,
                        opacity: activePress === shortcut.title ? 0.82 : 1,
                      }}>
                      <View
                        style={{
                          width: 40,
                          height: 40,
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: radius.full,
                          backgroundColor: isUrgent ? 'rgba(185, 54, 47, 0.12)' : theme.primarySoft,
                        }}>
                        <AppIcon
                          name={shortcut.icon}
                          color={isUrgent ? theme.danger : theme.primary}
                          size={21}
                        />
                      </View>
                      <Text
                        style={{
                          color: isUrgent ? theme.danger : theme.text,
                          fontSize: typeScale.body,
                          fontWeight: '800',
                          lineHeight: 20,
                        }}>
                        {t(shortcut.title)}
                      </Text>
                      <Text style={{ color: theme.muted, fontSize: typeScale.small, lineHeight: 17 }}>
                        {t(shortcut.subtitle)}
                      </Text>
                    </Pressable>
                  </Link>
                </View>
              );
            })}
          </View>
        ))}
      </View>

      <View
        style={{
          minHeight: 64,
          paddingHorizontal: space.md,
          paddingVertical: space.md,
          flexDirection: 'row',
          alignItems: 'center',
          gap: space.md,
          borderRadius: radius.lg,
          borderCurve: 'continuous',
          backgroundColor: theme.surfaceTint,
        }}>
        <AppIcon name="heart" color={theme.primary} size={26} />
        <View style={{ flex: 1, gap: space.xs }}>
          <Text style={{ color: theme.text, fontSize: typeScale.body, fontWeight: '800' }}>
            {t('Healthy pregnancy, brighter future')}
          </Text>
          <Text style={{ color: theme.muted, fontSize: typeScale.small, lineHeight: 19 }}>
            {t('MamaBot is a guide, not a replacement for a healthcare professional.')}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
