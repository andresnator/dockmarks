import type { Bookmark } from '../../shared/types';
import { BookmarkCard } from './BookmarkCard';

interface BookmarkGridOptions {
  onBookmarkUsed: (id: string) => void;
}

export class BookmarkGrid {
  private el: HTMLElement;
  private options: BookmarkGridOptions;

  constructor(container: HTMLElement, options: BookmarkGridOptions) {
    this.el = container;
    this.options = options;
  }

  update(bookmarks: Bookmark[]): void {
    this.el.innerHTML = '';

    if (bookmarks.length === 0) {
      return;
    }

    const grid = document.createElement('div');
    grid.className = 'bookmark-grid';

    for (const bookmark of bookmarks) {
      const card = new BookmarkCard(bookmark, {
        onUsed: this.options.onBookmarkUsed,
      });
      grid.appendChild(card.render());
    }

    this.el.appendChild(grid);
  }

  clear(): void {
    this.el.innerHTML = '';
  }
}
