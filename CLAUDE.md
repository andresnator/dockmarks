# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run build        # production build → dist/
npm run dev          # watch mode (incremental builds)
npm test             # run all unit tests
npm run typecheck    # TypeScript check without emitting
```

Run a single test file:
```bash
npx vitest run tests/unit/search.test.ts
```

## Architecture

Chrome MV3 extension with two independent entry points built by Vite:

- **`src/background/service-worker.ts`** — runs as a Chrome service worker. Registers a `chrome.alarms` job (60 min interval) and handles `SYNC_NOW` messages. Fetches the remote JSON, hashes the content to detect changes, and writes to `chrome.storage.local`. Never touches the DOM.

- **`src/sidepanel/main.ts`** — the UI entry point. Owns all state (`allBookmarks`, `searchQuery`, `activeSection`, theme). Instantiates components and wires them together. Listens for `SYNC_COMPLETE` messages from the service worker to refresh the view.

### Shared layer (`src/shared/`)

Pure logic, no Chrome API calls except through typed wrappers:
- `storage.ts` — typed wrappers around `chrome.storage.sync` and `chrome.storage.local`
- `bookmarks.ts` — `fetchBookmarks()` (HTTP) and `hashContent()` (SHA-256 via WebCrypto)
- `search.ts` — fuzzy-ish filter over `name`, `description`, `tags`
- `recentlyUsed.ts` — persists and retrieves recently clicked bookmark IDs
- `theme.ts` — `ThemeManager` class; reads/writes theme to sync storage and applies CSS class to `<body>`
- `types.ts` — all shared interfaces and types (`Bookmark`, `SyncStorage`, `LocalStorage`, `MessageType`, `Theme`)

### UI components (`src/sidepanel/components/`)

Each component is a class that owns a DOM element passed in at construction. No framework — components render via `innerHTML` or direct DOM mutation. Pattern: `constructor(el, callbacks)` → `update(data)` or `render(data)`.

### Storage split

- `chrome.storage.sync` — user settings: `jsonUrl`, `theme`, `lastSyncTime` (synced across devices)
- `chrome.storage.local` — cached data: `bookmarks[]`, `lastSyncHash`, `syncError`, `syncErrorTime` (device-local)

### Build output

Vite produces two chunks:
- `dist/service-worker.js` — fixed name (required by manifest)
- `dist/assets/sidepanel-[hash].js` + `dist/assets/sidepanel-[hash].css`
- `dist/src/sidepanel/index.html` (relative to dist root)

The `dist/` folder is what gets loaded as an unpacked extension.

### Tests

Unit tests live in `tests/unit/`. `tests/setup.ts` mocks the full `chrome` global (storage, runtime, alarms). Tests cover `search.ts`, `storage.ts`, and `bookmarks.ts`. No DOM/component tests.

Path aliases available: `@shared/*` → `src/shared/*`, `@components/*` → `src/sidepanel/components/*`.
