import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Header } from '@components/Header';

describe('Header — dynamic placeholder', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  it('renders placeholder "Search bookmarks..."', () => {
    new Header(container, {
      onSettingsClick: () => {},
      onSearch: () => {},
    });
    const input = container.querySelector<HTMLInputElement>('.search-input');
    expect(input).not.toBeNull();
    expect(input!.placeholder).toBe('Search bookmarks...');
  });

  it('updatePlaceholder keeps "Search bookmarks..."', () => {
    const header = new Header(container, {
      onSettingsClick: () => {},
      onSearch: () => {},
    });
    const input = container.querySelector<HTMLInputElement>('.search-input')!;
    header.updatePlaceholder();
    expect(input.placeholder).toBe('Search bookmarks...');
  });
});
