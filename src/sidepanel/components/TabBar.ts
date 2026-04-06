import type { Bookmark } from '../../shared/types';

interface TabBarOptions {
  onTabChange: (section: string | null) => void;
}

export class TabBar {
  private el: HTMLElement;
  private activeSection: string | null = null;
  private onTabChange: (section: string | null) => void;
  private wrapper!: HTMLElement;

  constructor(container: HTMLElement, options: TabBarOptions) {
    this.el = container;
    this.onTabChange = options.onTabChange;
    this.initFades();
  }

  private initFades(): void {
    this.wrapper = document.createElement('div');
    this.wrapper.id = 'tabbar-wrapper';
    this.el.parentNode!.insertBefore(this.wrapper, this.el);
    this.wrapper.appendChild(this.el);

    const fadeLeft = document.createElement('span');
    fadeLeft.className = 'tabbar-fade tabbar-fade--left';
    fadeLeft.setAttribute('aria-hidden', 'true');

    const fadeRight = document.createElement('span');
    fadeRight.className = 'tabbar-fade tabbar-fade--right';
    fadeRight.setAttribute('aria-hidden', 'true');

    this.wrapper.appendChild(fadeLeft);
    this.wrapper.appendChild(fadeRight);

    this.el.addEventListener('scroll', () => this.updateFades(), { passive: true });
  }

  private updateFades(): void {
    const { scrollLeft, clientWidth, scrollWidth } = this.el;
    const canScrollLeft = scrollLeft > 0;
    const canScrollRight = scrollLeft + clientWidth < scrollWidth - 1;
    this.wrapper.classList.toggle('has-left-fade', canScrollLeft);
    this.wrapper.classList.toggle('has-right-fade', canScrollRight);
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
        const label = this.getTabLabel(tab, isActive);
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

    this.updateFades();
  }

  private getTabLabel(tab: string, isActive: boolean): string {
    // Terminal theme: wrap active tab in brackets
    // We check via the html data-theme attribute
    const isTerminal = document.documentElement.getAttribute('data-theme') === 'terminal';
    if (isTerminal && isActive) {
      return `[${tab.toUpperCase()}]`;
    }
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
