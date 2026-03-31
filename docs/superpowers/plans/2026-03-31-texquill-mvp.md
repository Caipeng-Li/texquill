# TeXquill MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first end-to-end version of TeXquill so a user can browse a configured shared root, preview and select CSV files, edit a paper-like table document, save project-local state, and export deterministic LaTeX.

**Architecture:** Use a single Next.js App Router application with colocated route handlers for browser APIs and focused server modules for filesystem access, CSV parsing, persistence, and LaTeX rendering. Keep all client and server boundaries typed with shared Zod schemas so the UI edits a structured table document rather than raw LaTeX.

**Tech Stack:** Next.js App Router, React, TypeScript, Zod, `csv-parse`, `@dnd-kit`, Vitest, React Testing Library, Playwright

---

## Scope Guardrails

- v1 accepts CSV files only.
- Multi-file ingestion is limited to row-wise union for compatible columns; no arbitrary joins.
- Filesystem access is restricted to `TEXQUILL_SHARED_ROOT`.
- The main editor renders a semantic HTML table with overlay affordances; do not build a spreadsheet grid or raw `contenteditable` surface.
- The right-side drawer owns style controls, preview, and export settings.
- Raw data inspection opens in a bottom sheet so it stays auxiliary and does not compete with the right drawer.

## Planned File Structure

### Root And Tooling

- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next.config.ts`
- Create: `vitest.config.ts`
- Create: `playwright.config.ts`
- Create: `.eslintrc.json`
- Create: `.gitignore`
- Create: `.env.example`
- Create: `README.md`

### Front End App

- Create: `src/app/layout.tsx`
- Create: `src/app/page.tsx`
- Create: `src/app/globals.css`
- Create: `src/components/layout/AppShell.tsx`
- Create: `src/components/project/ProjectPicker.tsx`
- Create: `src/components/source/SourceSelector.tsx`
- Create: `src/components/canvas/TableCanvas.tsx`
- Create: `src/components/canvas/TableHeaderCell.tsx`
- Create: `src/components/canvas/TableBodyCell.tsx`
- Create: `src/components/canvas/InlineEditableText.tsx`
- Create: `src/components/canvas/ColumnResizeHandle.tsx`
- Create: `src/components/inspector/InspectorDrawer.tsx`
- Create: `src/components/inspector/TemplatePresetSelect.tsx`
- Create: `src/components/inspector/CaptionEditor.tsx`
- Create: `src/components/raw-data/RawDataSheet.tsx`

### Client State And Utilities

- Create: `src/features/workspace/useWorkspaceController.ts`
- Create: `src/features/editor/editor-reducer.ts`
- Create: `src/features/editor/editor-actions.ts`
- Create: `src/features/editor/EditorProvider.tsx`
- Create: `src/lib/fetch-json.ts`
- Create: `src/lib/formatting.ts`

### Server Modules

- Create: `server/filesystem/root-config.ts`
- Create: `server/filesystem/safe-path.ts`
- Create: `server/filesystem/project-service.ts`
- Create: `server/services/csv-service.ts`
- Create: `server/services/document-builder.ts`
- Create: `server/services/persistence-service.ts`
- Create: `server/export/latex-renderer.ts`

### API Routes

- Create: `src/app/api/projects/route.ts`
- Create: `src/app/api/projects/[...projectPath]/files/route.ts`
- Create: `src/app/api/projects/[...projectPath]/preview/route.ts`
- Create: `src/app/api/projects/[...projectPath]/bootstrap/route.ts`
- Create: `src/app/api/projects/[...projectPath]/workspace/route.ts`
- Create: `src/app/api/projects/[...projectPath]/export/route.ts`

### Shared Types And Constants

- Create: `shared/schema/project.ts`
- Create: `shared/schema/source-selection.ts`
- Create: `shared/schema/table-document.ts`
- Create: `shared/schema/workspace.ts`
- Create: `shared/constants/templates.ts`
- Create: `shared/types/index.ts`

### Example Data

- Create: `examples/projects/demo-study/results/main.csv`
- Create: `examples/projects/demo-study/results/ablation.csv`
- Create: `examples/projects/demo-study/results/metrics.csv`

### Tests

- Create: `tests/unit/app-shell.test.tsx`
- Create: `tests/unit/shared/table-document.test.ts`
- Create: `tests/unit/server/safe-path.test.ts`
- Create: `tests/unit/server/document-builder.test.ts`
- Create: `tests/unit/server/latex-renderer.test.ts`
- Create: `tests/unit/editor/editor-reducer.test.ts`
- Create: `tests/integration/api-projects.test.ts`
- Create: `tests/integration/api-bootstrap.test.ts`
- Create: `tests/integration/api-workspace.test.ts`
- Create: `tests/e2e/texquill-workflow.spec.ts`

## Task 1: Scaffold The App And Tooling Baseline

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next.config.ts`
- Create: `vitest.config.ts`
- Create: `playwright.config.ts`
- Create: `.eslintrc.json`
- Create: `.gitignore`
- Create: `.env.example`
- Create: `src/app/layout.tsx`
- Create: `src/app/page.tsx`
- Create: `src/app/globals.css`
- Create: `src/components/layout/AppShell.tsx`
- Test: `tests/unit/app-shell.test.tsx`

