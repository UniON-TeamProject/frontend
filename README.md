# Team project - UniOn - Frontend

Web client for **UniOn**, a team university project aimed at helping students organize study materials, practice with flashcards, and collaborate in study groups. It is a React single-page application (SPA) that consumes the JSON endpoints exposed by the project's [backend](https://github.com/Programowanie-Zespolowe-2025/backend).

## Purpose

The frontend is the user-facing part of UniOn. It renders the full study workflow and talks to the backend over HTTPS/JSON:

- **Notes and folders** — hierarchical browser with a rich text editor, tagging, soft delete, and restore.
- **Flashcards** — card sets linked to notes or social groups; manual or AI-generated cards.
- **Learning modes** — fast learning sessions and **FSRS** (spaced repetition) review.
- **Calendar** — personal events with tags, deadlines, and recurring-series edits; optional **USOS** sync.
- **Social features** — friends, study groups, roles, and invitation links.
- **Notifications** — in-app notification dropdown with read state.

Authentication is token-based: the backend issues a **JWT** on sign-in, and the client sends it as `Authorization: Bearer <token>` on protected requests. The token is kept in `localStorage` ("remember me") or `sessionStorage`. Protected routes redirect to the welcome page when no valid token is present.

## Features

### Account and security

- Multi-step registration: email → verification code → account data → done.
- Email and username availability checks during sign-up.
- Login with "remember me"; automatic sign-out and `session_expired` message on `401/403`.
- Password reset via email token flow.
- Profile management: password, username, avatar, UI theme, and university (USOS) assignment.
- Email change with a confirmation step; account deletion.

### Notes and folders

- Folder tree for organizing study materials (create, rename, move).
- Rich text note editor built on **TipTap** (headings, lists, images, highlight, typography, Markdown).
- Slash commands (`/`) and a formatting toolbar inside the editor.
- Copy and move notes between folders; soft delete with a trash view and restore.
- Per-note and per-folder tagging with suggestions.
- Export a note to PDF (`html2pdf.js`).

### Flashcards

- Card set and card management (front/back content, tags, edit, delete).
- Create cards manually or generate them from note text with AI.
- Card sets owned by the user or attached to a social study group.
- Bulk add or move cards; copy sets; recent activity; trash with restore / hard delete.

### Learning modes

- **Fast learning mode** — session queue per set, answer tracking, reset progress, statistics.
- **FSRS mode** — spaced repetition review with card ratings and due-card queues.

### Calendar and university integration

- Month grid with personal events (create, edit, delete).
- Query events by date range or by tags.
- Event tagging: predefined, custom, and regular tags; deadlines on events.
- Recurring events: edit or delete a single occurrence, this-and-following, or the full series.
- **USOS** OAuth connection per university, with a dedicated callback page.

### Social and collaboration

- Friend requests: send, accept, reject, and remove.
- Study groups: create, update, delete, manage members and roles, leave.
- Join a group via a shareable invitation link; share card sets in a group context.

### Notifications

- In-app notification feed for the authenticated user.
- Mark single or all notifications as read; clear the list.

### Platform behavior

- Installable **PWA** (`vite-plugin-pwa`, auto-update service worker).
- Theming with multiple color palettes (styled-components `ThemeProvider`), synced with the user's profile.
- Version-based cache-busting — stored data is cleared when the app version changes (the token is preserved).
- Served in production by **Nginx** with SPA fallback to `index.html`.

## Tech stack

| Layer | Technology |
|--------|------------|
| Language | JavaScript (ESM), JSX |
| Framework | React 19 (with React Compiler) |
| Build tool | Vite 7 |
| Routing | React Router 7 |
| State | Redux Toolkit + React Redux |
| Styling | styled-components, Bootstrap Icons |
| Rich text | TipTap 3 + `tiptap-markdown` |
| Other | `react-markdown`, `html2pdf.js`, `react-verification-input` |
| PWA | `vite-plugin-pwa` (Workbox) |
| Tooling | ESLint 9 |
| Runtime / server | Node (build), Nginx (serve) |

## Architecture

```text
Browser (React SPA)
   |
   |  src/api.js  --HTTPS/JSON (Bearer JWT)-->  UniOn backend REST API
   |
   +-- React Router      page routing + protected routes
   +-- Redux Toolkit     global state (theme, ...)
   +-- styled-components  theming
```

