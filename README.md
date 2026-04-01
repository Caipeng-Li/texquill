# TeXquill

TeXquill is a shared-root web application for turning experiment CSV files into paper-ready tables and deterministic LaTeX exports.

## Quick Start

1. Install dependencies:

```bash
npm install
```

2. Create a local environment file:

```bash
cp .env.example .env.local
```

3. Set the shared root to the demo data:

```bash
TEXQUILL_SHARED_ROOT=./examples/projects
```

4. Start the app:

```bash
npm run dev
```

5. Open `http://127.0.0.1:3000`.

## Scripts

- `npm run dev`: start the Next.js development server
- `npm run lint`: run ESLint
- `npm run test:unit`: run Vitest unit and integration tests
- `npm run test:e2e`: run the Playwright browser workflow
- `npm run build`: create a production build

## Environment

- `TEXQUILL_SHARED_ROOT`: root directory that TeXquill is allowed to browse

TeXquill refuses paths outside this configured root.

## Demo Data

Demo CSV files live under `examples/projects/demo-study/results/`.

The current demo project includes:

- `main.csv`
- `ablation.csv`
- `metrics.csv`
- `large-benchmark.csv`

## Architecture Notes

- `src/app`: Next.js App Router pages and route handlers
- `src/components`: UI shell, canvas, inspector, and raw-data components
- `src/features`: client-side workspace and editor state
- `server/filesystem`: safe shared-root path handling
- `server/services`: CSV parsing, document bootstrap, persistence
- `server/export`: deterministic LaTeX rendering
- `shared`: Zod schemas and shared types

## Persistence Layout

Saved state is written inside each selected project:

```text
<project>/.texquill/
├── recipes/
├── tables/
├── exports/
└── ui-state/
```

## Current Workflow

1. Choose a project under the shared root.
2. Select one or more CSV files.
3. Preview columns and start a table document.
4. Edit the paper-like canvas and inspector controls.
5. Save the workspace or export deterministic LaTeX.
