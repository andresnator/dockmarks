import { getSyncStorage, setSyncStorage } from './storage';
import type { Theme } from './types';

export class ThemeManager {
  private current: Theme = 'neutral';

  async load(): Promise<void> {
    const data = await getSyncStorage(['theme']);
    this.current = data.theme ?? 'neutral';
    this.apply();
  }

  get(): Theme {
    return this.current;
  }

  async set(theme: Theme): Promise<void> {
    this.current = theme;
    this.apply();
    await setSyncStorage({ theme });
  }

  apply(): void {
    document.documentElement.setAttribute('data-theme', this.current);
  }
}
