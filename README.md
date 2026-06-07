# TerKix Terminal OS

TerKix Terminal OS is a Termux-inspired, AI-native development workspace built with React, Vite, Express, and the Google Gemini API. It keeps the TerKix brand front-and-center while providing a terminal-first interface for managing virtual projects, files, agent workflows, deployments, plugins, contacts, and telemetry dashboards.

## What this repo contains

- **React 19 SPA** for the TerKix terminal, workspace explorer, dashboard, plugin hub, contacts manager, and telemetry views.
- **TerKix logo asset** at `public/terkix-logo.svg` for the favicon, nav rail, cockpit header, and dashboard hero.
- **Express + Vite server** for local development and production static hosting.
- **Gemini command API** at `/api/gemini/command` for multi-agent workflow generation with an offline simulator fallback in the UI.
- **Safe local persistence** for projects, terminal history, active workspace, and command metrics.

## Requirements

- Node.js 22 or newer is recommended.
- npm 10 or newer.
- A Gemini API key when you want live AI responses. Without a configured key, the client falls back to the built-in simulator.

## Environment setup

Copy the example environment file and fill in your values:

```bash
cp .env.example .env
```

Supported variables:

| Variable | Required | Default | Description |
| --- | --- | --- | --- |
| `GEMINI_API_KEY` | Yes for live AI | _none_ | API key used by `@google/genai`. |
| `GEMINI_MODEL` | No | `gemini-2.5-flash` | Model used by the server command endpoint. |
| `PORT` | No | `3000` | Port for the Express/Vite server. |
| `APP_URL` | No | _none_ | Public URL used by hosted environments. |

## Development

Install dependencies:

```bash
npm install
```

Run the app locally:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Quality checks

Run TypeScript validation:

```bash
npm run typecheck
```

Run the full production build:

```bash
npm run build
```

Start the production build:

```bash
npm start
```

Check server health when the app is running:

```bash
curl http://localhost:3000/api/health
```

## Project structure

```text
.
├── server.ts                 # Express server and Gemini command endpoint
├── src/App.tsx               # Main TerKix UI shell and workspace logic
├── src/components/           # Dashboard, project, plugin, contact, and chart modules
├── src/data/presets.ts       # Default virtual projects and sample workspace files
├── src/types.ts              # Shared domain types
└── src/utils/storage.ts      # Defensive localStorage helpers
```

## Notes for contributors

- Keep generated workspace file paths under `workspace/project/...` so the TerKix virtual file explorer can mount them correctly.
- Keep dependencies that are only needed for builds or tooling in `devDependencies`.
- Do not commit `.env` files or real API keys.
- Run `npm run typecheck` and `npm run build` before opening a pull request.