- [ ] **Step 1: Write the failing shell smoke test**

```tsx
import { render, screen } from "@testing-library/react";
import HomePage from "@/app/page";

it("renders the TeXquill workspace shell", () => {
  render(<HomePage />);
  expect(screen.getByRole("heading", { name: /texquill/i })).toBeInTheDocument();
  expect(screen.getByText(/paper-ready tables/i)).toBeInTheDocument();
});
```

- [ ] **Step 2: Run the unit test to confirm the repo is not scaffolded yet**

Run: `npm run test:unit -- tests/unit/app-shell.test.tsx`
Expected: FAIL with missing module or missing script errors.

- [ ] **Step 3: Create the Next.js baseline and scripts**

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "lint": "next lint",
    "test:unit": "vitest run",
    "test:e2e": "playwright test"
  }
}
```

- [ ] **Step 4: Add the minimal app shell**

```tsx
export default function HomePage() {
  return <AppShell />;
}
```

- [ ] **Step 5: Re-run the baseline verification**

Run: `npm run lint`
Expected: PASS

Run: `npm run test:unit -- tests/unit/app-shell.test.tsx`
Expected: PASS

- [ ] **Step 6: Commit the scaffold**

```bash
git add package.json tsconfig.json next.config.ts vitest.config.ts playwright.config.ts .eslintrc.json .gitignore .env.example src tests
git commit -m "chore: scaffold TeXquill app baseline"
```

## Task 2: Define Shared Schemas, Template Presets, And Example Fixtures

**Files:**
- Create: `shared/schema/project.ts`
- Create: `shared/schema/source-selection.ts`
- Create: `shared/schema/table-document.ts`
- Create: `shared/schema/workspace.ts`
- Create: `shared/constants/templates.ts`
- Create: `shared/types/index.ts`
- Create: `examples/projects/demo-study/results/main.csv`
- Create: `examples/projects/demo-study/results/ablation.csv`
- Create: `examples/projects/demo-study/results/metrics.csv`
- Test: `tests/unit/shared/table-document.test.ts`

- [ ] **Step 1: Write failing schema tests for the core document contracts**

```ts
it("accepts a table document with grouped headers and formatting rules", () => {
  const parsed = tableDocumentSchema.parse({
    id: "main-results",
    columns: [{ key: "model", label: "Model", width: 180, hidden: false }],
    headerGroups: [],
    rows: [{ id: "row-1", cells: { model: "TeXquill" } }],
    caption: "Main results.",
    footnotes: []
  });

  expect(parsed.columns).toHaveLength(1);
});
```

- [ ] **Step 2: Run the shared-schema test**

Run: `npm run test:unit -- tests/unit/shared/table-document.test.ts`
Expected: FAIL because the shared schema layer does not exist yet.

- [ ] **Step 3: Implement the shared Zod schemas and exported types**

```ts
export const templatePresetSchema = z.enum(["custom", "neurips", "icml", "acl"]);
```

- [ ] **Step 4: Add realistic CSV fixtures under `examples/projects/demo-study/results/`**

```csv
model,accuracy,f1,params_m
baseline,83.1,80.4,110
texquill,85.7,83.9,118
```

- [ ] **Step 5: Re-run unit tests for the schema layer**

Run: `npm run test:unit -- tests/unit/shared/table-document.test.ts`
Expected: PASS

- [ ] **Step 6: Commit the contracts**

```bash
git add shared examples tests/unit/shared/table-document.test.ts
git commit -m "feat: define TeXquill core schemas"
```

## Task 3: Implement Root-Bound Filesystem Services And Project Browsing APIs

**Files:**
- Create: `server/filesystem/root-config.ts`
- Create: `server/filesystem/safe-path.ts`
- Create: `server/filesystem/project-service.ts`
- Create: `src/app/api/projects/route.ts`
- Create: `src/app/api/projects/[...projectPath]/files/route.ts`
- Test: `tests/unit/server/safe-path.test.ts`
- Test: `tests/integration/api-projects.test.ts`

- [ ] **Step 1: Write failing tests for root restriction and directory listing**

```ts
it("rejects path traversal outside the shared root", () => {
  expect(() => resolveProjectPath("../../etc")).toThrow(/outside the configured root/i);
});
```

```ts
it("lists CSV files for a project beneath the shared root", async () => {
  const response = await GET(buildRequest("/api/projects/demo-study/files"));
  expect(response.status).toBe(200);
});
```

- [ ] **Step 2: Run the filesystem and API tests**

Run: `npm run test:unit -- tests/unit/server/safe-path.test.ts`
Expected: FAIL

Run: `npm run test:unit -- tests/integration/api-projects.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement root configuration and safe path helpers**

