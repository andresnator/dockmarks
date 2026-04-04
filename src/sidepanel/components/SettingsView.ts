import type { Theme } from '../../shared/types';
import { ThemeManager } from '../../shared/theme';

interface SettingsViewOptions {
  onUrlSave: (url: string) => void;
  onSyncClick: () => void;
  onThemeChange: (theme: Theme) => void;
  themeManager: ThemeManager;
}

interface SyncStatus {
  lastSyncTime?: number;
  syncError?: boolean;
}

export class SettingsView {
  private el: HTMLElement;
  private options: SettingsViewOptions;
  private urlInput!: HTMLInputElement;
  private syncBtn!: HTMLButtonElement;
  private syncStatus!: HTMLElement;

  constructor(container: HTMLElement, options: SettingsViewOptions) {
    this.el = container;
    this.options = options;
  }

  private getLabels(isTerminal: boolean) {
    return isTerminal ? {
      dataSource: '> Data Source',
      syncBtn: '[ sync ]',
      syncBtnActive: 'syncing...',
      theme: '> Theme',
      themeNeutral: 'Neutral',
      themeTerminal: 'Terminal',
    } : {
      dataSource: 'Data Source',
      syncBtn: 'Sync',
      syncBtnActive: 'Syncing...',
      theme: 'Theme',
      themeNeutral: 'Neutral',
      themeTerminal: 'Terminal',
    };
  }

  render(currentUrl: string, status: SyncStatus): void {
    const currentTheme = this.options.themeManager.get();
    const isTerminal = document.body.dataset['theme'] === 'terminal';
    const labels = this.getLabels(isTerminal);
    const headerLabel = isTerminal ? 'Config' : 'Settings';
    const urlPlaceholder = isTerminal ? '> https://...' : 'https://example.com/bookmarks.json';

    this.el.innerHTML = `
      <div class="settings-view">
        <div class="settings-header">${headerLabel}</div>

        <div class="settings-section">
          <div class="settings-section-label">${labels.dataSource}</div>
          <div class="settings-url-row">
            <input
              type="url"
              class="settings-url-input"
              placeholder="${urlPlaceholder}"
              value="${this.escapeAttr(currentUrl)}"
              autocomplete="off"
              spellcheck="false"
            />
            <button class="settings-sync-btn">${labels.syncBtn}</button>
          </div>
          <div class="settings-sync-status ${status.syncError ? 'error' : 'success'}">
            ${this.formatSyncStatus(status)}
          </div>
        </div>

        <div class="settings-section">
          <div class="settings-section-label">${labels.theme}</div>
          <div class="theme-selector">
            ${this.renderThemeCard('neutral', labels.themeNeutral, currentTheme)}
            ${this.renderThemeCard('terminal', labels.themeTerminal, currentTheme)}
          </div>
        </div>
        ${isTerminal ? '<div class="settings-dock-decor">[ DOCK ]</div>' : ''}
      </div>
    `;

    this.urlInput = this.el.querySelector<HTMLInputElement>('.settings-url-input')!;
    this.syncBtn = this.el.querySelector<HTMLButtonElement>('.settings-sync-btn')!;
    this.syncStatus = this.el.querySelector<HTMLElement>('.settings-sync-status')!;

    // URL save on blur or Enter
    this.urlInput.addEventListener('blur', () => this.saveUrl());
    this.urlInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this.saveUrl();
    });

    // Sync button
    this.syncBtn.addEventListener('click', () => {
      this.syncBtn.disabled = true;
      this.syncBtn.textContent = labels.syncBtnActive;
      this.options.onSyncClick();
    });

    // Theme cards
    this.el.querySelectorAll<HTMLElement>('.theme-card').forEach((card) => {
      card.addEventListener('click', () => {
        const theme = card.dataset['theme'] as Theme;
        if (theme) this.options.onThemeChange(theme);
      });
    });
  }

  private renderThemeCard(theme: Theme, label: string, currentTheme: Theme): string {
    const isActive = currentTheme === theme;
    return `
      <div class="theme-card${isActive ? ' active' : ''}" data-theme="${theme}" role="button" tabindex="0">
        <div class="theme-card-preview" data-theme-preview="${theme}">
          <div class="preview-block"></div>
          <div class="preview-block"></div>
          <div class="preview-block"></div>
        </div>
        <div class="theme-card-label">${label}</div>
      </div>
    `;
  }

  private saveUrl(): void {
    const url = this.urlInput.value.trim();
    if (url) {
      this.options.onUrlSave(url);
    }
  }

  updateSyncStatus(status: SyncStatus): void {
    if (!this.syncStatus) return;
    this.syncStatus.className = `settings-sync-status ${status.syncError ? 'error' : 'success'}`;
    this.syncStatus.textContent = this.formatSyncStatus(status);
    if (this.syncBtn) {
      const isTerminal = document.body.dataset['theme'] === 'terminal';
      this.syncBtn.disabled = false;
      this.syncBtn.textContent = this.getLabels(isTerminal).syncBtn;
    }
  }

  private formatSyncStatus(status: SyncStatus): string {
    if (status.syncError) {
      return 'Using cached data ⚠';
    }
    if (!status.lastSyncTime) {
      return '';
    }
    const minutes = Math.floor((Date.now() - status.lastSyncTime) / 60000);
    if (minutes < 1) return 'Last sync: just now ✓';
    if (minutes === 1) return 'Last sync: 1 min ago ✓';
    return `Last sync: ${minutes} min ago ✓`;
  }

  private escapeAttr(str: string): string {
    return str.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
}
