import { getSyncStorage, getLocalStorage, setLocalStorage } from '../shared/storage';
import { fetchBookmarks, hashContent } from '../shared/bookmarks';
import type { MessageType } from '../shared/types';

const ALARM_NAME = 'dockmarks-sync';
const SYNC_INTERVAL_MINUTES = 60;

// ---- Alarm registration ----

chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.create(ALARM_NAME, {
    periodInMinutes: SYNC_INTERVAL_MINUTES,
  });
  // Open side panel when the action icon is clicked
  void chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
  // Trigger an initial sync on install
  void fetchAndCache();
});

// ---- Alarm handler ----

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === ALARM_NAME) {
    void fetchAndCache();
  }
});

// ---- Message handler ----

chrome.runtime.onMessage.addListener(
  (message: MessageType, _sender, sendResponse) => {
    if (message.type === 'SYNC_NOW') {
      fetchAndCache()
        .then(() => sendResponse({ success: true }))
        .catch(() => sendResponse({ success: false }));
      return true; // Keep message channel open for async response
    }
    return false;
  }
);

// ---- Core sync logic ----

async function fetchAndCache(): Promise<void> {
  const settings = await getSyncStorage(['jsonUrl']);
  const jsonUrl = settings.jsonUrl;

  if (!jsonUrl) {
    // No URL configured — nothing to sync
    return;
  }

  try {
    const { bookmarks, rawText } = await fetchBookmarks(jsonUrl);
    const newHash = await hashContent(rawText);

    const cached = await getLocalStorage(['lastSyncHash', 'bookmarks']);
    const lastHash = cached.lastSyncHash;
    const cachedBookmarks = cached.bookmarks ?? [];

    if (newHash !== lastHash || cachedBookmarks.length === 0) {
      // Content changed, or cache is empty (e.g. after a bug fix) — update cache
      await setLocalStorage({
        bookmarks,
        lastSyncHash: newHash,
        syncError: false,
        syncErrorTime: 0,
      });
    } else {
      // Content unchanged — only clear error flags
      await setLocalStorage({
        syncError: false,
        syncErrorTime: 0,
      });
    }

    // Update last sync time in sync storage
    await chrome.storage.sync.set({ lastSyncTime: Date.now() });

    // Notify sidepanel if open
    notifySidePanel({ type: 'SYNC_COMPLETE' });

  } catch {
    // Network error or HTTP error — preserve cache, set error flag
    await setLocalStorage({
      syncError: true,
      syncErrorTime: Date.now(),
    });

    // Still notify sidepanel so it can update the error indicator
    notifySidePanel({ type: 'SYNC_COMPLETE' });
  }
}

function notifySidePanel(message: MessageType): void {
  // sendMessage may fail if no sidepanel is open — ignore the error
  chrome.runtime.sendMessage(message).catch(() => {
    // Sidepanel not open — this is expected
  });
}