```ts
export function resolveProjectPath(projectPath: string[]) {
  const absolute = path.resolve(getSharedRoot(), ...projectPath);
  if (!absolute.startsWith(getSharedRoot())) {
    throw new Error("Requested path is outside the configured root.");
  }
  return absolute;
}
```

- [ ] **Step 4: Implement project listing and CSV file discovery route handlers**

```ts
export async function GET() {
  const projects = await listProjects();
  return Response.json({ projects });
}
```

- [ ] **Step 5: Re-run the filesystem and integration tests**

Run: `npm run test:unit -- tests/unit/server/safe-path.test.ts`
Expected: PASS

Run: `npm run test:unit -- tests/integration/api-projects.test.ts`
Expected: PASS

- [ ] **Step 6: Commit the secure browsing layer**

```bash
git add server src/app/api tests/unit/server tests/integration/api-projects.test.ts
git commit -m "feat: add root-bound project browsing APIs"
```

## Task 4: Build CSV Preview And Table-Document Bootstrap Services

**Files:**
- Create: `server/services/csv-service.ts`
- Create: `server/services/document-builder.ts`
- Create: `src/app/api/projects/[...projectPath]/preview/route.ts`
- Create: `src/app/api/projects/[...projectPath]/bootstrap/route.ts`
- Test: `tests/unit/server/document-builder.test.ts`
- Test: `tests/integration/api-bootstrap.test.ts`

- [ ] **Step 1: Write failing tests for CSV parsing and bootstrap output**

```ts
it("builds a starter table document from compatible CSV sources", async () => {
  const document = await buildInitialTableDocument({
    csvPaths: ["results/main.csv", "results/ablation.csv"],
    selectedColumns: ["model", "accuracy", "f1"]
  });

  expect(document.columns.map((column) => column.key)).toEqual(["model", "accuracy", "f1"]);
});
```

- [ ] **Step 2: Run the document-builder and bootstrap tests**

