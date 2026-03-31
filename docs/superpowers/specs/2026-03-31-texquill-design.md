# TeXquill Design

Date: 2026-03-31
Status: Draft approved for planning review

## Summary

TeXquill is a server-deployed web tool for turning experiment results into paper-ready tables and LaTeX exports. The first version is optimized for repeated lab use on a shared server directory, with a visual editing experience centered on a WYSIWYG paper-table canvas rather than a spreadsheet-first workflow.

The defining interaction model is:

1. Choose a project under a configured shared root directory.
2. Select one or more CSV files as inputs.
3. Edit a paper-like table directly on a visual canvas.
4. Adjust style and export settings from a collapsible right-side drawer.
5. Export deterministic LaTeX plus optional caption and summary drafts.

## Problem

Research groups often store results across multiple CSV files and nested experiment folders. Turning those results into a publication-quality table usually requires a frustrating loop of manual filtering, spreadsheet cleanup, LaTeX editing, venue-specific formatting, and repeated visual tweaking.

Existing AI coding tools can help with one-off conversions, but they do not provide a stable, repeatable workflow for:

- browsing experiment outputs under shared server directories
- reusing table configurations across iterations
- visually adjusting a table that still compiles back into clean LaTeX
- preserving exports near the project data for later reuse

TeXquill exists to make this workflow repeatable for a lab, not just possible for one ad hoc session.

## Goals

- Provide a browser-based tool that runs on a shared server and is accessed from users' local browsers.
- Restrict file access to a configured shared root path instead of trying to read arbitrary home directories.
- Let users edit tables through a paper-like visual canvas that resembles the final rendered output.
- Keep template selection lightweight and secondary to the editing workflow.
- Support deterministic LaTeX export suitable for paper writing.
- Store recipes and export artifacts as files inside each project instead of requiring a database in v1.

## Non-Goals

- No support in v1 for reading arbitrary private home directories.
- No full spreadsheet product or Excel clone.
- No direct editing of raw LaTeX text as the primary workflow.
- No database, user-account system, or multi-tenant permission model in v1.
- No attempt to solve every possible dirty-data pipeline in the first release.
- No promise of fully automatic figure generation in v1; the focus is tables first.

## Users And Environment

Primary users are research group members working on a shared server where experiment outputs live under one or more shared directories.

Environment assumptions:

- The application is deployed once on a server.
- Users access the app via a browser on their own machines.
- Experiment files already exist on the server under a shared root path.
- The service process has read and write access to the configured shared root or to specific shared project directories beneath it.
- The service does not rely on access to users' private home directories.

## Product Shape

TeXquill v1 is a single web application with a single deployable service.

High-level shape:

- browser UI for project selection, table editing, preview, and export
- server-side file access limited to a configured root directory
- deterministic transformation pipeline from CSV selection to table document to LaTeX export
- file-based persistence under a hidden `.texquill/` directory inside each target project

## Repository Structure

The project repository will live at `/ssd/lijinpeng/code/texquill`.

Planned repository structure:

```text
texquill/
├── docs/
│   └── superpowers/
│       └── specs/
├── research/
│   ├── notes/
│   ├── decisions/
│   ├── progress/
│   ├── screenshots/
│   └── specs/
├── src/
│   ├── app/
│   ├── components/
│   ├── features/
│   ├── lib/
│   └── styles/
├── server/
│   ├── routes/
│   ├── services/
│   ├── filesystem/
│   └── export/
├── shared/
│   ├── schema/
│   ├── types/
│   └── constants/
├── examples/
│   ├── csv/
│   └── recipes/
├── outputs/
└── package.json
```

Role of major top-level folders:

- `research/`: process artifacts, progress notes, decisions, screenshots, and non-production materials
- `src/`: front-end application code
- `server/`: server-side logic for browsing files, reading CSV, writing recipe files, and exporting LaTeX
- `shared/`: schemas and types shared across front end and server
- `examples/`: demo inputs for development and hackathon demos
- `outputs/`: optional top-level demo artifacts; real project-specific artifacts live under project-local `.texquill/` directories

## Technical Architecture

### Front End

Use React with Next.js in a single TypeScript monorepo-style app.

Why:

