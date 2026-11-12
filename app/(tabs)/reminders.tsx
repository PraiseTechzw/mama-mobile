import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, View } from 'react-native';

import { AppIcon } from '@/components/app-icon';
import { ActionButton } from '@/components/action-button';
import { AppText as Text } from '@/components/app-text';
import { SurfaceCard } from '@/components/surface-card';
import { useAppState } from '@/contexts/app-state';
import { localeForLanguage, useTranslation } from '@/utils/i18n';
import { cancelReminderNotification } from '@/services/reminder-notifications';
import { formatDate } from '@/utils/pregnancy';
import { radius, space, typeScale, useAppTheme } from '@/theme';

export default function RemindersScreen() {
  const theme = useAppTheme();
  const t = useTranslation();
  const { data, removeReminder } = useAppState();
  const dateLocale = localeForLanguage(data.profile.language);
  const [error, setError] = useState('');
  const [now] = useState(() => Date.now());
  const reminders = [...data.reminders].sort((a, b) =>
    a.scheduledAt.localeCompare(b.scheduledAt),
  );
  const nextReminder = reminders.find(
    (reminder) => new Date(reminder.scheduledAt).getTime() >= now,
  );

  const confirmRemove = (id: string, title: string, notificationId: string | null) => {
    Alert.alert(t('Remove reminder?'), t('“{title}” will be removed from this device.', { title }), [
      { text: t('Keep reminder'), style: 'cancel' },
      {
        text: t('Remove'),
        style: 'destructive',
        onPress: () => {
          void (async () => {
            try {
              if (notificationId) await cancelReminderNotification(notificationId);
              if (removeReminder(id)) setError('');
            } catch (removeError) {
              setError(
                removeError instanceof Error
                  ? `${t('This reminder could not be removed')}: ${removeError.message}`
                  : t('This reminder could not be removed. Please try again.'),
              );
            }
          })();
        },
      },
    ]);
  };

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{ padding: space.lg, paddingBottom: space.xxxl, gap: space.xl }}
      style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={{ gap: space.xs }}>
        <Text style={{ color: theme.text, fontSize: typeScale.title, fontWeight: '800' }}>
          {t('Make room for your care')}
        </Text>
        <Text style={{ color: theme.muted, fontSize: typeScale.body, lineHeight: 23 }}>
          {t('Save ANC visits and personal care reminders on this device.')}
        </Text>
      </View>

      <SurfaceCard tone="soft" style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View
          style={{
            width: 48,
            height: 48,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: radius.full,
            backgroundColor: theme.surface,
          }}>
          <AppIcon name="calendar" color={theme.primary} size={23} />
        </View>
        <View style={{ flex: 1, gap: space.xs }}>
          <Text style={{ color: theme.text, fontSize: typeScale.body, fontWeight: '800' }}>
            {nextReminder ? nextReminder.title : t('Your next appointment')}
          </Text>
          <Text style={{ color: theme.muted, fontSize: typeScale.small, lineHeight: 20 }}>
            {nextReminder
              ? formatDate(nextReminder.scheduledAt, {
                  weekday: 'long',
                  hour: 'numeric',
                  minute: '2-digit',
                }, dateLocale)
              : t('Add a visit to keep it in view.')}
          </Text>
        </View>
      </SurfaceCard>

      <ActionButton
        title={t('Add a reminder')}
        icon="plus"
        onPress={() => router.push('/reminder-form')}
      />

      <View style={{ gap: space.md }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={{ color: theme.text, fontSize: typeScale.heading, fontWeight: '800' }}>
            {t('Your reminders')}
          </Text>
          <Text style={{ color: theme.muted, fontSize: typeScale.small }}>
            {reminders.length}
          </Text>
        </View>

        {reminders.length ? (
          <SurfaceCard style={{ padding: 0, gap: 0, overflow: 'hidden' }}>
            {reminders.map((reminder, index) => (
              <View
                key={reminder.id}
                style={{
                  minHeight: 82,
                  paddingHorizontal: space.lg,
                  paddingVertical: space.md,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: space.md,
                  borderBottomWidth: index === reminders.length - 1 ? 0 : 1,
                  borderBottomColor: theme.line,
                }}>
                <View
                  style={{
                    width: 40,
                    height: 40,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: radius.full,
                    backgroundColor: theme.primarySoft,
                  }}>
                  <AppIcon name="bell" color={theme.primary} size={19} />
                </View>
                <View style={{ flex: 1, gap: space.xs }}>
                  <Text style={{ color: theme.text, fontSize: typeScale.body, fontWeight: '700' }}>
                    {reminder.title}
                  </Text>
                  <Text selectable style={{ color: theme.muted, fontSize: typeScale.small }}>
                    {formatDate(reminder.scheduledAt, {
                      weekday: 'short',
                      hour: 'numeric',
                      minute: '2-digit',
                    }, dateLocale)}
                  </Text>
                  {reminder.notes ? (
                    <Text style={{ color: theme.muted, fontSize: typeScale.caption, lineHeight: 18 }}>
                      {reminder.notes}
                    </Text>
                  ) : null}
                  {data.profile.notificationsEnabled && !reminder.notificationId ? (
                    <Text style={{ color: theme.muted, fontSize: typeScale.caption }}>
                      {t('No device alert scheduled')}
                    </Text>
                  ) : null}
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t('Remove {title}', { title: reminder.title })}
                  hitSlop={10}
                  onPress={() =>
                    confirmRemove(reminder.id, reminder.title, reminder.notificationId)
                  }
                  style={({ pressed }) => ({
                    minWidth: 44,
                    minHeight: 44,
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: pressed ? 0.6 : 1,
                  })}>
                  <AppIcon name="close" color={theme.muted} size={18} />
                </Pressable>
              </View>
            ))}
          </SurfaceCard>
        ) : (
          <SurfaceCard tone="soft" style={{ alignItems: 'center' }}>
            <AppIcon name="calendar" color={theme.primary} size={28} />
            <Text style={{ color: theme.text, fontSize: typeScale.body, fontWeight: '800' }}>
              {t('No reminders yet')}
            </Text>
            <Text style={{ color: theme.muted, fontSize: typeScale.small, textAlign: 'center' }}>
              {t('Add your next ANC visit or a note for yourself. It will be saved on this device.')}
            </Text>
          </SurfaceCard>
        )}
      </View>

      <Text selectable style={{ color: theme.muted, fontSize: typeScale.caption, lineHeight: 19 }}>
        {t('Device notifications are optional. Turn them on in Settings and allow notifications when asked. Always follow the timing given by your clinic.')}
      </Text>
      {error ? (
        <Text accessibilityLiveRegion="polite" style={{ color: theme.danger, fontSize: typeScale.small }}>
          {error}
        </Text>
      ) : null}
    </ScrollView>
  );
}