Run: `npm run test:unit -- tests/unit/server/document-builder.test.ts`
Expected: FAIL

Run: `npm run test:unit -- tests/integration/api-bootstrap.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement CSV parsing, preview rows, and compatible-column checks**

```ts
const records = parse(csvText, {
  columns: true,
  skip_empty_lines: true
});
```

- [ ] **Step 4: Implement the bootstrap route that returns a `sourceSelection` and `tableDocument` pair**

```ts
return Response.json({
  sourceSelection,
  tableDocument
});
```

- [ ] **Step 5: Re-run bootstrap tests**

Run: `npm run test:unit -- tests/unit/server/document-builder.test.ts`
Expected: PASS

Run: `npm run test:unit -- tests/integration/api-bootstrap.test.ts`
Expected: PASS

- [ ] **Step 6: Commit the ingestion pipeline**

```bash
git add server src/app/api tests/unit/server tests/integration/api-bootstrap.test.ts
git commit -m "feat: bootstrap table documents from CSV sources"
```

## Task 5: Build The Workspace Flow For Project And Source Selection

**Files:**
- Create: `src/features/workspace/useWorkspaceController.ts`
- Create: `src/lib/fetch-json.ts`
- Create: `src/components/project/ProjectPicker.tsx`
- Create: `src/components/source/SourceSelector.tsx`
- Modify: `src/components/layout/AppShell.tsx`
- Modify: `src/app/page.tsx`
- Test: `tests/unit/app-shell.test.tsx`

- [ ] **Step 1: Extend the UI test to cover project selection and bootstrap actions**

```tsx
it("lets the user choose a project and start a table document", async () => {
  render(<AppShell />);
  expect(await screen.findByLabelText(/project/i)).toBeInTheDocument();
});
```

- [ ] **Step 2: Run the shell test to confirm the flow is missing**

Run: `npm run test:unit -- tests/unit/app-shell.test.tsx`
Expected: FAIL because the selection controls are not wired yet.

- [ ] **Step 3: Implement the workspace controller and API helpers**

```ts
const [workspaceState, dispatch] = useReducer(workspaceReducer, initialWorkspaceState);
```

- [ ] **Step 4: Build the top-toolbar project picker and CSV source selection UI**

```tsx
<ProjectPicker projects={projects} value={selectedProject} onChange={handleProjectChange} />
<SourceSelector files={csvFiles} onBootstrap={handleBootstrap} />
```

- [ ] **Step 5: Re-run the shell test**

Run: `npm run test:unit -- tests/unit/app-shell.test.tsx`
Expected: PASS

- [ ] **Step 6: Commit the workspace flow**

```bash
git add src/components src/features src/lib tests/unit/app-shell.test.tsx
git commit -m "feat: add project and source selection flow"
```

## Task 6: Implement Structured Editor State And The Paper-Like Table Canvas

**Files:**
- Create: `src/features/editor/editor-reducer.ts`
- Create: `src/features/editor/editor-actions.ts`
- Create: `src/features/editor/EditorProvider.tsx`
- Create: `src/components/canvas/TableCanvas.tsx`
- Create: `src/components/canvas/TableHeaderCell.tsx`
- Create: `src/components/canvas/TableBodyCell.tsx`
- Create: `src/components/canvas/InlineEditableText.tsx`
- Create: `src/components/canvas/ColumnResizeHandle.tsx`
- Test: `tests/unit/editor/editor-reducer.test.ts`

- [ ] **Step 1: Write failing reducer tests for rename, hide, resize, and reorder actions**

```ts
it("renames a visible column label without mutating the source schema", () => {
  const nextState = editorReducer(initialState, renameColumnLabel("accuracy", "Acc."));
  expect(nextState.tableDocument.columns[1]?.label).toBe("Acc.");
});
```

- [ ] **Step 2: Run the editor reducer test**

Run: `npm run test:unit -- tests/unit/editor/editor-reducer.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement the editor reducer and action creators**

