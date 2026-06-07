/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

const isBrowserStorageAvailable = () => typeof window !== "undefined" && typeof window.localStorage !== "undefined";

function getStoredValue(key: string, legacyKeys: string[] = []): string | null {
  const saved = window.localStorage.getItem(key);
  if (saved !== null) {
    return saved;
  }

  for (const legacyKey of legacyKeys) {
    const legacyValue = window.localStorage.getItem(legacyKey);
    if (legacyValue !== null) {
      window.localStorage.setItem(key, legacyValue);
      return legacyValue;
    }
  }

  return null;
}

export function readJsonStorage<T>(
  key: string,
  fallback: T,
  validator?: (value: unknown) => value is T,
  legacyKeys: string[] = [],
): T {
  if (!isBrowserStorageAvailable()) {
    return fallback;
  }

  try {
    const saved = getStoredValue(key, legacyKeys);
    if (!saved) {
      return fallback;
    }

    const parsed = JSON.parse(saved) as unknown;
    if (validator && !validator(parsed)) {
      window.localStorage.removeItem(key);
      return fallback;
    }

    return parsed as T;
  } catch (error) {
    console.warn(`Ignoring corrupted localStorage value for ${key}:`, error);
    window.localStorage.removeItem(key);
    return fallback;
  }
}

export function readStringStorage(key: string, fallback: string, legacyKeys: string[] = []): string {
  if (!isBrowserStorageAvailable()) {
    return fallback;
  }

  try {
    return getStoredValue(key, legacyKeys) || fallback;
  } catch (error) {
    console.warn(`Unable to read localStorage value for ${key}:`, error);
    return fallback;
  }
}

export function readNumberStorage(key: string, fallback: number, legacyKeys: string[] = []): number {
  const rawValue = readStringStorage(key, String(fallback), legacyKeys);
  const parsed = Number.parseInt(rawValue, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function writeStorage(key: string, value: unknown): void {
  if (!isBrowserStorageAvailable()) {
    return;
  }

  try {
    const serialized = typeof value === "string" ? value : JSON.stringify(value);
    window.localStorage.setItem(key, serialized);
  } catch (error) {
    console.warn(`Unable to persist localStorage value for ${key}:`, error);
  }
}
