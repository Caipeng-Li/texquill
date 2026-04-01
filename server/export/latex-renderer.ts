import type { TableDocument, TableRow } from "../../shared/types";

function escapeLatex(value: string) {
  return value
    .replaceAll("\\", "\\textbackslash{}")
    .replaceAll("&", "\\&")
    .replaceAll("%", "\\%")
    .replaceAll("_", "\\_")
    .replaceAll("{", "\\{")
    .replaceAll("}", "\\}");
}

function getVisibleColumns(tableDocument: TableDocument) {
  return tableDocument.columns.filter((column) => !column.hidden);
}

function buildGroupHeaderCells(tableDocument: TableDocument) {
  const visibleColumns = getVisibleColumns(tableDocument);
  const visibleColumnKeys = visibleColumns.map((column) => column.key);
  const allColumnKeys = tableDocument.columns.map((column) => column.key);
  const cells: string[] = [];
  let visibleIndex = 0;

  while (visibleIndex < visibleColumns.length) {
    const currentColumnKey = visibleColumnKeys[visibleIndex];
    const group = tableDocument.headerGroups.find(
      (headerGroup) => headerGroup.startColumnKey === currentColumnKey,
    );

    if (!group) {
      cells.push(" ");
      visibleIndex += 1;
      continue;
    }

    const startIndex = allColumnKeys.indexOf(group.startColumnKey);
    const coveredKeys = allColumnKeys.slice(startIndex, startIndex + group.span);
    const visibleCoveredKeys = coveredKeys.filter((columnKey) =>
      visibleColumnKeys.includes(columnKey),
    );

    if (visibleCoveredKeys.length !== group.span) {
      cells.push(" ");
      visibleIndex += 1;
      continue;
    }

    cells.push(`\\multicolumn{${group.span}}{c}{${escapeLatex(group.label)}}`);
    visibleIndex += group.span;
  }

  return cells;
}

function renderRow(visibleColumnKeys: string[], row: TableRow) {
  return visibleColumnKeys
    .map((columnKey) => escapeLatex(String(row.cells[columnKey] ?? "")))
    .join(" & ");
}

export function renderLatexTable(tableDocument: TableDocument) {
  const visibleColumns = getVisibleColumns(tableDocument);
  const visibleColumnKeys = visibleColumns.map((column) => column.key);
  const alignment = visibleColumns
    .map((column) => (column.align === "decimal" ? "r" : "l"))
    .join("");
  const groupHeaderCells = buildGroupHeaderCells(tableDocument);
  const headerRow = visibleColumns.map((column) => escapeLatex(column.label)).join(" & ");
  const bodyRows = tableDocument.rows.map((row) => `${renderRow(visibleColumnKeys, row)} \\\\`);
  const lines = [
    "\\begin{table}[t]",
    "\\centering",
    `\\begin{tabular}{${alignment}}`,
    "\\toprule",
  ];

  if (tableDocument.headerGroups.length > 0) {
    lines.push(`${groupHeaderCells.join(" & ")} \\\\`);
  }

  lines.push(`${headerRow} \\\\`);
  lines.push("\\midrule");
  lines.push(...bodyRows);
  lines.push("\\bottomrule");
  lines.push("\\end{tabular}");

  if (tableDocument.caption) {
    lines.push(`\\caption{${escapeLatex(tableDocument.caption)}}`);
  }

  if (tableDocument.footnotes.length > 0) {
    lines.push(`% Footnotes: ${tableDocument.footnotes.map(escapeLatex).join(" | ")}`);
  }

  lines.push("\\end{table}");

  return lines.join("\n");
}
