# Dockmarks

Chrome extension (MV3) — corporate bookmark side panel that loads links from a team-managed JSON URL.

## Features

- Side panel accessible from any tab
- Bookmarks loaded from a remote JSON endpoint
- Real-time search
- Section-based navigation (tabs per category)
- Recently used bookmarks sorted first
- Background auto-sync via `chrome.alarms`
- Neutral appearance (clean, light)

## Development

```bash
npm install
npm run build      # production build → dist/
npm run dev        # watch mode
npm test           # run tests
npm run typecheck  # TypeScript check
```

## Load in Chrome

1. Run `npm run build`
2. Go to `chrome://extensions/`
3. Enable **Developer mode**
4. Click **Load unpacked** → select the `dist/` folder

## Bookmark JSON format

Host a JSON file at any URL with this structure:

```json
[
  {
    "id": "jira",
    "name": "Jira",
    "url": "https://yourcompany.atlassian.net",
    "section": "TOOLS",
    "description": "Issue tracker"
  }
]
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | ✅ | Unique identifier |
| `name` | string | ✅ | Display name |
| `url` | string | ✅ | Link URL |
| `section` | string | ✅ | Tab/category name (e.g. `SITES`, `WIKIS`) |
| `description` | string | — | Shown as subtitle in the card |

## Configuration

Open the side panel → click the gear icon ⚙ → enter your JSON URL → Save.

## Stack

- TypeScript + Vite (multi-entry build)
- Chrome MV3 (Side Panel API, Storage API, Alarms API)
- Vitest for unit tests
- No framework — vanilla DOM components

## License

[MIT](LICENSE)
