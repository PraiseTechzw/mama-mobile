export function pregnancyWeekFromDueDate(dueDate: string) {
  if (!dueDate) return null;

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dueDate);
  if (!match) return null;

  const [, year, month, day] = match;
  const due = Date.UTC(Number(year), Number(month) - 1, Number(day));
  const todayDate = new Date();
  const today = Date.UTC(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate());
  const dueDays = Math.ceil((due - today) / 86_400_000);

  if (dueDays < -14 || dueDays > 280) return null;
  return Math.max(1, Math.min(42, 40 - Math.ceil(dueDays / 7)));
}

export function formatDate(
  date: string,
  options?: Intl.DateTimeFormatOptions,
  locale?: string,
) {
  const parsed = /^\d{4}-\d{2}-\d{2}$/.test(date)
    ? new Date(`${date}T12:00:00`)
    : new Date(date);
  if (Number.isNaN(parsed.getTime())) return 'Date not set';

  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...options,
  }).format(parsed);
}

export function dateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseDateInput(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;

  const [, year, month, day] = match;
  const parsed = new Date(Number(year), Number(month) - 1, Number(day), 12);
  if (
    parsed.getFullYear() !== Number(year) ||
    parsed.getMonth() !== Number(month) - 1 ||
    parsed.getDate() !== Number(day)
  ) {
    return null;
  }
  return parsed;
}
