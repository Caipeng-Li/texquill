/** @vitest-environment node */

import { expect, it } from "vitest";

import { renderLatexTable } from "../../../server/export/latex-renderer";
import { tableDocumentSchema } from "../../../shared/schema/table-document";

it("renders LaTeX with booktabs and grouped headers", () => {
  const tableDocument = tableDocumentSchema.parse({
    id: "main-results",
    columns: [
      { key: "model", label: "Model", width: 220, hidden: false, align: "left" },
      { key: "accuracy", label: "Accuracy", width: 140, hidden: false, align: "decimal" },
      { key: "f1", label: "F1", width: 140, hidden: false, align: "decimal" },
    ],
    headerGroups: [
      {
        id: "main-metrics",
        label: "Main Metrics",
        startColumnKey: "accuracy",
        span: 2,
      },
    ],
    rows: [
      {
        id: "row-1",
        cells: {
          model: "TeXquill",
          accuracy: "85.7",
          f1: "83.9",
        },
      },
    ],
    caption: "Main results.",
    footnotes: ["Higher is better."],
    templatePreset: "neurips",
    templateOverrides: {
      ruleStyle: "booktabs",
    },
    emphasisRules: [],
  });

  const latex = renderLatexTable(tableDocument);

  expect(latex).toContain("\\toprule");
  expect(latex).toContain("\\multicolumn{2}{c}{Main Metrics}");
  expect(latex).toContain("\\caption{Main results.}");
});
