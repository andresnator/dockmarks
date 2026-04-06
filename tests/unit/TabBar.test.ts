import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TabBar } from '@components/TabBar';
import type { Bookmark } from '@shared/types';

const makeBookmarks = (sections: string[]): Bookmark[] =>
  sections.map((section, i) => ({
    id: String(i),
    name: `Item ${i}`,
    url: `https://example.com/${i}`,
    section,
  }));

const makeTabBar = (container: HTMLElement): TabBar =>
  new TabBar(container, { onTabChange: () => {} });

describe('TabBar — scroll fade indicators', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    container.id = 'tabbar';
    document.body.appendChild(container);
  });

  afterEach(() => {
    // Clean up: remove wrapper if it exists, otherwise remove container
    const wrapper = document.getElementById('tabbar-wrapper');
    if (wrapper) {
      wrapper.remove();
    } else {
      container.remove();
    }
  });

  describe('DOM structure', () => {
    it('wraps #tabbar in a #tabbar-wrapper element', () => {
      makeTabBar(container);
      const wrapper = document.getElementById('tabbar-wrapper');
      expect(wrapper).not.toBeNull();
      expect(wrapper!.contains(container)).toBe(true);
    });

    it('creates a left fade span with aria-hidden="true"', () => {
      makeTabBar(container);
      const wrapper = document.getElementById('tabbar-wrapper')!;
      const fadeLeft = wrapper.querySelector('.tabbar-fade--left');
      expect(fadeLeft).not.toBeNull();
      expect(fadeLeft!.getAttribute('aria-hidden')).toBe('true');
    });

    it('creates a right fade span with aria-hidden="true"', () => {
      makeTabBar(container);
      const wrapper = document.getElementById('tabbar-wrapper')!;
      const fadeRight = wrapper.querySelector('.tabbar-fade--right');
      expect(fadeRight).not.toBeNull();
      expect(fadeRight!.getAttribute('aria-hidden')).toBe('true');
    });

    it('both fades have the tabbar-fade class', () => {
      makeTabBar(container);
      const wrapper = document.getElementById('tabbar-wrapper')!;
      const fades = wrapper.querySelectorAll('.tabbar-fade');
      expect(fades.length).toBe(2);
    });
  });

  describe('updateFades — no overflow', () => {
    it('no overflow → neither has-left-fade nor has-right-fade on wrapper', () => {
      const tabbar = makeTabBar(container);
      tabbar.update(makeBookmarks(['A', 'B']));

      // jsdom default: scrollLeft=0, scrollWidth=0, clientWidth=0 → no overflow
      const wrapper = document.getElementById('tabbar-wrapper')!;
      expect(wrapper.classList.contains('has-left-fade')).toBe(false);
      expect(wrapper.classList.contains('has-right-fade')).toBe(false);
    });
  });

  describe('updateFades — overflow right (at start)', () => {
    it('scrollLeft=0, scrollWidth > clientWidth → has-right-fade, no has-left-fade', () => {
      const tabbar = makeTabBar(container);
      tabbar.update(makeBookmarks(['A', 'B', 'C']));

      // Simulate overflow to the right
      Object.defineProperty(container, 'scrollLeft', { value: 0, writable: true, configurable: true });
      Object.defineProperty(container, 'scrollWidth', { value: 400, writable: true, configurable: true });
      Object.defineProperty(container, 'clientWidth', { value: 200, writable: true, configurable: true });

      container.dispatchEvent(new Event('scroll'));

      const wrapper = document.getElementById('tabbar-wrapper')!;
      expect(wrapper.classList.contains('has-right-fade')).toBe(true);
      expect(wrapper.classList.contains('has-left-fade')).toBe(false);
    });
  });

  describe('updateFades — scrolled right (partial)', () => {
    it('scrollLeft > 0, not at end → has-left-fade', () => {
      const tabbar = makeTabBar(container);
      tabbar.update(makeBookmarks(['A', 'B', 'C']));

      Object.defineProperty(container, 'scrollLeft', { value: 50, writable: true, configurable: true });
      Object.defineProperty(container, 'scrollWidth', { value: 400, writable: true, configurable: true });
      Object.defineProperty(container, 'clientWidth', { value: 200, writable: true, configurable: true });

      container.dispatchEvent(new Event('scroll'));

      const wrapper = document.getElementById('tabbar-wrapper')!;
      expect(wrapper.classList.contains('has-left-fade')).toBe(true);
    });

    it('scrollLeft > 0, not at end → has-right-fade also visible (both fades)', () => {
      const tabbar = makeTabBar(container);
      tabbar.update(makeBookmarks(['A', 'B', 'C']));

      Object.defineProperty(container, 'scrollLeft', { value: 50, writable: true, configurable: true });
      Object.defineProperty(container, 'scrollWidth', { value: 400, writable: true, configurable: true });
      Object.defineProperty(container, 'clientWidth', { value: 200, writable: true, configurable: true });

      container.dispatchEvent(new Event('scroll'));

      const wrapper = document.getElementById('tabbar-wrapper')!;
      expect(wrapper.classList.contains('has-left-fade')).toBe(true);
      expect(wrapper.classList.contains('has-right-fade')).toBe(true);
    });
  });

  describe('updateFades — scrolled to end', () => {
    it('scrollLeft + clientWidth >= scrollWidth → no has-right-fade', () => {
      const tabbar = makeTabBar(container);
      tabbar.update(makeBookmarks(['A', 'B', 'C']));

      Object.defineProperty(container, 'scrollLeft', { value: 200, writable: true, configurable: true });
      Object.defineProperty(container, 'scrollWidth', { value: 400, writable: true, configurable: true });
      Object.defineProperty(container, 'clientWidth', { value: 200, writable: true, configurable: true });

      container.dispatchEvent(new Event('scroll'));

      const wrapper = document.getElementById('tabbar-wrapper')!;
      expect(wrapper.classList.contains('has-right-fade')).toBe(false);
    });

    it('scrolled to end → has-left-fade is still visible', () => {
      const tabbar = makeTabBar(container);
      tabbar.update(makeBookmarks(['A', 'B', 'C']));

      Object.defineProperty(container, 'scrollLeft', { value: 200, writable: true, configurable: true });
      Object.defineProperty(container, 'scrollWidth', { value: 400, writable: true, configurable: true });
      Object.defineProperty(container, 'clientWidth', { value: 200, writable: true, configurable: true });

      container.dispatchEvent(new Event('scroll'));

      const wrapper = document.getElementById('tabbar-wrapper')!;
      expect(wrapper.classList.contains('has-left-fade')).toBe(true);
    });
  });

  describe('updateFades re-evaluated after update()', () => {
    it('update() re-evaluates fades with current scroll state', () => {
      const tabbar = makeTabBar(container);

      // Set overflow state before update
      Object.defineProperty(container, 'scrollLeft', { value: 0, writable: true, configurable: true });
      Object.defineProperty(container, 'scrollWidth', { value: 400, writable: true, configurable: true });
      Object.defineProperty(container, 'clientWidth', { value: 200, writable: true, configurable: true });

      tabbar.update(makeBookmarks(['A', 'B', 'C', 'D', 'E']));

      const wrapper = document.getElementById('tabbar-wrapper')!;
      // After update with overflow, right fade should be visible
      expect(wrapper.classList.contains('has-right-fade')).toBe(true);
    });
  });
});
