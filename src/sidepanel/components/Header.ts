interface HeaderOptions {
  onSettingsClick: () => void;
  onSearch: (query: string) => void;
}

export class Header {
  private el: HTMLElement;
  private searchInput: HTMLInputElement;
  private settingsBtn: HTMLButtonElement;
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(container: HTMLElement, options: HeaderOptions) {
    this.el = container;
    this.el.innerHTML = this.render();
    this.searchInput = this.el.querySelector<HTMLInputElement>('.search-input')!;
    this.settingsBtn = this.el.querySelector<HTMLButtonElement>('.header-settings-btn')!;

    this.settingsBtn.addEventListener('click', options.onSettingsClick);
    this.searchInput.addEventListener('input', () => {
      if (this.debounceTimer) clearTimeout(this.debounceTimer);
      this.debounceTimer = setTimeout(() => {
        options.onSearch(this.searchInput.value);
      }, 150);
    });
  }

  private getPlaceholder(): string {
    return document.body.dataset['theme'] === 'terminal'
      ? '$ search...'
      : 'Search bookmarks...';
  }

  private render(): string {
    return `
      <div class="header-logo">
        <img class="header-logo-img" src="${chrome.runtime.getURL('icons/pushpin-20.png')}" alt="Dockmarks logo" />
        <span class="header-title">Dockmarks</span>
      </div>
      <div class="header-search">
        <input
          type="text"
          class="search-input"
          placeholder="${this.getPlaceholder()}"
          aria-label="Search bookmarks"
          autocomplete="off"
          spellcheck="false"
        />
      </div>
      <button class="header-settings-btn" title="Settings" aria-label="Settings">
        ⚙
      </button>
    `;
  }

  updatePlaceholder(): void {
    if (this.searchInput) this.searchInput.placeholder = this.getPlaceholder();
  }

  setError(hasError: boolean): void {
    this.settingsBtn.classList.toggle('has-error', hasError);
  }

  getSearchValue(): string {
    return this.searchInput.value;
  }

  clearSearch(): void {
    this.searchInput.value = '';
  }
}
