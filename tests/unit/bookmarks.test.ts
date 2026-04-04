import { describe, it, expect, vi, beforeEach } from 'vitest';
import { hashContent, validateBookmarks, fetchBookmarks } from '../../src/shared/bookmarks';
import type { Bookmark } from '../../src/shared/types';

describe('hashContent', () => {
  it('returns a consistent hex string for the same input', async () => {
    const hash1 = await hashContent('{"test": 1}');
    const hash2 = await hashContent('{"test": 1}');
    expect(hash1).toBe(hash2);
    expect(hash1).toMatch(/^[a-f0-9]{64}$/); // SHA-256 = 64 hex chars
  });

  it('returns different hashes for different inputs', async () => {
    const hash1 = await hashContent('content A');
    const hash2 = await hashContent('content B');
    expect(hash1).not.toBe(hash2);
  });
});

describe('validateBookmarks', () => {
  const validBookmark = {
    id: 'bm-1',
    name: 'Jira',
    url: 'https://company.atlassian.net',
    section: 'Sites',
    tags: ['agile'],
    description: 'Project management',
    logo: 'https://cdn.example.com/jira.svg',
  };

  it('returns valid bookmarks unchanged', () => {
    const data = { bookmarks: [validBookmark] };
    const result = validateBookmarks(data);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('bm-1');
  });

  it('filters out bookmarks missing required fields (id, name, url, section)', () => {
    const data = {
      bookmarks: [
        validBookmark,
        { name: 'No ID', url: 'https://a.com', section: 'Sites' }, // missing id
        { id: 'x', url: 'https://b.com', section: 'Sites' },        // missing name
      ],
    };
    const result = validateBookmarks(data);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('bm-1');
  });

  it('returns empty array for invalid data shape', () => {
    expect(validateBookmarks(null)).toHaveLength(0);
    expect(validateBookmarks({})).toHaveLength(0);
    expect(validateBookmarks({ bookmarks: 'not-array' })).toHaveLength(0);
  });
});

describe('fetchBookmarks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches and returns validated bookmarks on success', async () => {
    const mockData = {
      bookmarks: [{ id: '1', name: 'Test', url: 'https://t.com', section: 'Tools' }],
    };
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(JSON.stringify(mockData)),
    } as Response);

    const result = await fetchBookmarks('https://example.com/bookmarks.json');
    expect(result.bookmarks).toHaveLength(1);
    expect(result.rawText).toBe(JSON.stringify(mockData));
  });

  it('throws on HTTP error (4XX/5XX)', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
    } as Response);

    await expect(fetchBookmarks('https://example.com/bookmarks.json')).rejects.toThrow('HTTP 404');
  });

  it('throws on network failure', async () => {
    global.fetch = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));

    await expect(fetchBookmarks('https://example.com/bookmarks.json')).rejects.toThrow();
  });
});
