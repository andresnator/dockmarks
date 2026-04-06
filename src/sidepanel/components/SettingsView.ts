import { ThemeManager } from '../../shared/theme';

interface SettingsViewOptions {
  onUrlSave: (url: string) => void;
  onSyncClick: () => void;
  onThemeChange: () => void;
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

  render(currentUrl: string, status: SyncStatus): void {
    this.el.innerHTML = `
      <div class="settings-view">
        <div class="settings-header">Settings</div>

        <div class="settings-section">
          <div class="settings-section-label">Data Source</div>
          <div class="settings-url-row">
            <input
              type="url"
              class="settings-url-input"
              placeholder="https://example.com/bookmarks.json"
              value="${this.escapeAttr(currentUrl)}"
              autocomplete="off"
              spellcheck="false"
            />
            <button class="settings-sync-btn">Sync</button>
          </div>
          <div class="settings-sync-status ${status.syncError ? 'error' : 'success'}">
            ${this.formatSyncStatus(status)}
          </div>
        </div>
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
      this.syncBtn.textContent = 'Syncing...';
      this.options.onSyncClick();
    });
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
      this.syncBtn.disabled = false;
      this.syncBtn.textContent = 'Sync';
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
