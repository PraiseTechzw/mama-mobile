import { Host, Switch } from '@expo/ui';
import { DateTimePicker } from '@expo/ui/community/datetime-picker';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from 'react-native';

import { ActionButton } from '@/components/action-button';
import { AppText as Text } from '@/components/app-text';
import { SurfaceCard } from '@/components/surface-card';
import { useAppState } from '@/contexts/app-state';
import { languageLabels, localeForLanguage, translate, useTranslation } from '@/utils/i18n';
import {
  cancelReminderNotification,
  requestReminderPermission,
  scheduleReminderNotification,
} from '@/services/reminder-notifications';
import { dateInputValue, formatDate, parseDateInput } from '@/utils/pregnancy';
import { radius, space, typeScale, useAppTheme } from '@/theme';

export default function SettingsScreen() {
  const theme = useAppTheme();
  const t = useTranslation();
  const { data, saveProfile, setNotificationsEnabled } = useAppState();
  const [name, setName] = useState(data.profile.name);
  const [phone, setPhone] = useState(data.profile.phone);
  const [week, setWeek] = useState(data.profile.pregnancyWeek?.toString() ?? '');
  const [dueDate, setDueDate] = useState(data.profile.dueDate);
  const [showDueDatePicker, setShowDueDatePicker] = useState(false);
  const [saved, setSaved] = useState('');
  const [error, setError] = useState('');
  const [updatingNotifications, setUpdatingNotifications] = useState(false);

  const inputStyle = {
    minHeight: 50,
    paddingHorizontal: space.lg,
    borderRadius: radius.md,
    borderCurve: 'continuous' as const,
    borderWidth: 1,
    borderColor: theme.line,
    backgroundColor: theme.surface,
    color: theme.text,
    fontFamily: 'Nunito_400Regular',
    fontSize: typeScale.body,
  };
  const parsedDueDate = dueDate ? parseDateInput(dueDate) : null;

  const changeLanguage = (language: typeof data.profile.language) => {
    setError('');
    setSaved('');
    if (saveProfile({ ...data.profile, language })) {
      setSaved(translate(language, 'Language preference saved.'));
    } else {
      setError(
        translate(language, 'Your language preference could not be saved. Please try again.'),
      );
    }
  };

  const save = () => {
    setError('');
    setSaved('');
    const pregnancyWeek = week.trim() ? Number(week) : null;
    if (
      pregnancyWeek !== null &&
      (!Number.isInteger(pregnancyWeek) || pregnancyWeek < 1 || pregnancyWeek > 42)
    ) {
      setError(t('Enter a pregnancy week from 1 to 42, or leave it blank.'));
      return;
    }
    if (dueDate && !parseDateInput(dueDate)) {
      setError(t('Enter a valid due date in YYYY-MM-DD format.'));
      return;
    }

    if (
      saveProfile({
        ...data.profile,
        name: name.trim(),
        phone: phone.trim(),
        dueDate,
        pregnancyWeek,
      })
    ) {
      setSaved(t('Your details are saved on this device.'));
    }
  };

  const updateNotifications = async (enabled: boolean) => {
    if (updatingNotifications) return;
    setUpdatingNotifications(true);
    setError('');
    setSaved('');
    const scheduled: string[] = [];

    try {
      const notificationIds: Record<string, string | null> = {};

      if (enabled) {
        const permissionGranted = await requestReminderPermission();
        if (!permissionGranted) {
          setError(
            Platform.OS === 'web'
              ? t('Device notifications are available in the Android and iOS app.')
              : t('Notifications are not allowed. You can enable them in your device settings.'),
          );
          return;
        }

        for (const reminder of data.reminders) {
          if (new Date(reminder.scheduledAt).getTime() <= Date.now()) {
            notificationIds[reminder.id] = null;
            continue;
          }
          const notificationId = await scheduleReminderNotification(
            reminder.scheduledAt,
            reminder.title,
            reminder.notes || 'You have a reminder from MamaBot.',
          );
          if (!notificationId) {
            throw new Error(t('A reminder notification could not be scheduled.'));
          }
          scheduled.push(notificationId);
          notificationIds[reminder.id] = notificationId;
        }

        if (!setNotificationsEnabled(true, notificationIds)) {
          const cleanup = await Promise.allSettled(
            scheduled.map((notificationId) => cancelReminderNotification(notificationId)),
          );
          if (cleanup.some((result) => result.status === 'rejected')) {
            setError(t('Changes could not be saved, and at least one reminder alert may still be scheduled.'));
          }
          return;
        }
        setSaved(t('Device notifications are on for upcoming reminders.'));
      } else {
        for (const reminder of data.reminders) {
          if (reminder.notificationId) {
            await cancelReminderNotification(reminder.notificationId);
          }
          notificationIds[reminder.id] = null;
        }
        if (setNotificationsEnabled(false, notificationIds)) {
          setSaved(t('Device notifications are off.'));
        }
      }
    } catch (notificationError) {
      const cleanup = await Promise.allSettled(
        scheduled.map((notificationId) => cancelReminderNotification(notificationId)),
      );
      const cleanupFailed = cleanup.some((result) => result.status === 'rejected');
      setError(
        `${notificationError instanceof Error ? `${t('Notification settings could not be updated')}: ${notificationError.message}` : t('Notification settings could not be updated. Please try again.')}${cleanupFailed ? ` ${t('At least one reminder alert may still be scheduled.')}` : ''}`,
      );
    } finally {
      setUpdatingNotifications(false);
    }
  };

  const changeDueDate = (_event: unknown, date: Date) => {
    setDueDate(dateInputValue(date));
    if (Platform.OS === 'android') setShowDueDatePicker(false);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: space.lg, paddingBottom: space.xxxl, gap: space.xl }}>
      <View style={{ gap: space.xs }}>
        <Text style={{ color: theme.text, fontSize: typeScale.title, fontWeight: '800' }}>
          {t('Your space, your pace')}
        </Text>
        <Text style={{ color: theme.muted, fontSize: typeScale.body, lineHeight: 23 }}>
          {t('Add details to make your MamaBot experience feel more personal.')}
        </Text>
      </View>

      <SurfaceCard>
        <Text style={{ color: theme.text, fontSize: typeScale.heading, fontWeight: '800' }}>
          {t('App language')}
        </Text>
        <Text style={{ color: theme.muted, fontSize: typeScale.small, lineHeight: 20 }}>
          {t('Choose the language MamaBot uses throughout the app.')}
        </Text>
        <View style={{ gap: space.sm }}>
          {(['en', 'sn', 'nd'] as const).map((language) => {
            const selected = data.profile.language === language;
            return (
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected }}
                key={language}
                onPress={() => changeLanguage(language)}
                style={{
                  minHeight: 48,
                  paddingHorizontal: space.md,
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
                  {languageLabels[language]}
                </Text>
                {selected ? <Text style={{ color: theme.primary, fontWeight: '800' }}>✓</Text> : null}
              </Pressable>
            );
          })}
        </View>
      </SurfaceCard>

      <SurfaceCard>
        <Text style={{ color: theme.text, fontSize: typeScale.heading, fontWeight: '800' }}>
          {t('Your profile')}
        </Text>
        <View style={{ gap: space.sm }}>
          <Text style={{ color: theme.muted, fontSize: typeScale.small, fontWeight: '700' }}>
            {t('Name (optional)')}
          </Text>
          <TextInput
            accessibilityLabel={t('Name')}
            value={name}
            onChangeText={(value) => {
              setName(value);
              setSaved('');
            }}
            maxLength={60}
            placeholder={t('What should we call you?')}
            placeholderTextColor={theme.muted}
            style={inputStyle}
          />
        </View>
        <View style={{ gap: space.sm }}>
          <Text style={{ color: theme.muted, fontSize: typeScale.small, fontWeight: '700' }}>
            {t('Phone number (optional)')}
          </Text>
          <TextInput
            accessibilityLabel={t('Phone number')}
            value={phone}
            onChangeText={(value) => {
              setPhone(value);
              setSaved('');
            }}
            keyboardType="phone-pad"
            maxLength={24}
            placeholder={t('Add a phone number')}
            placeholderTextColor={theme.muted}
            style={inputStyle}
          />
        </View>
        <View style={{ gap: space.sm }}>
          <Text style={{ color: theme.muted, fontSize: typeScale.small, fontWeight: '700' }}>
            {t('Pregnancy week (optional)')}
          </Text>
          <TextInput
            accessibilityLabel={t('Pregnancy week')}
            value={week}
            onChangeText={(value) => {
              setWeek(value.replace(/[^0-9]/g, '').slice(0, 2));
              setSaved('');
            }}
            keyboardType="number-pad"
            placeholder={t('For example, 24')}
            placeholderTextColor={theme.muted}
            style={inputStyle}
          />
        </View>
        <View style={{ gap: space.sm }}>
          <Text style={{ color: theme.muted, fontSize: typeScale.small, fontWeight: '700' }}>
            {t('Expected due date (optional)')}
          </Text>
          {Platform.OS === 'web' ? (
            <TextInput
              accessibilityLabel={t('Expected due date in year-month-day format')}
              value={dueDate}
              onChangeText={(value) => {
                setDueDate(value);
                setSaved('');
              }}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={theme.muted}
              keyboardType="numbers-and-punctuation"
              style={inputStyle}
            />
          ) : (
            <>
              <ActionButton
                title={
                  parsedDueDate
                    ? formatDate(parsedDueDate.toISOString(), undefined, localeForLanguage(data.profile.language))
                    : t('Choose a date')
                }
                icon="calendar"
                variant="secondary"
                onPress={() => setShowDueDatePicker((visible) => !visible)}
              />
              {showDueDatePicker ? (
                <Host matchContents>
                  <DateTimePicker
                    value={parsedDueDate ?? new Date()}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'inline' : 'default'}
                    presentation={Platform.OS === 'android' ? 'dialog' : 'inline'}
                    minimumDate={new Date()}
                    accentColor={theme.primary}
                    onValueChange={changeDueDate}
                    onDismiss={() => setShowDueDatePicker(false)}
                  />
                </Host>
              ) : null}
            </>
          )}
        </View>
        <ActionButton title={t('Save details')} icon="check" onPress={save} />
        {error ? (
          <Text accessibilityLiveRegion="polite" selectable style={{ color: theme.danger, fontSize: typeScale.small }}>
            {error}
          </Text>
        ) : null}
        {saved ? (
          <Text accessibilityLiveRegion="polite" style={{ color: theme.primary, fontSize: typeScale.small, fontWeight: '700' }}>
            {saved}
          </Text>
        ) : null}
      </SurfaceCard>

      <SurfaceCard style={{ padding: 0, gap: 0, overflow: 'hidden' }}>
        <View style={{ padding: space.lg, flexDirection: 'row', alignItems: 'center', gap: space.md }}>
          <View style={{ flex: 1, gap: space.xs }}>
            <Text style={{ color: theme.text, fontSize: typeScale.body, fontWeight: '800' }}>
              {t('ANC notifications')}
            </Text>
            <Text style={{ color: theme.muted, fontSize: typeScale.small, lineHeight: 19 }}>
              {t('Optional alerts for saved reminders. Permission is requested on this device.')}
            </Text>
          </View>
          <Host matchContents>
            <Switch
              label={t('ANC notifications')}
              value={data.profile.notificationsEnabled}
              onValueChange={(enabled) => void updateNotifications(enabled)}
            />
          </Host>
        </View>
      </SurfaceCard>

      <SurfaceCard tone="soft">
        <Text style={{ color: theme.text, fontSize: typeScale.body, fontWeight: '800' }}>
          {t('About MamaBot')}
        </Text>
        <Text selectable style={{ color: theme.muted, fontSize: typeScale.small, lineHeight: 21 }}>
          {t('Your profile, reminders, and chat are stored on this device and are not sent to a server. MamaBot is a general information guide, not a medical service or emergency contact.')}
        </Text>
        <ActionButton
          title={t('Help me prepare a question')}
          icon="chat"
          variant="secondary"
          onPress={() => router.push('/chat')}
        />
      </SurfaceCard>

      <Text selectable style={{ color: theme.muted, fontSize: typeScale.caption, lineHeight: 18 }}>
        {t('If you have an urgent concern, contact your local emergency service or go to the nearest health facility. Do not wait for a response in this app.')}
      </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
