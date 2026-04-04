import type { Bookmark } from './types';

export function filterBookmarks(bookmarks: Bookmark[], query: string): Bookmark[] {
  if (!query.trim()) return bookmarks;
  const q = query.toLowerCase().trim();
  return bookmarks.filter((bm) => {
    if (bm.name.toLowerCase().includes(q)) return true;
    if (bm.section.toLowerCase().includes(q)) return true;
    if (bm.tags?.some((tag) => tag.toLowerCase().includes(q))) return true;
    return false;
  });
}
