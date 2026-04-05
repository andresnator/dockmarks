import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Header } from '@components/Header';

describe('Header — dynamic placeholder', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    // Reset theme on body before each test
    delete document.body.dataset['theme'];
  });

  afterEach(() => {
    container.remove();
  });

  it('renders placeholder "Search bookmarks..." when theme is neutral (not set)', () => {
    new Header(container, {
      onSettingsClick: () => {},
      onSearch: () => {},
    });
    const input = container.querySelector<HTMLInputElement>('.search-input');
    expect(input).not.toBeNull();
    expect(input!.placeholder).toBe('Search bookmarks...');
  });

  it('renders placeholder "$ search..." when theme is terminal', () => {
    document.body.dataset['theme'] = 'terminal';
    new Header(container, {
      onSettingsClick: () => {},
      onSearch: () => {},
    });
    const input = container.querySelector<HTMLInputElement>('.search-input');
    expect(input).not.toBeNull();
    expect(input!.placeholder).toBe('$ search...');
  });

  it('updatePlaceholder changes from neutral to terminal', () => {
    const header = new Header(container, {
      onSettingsClick: () => {},
      onSearch: () => {},
    });
    const input = container.querySelector<HTMLInputElement>('.search-input')!;
    expect(input.placeholder).toBe('Search bookmarks...');

    document.body.dataset['theme'] = 'terminal';
    header.updatePlaceholder();

    expect(input.placeholder).toBe('$ search...');
  });

  it('updatePlaceholder changes from terminal to neutral', () => {
    document.body.dataset['theme'] = 'terminal';
    const header = new Header(container, {
      onSettingsClick: () => {},
      onSearch: () => {},
    });
    const input = container.querySelector<HTMLInputElement>('.search-input')!;
    expect(input.placeholder).toBe('$ search...');

    delete document.body.dataset['theme'];
    header.updatePlaceholder();

    expect(input.placeholder).toBe('Search bookmarks...');
  });
});
