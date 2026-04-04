import type { Bookmark } from '../../shared/types';

interface BookmarkCardOptions {
  onUsed: (id: string) => void;
}

export class BookmarkCard {
  private bookmark: Bookmark;
  private options: BookmarkCardOptions;

  constructor(bookmark: Bookmark, options: BookmarkCardOptions) {
    this.bookmark = bookmark;
    this.options = options;
  }

  render(): HTMLElement {
    const card = document.createElement('div');
    card.className = 'bookmark-card';
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', `Open ${this.bookmark.name}`);
    card.innerHTML = this.buildHTML();

    card.addEventListener('click', () => this.handleClick());
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.handleClick();
      }
    });

    return card;
  }

  private buildHTML(): string {
    const { name, logo, section, description } = this.bookmark;
    const initial = name.charAt(0).toUpperCase();
    const tooltipText = description
      ? `${section} — ${description}`
      : section;

    const logoHTML = logo
      ? `<img
           class="bookmark-card-logo"
           src="${this.escapeAttr(logo)}"
           alt=""
           onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"
         />
         <div class="bookmark-card-logo-fallback" style="display:none">${this.escapeHtml(initial)}</div>`
      : `<div class="bookmark-card-logo-fallback">${this.escapeHtml(initial)}</div>`;

    return `
      ${logoHTML}
      <span class="bookmark-card-name">${this.escapeHtml(name)}</span>
      <span class="bookmark-tooltip">${this.escapeHtml(tooltipText)}</span>
    `;
  }

  private handleClick(): void {
    chrome.tabs.create({ url: this.bookmark.url, active: false });
    this.options.onUsed(this.bookmark.id);
  }

  private escapeHtml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  private escapeAttr(str: string): string {
    return str.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
}
