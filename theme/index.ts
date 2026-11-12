const palette = {
  background: '#FBF8FF',
  surface: '#FFFFFF',
  surfaceSoft: '#F1ECFF',
  surfaceTint: '#F4ECFF',
  text: '#211B38',
  muted: '#716985',
  primary: '#5125B8',
  primarySoft: '#E8DFFF',
  chatAccent: '#2678F3',
  accent: '#A247C5',
  danger: '#B9362F',
  dangerSoft: '#FCE9E6',
  line: '#E7E0F1',
  white: '#FFFFFF',
} as const;

export function useAppTheme() {
  return palette;
}

export const space = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
} as const;

export const radius = {
  sm: 10,
  md: 16,
  lg: 24,
  full: 999,
} as const;

export const typeScale = {
  caption: 11,
  small: 13,
  body: 15,
  subheading: 17,
  heading: 21,
  title: 27,
  display: 36,
} as const;

export const icons = {
  home: { ios: 'house.fill', android: 'home', web: 'home' },
  chat: {
    ios: 'ellipsis.bubble.fill',
    android: 'chat',
    web: 'chat',
  },
  book: { ios: 'book.closed.fill', android: 'menu_book', web: 'menu_book' },
  calendar: { ios: 'calendar', android: 'calendar_month', web: 'calendar_month' },
  profile: {
    ios: 'person.crop.circle.fill',
    android: 'account_circle',
    web: 'account_circle',
  },
  pregnancy: {
    ios: 'person.fill',
    android: 'pregnant_woman',
    web: 'pregnant_woman',
  },
  settings: {
    ios: 'gearshape.fill',
    android: 'settings',
    web: 'settings',
  },
  heart: { ios: 'heart.fill', android: 'favorite', web: 'favorite' },
  sparkles: { ios: 'sparkles', android: 'auto_awesome', web: 'auto_awesome' },
  arrow: { ios: 'arrow.right', android: 'arrow_forward', web: 'arrow_forward' },
  chevron: { ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' },
  bell: { ios: 'bell.fill', android: 'notifications', web: 'notifications' },
  check: { ios: 'checkmark.circle.fill', android: 'check_circle', web: 'check_circle' },
  warning: {
    ios: 'exclamationmark.triangle.fill',
    android: 'warning',
    web: 'warning',
  },
  phone: { ios: 'phone.fill', android: 'call', web: 'call' },
  drop: { ios: 'drop.fill', android: 'water_drop', web: 'water_drop' },
  eye: { ios: 'eye.fill', android: 'visibility', web: 'visibility' },
  breathing: { ios: 'wind', android: 'air', web: 'air' },
  medical: {
    ios: 'cross.case.fill',
    android: 'medical_services',
    web: 'medical_services',
  },
  clock: { ios: 'clock.fill', android: 'schedule', web: 'schedule' },
  plus: { ios: 'plus', android: 'add', web: 'add' },
  close: { ios: 'xmark', android: 'close', web: 'close' },
} as const;

export type IconName = keyof typeof icons;
