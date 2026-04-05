import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getRecentIds, recordUsage } from '../../src/shared/recentlyUsed';

describe('recentlyUsed', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getRecentIds', () => {
    it('returns empty array when no data stored', async () => {
      vi.mocked(chrome.storage.local.get).mockResolvedValue({});
      expect(await getRecentIds()).toEqual([]);
    });

    it('returns stored IDs', async () => {
      vi.mocked(chrome.storage.local.get).mockResolvedValue({
        recentlyUsedIds: ['a', 'b', 'c'],
      });
      expect(await getRecentIds()).toEqual(['a', 'b', 'c']);
    });

    it('returns empty array when stored value is not an array', async () => {
      vi.mocked(chrome.storage.local.get).mockResolvedValue({
        recentlyUsedIds: 'invalid',
      });
      expect(await getRecentIds()).toEqual([]);
    });
  });

  describe('recordUsage', () => {
    it('adds a new ID to the front', async () => {
      vi.mocked(chrome.storage.local.get).mockResolvedValue({
        recentlyUsedIds: ['b', 'c'],
      });

      await recordUsage('a');

      expect(chrome.storage.local.set).toHaveBeenCalledWith({
        recentlyUsedIds: ['a', 'b', 'c'],
      });
    });

    it('deduplicates by moving existing ID to front', async () => {
      vi.mocked(chrome.storage.local.get).mockResolvedValue({
        recentlyUsedIds: ['a', 'b', 'c'],
      });

      await recordUsage('c');

      expect(chrome.storage.local.set).toHaveBeenCalledWith({
        recentlyUsedIds: ['c', 'a', 'b'],
      });
    });

    it('limits to 10 items', async () => {
      const existing = Array.from({ length: 10 }, (_, i) => `id-${i}`);
      vi.mocked(chrome.storage.local.get).mockResolvedValue({
        recentlyUsedIds: existing,
      });

      await recordUsage('new-id');

      const saved = vi.mocked(chrome.storage.local.set).mock.calls[0][0] as {
        recentlyUsedIds: string[];
      };
      expect(saved.recentlyUsedIds).toHaveLength(10);
      expect(saved.recentlyUsedIds[0]).toBe('new-id');
      expect(saved.recentlyUsedIds).not.toContain('id-9');
    });

    it('works when storage is empty', async () => {
      vi.mocked(chrome.storage.local.get).mockResolvedValue({});

      await recordUsage('first');

      expect(chrome.storage.local.set).toHaveBeenCalledWith({
        recentlyUsedIds: ['first'],
      });
    });
  });
});
