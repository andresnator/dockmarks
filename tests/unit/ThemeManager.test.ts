import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ThemeManager } from '../../src/shared/theme';

describe('ThemeManager', () => {
  let manager: ThemeManager;

  beforeEach(() => {
    vi.clearAllMocks();
    document.documentElement.removeAttribute('data-theme');
    manager = new ThemeManager();
  });

  describe('load', () => {
    it('defaults to neutral when no theme stored', async () => {
      vi.mocked(chrome.storage.sync.get).mockResolvedValue({});

      await manager.load();

      expect(manager.get()).toBe('neutral');
      expect(document.documentElement.getAttribute('data-theme')).toBe('neutral');
    });

    it('loads stored theme', async () => {
      vi.mocked(chrome.storage.sync.get).mockResolvedValue({ theme: 'terminal' });

      await manager.load();

      expect(manager.get()).toBe('terminal');
      expect(document.documentElement.getAttribute('data-theme')).toBe('terminal');
    });
  });

  describe('set', () => {
    it('updates current theme and persists to storage', async () => {
      await manager.set('terminal');

      expect(manager.get()).toBe('terminal');
      expect(chrome.storage.sync.set).toHaveBeenCalledWith({ theme: 'terminal' });
    });

    it('applies theme to DOM', async () => {
      await manager.set('terminal');

      expect(document.documentElement.getAttribute('data-theme')).toBe('terminal');
    });
  });

  describe('apply', () => {
    it('sets data-theme attribute on document element', () => {
      manager.apply();

      expect(document.documentElement.getAttribute('data-theme')).toBe('neutral');
    });
  });

  describe('get', () => {
    it('returns neutral by default', () => {
      expect(manager.get()).toBe('neutral');
    });
  });
});
