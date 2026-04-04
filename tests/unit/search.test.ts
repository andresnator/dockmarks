import { describe, it, expect } from 'vitest';
import { filterBookmarks } from '../../src/shared/search';
import type { Bookmark } from '../../src/shared/types';

const bookmarks: Bookmark[] = [
  { id: '1', name: 'Jira', url: 'https://jira.com', section: 'Sites', tags: ['agile', 'project-management'], description: 'Issue tracking' },
  { id: '2', name: 'Confluence', url: 'https://confluence.com', section: 'Wikis', tags: ['documentation', 'wiki'], description: 'Team wiki' },
  { id: '3', name: 'GitHub', url: 'https://github.com', section: 'Tools', tags: ['git', 'code'], description: 'Code hosting' },
  { id: '4', name: 'Slack', url: 'https://slack.com', section: 'Sites', tags: ['communication'], description: 'Team chat' },
];

describe('filterBookmarks', () => {
  it('returns all bookmarks for empty query', () => {
    expect(filterBookmarks(bookmarks, '')).toHaveLength(4);
  });

  it('filters by name (case-insensitive)', () => {
    const result = filterBookmarks(bookmarks, 'jira');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');
  });

  it('filters by name uppercase', () => {
    const result = filterBookmarks(bookmarks, 'GITHUB');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('3');
  });

  it('filters by section', () => {
    const result = filterBookmarks(bookmarks, 'wikis');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('2');
  });

  it('filters by tag', () => {
    const result = filterBookmarks(bookmarks, 'agile');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');
  });

  it('returns empty array when no match', () => {
    const result = filterBookmarks(bookmarks, 'zzzzz');
    expect(result).toHaveLength(0);
  });

  it('handles bookmarks with no tags', () => {
    const noTagsBookmarks: Bookmark[] = [
      { id: '5', name: 'Test', url: 'https://test.com', section: 'Sites' },
    ];
    expect(filterBookmarks(noTagsBookmarks, 'test')).toHaveLength(1);
    expect(filterBookmarks(noTagsBookmarks, 'tag')).toHaveLength(0);
  });

  it('matches multiple results', () => {
    const result = filterBookmarks(bookmarks, 'sites');
    expect(result).toHaveLength(2); // Jira + Slack
  });
});
