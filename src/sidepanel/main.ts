import { getSyncStorage, setSyncStorage, getLocalStorage } from '../shared/storage';
import { ThemeManager } from '../shared/theme';
import { filterBookmarks } from '../shared/search';
import { getRecentIds, recordUsage } from '../shared/recentlyUsed';
import { Header } from './components/Header';
import { TabBar } from './components/TabBar';
import { BookmarkGrid } from './components/BookmarkGrid';
import { SettingsView } from './components/SettingsView';
import type { Bookmark, MessageType, Theme } from '../shared/types';

// ---- State ----

let allBookmarks: Bookmark[] = [];
let searchQuery = '';
let activeSection: string | null = null;
let isSettingsOpen = false;
let isSyncing = false;

const themeManager = new ThemeManager();

// ---- DOM refs ----

const headerEl = document.getElementById('header')!;
const tabbarEl = document.getElementById('tabbar')!;
const gridContainer = document.getElementById('grid-container')!;
const settingsContainer = document.getElementById('settings-container')!;
const emptyStateEl = document.getElementById('empty-state')!;

// ---- Components ----

const header = new Header(headerEl, {
  onSettingsClick: toggleSettings,
  onSearch: (query) => {
    searchQuery = query;
    updateGrid();
  },
});

const tabBar = new TabBar(tabbarEl, {
  onTabChange: (section) => {
    activeSection = section;
    updateGrid();
  },
});

const grid = new BookmarkGrid(gridContainer, {
  onBookmarkUsed: (id) => {
    recordUsage(id);
    updateGrid();
  },
});

let settingsView: SettingsView | null = null;

// Add terminal footer to DOM
const terminalFooter = document.createElement('div');
terminalFooter.className = 'terminal-footer';
terminalFooter.innerHTML = `
  <span>STATUS: ONLINE</span>
  <span>ENCRYPTED_AES256</span>
`;
document.getElementById('app')!.appendChild(terminalFooter);

// ---- Init ----

async function init(): Promise<void> {
  // 1. Apply theme
  await themeManager.load();

  // 2. Load settings
  const settings = await getSyncStorage(['jsonUrl', 'lastSyncTime']);

  // 3. Load cached bookmarks
  const cached = await getLocalStorage(['bookmarks', 'syncError', 'syncErrorTime']);
  if (cached.bookmarks && cached.bookmarks.length > 0) {
    allBookmarks = cached.bookmarks;
  }

  // 4. Update header error state
  header.setError(!!cached.syncError);

  // 5. Render grid and tabs
  tabBar.update(allBookmarks);
  updateGrid();

  // 6. Trigger background sync if no URL configured → show empty state
  if (!settings.jsonUrl) {
    showEmptyState('no-url');
    return;
  }

  // 7. If no cache, show loading state
  if (allBookmarks.length === 0 && !cached.syncError) {
    showEmptyState('loading');
  }

  // 8. Request a sync from service worker
  chrome.runtime.sendMessage({ type: 'SYNC_NOW' }).catch(() => {
    // Service worker may not be ready yet — that's OK
  });
}

// ---- Update grid ----

function updateGrid(): void {
  let visible = allBookmarks;

  // Apply tab filter
  if (activeSection !== null) {
    visible = visible.filter((b) => b.section === activeSection);
  } else {
    // "All" tab: recently used first, then alphabetical
    const recentIds = getRecentIds();
    const recentSet = new Set(recentIds);
    const recentItems = recentIds
      .map((id) => visible.find((b) => b.id === id))
      .filter((b): b is Bookmark => b !== undefined);
    const rest = visible
      .filter((b) => !recentSet.has(b.id))
      .sort((a, b) => a.name.localeCompare(b.name));
    visible = [...recentItems, ...rest];
  }

  // Apply search filter
  if (searchQuery.trim()) {
    visible = filterBookmarks(visible, searchQuery);
  }

  // Show/hide empty search state
  if (visible.length === 0 && allBookmarks.length > 0) {
    showEmptyState('no-results');
    return;
  }

  hideEmptyState();
  grid.update(visible);
}

