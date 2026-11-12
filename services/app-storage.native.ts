import 'expo-sqlite/localStorage/install';

export const appStorage = {
  getItem(key: string) {
    return globalThis.localStorage.getItem(key);
  },
  setItem(key: string, value: string) {
    globalThis.localStorage.setItem(key, value);
  },
};