```ts
case "column/reordered":
  return {
    ...state,
    tableDocument: reorderColumns(state.tableDocument, action.payload)
  };
```

- [ ] **Step 4: Render the paper-like table canvas with inline editing and resize handles**

```tsx
<table className={styles.canvasTable}>
  <thead>{/* grouped header rows */}</thead>
  <tbody>{/* visible rows */}</tbody>
</table>
```

- [ ] **Step 5: Re-run reducer tests and manually verify the canvas in the browser**

Run: `npm run test:unit -- tests/unit/editor/editor-reducer.test.ts`
Expected: PASS

Run: `npm run dev`
Expected: the page shows a styled table canvas that supports inline label edits and column visibility changes.

- [ ] **Step 6: Commit the editor core**

```bash
git add src/features/editor src/components/canvas tests/unit/editor/editor-reducer.test.ts
git commit -m "feat: add paper-like table canvas core"
```

## Task 7: Add The Inspector Drawer, Header Grouping, And Raw Data Sheet

**Files:**
- Create: `src/components/inspector/InspectorDrawer.tsx`
- Create: `src/components/inspector/TemplatePresetSelect.tsx`
- Create: `src/components/inspector/CaptionEditor.tsx`
- Create: `src/components/raw-data/RawDataSheet.tsx`
- Modify: `src/components/layout/AppShell.tsx`
- Modify: `src/components/canvas/TableCanvas.tsx`
- Modify: `src/features/editor/editor-reducer.ts`
- Test: `tests/unit/editor/editor-reducer.test.ts`

- [ ] **Step 1: Add failing reducer tests for grouped headers and template overrides**

```ts
it("creates a grouped header across adjacent visible columns", () => {
  const nextState = editorReducer(initialState, createHeaderGroup({
    label: "Main Metrics",
    columnKeys: ["accuracy", "f1"]
  }));

  expect(nextState.tableDocument.headerGroups).toHaveLength(1);
});
```

- [ ] **Step 2: Run the editor reducer test again**

Run: `npm run test:unit -- tests/unit/editor/editor-reducer.test.ts`
Expected: FAIL on missing grouping and override actions.

- [ ] **Step 3: Implement right-drawer controls for template preset, caption, footnotes, emphasis rules, and LaTeX preview requests**

```tsx
<InspectorDrawer
  templatePreset={tableDocument.templatePreset}
  onTemplateChange={handleTemplateChange}
  onCaptionChange={handleCaptionChange}
/>
```

- [ ] **Step 4: Implement grouped headers and bottom-sheet raw data inspection**

```tsx
<RawDataSheet rows={previewRows} isOpen={isRawDataOpen} onOpenChange={setIsRawDataOpen} />
```

- [ ] **Step 5: Re-run editor tests and smoke-check the full editing surface**

Run: `npm run test:unit -- tests/unit/editor/editor-reducer.test.ts`
Expected: PASS

Run: `npm run dev`
Expected: template overrides, grouped headers, and raw data inspection all work without leaving the editor page.

- [ ] **Step 6: Commit the editing polish**

```bash
git add src/components/inspector src/components/raw-data src/components/layout src/components/canvas src/features/editor tests/unit/editor/editor-reducer.test.ts
git commit -m "feat: add inspector controls and grouped header editing"
```

## Task 8: Implement Project-Local Persistence And Deterministic LaTeX Export

**Files:**
- Create: `server/services/persistence-service.ts`
- Create: `server/export/latex-renderer.ts`
- Create: `src/app/api/projects/[...projectPath]/workspace/route.ts`
- Create: `src/app/api/projects/[...projectPath]/export/route.ts`
- Test: `tests/unit/server/latex-renderer.test.ts`
- Test: `tests/integration/api-workspace.test.ts`

- [ ] **Step 1: Write failing tests for workspace save/load and `.tex` export**

```ts
it("writes project-local TeXquill state under .texquill", async () => {
  await saveWorkspace(projectPath, workspacePayload);
  expect(await exists(join(projectPath, ".texquill", "tables", "main-results.table.json"))).toBe(true);
});
```

