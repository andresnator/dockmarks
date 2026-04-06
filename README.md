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

Host a JSON file at any URL. The file must be a JSON array of bookmark objects.

```json
[
  {
    "id": "sentry",
    "name": "Sentry",
    "url": "https://sentry.io",
    "description": "Error tracking, performance monitoring, and release health.",
    "logo": "https://www.google.com/s2/favicons?domain=sentry.io&sz=128",
    "section": "TELEMETRY",
    "tags": ["errors", "performance", "releases"]
  }
]
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | ✅ | Unique kebab-case identifier (e.g. `docker-hub`, `my-app`) |
| `name` | string | ✅ | Display name shown in the card |
| `url` | string | ✅ | The URL the bookmark opens |
| `section` | string | ✅ | Tab/category in `SCREAMING_SNAKE_CASE` |
| `description` | string | — | One-sentence subtitle shown in the card (≤ 80 chars) |
| `logo` | string | — | Icon URL — use the Google Favicon API (see below) |
| `tags` | string[] | — | 2–4 lowercase kebab-case strings for search |

### Sections

Sections become navigation tabs in the side panel. Use `SCREAMING_SNAKE_CASE`.  
Recommended values (extend as needed):

| Section | Purpose |
|---------|---------|
| `ENGINEERING` | Dev tools, repos, CI/CD |
| `COLLABORATION` | Docs, chat, project management |
| `TELEMETRY` | Monitoring, analytics, observability |
| `SECURITY` | Auth, secrets, compliance |
| `CLOUD` | Infrastructure, hosting, databases |
| `DATA` | Warehousing, BI, pipelines |

### Logo — Google Favicon API

The easiest way to get a consistent icon for any bookmark:

```
https://www.google.com/s2/favicons?domain=<root-domain>&sz=128
```

Always use the **root domain** (no subdomain, no path):

```
https://app.datadoghq.com  →  domain=datadoghq.com
https://cloud.google.com   →  domain=google.com
```

### Building entries with AI

If you use Claude Code or any AI assistant, paste the URL and ask it to generate the entry — the `dockmarks-json-builder` skill handles it automatically:

> "Add `https://linear.app` to my bookmarks JSON"

The AI will infer `id`, `section`, `logo`, `tags`, and `description` following project conventions, and output a ready-to-paste JSON object.

See [`skills/dockmarks-json-builder/`](skills/dockmarks-json-builder/) for the full skill reference, annotated template, and JSON Schema.

### Full example feed

See [`bookmarks.example.json`](bookmarks.example.json) for 50+ real entries covering all sections.

## Configuration

Open the side panel → click the gear icon ⚙ → enter your JSON URL → Save.

## Stack

- TypeScript + Vite (multi-entry build)
- Chrome MV3 (Side Panel API, Storage API, Alarms API)
- Vitest for unit tests
- No framework — vanilla DOM components

## License

[MIT](LICENSE)
