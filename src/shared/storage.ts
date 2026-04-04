import type { SyncStorage, LocalStorage } from './types';

export async function getSyncStorage(keys: (keyof SyncStorage)[]): Promise<Partial<SyncStorage>> {
  return chrome.storage.sync.get(keys) as Promise<Partial<SyncStorage>>;
}

export async function setSyncStorage(items: Partial<SyncStorage>): Promise<void> {
  return chrome.storage.sync.set(items);
}

export async function getLocalStorage(keys: (keyof LocalStorage)[]): Promise<Partial<LocalStorage>> {
  return chrome.storage.local.get(keys) as Promise<Partial<LocalStorage>>;
}

export async function setLocalStorage(items: Partial<LocalStorage>): Promise<void> {
  return chrome.storage.local.set(items);
}
