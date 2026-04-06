import { describe, it, expect, beforeEach } from 'vitest';
import { ThemeManager } from '../../src/shared/theme';

describe('ThemeManager', () => {
  let manager: ThemeManager;

  beforeEach(() => {
    document.documentElement.removeAttribute('data-theme');
    manager = new ThemeManager();
  });

  describe('get', () => {
    it('always returns neutral', () => {
      expect(manager.get()).toBe('neutral');
    });
  });

  describe('apply', () => {
    it('sets data-theme="neutral" on document element', () => {
      manager.apply();
      expect(document.documentElement.getAttribute('data-theme')).toBe('neutral');
    });
  });
});
