import { DateTimePicker } from '@expo/ui/community/datetime-picker';
import { Host } from '@expo/ui';
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
import { FacilityPicker } from '@/components/facility-picker';
import { useAppState } from '@/contexts/app-state';
import { localeForLanguage, useTranslation } from '@/utils/i18n';
import {
  cancelReminderNotification,
  scheduleReminderNotification,
} from '@/services/reminder-notifications';
import { dateInputValue, formatDate, parseDateInput } from '@/utils/pregnancy';
import { getHealthcareFacility } from '@/utils/facilities';
import { radius, space, typeScale, useAppTheme } from '@/theme';

type PickerMode = 'date' | 'time' | null;

function addTomorrow(date: Date) {
  const tomorrow = new Date(date);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(9, 0, 0, 0);
  return tomorrow;
}

export default function ReminderFormScreen() {
  const theme = useAppTheme();
  const t = useTranslation();
  const { data, addReminder } = useAppState();
  const [title, setTitle] = useState(() => t('ANC appointment'));
  const [notes, setNotes] = useState('');
  const [facilityId, setFacilityId] = useState<string | null>(null);
  const [date, setDate] = useState(() => addTomorrow(new Date()));
  const [webDate, setWebDate] = useState(() => dateInputValue(addTomorrow(new Date())));
  const [webTime, setWebTime] = useState(() => {
    const tomorrow = addTomorrow(new Date());
    return `${String(tomorrow.getHours()).padStart(2, '0')}:${String(tomorrow.getMinutes()).padStart(2, '0')}`;
  });
  const [picker, setPicker] = useState<PickerMode>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [canSaveWithoutNotification, setCanSaveWithoutNotification] = useState(false);
  const [error, setError] = useState('');

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

  const save = async (withoutNotification = false) => {
    if (isSaving) return;
    const parsedDate = Platform.OS === 'web' ? parseDateInput(webDate) : date;
    if (!title.trim()) {
      setError(t('Add a title for this reminder.'));
      return;
    }
    if (!parsedDate) {
      setError(t('Enter a valid date in YYYY-MM-DD format.'));
      return;
    }
    if (Platform.OS === 'web' && !/^([01]\d|2[0-3]):([0-5]\d)$/.test(webTime)) {
      setError(t('Enter a valid time in 24-hour format, such as 09:00.'));
      return;
    }

    const scheduledDate = new Date(parsedDate);
    if (Platform.OS === 'web') {
      scheduledDate.setHours(Number(webTime.slice(0, 2)), Number(webTime.slice(3)), 0, 0);
    }
    if (scheduledDate.getTime() <= Date.now()) {
      setError(t('Choose a date and time in the future.'));
      return;
    }

    setIsSaving(true);
    setError('');
    const scheduledAt = scheduledDate.toISOString();
    let notificationId: string | null = null;

    try {
      if (data.profile.notificationsEnabled && !withoutNotification) {
        try {
          const facility = getHealthcareFacility(facilityId);
          const notificationNotes = [
            notes.trim(),
            facility ? `${t('Health facility')}: ${facility.name}` : '',
          ]
            .filter(Boolean)
            .join(' · ');
          notificationId = await scheduleReminderNotification(
            scheduledAt,
            title.trim(),
            notificationNotes || t('You have a reminder from MamaBot.'),
          );
        } catch (notificationError) {
          setCanSaveWithoutNotification(true);
          setError(
            notificationError instanceof Error
              ? `${t('A device notification could not be scheduled')}: ${notificationError.message}`
              : t('A device notification could not be scheduled.'),
          );
          return;
        }

        if (!notificationId) {
          setCanSaveWithoutNotification(true);
          setError(
            Platform.OS === 'web'
              ? t('Device notifications are available in the Android and iOS app.')
              : t('Notifications are not allowed on this device. You can save the reminder without an alert.'),
          );
          return;
        }
      }

      const reminderId = addReminder(
        {
          title: title.trim(),
          notes: notes.trim(),
          scheduledAt,
          facilityId,
        },
        notificationId,
      );
      if (!reminderId) {
        if (notificationId) await cancelReminderNotification(notificationId);
        return;
      }
      setCanSaveWithoutNotification(false);
      router.back();
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? `${t('The reminder could not be saved')}: ${saveError.message}`
          : t('The reminder could not be saved. Please try again.'),
      );
    } finally {
      setIsSaving(false);
    }
  };

  const onDateChange = (_event: unknown, selectedDate: Date) => {
    const next = new Date(date);
    next.setFullYear(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
    setDate(next);
    if (Platform.OS === 'android') setPicker(null);
  };

  const onTimeChange = (_event: unknown, selectedDate: Date) => {
    const next = new Date(date);
    next.setHours(selectedDate.getHours(), selectedDate.getMinutes(), 0, 0);
    setDate(next);
    if (Platform.OS === 'android') setPicker(null);
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
            {t('Add a gentle reminder')}
          </Text>
          <Text style={{ color: theme.muted, fontSize: typeScale.body, lineHeight: 22 }}>
            {t('Add a clinic visit or a note for yourself. Your clinic’s advice comes first.')}
          </Text>
        </View>

        <SurfaceCard>
          <FacilityPicker
            facilityId={facilityId}
            label={t('Clinic or health facility (optional)')}
            description={t('Choose the actual clinic for this visit, or search by name, district or province.')}
            onSelect={(facility) => setFacilityId(facility?.id ?? null)}
          />

          <View style={{ gap: space.sm }}>
            <Text style={{ color: theme.text, fontSize: typeScale.small, fontWeight: '700' }}>
              {t('Reminder title')}
            </Text>
            <TextInput
              accessibilityLabel={t('Reminder title')}
              value={title}
              onChangeText={setTitle}
              maxLength={70}
              placeholder={t('For example, ANC appointment')}
              placeholderTextColor={theme.muted}
              returnKeyType="next"
              style={inputStyle}
            />
          </View>

          <View style={{ gap: space.sm }}>
            <Text style={{ color: theme.text, fontSize: typeScale.small, fontWeight: '700' }}>
              {t('Note (optional)')}
            </Text>
            <TextInput
              accessibilityLabel={t('Reminder note')}
              value={notes}
              onChangeText={setNotes}
              maxLength={160}
              placeholder={t('What would you like to remember?')}
              placeholderTextColor={theme.muted}
              returnKeyType="done"
              style={[inputStyle, { minHeight: 84, paddingVertical: space.md }]}
            />
          </View>

          {Platform.OS === 'web' ? (
            <View style={{ gap: space.md }}>
              <View style={{ gap: space.sm }}>
                <Text style={{ color: theme.text, fontSize: typeScale.small, fontWeight: '700' }}>
                  {t('Date (YYYY-MM-DD)')}
                </Text>
                <TextInput
                  accessibilityLabel={t('Reminder date in year-month-day format')}
                  value={webDate}
                  onChangeText={setWebDate}
                  placeholder="2026-11-18"
                  placeholderTextColor={theme.muted}
                  keyboardType="numbers-and-punctuation"
                  style={inputStyle}
                />
              </View>
              <Text style={{ color: theme.text, fontSize: typeScale.small, fontWeight: '700' }}>
                {t('Time (24-hour)')}
              </Text>
              <TextInput
                accessibilityLabel={t('Reminder time in 24-hour format')}
                value={webTime}
                onChangeText={setWebTime}
                placeholder="09:00"
                placeholderTextColor={theme.muted}
                keyboardType="numbers-and-punctuation"
                style={inputStyle}
              />
            </View>
          ) : (
            <>
              <View style={{ gap: space.sm }}>
                <Text style={{ color: theme.text, fontSize: typeScale.small, fontWeight: '700' }}>
                  {t('When')}
                </Text>
                <View style={{ flexDirection: 'row', gap: space.sm }}>
                  {(['date', 'time'] as const).map((mode) => (
                    <Pressable
                      accessibilityRole="button"
                      key={mode}
                      onPress={() => setPicker(picker === mode ? null : mode)}
                      style={({ pressed }) => ({
                        flex: 1,
                        minHeight: 48,
                        paddingHorizontal: space.md,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: space.sm,
                        borderRadius: radius.md,
                        borderCurve: 'continuous',
                        backgroundColor: picker === mode ? theme.primarySoft : theme.surfaceSoft,
                        opacity: pressed ? 0.82 : 1,
                      })}>
                      <Text style={{ color: theme.primary, fontSize: typeScale.small, fontWeight: '700' }}>
                        {mode === 'date'
                          ? formatDate(date.toISOString(), undefined, localeForLanguage(data.profile.language))
                          : formatDate(date.toISOString(), { hour: 'numeric', minute: '2-digit' }, localeForLanguage(data.profile.language))}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {picker ? (
                <Host matchContents>
                  <DateTimePicker
                    value={date}
                    mode={picker}
                    display={Platform.OS === 'ios' ? (picker === 'date' ? 'inline' : 'spinner') : 'default'}
                    presentation={Platform.OS === 'android' ? 'dialog' : 'inline'}
                    minimumDate={picker === 'date' ? new Date() : undefined}
                    accentColor={theme.primary}
                    is24Hour
                    onValueChange={picker === 'date' ? onDateChange : onTimeChange}
                    onDismiss={() => setPicker(null)}
                  />
                </Host>
              ) : null}
            </>
          )}

          <Text style={{ color: theme.muted, fontSize: typeScale.caption, lineHeight: 18 }}>
            {data.profile.notificationsEnabled
              ? t('MamaBot will schedule a device notification if permission is available.')
              : t('This reminder will be saved in the app. Turn on device notifications in Settings if you want an alert.')}
          </Text>
        </SurfaceCard>

        {error ? (
          <Text accessibilityLiveRegion="polite" selectable style={{ color: theme.danger, fontSize: typeScale.small }}>
            {error}
          </Text>
        ) : null}
        <ActionButton
          title={isSaving ? t('Saving…') : t('Save reminder')}
          icon="check"
          onPress={() => void save()}
          disabled={isSaving}
        />
        {canSaveWithoutNotification ? (
          <ActionButton
            title={t('Save without notification')}
            variant="outline"
            onPress={() => void save(true)}
            disabled={isSaving}
          />
        ) : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
