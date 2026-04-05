const STORAGE_KEY = 'recentlyUsedIds';
const MAX_RECENT = 10;

export async function getRecentIds(): Promise<string[]> {
  const result = await chrome.storage.local.get([STORAGE_KEY]);
  const ids = result[STORAGE_KEY];
  return Array.isArray(ids) ? ids : [];
}

export async function recordUsage(id: string): Promise<void> {
  const recent = (await getRecentIds()).filter((r) => r !== id);
  recent.unshift(id);
  await chrome.storage.local.set({ [STORAGE_KEY]: recent.slice(0, MAX_RECENT) });
}
