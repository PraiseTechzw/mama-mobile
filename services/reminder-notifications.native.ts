import {
  AndroidImportance,
  setNotificationChannelAsync,
  getPermissionsAsync,
  requestPermissionsAsync,
  scheduleNotificationAsync,
  cancelScheduledNotificationAsync,
  setNotificationHandler,
  SchedulableTriggerInputTypes,
} from 'expo-notifications';
import { Platform } from 'react-native';

export function configureReminderNotifications() {
  setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

export async function requestReminderPermission() {
  if (Platform.OS === 'android') {
    await setNotificationChannelAsync('care-reminders', {
      name: 'Care reminders',
      importance: AndroidImportance.DEFAULT,
    });
  }

  const current = await getPermissionsAsync();
  if (current.granted) return true;

  const requested = await requestPermissionsAsync();
  return requested.granted;
}

export async function scheduleReminderNotification(
  date: string,
  title: string,
  body: string,
) {
  if (new Date(date).getTime() <= Date.now()) return null;

  const granted = await requestReminderPermission();
  if (!granted) return null;

  return scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: true,
    },
    trigger: {
      type: SchedulableTriggerInputTypes.DATE,
      date: new Date(date),
      ...(Platform.OS === 'android' ? { channelId: 'care-reminders' } : {}),
    },
  });
}

export function cancelReminderNotification(id: string) {
  return cancelScheduledNotificationAsync(id);
}
