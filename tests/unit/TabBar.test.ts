import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TabBar } from '@components/TabBar';
import type { Bookmark } from '@shared/types';

const makeBookmarks = (sections: string[]): Bookmark[] =>
  sections.map((section, i) => ({
    id: String(i),
    name: `Item ${i}`,
    url: `https://example.com/${i}`,
    section,
  }));

describe('TabBar', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    container.id = 'tabbar';
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  it('renders a button for each unique section plus ALL', () => {
    const tabbar = new TabBar(container, { onTabChange: () => {} });
    tabbar.update(makeBookmarks(['Cloud', 'Data', 'Cloud']));

    const buttons = container.querySelectorAll('.tab-btn');
    expect(buttons.length).toBe(3); // ALL + Cloud + Data
  });

  it('renders ALL as the first tab with empty data-section', () => {
    const tabbar = new TabBar(container, { onTabChange: () => {} });
    tabbar.update(makeBookmarks(['Engineering']));

    const first = container.querySelector('.tab-btn') as HTMLButtonElement;
    expect(first.textContent).toBe('ALL');
    expect(first.dataset['section']).toBe('');
  });

  it('marks active tab with .active class and aria-pressed="true"', () => {
    const tabbar = new TabBar(container, { onTabChange: () => {} });
    tabbar.update(makeBookmarks(['Cloud', 'Data']));

    // Click on Cloud tab
    const cloudBtn = container.querySelectorAll('.tab-btn')[1] as HTMLButtonElement;
    cloudBtn.click();

    // After re-render, find the active button
    const active = container.querySelector('.tab-btn.active') as HTMLButtonElement;
    expect(active).not.toBeNull();
    expect(active.dataset['section']).toBe('Cloud');
    expect(active.getAttribute('aria-pressed')).toBe('true');
  });

  it('calls onTabChange with section name when tab is clicked', () => {
    const spy = vi.fn();
    const tabbar = new TabBar(container, { onTabChange: spy });
    tabbar.update(makeBookmarks(['Cloud', 'Data']));

    const dataBtn = container.querySelectorAll('.tab-btn')[2] as HTMLButtonElement;
    dataBtn.click();

    expect(spy).toHaveBeenCalledWith('Data');
  });

  it('calls onTabChange with null when ALL tab is clicked', () => {
    const spy = vi.fn();
    const tabbar = new TabBar(container, { onTabChange: spy });
    tabbar.update(makeBookmarks(['Cloud']));

    const allBtn = container.querySelector('.tab-btn') as HTMLButtonElement;
    allBtn.click();

    expect(spy).toHaveBeenCalledWith(null);
  });

  it('does not create a #tabbar-wrapper element', () => {
    new TabBar(container, { onTabChange: () => {} });
    expect(document.getElementById('tabbar-wrapper')).toBeNull();
  });

  it('renders tab labels in uppercase', () => {
    const tabbar = new TabBar(container, { onTabChange: () => {} });
    tabbar.update(makeBookmarks(['Cloud', 'Data']));

    const labels = Array.from(container.querySelectorAll('.tab-btn')).map(
      (btn) => btn.textContent,
    );
    expect(labels).toEqual(['ALL', 'CLOUD', 'DATA']);
  });
});
