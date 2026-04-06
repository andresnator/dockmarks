---
name: dockmarks-json-builder
description: >
  Generates a valid Dockmarks bookmark JSON entry from a URI, following the
  Bookmark interface defined in src/shared/types.ts.
  Trigger: When the user provides a URL or URI and wants to add it as a bookmark entry to the Dockmarks JSON feed.
license: Apache-2.0
metadata:
  author: gentleman-programming
  version: "1.0"
---

## When to Use

- User provides a URL/URI and asks to add it as a bookmark
- User asks to generate a JSON entry for the Dockmarks feed
- User asks for the bookmark JSON template or schema
- User is building or editing the remote `bookmarks.json` file

## Critical Patterns

### 1. Always use the full template — never omit optional fields

Even if values are unknown, include all fields with sensible defaults or empty markers.
The AI consuming this JSON must never guess field names.

### 2. `id` must be unique kebab-case derived from the name or domain

```
"https://linear.app"  →  id: "linear"
"https://app.datadoghq.com"  →  id: "datadog"
"https://www.atlassian.com/software/jira"  →  id: "jira"
```

Rules:
- Lowercase only
- Hyphens instead of spaces or underscores
- Strip `www.`, protocol, and path segments unless needed for uniqueness
- If the tool/service has a common short name, prefer it (e.g. `gitlab` not `gitlab-com`)

### 3. `logo` uses Google Favicon API — always at 128px

```
"logo": "https://www.google.com/s2/favicons?domain=<root-domain>&sz=128"
```

Extract the **root domain** from the URI (no subdomain, no path):
- `https://app.datadoghq.com/logs` → `domain=datadoghq.com`
- `https://cloud.google.com/looker` → `domain=google.com`
- `https://www.atlassian.com/software/jira` → `domain=atlassian.com`

### 4. `section` must be SCREAMING_SNAKE_CASE

Use one of the established sections from `bookmarks.example.json`:
- `ENGINEERING`
- `COLLABORATION`
- `TELEMETRY`
- `SECURITY`
- `CLOUD`
- `DATA`

If none fits, propose a new section name in SCREAMING_SNAKE_CASE and ask the user to confirm.

### 5. `tags` — 2 to 4 lowercase kebab-case strings

Pick terms that a user would naturally search for. Prioritize:
1. The tool category (e.g. `ci-cd`, `database`, `auth`)
2. The primary use case (e.g. `error-tracking`, `pull-requests`)
3. The ecosystem (e.g. `atlassian`, `google`, `aws`)

### 6. `description` — one sentence, ≤ 80 characters, present tense

Describe what the tool DOES, not what it IS.

| ✅ DO | ❌ DON'T |
|-------|---------|
| `"Error tracking, performance monitoring, and release health."` | `"Sentry is a platform for error monitoring."` |
| `"API design, testing, collections, and collaboration."` | `"A tool to test APIs."` |

---

## Step-by-Step Workflow

When the user provides a URI:

1. **Parse** the URI → extract `domain`, `name` candidate, and `section` candidate
2. **Infer** `id` from domain/name (kebab-case, unique)
3. **Build** `logo` URL using the Google Favicon API
4. **Ask** only if truly ambiguous: `name`, `section`, `description`, or `tags`
5. **Output** the complete JSON object using the template below

---

## JSON Template

```json
{
  "id": "<kebab-case-unique-id>",
  "name": "<Human-readable display name>",
  "url": "<exact URI provided by the user>",
  "description": "<one sentence, present tense, ≤ 80 chars>",
  "logo": "https://www.google.com/s2/favicons?domain=<root-domain>&sz=128",
  "section": "<SCREAMING_SNAKE_CASE>",
  "tags": ["<tag1>", "<tag2>", "<tag3>"]
}
```

See [assets/bookmark-template.json](assets/bookmark-template.json) for the annotated template.
See [assets/schema.json](assets/schema.json) for the full JSON Schema (validation).

---

## Example

**Input:** `https://sentry.io`

**Output:**
```json
{
  "id": "sentry",
  "name": "Sentry",
  "url": "https://sentry.io",
  "description": "Error tracking, performance monitoring, and release health.",
  "logo": "https://www.google.com/s2/favicons?domain=sentry.io&sz=128",
  "section": "TELEMETRY",
  "tags": ["errors", "performance", "releases"]
}
```

---

**Input:** `https://www.atlassian.com/software/jira`

**Output:**
```json
{
  "id": "jira",
  "name": "Jira",
  "url": "https://www.atlassian.com/software/jira",
  "description": "Issue tracking, sprint planning, and delivery workflows.",
  "logo": "https://www.google.com/s2/favicons?domain=atlassian.com&sz=128",
  "section": "ENGINEERING",
  "tags": ["issues", "sprints", "agile"]
}
```

---

## Commands

```bash
# Validate your JSON against the schema
npx ajv validate -s skills/dockmarks-json-builder/assets/schema.json -d your-bookmark.json

# Check the example file is valid
npx ajv validate -s skills/dockmarks-json-builder/assets/schema.json -d bookmarks.example.json
```

## Resources

- **Template**: See [assets/bookmark-template.json](assets/bookmark-template.json) — annotated blank entry
- **Schema**: See [assets/schema.json](assets/schema.json) — JSON Schema for validation
- **Types**: `src/shared/types.ts` — source of truth for the `Bookmark` interface
- **Example feed**: `bookmarks.example.json` — 50+ real entries to reference patterns
