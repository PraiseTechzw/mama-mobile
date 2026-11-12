export function configureReminderNotifications() {}

export async function requestReminderPermission() {
  return false;
}

export async function scheduleReminderNotification(
  _date: string,
  _title: string,
  _body: string,
) {
  return null;
}

export async function cancelReminderNotification(_id: string) {}
