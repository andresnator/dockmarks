import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { SettingsView } from '@components/SettingsView';
import { ThemeManager } from '../../src/shared/theme';

function makeThemeManager(): ThemeManager {
  const tm = new ThemeManager();
  vi.spyOn(tm, 'get').mockReturnValue('neutral');
  return tm;
}

describe('SettingsView — labels', () => {
  let container: HTMLElement;
  const defaultStatus = { lastSyncTime: undefined, syncError: false };

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  it('renders "Data Source" label', () => {
    const view = new SettingsView(container, {
      onUrlSave: () => {},
      onSyncClick: () => {},
      onThemeChange: () => {},
      themeManager: makeThemeManager(),
    });
    view.render('', defaultStatus);
    expect(container.innerHTML).toContain('Data Source');
  });

  it('renders "Sync" button text', () => {
    const view = new SettingsView(container, {
      onUrlSave: () => {},
      onSyncClick: () => {},
      onThemeChange: () => {},
      themeManager: makeThemeManager(),
    });
    view.render('', defaultStatus);
    const btn = container.querySelector<HTMLButtonElement>('.settings-sync-btn');
    expect(btn).not.toBeNull();
    expect(btn!.textContent).toBe('Sync');
  });

  it('renders "Settings" header', () => {
    const view = new SettingsView(container, {
      onUrlSave: () => {},
      onSyncClick: () => {},
      onThemeChange: () => {},
      themeManager: makeThemeManager(),
    });
    view.render('', defaultStatus);
    expect(container.innerHTML).toContain('Settings');
  });

  it('does NOT render theme selector', () => {
    const view = new SettingsView(container, {
      onUrlSave: () => {},
      onSyncClick: () => {},
      onThemeChange: () => {},
      themeManager: makeThemeManager(),
    });
    view.render('', defaultStatus);
    expect(container.querySelector('.theme-selector')).toBeNull();
    expect(container.querySelector('.theme-card')).toBeNull();
  });

  it('does NOT render settings-dock-decor', () => {
    const view = new SettingsView(container, {
      onUrlSave: () => {},
      onSyncClick: () => {},
      onThemeChange: () => {},
      themeManager: makeThemeManager(),
    });
    view.render('', defaultStatus);
    expect(container.querySelector('.settings-dock-decor')).toBeNull();
  });
});