- one deployment target for the hackathon
- easy co-location of UI and API routes
- good fit for server-rendered project pages plus interactive editing
- avoids front-end/back-end split overhead in v1

### Back End

Use Next.js server capabilities plus server-side TypeScript modules under `server/`.

Server responsibilities:

- browse directories beneath a configured root
- preview CSV files
- parse and normalize selected result tables
- save and load recipes and table documents
- generate deterministic LaTeX exports
- optionally call AI for caption or summary drafts later, without making AI part of the core export path

### Storage

No database in v1.

Persistent storage strategy:

- project-scoped JSON documents for recipes and table state
- plain-text export files for `.tex`, caption drafts, and summary drafts
- browser local storage only for lightweight UI preferences

This keeps the first version simple, inspectable, and easy to migrate later if a database becomes necessary.

## Core Data Model

TeXquill should treat the workflow as three layers.

### 1. Source Selection

Represents which files and columns feed a table.

Typical fields:

- selected CSV paths
- chosen columns
- optional row filters
- optional JSON-field extraction rules for structured columns

### 2. Table Document

Represents the editable paper table independent of raw source files.

Typical fields:

- column order
- header rows and merged header groups
- hidden columns
- display labels
- numeric formatting rules
- emphasis rules such as bolding best values
- caption text
- footnotes
- template selection and overrides

This is the central product object. The visual canvas edits this document, and the export engine renders from it.

### 3. Export Artifacts

Represents generated outputs.

Typical artifacts:

- `.tex` table file
- caption draft file
- summary draft file
- optional preview snapshot metadata

## Project-Local Persistence Layout

Inside a selected research project, TeXquill will persist state in a hidden directory:

```text
<project>/.texquill/
├── recipes/
│   └── main-results.recipe.json
├── tables/
│   └── main-results.table.json
├── exports/
│   ├── main-results.tex
│   ├── main-results.caption.md
│   └── main-results.summary.md
└── ui-state/
    └── last-opened.json
```

Notes:

- `recipes/` stores how the table was sourced and transformed.
- `tables/` stores the canonical editable document.
- `exports/` stores generated outputs.
- `ui-state/` is optional and may also be partially mirrored in browser local storage.

## Main Interaction Model

The first version should be canvas-first, not spreadsheet-first.

### Confirmed UX Decisions

- Template selection is lightweight and should live in the top toolbar or a small dropdown.
- The main editor is a paper-like visual table canvas, not a raw spreadsheet grid.
- The canvas should feel close to the final rendered paper table.
- Users should be able to perform actions such as merge header cells, drag column order, adjust widths, hide columns, and edit labels directly on this canvas.
- A raw data grid may exist, but only as an auxiliary panel when users need precise source-level inspection.
- The inspector lives in a collapsible right-side drawer.

### Main Screen Layout

Top toolbar:

- shared project selector
- CSV/file selector
- template dropdown
- save button
- export actions

Center stage:

- main paper-table canvas

Right-side drawer:

- template overrides
- style controls
- LaTeX preview
- export controls

Auxiliary panels:

- raw data grid, opened only when needed
- future caption/summary assistant area

## Canvas Editing Model

The visual editor should manipulate a structured table document while looking like a rendered paper table.

Supported v1 interactions:

- click to select cells, rows, columns, or header regions
- double-click to edit visible labels or text
- drag to reorder columns
- drag handles to adjust relative widths
- merge header cells into grouped headers
- hide or reveal columns
- mark emphasis rules such as best-in-bold
- update caption and footnote text through drawer controls or inline affordances

Important constraint:

The canvas edits the structured document, not raw LaTeX tokens. TeXquill should never rely on trying to reverse-engineer arbitrary handwritten LaTeX after the fact.

## Template System

Templates exist to provide sensible defaults, not to dominate the interface.

V1 template requirements:

- a small list or dropdown in the toolbar
- presets for common paper styles such as NeurIPS, ICML, ACL, and Custom
- each preset defines default spacing, alignment, font scale assumptions, and table rule style
- users can override template defaults from the right-side drawer

Template selection should be fast and reversible.

## Data Ingestion And Transformation

V1 should cover common research use cases without pretending to be a universal ETL system.

Required ingestion capabilities:

