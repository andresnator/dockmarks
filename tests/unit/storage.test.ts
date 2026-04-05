import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getSyncStorage, setSyncStorage, getLocalStorage, setLocalStorage } from '../../src/shared/storage';
import type { SyncStorage, LocalStorage } from '../../src/shared/types';

describe('syncStorage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getSyncStorage returns typed values', async () => {
    const mockData: Partial<SyncStorage> = { jsonUrl: 'https://example.com/bookmarks.json', theme: 'neutral' };
    vi.mocked(chrome.storage.sync.get).mockResolvedValue(mockData as never);

    const result = await getSyncStorage(['jsonUrl', 'theme']);
    expect(result.jsonUrl).toBe('https://example.com/bookmarks.json');
    expect(result.theme).toBe('neutral');
  });

  it('setSyncStorage calls chrome.storage.sync.set with correct args', async () => {
    await setSyncStorage({ jsonUrl: 'https://test.com/data.json' });
    expect(chrome.storage.sync.set).toHaveBeenCalledWith({ jsonUrl: 'https://test.com/data.json' });
  });
});

describe('localStorage (chrome.storage.local)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getLocalStorage returns typed values', async () => {
    const mockBookmarks = [{ id: '1', name: 'Test', url: 'https://test.com', section: 'Sites' }];
    vi.mocked(chrome.storage.local.get).mockResolvedValue({ bookmarks: mockBookmarks, syncError: false } as never);

    const result = await getLocalStorage(['bookmarks', 'syncError']);
    expect(result.bookmarks).toEqual(mockBookmarks);
    expect(result.syncError).toBe(false);
  });

  it('setLocalStorage calls chrome.storage.local.set', async () => {
    const partial: Partial<LocalStorage> = { syncError: true };
    await setLocalStorage(partial);
    expect(chrome.storage.local.set).toHaveBeenCalledWith(partial);
  });
});
