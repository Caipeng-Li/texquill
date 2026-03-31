# Current Memory

Last updated: 2026-03-31
Project: TeXquill

## What TeXquill Is

TeXquill is a server-deployed web tool for turning experiment results into paper-ready tables and deterministic LaTeX exports. It is designed for repeated lab use on a shared server directory rather than one-off prompt-driven conversions.

## Current State

The project is still in design and planning, not implementation.

What already exists:

- a written design spec at `docs/superpowers/specs/2026-03-31-texquill-design.md`
- an initialized git repository at `/ssd/lijinpeng/code/texquill`
- a confirmed product direction, interaction model, storage strategy, and repository shape

What does not exist yet:

- no application scaffold
- no front-end code
- no back-end code
- no database
- no implementation plan yet

## Locked Product Decisions

- Product name: `TeXquill`
- Repository path: `/ssd/lijinpeng/code/texquill`
- Deployment model: shared web app running on a server
- File access model: only inside a configured shared root directory
- Persistence model: file-based storage inside each project under `.texquill/`
- Database: not needed in v1
- Template UX: lightweight selector, not a dominant left-side panel
- Main editor: WYSIWYG paper-table canvas
- Interaction priority: directly manipulate a table that looks close to final paper output
- Inspector placement: collapsible right-side drawer
- Raw data grid: auxiliary only, not the main editing surface

## Confirmed Editing Experience

The main editing experience should not be spreadsheet-first.

The intended flow is:

1. Choose a shared project directory.
2. Select one or more CSV files.
3. Generate an editable table document.
4. Edit the table directly on a paper-like visual canvas.
5. Use the right-side drawer for style rules, LaTeX preview, and export.
6. Save recipes and artifacts back into the project-local `.texquill/` directory.

Examples of expected canvas interactions:

- merge header cells
- drag column order
- adjust column widths
- hide columns
- edit labels inline
- apply best-in-bold or related emphasis rules

## Why This Project Is Worth Building

The project is valuable because the real lab workflow is not just "turn one CSV into LaTeX once." The real pain is repeatable conversion across many experiment directories, many CSV files, changing table layouts, JSON-like fields, and repeated formatting tweaks. TeXquill is meant to make that process stable and reusable for a group.

## Recommended Next Step

Do not jump straight into coding from scratch without a plan.

The next structured step should be:

1. review the design spec
2. write an implementation plan
3. then scaffold the app and start building

## Where To Look First

- Spec: `docs/superpowers/specs/2026-03-31-texquill-design.md`
- Decisions: `research/decisions/2026-03-31-core-decisions.md`
- Progress log: `research/progress/2026-03-31-design-session.md`