- browse CSV files beneath the configured root
- preview a CSV before use
- choose one or more CSV files as sources for a table
- select columns and rename them
- apply simple filters
- extract values from JSON-like columns via key-path selection when present

Deferred capabilities:

- full arbitrary join builder
- broad support for non-CSV log formats
- complex transformation graphs

## Export Pipeline

Export must be deterministic and reproducible.

The export engine should:

- render clean LaTeX from the table document
- use paper-friendly defaults such as `booktabs`
- support numeric alignment and consistent decimal formatting
- preserve merged headers and emphasis rules
- output artifacts as files into the project-local `.texquill/exports/` directory

Optional later layer:

- generate caption and result-summary drafts with AI assistance, but never make those drafts a prerequisite for `.tex` export

## System Flow

Primary flow:

1. User opens TeXquill in the browser.
2. User selects a project under the configured shared root.
3. User picks one or more CSV files.
4. Server parses the selected files into source metadata and a starting table document.
5. User edits the table on the visual canvas.
6. Drawer controls update formatting and export settings.
7. Server regenerates preview and LaTeX output from the current table document.
8. User saves the recipe and exports the `.tex` artifact.

Secondary flow for later iterations:

1. User reopens a project.
2. TeXquill loads the prior recipe and table document from `.texquill/`.
3. User tweaks structure, wording, or styling without rebuilding the entire table from scratch.

## Error Handling

The app should fail clearly and recover safely.

Required v1 handling:

- If a project path is outside the configured root, reject it.
- If the service lacks permission to read a file, show a clear permission error.
- If a CSV is malformed, show a parse error with file context.
- If a JSON-path extraction fails, highlight the broken rule instead of corrupting the table.
- If export fails, keep the current table document intact and report the export error separately.
- If a recipe references a missing file, open in a degraded recovery mode and prompt the user to relink or replace the source.

## Security And Boundaries

V1 boundaries must be strict:

- The server only reads and writes inside configured shared directories.
- No arbitrary file-system browsing outside the configured root.
- No attempt to bypass OS-level permissions.
- Project-local `.texquill/` artifacts should remain inside the target project.

## Testing Strategy

The first implementation plan should include tests at three levels.

### Unit Tests

- table document transforms
- merge-header logic
- column reorder and hide logic
- numeric formatting rules
- LaTeX rendering utilities
- JSON-path extraction helpers

### Integration Tests

- loading CSV files from a project path
- saving and reloading recipes
- generating `.tex` output from a saved table document
- enforcing configured root-path restrictions

### UI Tests

- selecting a project and source file
- editing table labels on the canvas
- opening and using the right-side drawer
- exporting LaTeX from the current document

## MVP Scope

The implementation plan should treat the following as must-have for v1:

- shared-root project browsing
- CSV preview and selection
- lightweight template picker
- WYSIWYG paper-table canvas
- right-side inspector drawer
- deterministic LaTeX export
- file-based persistence in `.texquill/`

Nice-to-have but not required for v1:

- AI-generated caption drafts
- AI-generated result summaries
- multiple linked tables in one session
- advanced transformation builder

## Risks

- Building a convincing paper-like canvas may tempt the project toward full spreadsheet complexity.
- Export quality may drift if the table document model is too loosely defined.
- Multi-file ingestion can expand in scope quickly if joins and transformations are not tightly constrained.
- Shared-directory assumptions may differ across lab environments and should be configurable early.

## Decisions Locked In

- Product name: `TeXquill`
- Repository root: `/ssd/lijinpeng/code/texquill`
- Deployment model: shared server web app
- Access model: configured shared root directory only
- Persistence model: file-based, no database in v1
- Main editor: WYSIWYG paper-table canvas
- Template UX: lightweight selector, not a dominant left rail
- Inspector placement: collapsible right-side drawer

## Open Questions For Planning

These questions do not block planning but should be resolved in the implementation plan:

- Which table-rendering approach best supports a paper-like canvas while preserving structured edits?
- Should the raw data grid appear as a modal, a bottom sheet, or a drawer-triggered auxiliary panel?
- Which initial template presets should ship in the very first demo build?
- How should the first version represent multi-file source mappings without overbuilding a generic transformation system?
