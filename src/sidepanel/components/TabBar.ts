import type { Bookmark } from '../../shared/types';

interface TabBarOptions {
  onTabChange: (section: string | null) => void;
}

export class TabBar {
  private el: HTMLElement;
  private activeSection: string | null = null;
  private onTabChange: (section: string | null) => void;

  constructor(container: HTMLElement, options: TabBarOptions) {
    this.el = container;
    this.onTabChange = options.onTabChange;
  }

  update(bookmarks: Bookmark[]): void {
    const sections = [...new Set(bookmarks.map((b) => b.section))].sort();
    this.render(['All', ...sections]);
  }

  private render(tabs: string[]): void {
    this.el.innerHTML = tabs
      .map((tab) => {
        const section = tab === 'All' ? null : tab;
        const isActive = this.activeSection === section;
        const label = this.getTabLabel(tab);
        return `<button
          class="tab-btn${isActive ? ' active' : ''}"
          data-section="${section ?? ''}"
          aria-pressed="${isActive}"
        >${label}</button>`;
      })
      .join('');

    this.el.querySelectorAll<HTMLButtonElement>('.tab-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const raw = btn.dataset['section'];
        const section = raw === '' ? null : (raw ?? null);
        this.setActive(section);
        this.onTabChange(section);
      });
    });
  }

  private getTabLabel(tab: string): string {
    return tab.toUpperCase();
  }

  private setActive(section: string | null): void {
    this.activeSection = section;
    // Re-render to update bracket notation and active class
    const tabs = [
      'All',
      ...Array.from(this.el.querySelectorAll<HTMLButtonElement>('.tab-btn'))
        .map((btn) => btn.dataset['section'])
        .filter((s): s is string => s !== undefined && s !== ''),
    ];
    this.render(tabs);
  }

  getActiveSection(): string | null {
    return this.activeSection;
  }
}
