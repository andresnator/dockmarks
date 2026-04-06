# Privacy Policy

**Dockmarks** is a Chrome extension that displays team bookmarks in a side panel, loaded from a JSON URL configured by the user.

## Data collection

Dockmarks does **not** collect, transmit, or share any personal data. Specifically:

- No personal information (name, email, address)
- No authentication data (passwords, tokens)
- No browsing history or web activity
- No location data
- No analytics, telemetry, or usage tracking

## Data stored locally

Dockmarks uses Chrome's built-in storage APIs to save:

| Data | Storage | Purpose |
|------|---------|---------|
| JSON URL | `chrome.storage.sync` | The remote URL you configure in Settings |
| Last sync time | `chrome.storage.sync` | Displayed in the Settings panel |
| Cached bookmarks | `chrome.storage.local` | Loaded from your JSON URL so the panel opens instantly |
| Content hash | `chrome.storage.local` | Detects changes in the remote JSON to avoid unnecessary updates |
| Recently used IDs | `chrome.storage.local` | Sorts your most-used bookmarks first |

This data never leaves your browser. Sync storage is synced across your own Chrome profile by Google — Dockmarks has no server and no access to this sync.

## Network requests

The only network request Dockmarks makes is an HTTP GET to the JSON URL you configure. This happens:

- When you click **Sync** in Settings
- Automatically every 60 minutes via a background alarm

No other external connections are made.

## Third-party services

Dockmarks does not use any third-party services, SDKs, or analytics platforms.

## Changes to this policy

If this policy changes, the update will be posted in this repository. The date below reflects the latest revision.

## Contact

For questions or concerns, open an issue at [github.com/Andresnator/dockmarks](https://github.com/Andresnator/dockmarks/issues).

---

*Last updated: 2026-04-06*
