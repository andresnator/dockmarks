import { describe, it, expect, vi } from 'vitest';
import { BookmarkCard } from '../../src/sidepanel/components/BookmarkCard';
import type { Bookmark } from '../../src/shared/types';

const baseBookmark: Bookmark = {
  id: '1',
  name: 'GitHub',
  url: 'https://github.com',
  section: 'Tools',
  description: 'Code hosting',
};

const bookmarkWithLogo: Bookmark = {
  ...baseBookmark,
  logo: 'https://github.com/favicon.ico',
};

const bookmarkNoLogo: Bookmark = {
  ...baseBookmark,
};

const makeCard = (bookmark: Bookmark): HTMLElement => {
  const card = new BookmarkCard(bookmark, { onUsed: vi.fn() });
  return card.render();
};

describe('BookmarkCard', () => {
  describe('render() with logo URL', () => {
    it('img element has NO onerror attribute', () => {
      const el = makeCard(bookmarkWithLogo);
      const img = el.querySelector<HTMLImageElement>('.bookmark-card-logo');
      expect(img).not.toBeNull();
      expect(img!.getAttribute('onerror')).toBeNull();
    });

    it('fires error event → img hidden, fallback shown', () => {
      const el = makeCard(bookmarkWithLogo);
      const img = el.querySelector<HTMLImageElement>('.bookmark-card-logo');
      const fallback = el.querySelector<HTMLElement>('.bookmark-card-logo-fallback');
      expect(img).not.toBeNull();
      expect(fallback).not.toBeNull();

      // Before error fires, fallback should be hidden
      expect(fallback!.style.display).toBe('none');

      // Dispatch error event on img
      img!.dispatchEvent(new Event('error'));

      expect(img!.style.display).toBe('none');
      expect(fallback!.style.display).toBe('flex');
    });
  });

  describe('render() without logo URL', () => {
    it('renders only the fallback div, no img element', () => {
      const el = makeCard(bookmarkNoLogo);
      const img = el.querySelector('.bookmark-card-logo');
      const fallback = el.querySelector('.bookmark-card-logo-fallback');
      expect(img).toBeNull();
      expect(fallback).not.toBeNull();
    });

    it('fallback div is visible (no display:none)', () => {
      const el = makeCard(bookmarkNoLogo);
      const fallback = el.querySelector<HTMLElement>('.bookmark-card-logo-fallback');
      expect(fallback!.style.display).not.toBe('none');
    });
  });

  describe('tooltip content', () => {
    it('renders section and description inside tooltip', () => {
      const bookmark: Bookmark = {
        id: '2',
        name: 'VS Code',
        url: 'https://code.visualstudio.com',
        section: 'Dev Tools',
        description: 'Fast editor',
      };
      const el = makeCard(bookmark);
      const tooltip = el.querySelector('.bookmark-tooltip');
      expect(tooltip).not.toBeNull();
      expect(tooltip!.innerHTML).toContain('<strong>Dev Tools</strong>');
      expect(tooltip!.innerHTML).toContain('Fast editor');
    });

    it('renders only section (no <br>) when description is absent', () => {
      const bookmark: Bookmark = {
        id: '3',
        name: 'Google',
        url: 'https://google.com',
        section: 'Search',
      };
      const el = makeCard(bookmark);
      const tooltip = el.querySelector('.bookmark-tooltip');
      expect(tooltip).not.toBeNull();
      expect(tooltip!.innerHTML).toContain('<strong>Search</strong>');
      expect(tooltip!.innerHTML).not.toContain('<br>');
    });

    it('escapes HTML in section and description', () => {
      const bookmark: Bookmark = {
        id: '4',
        name: 'Bad',
        url: 'https://example.com',
        section: '<script>',
        description: '<img onerror="x">',
      };
      const el = makeCard(bookmark);
      const tooltip = el.querySelector('.bookmark-tooltip');
      expect(tooltip).not.toBeNull();
      // Raw tags must not appear unescaped — the browser parses innerHTML so
      // a literal <script> tag would be absent; verify it didn't inject a real element
      expect(tooltip!.querySelector('script')).toBeNull();
      // onerror must not be a live attribute on any child element
      const anyOnerror = tooltip!.querySelector('[onerror]');
      expect(anyOnerror).toBeNull();
    });
  });
});
