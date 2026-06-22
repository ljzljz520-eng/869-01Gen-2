const PREFIX = 'charity_dashboard_';

function getPrefixedKey(key: string): string {
  return `${PREFIX}${key}`;
}

export function storageGet<T>(key: string, defaultValue?: T): T | undefined {
  if (typeof window === 'undefined') {
    return defaultValue;
  }

  try {
    const prefixedKey = getPrefixedKey(key);
    const serialized = window.localStorage.getItem(prefixedKey);
    if (serialized === null) {
      return defaultValue;
    }
    return JSON.parse(serialized) as T;
  } catch (error) {
    console.error(`[storage] Failed to get key "${key}":`, error);
    return defaultValue;
  }
}

export function storageSet<T>(key: string, value: T): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    const prefixedKey = getPrefixedKey(key);
    const serialized = JSON.stringify(value);
    window.localStorage.setItem(prefixedKey, serialized);
    return true;
  } catch (error) {
    console.error(`[storage] Failed to set key "${key}":`, error);
    return false;
  }
}

export function storageRemove(key: string): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    const prefixedKey = getPrefixedKey(key);
    window.localStorage.removeItem(prefixedKey);
    return true;
  } catch (error) {
    console.error(`[storage] Failed to remove key "${key}":`, error);
    return false;
  }
}

export function storageClear(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    const keys: string[] = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (key && key.startsWith(PREFIX)) {
        keys.push(key);
      }
    }
    keys.forEach((key) => window.localStorage.removeItem(key));
    return true;
  } catch (error) {
    console.error('[storage] Failed to clear storage:', error);
    return false;
  }
}

export function storageHas(key: string): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  const prefixedKey = getPrefixedKey(key);
  return window.localStorage.getItem(prefixedKey) !== null;
}

export function storageKeys(): string[] {
  if (typeof window === 'undefined') {
    return [];
  }

  const keys: string[] = [];
  for (let i = 0; i < window.localStorage.length; i++) {
    const key = window.localStorage.key(i);
    if (key && key.startsWith(PREFIX)) {
      keys.push(key.slice(PREFIX.length));
    }
  }
  return keys;
}

export const storage = {
  get: storageGet,
  set: storageSet,
  remove: storageRemove,
  clear: storageClear,
  has: storageHas,
  keys: storageKeys,
};

export default storage;
