export class ThemeManager {
  get(): 'neutral' {
    return 'neutral';
  }

  apply(): void {
    document.documentElement.setAttribute('data-theme', 'neutral');
  }
}
