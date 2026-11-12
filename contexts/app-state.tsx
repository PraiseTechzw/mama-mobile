import {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { appStorage } from '@/services/app-storage';
import { Platform } from 'react-native';

export type AppLanguage = 'en' | 'sn' | 'nd';

export type Profile = {
  name: string;
  phone: string;
  dueDate: string;
  pregnancyWeek: number | null;
  notificationsEnabled: boolean;
  language: AppLanguage;
};

export type Reminder = {
  id: string;
  title: string;
  notes: string;
  scheduledAt: string;
  notificationId: string | null;
};

export type ChatMessage = {
  id: string;
  author: 'mama' | 'you';
  text: string;
  createdAt: string;
};

type AppData = {
  version: 1;
  onboardingComplete: boolean;
  profile: Profile;
  reminders: Reminder[];
  chatMessages: ChatMessage[];
};

type AppStateContextValue = {
  data: AppData;
  isReady: boolean;
  loadFailed: boolean;
  error: string | null;
  retryLoad: () => void;
  completeOnboarding: (profile?: Profile) => boolean;
  saveProfile: (profile: Profile) => boolean;
  addReminder: (
    reminder: Omit<Reminder, 'id' | 'notificationId'>,
    notificationId?: string | null,
  ) => string | null;
  removeReminder: (id: string) => boolean;
  setNotificationsEnabled: (
    enabled: boolean,
    notificationIds?: Record<string, string | null>,
  ) => boolean;
  addChatMessages: (messages: ChatMessage[]) => boolean;
  clearChat: () => boolean;
};

const STORAGE_KEY = 'mamabot-app-state-v1';

const emptyData: AppData = {
  version: 1,
  onboardingComplete: false,
  profile: {
    name: '',
    phone: '',
    dueDate: '',
    pregnancyWeek: null,
    notificationsEnabled: false,
    language: 'en',
  },
  reminders: [],
  chatMessages: [],
};

const AppStateContext = createContext<AppStateContextValue | null>(null);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isAppLanguage(value: unknown): value is AppLanguage {
  return value === 'en' || value === 'sn' || value === 'nd';
}

function parseSavedData(value: unknown): AppData {
  if (!isRecord(value) || value.version !== 1 || !isRecord(value.profile)) {
    throw new Error('Saved MamaBot data has an unsupported format.');
  }

  const { profile } = value;
  if (
    typeof profile.name !== 'string' ||
    typeof profile.phone !== 'string' ||
    typeof profile.dueDate !== 'string' ||
    (profile.pregnancyWeek !== null &&
      (typeof profile.pregnancyWeek !== 'number' ||
        !Number.isInteger(profile.pregnancyWeek) ||
        profile.pregnancyWeek < 1 ||
        profile.pregnancyWeek > 42)) ||
    typeof profile.notificationsEnabled !== 'boolean' ||
    (profile.language !== undefined && !isAppLanguage(profile.language)) ||
    typeof value.onboardingComplete !== 'boolean' ||
    !Array.isArray(value.reminders) ||
    !Array.isArray(value.chatMessages)
  ) {
    throw new Error('Saved MamaBot data could not be read. Your information has not been changed.');
  }

  const reminders = value.reminders.map((item): Reminder => {
    if (
      !isRecord(item) ||
      typeof item.id !== 'string' ||
      typeof item.title !== 'string' ||
      typeof item.notes !== 'string' ||
      typeof item.scheduledAt !== 'string' ||
      (item.notificationId !== null && typeof item.notificationId !== 'string')
    ) {
      throw new Error('A saved reminder could not be read. Your information has not been changed.');
    }

    return {
      id: item.id,
      title: item.title,
      notes: item.notes,
      scheduledAt: item.scheduledAt,
      notificationId: item.notificationId,
    };
  });

  const chatMessages = value.chatMessages.map((item): ChatMessage => {
    if (
      !isRecord(item) ||
      typeof item.id !== 'string' ||
      (item.author !== 'mama' && item.author !== 'you') ||
      typeof item.text !== 'string' ||
      typeof item.createdAt !== 'string'
    ) {
      throw new Error('A saved chat message could not be read. Your information has not been changed.');
    }

    return {
      id: item.id,
      author: item.author,
      text: item.text,
      createdAt: item.createdAt,
    };
  });

  return {
    version: 1,
    onboardingComplete: value.onboardingComplete,
    profile: {
      name: profile.name,
      phone: profile.phone,
      dueDate: profile.dueDate,
      pregnancyWeek: profile.pregnancyWeek,
      notificationsEnabled: profile.notificationsEnabled,
      language: isAppLanguage(profile.language) ? profile.language : 'en',
    },
    reminders,
    chatMessages,
  };
}

function createMessageId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function readSavedData() {
  try {
    const saved = appStorage.getItem(STORAGE_KEY);
    return {
      data: saved ? parseSavedData(JSON.parse(saved) as unknown) : emptyData,
      loadFailed: false,
      error: null,
    };
  } catch (loadError) {
    return {
      data: emptyData,
      loadFailed: true,
      error:
        loadError instanceof Error
          ? loadError.message
          : 'Saved MamaBot data could not be loaded. Please try again.',
    };
  }
}

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [initialLoad] = useState(() =>
    Platform.OS === 'web'
      ? { data: emptyData, loadFailed: false, error: null }
      : readSavedData(),
  );
  const [data, setData] = useState<AppData>(initialLoad.data);
  const [isReady, setIsReady] = useState(Platform.OS !== 'web');
  const [loadFailed, setLoadFailed] = useState(initialLoad.loadFailed);
  const [error, setError] = useState<string | null>(initialLoad.error);
  const dataRef = useRef(initialLoad.data);

  const loadData = useCallback(() => {
    setIsReady(false);
    const result = readSavedData();
    dataRef.current = result.data;
    setData(result.data);
    setLoadFailed(result.loadFailed);
    setError(result.error);
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const timeout = setTimeout(loadData, 0);
    return () => clearTimeout(timeout);
  }, [loadData]);

  const commit = useCallback((next: AppData) => {
    try {
      appStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      dataRef.current = next;
      setData(next);
      setError(null);
      return true;
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? `Could not save your changes: ${saveError.message}`
          : 'Could not save your changes. Please try again.',
      );
      return false;
    }
  }, []);

  const completeOnboarding = useCallback(
    (profile?: Profile) =>
      commit({
        ...dataRef.current,
        onboardingComplete: true,
        profile: profile ?? dataRef.current.profile,
      }),
    [commit],
  );

  const saveProfile = useCallback(
    (profile: Profile) => commit({ ...dataRef.current, profile }),
    [commit],
  );

  const addReminder = useCallback(
    (
      reminder: Omit<Reminder, 'id' | 'notificationId'>,
      notificationId: string | null = null,
    ) => {
      const id = createMessageId();
      const saved = commit({
        ...dataRef.current,
        reminders: [...dataRef.current.reminders, { ...reminder, id, notificationId }],
      });
      return saved ? id : null;
    },
    [commit],
  );

  const removeReminder = useCallback(
    (id: string) =>
      commit({
        ...dataRef.current,
        reminders: dataRef.current.reminders.filter((reminder) => reminder.id !== id),
      }),
    [commit],
  );

  const setNotificationsEnabled = useCallback(
    (enabled: boolean, notificationIds?: Record<string, string | null>) =>
      commit({
        ...dataRef.current,
        profile: { ...dataRef.current.profile, notificationsEnabled: enabled },
        reminders: notificationIds
          ? dataRef.current.reminders.map((reminder) => ({
              ...reminder,
              notificationId: notificationIds[reminder.id] ?? null,
            }))
          : dataRef.current.reminders,
      }),
    [commit],
  );

  const addChatMessages = useCallback(
    (messages: ChatMessage[]) =>
      commit({
        ...dataRef.current,
        chatMessages: [...dataRef.current.chatMessages, ...messages],
      }),
    [commit],
  );

  const clearChat = useCallback(
    () => commit({ ...dataRef.current, chatMessages: [] }),
    [commit],
  );

  const value = useMemo<AppStateContextValue>(
    () => ({
      data,
      isReady,
      loadFailed,
      error,
      retryLoad: loadData,
      completeOnboarding,
      saveProfile,
      addReminder,
      removeReminder,
      setNotificationsEnabled,
      addChatMessages,
      clearChat,
    }),
    [
      data,
      isReady,
      loadFailed,
      error,
      loadData,
      completeOnboarding,
      saveProfile,
      addReminder,
      removeReminder,
      setNotificationsEnabled,
      addChatMessages,
      clearChat,
    ],
  );

  return <AppStateContext value={value}>{children}</AppStateContext>;
}

export function useAppState() {
  const context = use(AppStateContext);
  if (!context) {
    throw new Error('useAppState must be used inside AppStateProvider.');
  }
  return context;
}
