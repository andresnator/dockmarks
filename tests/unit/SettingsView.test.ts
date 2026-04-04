import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { SettingsView } from '@components/SettingsView';
import type { Theme } from '../../src/shared/types';
import { ThemeManager } from '../../src/shared/theme';

function makeThemeManager(theme: Theme): ThemeManager {
  const tm = new ThemeManager();
  vi.spyOn(tm, 'get').mockReturnValue(theme);
  return tm;
}

describe('SettingsView — labels and decorators', () => {
  let container: HTMLElement;
  const defaultStatus = { lastSyncTime: undefined, syncError: false };

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    delete document.body.dataset['theme'];
  });

  afterEach(() => {
    container.remove();
    delete document.body.dataset['theme'];
  });

  describe('neutral theme labels', () => {
    it('renders "Data Source" label', () => {
      const view = new SettingsView(container, {
        onUrlSave: () => {},
        onSyncClick: () => {},
        onThemeChange: () => {},
        themeManager: makeThemeManager('neutral'),
      });
      view.render('', defaultStatus);
      expect(container.innerHTML).toContain('Data Source');
    });

    it('renders "Sync" button text', () => {
      const view = new SettingsView(container, {
        onUrlSave: () => {},
        onSyncClick: () => {},
        onThemeChange: () => {},
        themeManager: makeThemeManager('neutral'),
      });
      view.render('', defaultStatus);
      const btn = container.querySelector<HTMLButtonElement>('.settings-sync-btn');
      expect(btn).not.toBeNull();
      expect(btn!.textContent).toBe('Sync');
    });

    it('renders "Theme" section label', () => {
      const view = new SettingsView(container, {
        onUrlSave: () => {},
        onSyncClick: () => {},
        onThemeChange: () => {},
        themeManager: makeThemeManager('neutral'),
      });
      view.render('', defaultStatus);
      expect(container.innerHTML).toContain('Theme');
    });

    it('renders "Neutral" theme card label', () => {
      const view = new SettingsView(container, {
        onUrlSave: () => {},
        onSyncClick: () => {},
        onThemeChange: () => {},
        themeManager: makeThemeManager('neutral'),
      });
      view.render('', defaultStatus);
      expect(container.innerHTML).toContain('Neutral');
    });

    it('renders "Terminal" theme card label', () => {
      const view = new SettingsView(container, {
        onUrlSave: () => {},
        onSyncClick: () => {},
        onThemeChange: () => {},
        themeManager: makeThemeManager('neutral'),
      });
      view.render('', defaultStatus);
      expect(container.innerHTML).toContain('Terminal');
    });

    it('does NOT render settings-dock-decor in neutral theme', () => {
      const view = new SettingsView(container, {
        onUrlSave: () => {},
        onSyncClick: () => {},
        onThemeChange: () => {},
        themeManager: makeThemeManager('neutral'),
      });
      view.render('', defaultStatus);
      expect(container.querySelector('.settings-dock-decor')).toBeNull();
    });
  });

  describe('terminal theme labels', () => {
    beforeEach(() => {
      document.body.dataset['theme'] = 'terminal';
    });

    it('renders "> Data Source" label', () => {
      const view = new SettingsView(container, {
        onUrlSave: () => {},
        onSyncClick: () => {},
        onThemeChange: () => {},
        themeManager: makeThemeManager('terminal'),
      });
      view.render('', defaultStatus);
      expect(container.innerHTML).toContain('&gt; Data Source');
    });

    it('renders "[ sync ]" button text', () => {
      const view = new SettingsView(container, {
        onUrlSave: () => {},
        onSyncClick: () => {},
        onThemeChange: () => {},
        themeManager: makeThemeManager('terminal'),
      });
      view.render('', defaultStatus);
      const btn = container.querySelector<HTMLButtonElement>('.settings-sync-btn');
      expect(btn).not.toBeNull();
      expect(btn!.textContent).toBe('[ sync ]');
    });

    it('renders "> Theme" section label', () => {
      const view = new SettingsView(container, {
        onUrlSave: () => {},
        onSyncClick: () => {},
        onThemeChange: () => {},
        themeManager: makeThemeManager('terminal'),
      });
      view.render('', defaultStatus);
      expect(container.innerHTML).toContain('&gt; Theme');
    });

    it('renders "Neutral" theme card label in terminal theme', () => {
      const view = new SettingsView(container, {
        onUrlSave: () => {},
        onSyncClick: () => {},
        onThemeChange: () => {},
        themeManager: makeThemeManager('terminal'),
      });
      view.render('', defaultStatus);
      expect(container.innerHTML).toContain('Neutral');
    });

    it('renders "Terminal" theme card label in terminal theme', () => {
      const view = new SettingsView(container, {
        onUrlSave: () => {},
        onSyncClick: () => {},
        onThemeChange: () => {},
        themeManager: makeThemeManager('terminal'),
      });
      view.render('', defaultStatus);
      expect(container.innerHTML).toContain('Terminal');
    });

    it('does NOT render old terminal labels (SYSTEM_DATA_SRC, EXECUTE_SYNC, etc.)', () => {
      const view = new SettingsView(container, {
        onUrlSave: () => {},
        onSyncClick: () => {},
        onThemeChange: () => {},
        themeManager: makeThemeManager('terminal'),
      });
      view.render('', defaultStatus);
      const html = container.innerHTML;
      expect(html).not.toContain('SYSTEM_DATA_SRC');
      expect(html).not.toContain('EXECUTE_SYNC');
      expect(html).not.toContain('UI_ENVIRONMENT');
      expect(html).not.toContain('NEUTRAL_ENV');
      expect(html).not.toContain('TERMINAL_ENV');
    });

    it('renders settings-dock-decor with text DOCK in terminal theme', () => {
      const view = new SettingsView(container, {
        onUrlSave: () => {},
        onSyncClick: () => {},
        onThemeChange: () => {},
        themeManager: makeThemeManager('terminal'),
      });
      view.render('', defaultStatus);
      const decor = container.querySelector('.settings-dock-decor');
      expect(decor).not.toBeNull();
      expect(decor!.textContent).toContain('DOCK');
    });
  });
});