All HTTP calls live in `src/api.js`. The API base URL comes from the `VITE_API_HOST` environment variable (`src/config.js`). Routes are declared in `src/App.jsx`; `ProtectedRoute` redirects to `/` when no token is present.

## Prerequisites

- **Node.js 20+** (the Docker image builds on Node 24)
- **npm**
- A reachable **UniOn backend** instance (see `VITE_API_HOST`)

## Configuration and environment variables

The API host is read from Vite environment variables. Two files are included:

| File | Used when | Value |
|------|-----------|-------|
| `.env` | default / production build | `VITE_API_HOST=https://srv49-20109.wykr.es` |
| `.env.local` | local development | `VITE_API_HOST=http://localhost:20109` |

### Important configuration keys

| Key | Purpose |
|-----|---------|
| `VITE_API_HOST` | Base URL of the UniOn backend REST API |

> `.env.local` overrides `.env` and is the one used by `npm run dev`. Point it at your local backend.

## Install

From the project root:

```bash
npm install
```

## Run

**Development:**

```bash
npm run dev
```

Vite serves the app on `http://localhost:5173` with hot reload, calling the backend at the `VITE_API_HOST` from `.env.local`.

**Production preview** (after a build):

```bash
npm run preview
```

Lint the project:

```bash
npm run lint
```

## Build

```bash
npm run build
```

The static bundle is produced in `dist/`.

## Docker

Build and run the production image (Node build stage + Nginx runtime):

```bash
./docker-build.sh   # docker build -t zespolowka .
./docker-run.sh     # run the container
```

Nginx serves the SPA on port `80` and falls back to `index.html` for client-side routes (`nginx.conf`).

## Deployment

- **CI/CD (GitHub Actions)** — automatic build and deploy of the Docker image to the target server. Workflow: [`.github/workflows/ci-cd.yaml`](.github/workflows/ci-cd.yaml); setup: [`cicd-setup.md`](cicd-setup.md).
- **Manual deploy** — step-by-step instructions in [`manualny-deploy.md`](manualny-deploy.md).

## Routes

Defined in `src/App.jsx`. Routes marked "token" require a valid token.

| Path | Page | Access |
|------|------|--------|
| `/` | Welcome page | public |
| `/login` | Login | public |
| `/register` | Registration | public |
| `/reset-password` | Forgot / reset password | public |
| `/logout` | Logout | public |
| `/validateInvitation` | Join a group via link | public |
| `/home` | Dashboard | token |
| `/notes/*` | Notes and folders browser | token |
| `/note/:id` | Note text editor | token |
| `/user` | Profile and settings | token |
| `/calendar` | Calendar | token |
| `/usos-callback` | USOS OAuth callback | token |
| `/learning` | Flashcards overview | token |
| `/learning/set/:setId` | Card set | token |
| `/learning/fast/:setId` | Fast learning mode | token |
| `/learning/fsrs/:setId` | FSRS learning mode | token |
| `/learning/trash` | Deleted card sets | token |
| `/social` | Study groups | token |
| `/social/:id` | Group details | token |
| `/social/friends` | Friends | token |

## Project layout

```text
src/
  api.js            All backend HTTP calls (fetch)
  config.js         API_HOST from VITE_API_HOST
  token.js          JWT storage helpers (get/save/remove/parse)
  App.jsx           Routes + protected-route guard
  main.jsx          App bootstrap, Redux + Theme providers, version cache-bust
  pages/            Top-level screens (Notes, Calendar, Flashcards, Social, ...)
  components/
    atoms/          Buttons, inputs, modals, text, logo, ...
    organisms/      Layout, calendar grid, notifications, tag selector, registration steps
    editor/         TipTap editor pieces, flashcard creator, AI modal
    profile/        Profile card, avatar, theme and university selectors
  helpers/          Validation and text-editor helpers (slash commands, suggestions)
  store/            Redux store and slices (theme, ...)
  styles/           Global style and theme palettes
public/             Static assets, PWA icons
Dockerfile          Multi-stage build (Node -> Nginx)
nginx.conf          SPA serving + caching rules
```