// ---- Settings toggle ----

function toggleSettings(): void {
  isSettingsOpen = !isSettingsOpen;

  if (isSettingsOpen) {
    settingsContainer.hidden = false;
    gridContainer.hidden = true;
    tabbarEl.hidden = true;
    renderSettings();
  } else {
    settingsContainer.hidden = true;
    gridContainer.hidden = false;
    tabbarEl.hidden = false;
    updateGrid();
  }
}

async function renderSettings(): Promise<void> {
  const settings = await getSyncStorage(['jsonUrl', 'lastSyncTime']);
  const local = await getLocalStorage(['syncError']);

  if (!settingsView) {
    settingsView = new SettingsView(settingsContainer, {
      onUrlSave: async (url) => {
        await setSyncStorage({ jsonUrl: url });
        chrome.runtime.sendMessage({ type: 'SYNC_NOW' }).catch(() => {});
      },
      onSyncClick: () => {
        if (isSyncing) return;
        isSyncing = true;
        chrome.runtime.sendMessage({ type: 'SYNC_NOW' }).catch(() => {
          isSyncing = false;
        });
      },
      onThemeChange: async (theme: Theme) => {
        await themeManager.set(theme);
        renderSettings(); // re-render with new theme labels
      },
      themeManager,
    });
  }

  settingsView.render(settings.jsonUrl ?? '', {
    lastSyncTime: settings.lastSyncTime,
    syncError: !!local.syncError,
  });
}

// ---- Empty state ----

type EmptyStateType = 'no-url' | 'loading' | 'no-results' | 'error';

function showEmptyState(type: EmptyStateType): void {
  gridContainer.hidden = true;
  emptyStateEl.hidden = false;

  const isTerminal = themeManager.get() === 'terminal';

  const messages: Record<EmptyStateType, { icon: string; title: string; subtitle: string }> = {
    'no-url': {
      icon: '⚙',
      title: isTerminal ? 'NO_DATA_SOURCE_CONFIGURED' : 'No source configured',
      subtitle: 'Open settings ⚙ and enter your bookmarks JSON URL.',
    },
    'loading': {
      icon: '⟳',
      title: isTerminal ? 'FETCHING_DATA...' : 'Loading bookmarks...',
      subtitle: 'Fetching your bookmarks for the first time.',
    },
    'no-results': {
      icon: '◎',
      title: isTerminal ? 'NO_MATCH_FOUND' : 'No results',
      subtitle: 'Try a different search term.',
    },
    'error': {
      icon: '⚠',
      title: isTerminal ? 'CONNECTION_ERROR' : 'Could not load bookmarks',
      subtitle: 'Check your URL and connection. Using cached data if available.',
    },
  };

  const { icon, title, subtitle } = messages[type];
  emptyStateEl.innerHTML = `
    <div class="empty-state-icon">${icon}</div>
    <div class="empty-state-title">${title}</div>
    <div class="empty-state-subtitle">${subtitle}</div>
  `;
}

function hideEmptyState(): void {
  emptyStateEl.hidden = true;
  gridContainer.hidden = false;
}

// ---- Sync complete listener ----

chrome.runtime.onMessage.addListener((message: MessageType) => {
  if (message.type === 'SYNC_COMPLETE') {
    isSyncing = false;

    // Reload bookmarks from cache
    getLocalStorage(['bookmarks', 'syncError']).then((cached) => {
      if (cached.bookmarks && cached.bookmarks.length > 0) {
        allBookmarks = cached.bookmarks;
      }

      header.setError(!!cached.syncError);

      if (isSettingsOpen && settingsView) {
        getSyncStorage(['lastSyncTime']).then((settings) => {
          settingsView!.updateSyncStatus({
            lastSyncTime: settings.lastSyncTime,
            syncError: !!cached.syncError,
          });
        });
      } else {
        tabBar.update(allBookmarks);
        updateGrid();

        if (cached.syncError && allBookmarks.length === 0) {
          showEmptyState('error');
        }
      }
    });
  }
});

// ---- Boot ----

document.addEventListener('DOMContentLoaded', () => {
  void init();
});
