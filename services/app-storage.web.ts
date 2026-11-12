export const appStorage = {
  getItem(key: string) {
    if (typeof globalThis.localStorage === 'undefined') return null;
    return globalThis.localStorage.getItem(key);
  },
  setItem(key: string, value: string) {
    if (typeof globalThis.localStorage === 'undefined') {
      throw new Error('Local browser storage is not available.');
    }
    globalThis.localStorage.setItem(key, value);
  },
};
