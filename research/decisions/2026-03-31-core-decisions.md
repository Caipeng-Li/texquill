# Core Decisions

Date: 2026-03-31
Project: TeXquill

## Product

- The tool is a lab-facing web product, not just a personal CLI helper.
- The first version is table-first, not figure-first.
- The value proposition is repeatable paper-table creation for shared research projects.

## Deployment

- Deploy once on a server.
- Users interact from their local browsers.
- The service reads from a configured shared root path on the server.
- The service does not attempt to read arbitrary private home directories.

## Storage

- No database in v1.
- Core state is stored as files inside each target project.
- The hidden per-project state directory is `.texquill/`.
- Browser local storage is allowed only for lightweight UI state.

## Editor

- The main editing surface is a paper-like WYSIWYG table canvas.
- The canvas should resemble final rendered output.
- The main interaction is not direct LaTeX text editing.
- The main interaction is not a spreadsheet-first grid.
- A raw data grid may exist, but only as an auxiliary inspection surface.

## Layout

- Template selection should be a small toolbar control, not a large left rail.
- The inspector should live in a collapsible right-side drawer.
- Export and LaTeX preview also live in the drawer.

## Scope Boundaries

- v1 supports shared directory browsing, CSV selection, table editing, and LaTeX export.
- v1 does not try to become a general-purpose data platform.
- v1 does not require user accounts or a formal permission system.
- v1 does not require a database.

