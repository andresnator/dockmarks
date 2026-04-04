import type { Bookmark } from './types';

export async function hashContent(content: string): Promise<string> {
  const buffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(content));
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export function validateBookmarks(data: unknown): Bookmark[] {
  if (!data || typeof data !== 'object') return [];
  const obj = data as Record<string, unknown>;
  if (!Array.isArray(obj['bookmarks'])) return [];

  return (obj['bookmarks'] as unknown[]).filter((item): item is Bookmark => {
    if (!item || typeof item !== 'object') return false;
    const bm = item as Record<string, unknown>;
    return (
      typeof bm['id'] === 'string' && bm['id'].length > 0 &&
      typeof bm['name'] === 'string' && bm['name'].length > 0 &&
      typeof bm['url'] === 'string' && bm['url'].length > 0 &&
      typeof bm['section'] === 'string' && bm['section'].length > 0
    );
  });
}

export interface FetchResult {
  bookmarks: Bookmark[];
  rawText: string;
}

export async function fetchBookmarks(url: string): Promise<FetchResult> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  const rawText = await response.text();
  const data: unknown = JSON.parse(rawText);
  const bookmarks = validateBookmarks(data);
  return { bookmarks, rawText };
}
