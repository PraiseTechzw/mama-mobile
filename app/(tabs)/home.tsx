import { Link, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

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
  const dateLocale = localeForLanguage(data.profile.language);
  const nextReminder = data.reminders
    .filter((reminder) => new Date(reminder.scheduledAt).getTime() >= now)
    .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt))[0];

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{
        padding: space.lg,
        paddingBottom: space.md,
        gap: space.md,
      }}
      style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={{ gap: space.xs }}>
        <Text style={{ color: theme.text, fontSize: 24, fontWeight: '800', lineHeight: 30 }}>
          {t('Hello, {name}', { name: data.profile.name.trim() || t('Mama') })}
        </Text>
        <Text style={{ color: theme.muted, fontSize: typeScale.body, lineHeight: 21 }}>
          {week
            ? t('You’re around week {week}. How can we help today?', { week })
            : t('How can we help today?')}
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
            width: '100%',
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
              width: 44,
              height: 44,
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
              style={{ color: theme.white, fontSize: typeScale.subheading, fontWeight: '800', lineHeight: 22 }}>
              {nextReminder ? nextReminder.title : t('Plan your next visit')}
            </Text>
            <Text style={{ color: theme.white, fontSize: typeScale.small, lineHeight: 19 }}>
              {nextReminder
                ? formatDate(nextReminder.scheduledAt, {
                    weekday: 'short',
                    hour: 'numeric',
                    minute: '2-digit',
                    }, dateLocale)
                : t('Add a reminder to keep your care on track.')}
            </Text>
          </View>
          <AppIcon name="arrow" color={theme.white} size={20} />
        </Pressable>
      </Link>

      <View style={{ gap: space.sm }}>
        <View style={{ gap: space.xs }}>
          <Text style={{ color: theme.text, fontSize: typeScale.heading, fontWeight: '800' }}>
            {t('What can we help with?')}
          </Text>
          <Text style={{ color: theme.muted, fontSize: typeScale.body }}>
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
                        width: '100%',
                        minHeight: 104,
                        padding: space.sm,
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: space.sm,
                        borderRadius: radius.lg,
                        borderCurve: 'continuous',
                        backgroundColor: theme.surface,
                        borderWidth: 1,
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
                          backgroundColor: isUrgent ? theme.dangerSoft : theme.primarySoft,
                        }}>
                        <AppIcon
                          name={shortcut.icon}
                          color={isUrgent ? theme.danger : theme.primary}
                          size={21}
                        />
                      </View>
                      <View style={{ alignItems: 'center', gap: space.xs }}>
                        <Text
                          style={{
                            color: theme.text,
                            fontSize: typeScale.body,
                            fontWeight: '800',
                            textAlign: 'center',
                            lineHeight: 20,
                          }}>
                          {t(shortcut.title)}
                        </Text>
                        <Text
                          style={{
                            color: theme.muted,
                            fontSize: typeScale.small,
                            lineHeight: 17,
                            textAlign: 'center',
                          }}>
                          {t(shortcut.subtitle)}
                        </Text>
                      </View>
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
          minHeight: 58,
          paddingHorizontal: space.md,
          paddingVertical: space.sm,
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
          <Text style={{ color: theme.muted, fontSize: typeScale.small }}>
            {t('One step at a time, Mama.')}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