```ts
it("renders LaTeX with booktabs and grouped headers", () => {
  const latex = renderLatexTable(tableDocument);
  expect(latex).toContain("\\toprule");
  expect(latex).toContain("\\multicolumn{2}{c}{Main Metrics}");
});
```

- [ ] **Step 2: Run persistence and export tests**

Run: `npm run test:unit -- tests/unit/server/latex-renderer.test.ts`
Expected: FAIL

Run: `npm run test:unit -- tests/integration/api-workspace.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement project-local save and load helpers**

```ts
await writeFile(join(projectRoot, ".texquill", "tables", `${table.id}.table.json`), json, "utf8");
```

- [ ] **Step 4: Implement deterministic LaTeX rendering and export route output**

```ts
return Response.json({
  latex,
  exportPath: ".texquill/exports/main-results.tex"
});
```

- [ ] **Step 5: Re-run persistence and export tests**

Run: `npm run test:unit -- tests/unit/server/latex-renderer.test.ts`
Expected: PASS

Run: `npm run test:unit -- tests/integration/api-workspace.test.ts`
Expected: PASS

- [ ] **Step 6: Commit persistence and export**

```bash
git add server src/app/api tests/unit/server tests/integration/api-workspace.test.ts
git commit -m "feat: save TeXquill workspace and export LaTeX"
```

## Task 9: Cover Recovery Paths, End-To-End Flow, And Project Documentation

**Files:**
- Modify: `README.md`
- Create: `tests/e2e/texquill-workflow.spec.ts`
- Modify: `tests/integration/api-workspace.test.ts`
- Modify: `src/components/layout/AppShell.tsx`
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Add failing tests for the recovery mode and full browser flow**

```ts
test("reopens a saved project, edits the table, and exports latex", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Project").selectOption("demo-study");
  await page.getByRole("button", { name: /export latex/i }).click();
  await expect(page.getByText(/export complete/i)).toBeVisible();
});
```

- [ ] **Step 2: Run the end-to-end and recovery tests**

Run: `npm run test:e2e -- tests/e2e/texquill-workflow.spec.ts`
Expected: FAIL

- [ ] **Step 3: Implement missing-state recovery messaging and success toasts**

```tsx
{workspaceState.mode === "recovery" ? (
  <div role="alert">A saved source file is missing. Relink or replace the source to continue.</div>
) : null}
```

- [ ] **Step 4: Write the project README with setup, environment variables, demo data, and architecture notes**

```md
## Quick Start

1. `npm install`
2. `cp .env.example .env.local`
3. Set `TEXQUILL_SHARED_ROOT=./examples/projects`
4. `npm run dev`
```

- [ ] **Step 5: Run the full verification suite**

Run: `npm run lint`
Expected: PASS

Run: `npm run test:unit`
Expected: PASS

Run: `npm run test:e2e`
Expected: PASS

Run: `npm run build`
Expected: PASS

- [ ] **Step 6: Commit the final MVP pass**

```bash
git add README.md src tests
git commit -m "feat: complete TeXquill MVP workflow"
```

## Final Verification Checklist

- [ ] The app refuses any path outside `TEXQUILL_SHARED_ROOT`.
- [ ] A user can list projects and preview CSV files beneath the shared root.
- [ ] A user can select one or more compatible CSV files and bootstrap a table document.
- [ ] The canvas supports inline label editing, column hiding, resizing, reordering, and grouped headers.
- [ ] The inspector drawer controls template preset, caption, footnotes, emphasis rules, preview, and export.
- [ ] The raw data sheet remains auxiliary and does not replace the main canvas.
- [ ] Saving writes recipe, table, export, and optional UI state artifacts under `<project>/.texquill/`.
- [ ] Export produces deterministic LaTeX with `booktabs`-style rules and merged headers.
- [ ] Recovery mode appears when saved sources are missing and does not destroy the current table document.
