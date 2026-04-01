import { projectEntrySchema } from "../../../shared/schema/project";
import {
  tableDocumentSchema,
  templatePresetSchema,
} from "../../../shared/schema/table-document";
import { workspacePayloadSchema } from "../../../shared/schema/workspace";

const tableDocumentPayload = {
  id: "main-results",
  columns: [
    { key: "model", label: "Model", width: 180, hidden: false },
    { key: "accuracy", label: "Accuracy", width: 140, hidden: false, align: "decimal" },
    { key: "f1", label: "F1", width: 140, hidden: false, align: "decimal" },
  ],
  headerGroups: [
    { id: "main-metrics", label: "Main Metrics", startColumnKey: "accuracy", span: 2 },
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
  emphasisRules: [{ id: "best-accuracy", columnKey: "accuracy", type: "max", style: "bold" }],
};

it("accepts a table document with grouped headers and formatting rules", () => {
  const parsed = tableDocumentSchema.parse(tableDocumentPayload);

  expect(parsed.columns).toHaveLength(3);
  expect(parsed.headerGroups).toHaveLength(1);
  expect(parsed.emphasisRules).toHaveLength(1);
});

it("accepts the initial template presets for the editor", () => {
  expect(templatePresetSchema.parse("custom")).toBe("custom");
  expect(templatePresetSchema.parse("neurips")).toBe("neurips");
  expect(templatePresetSchema.parse("icml")).toBe("icml");
  expect(templatePresetSchema.parse("acl")).toBe("acl");
});

it("accepts a project workspace payload tied to a selected CSV source", () => {
  const parsed = workspacePayloadSchema.parse({
    projectPath: "demo-study",
    recipeName: "main-results",
    sourceSelection: {
      selectedFilePaths: ["results/main.csv"],
      columns: [
        { sourcePath: "results/main.csv", columnKey: "model", label: "Model" },
        { sourcePath: "results/main.csv", columnKey: "accuracy", label: "Accuracy" },
      ],
      rowFilters: [],
      jsonFieldSelections: [],
    },
    tableDocument: tableDocumentPayload,
  });

  expect(parsed.sourceSelection.selectedFilePaths).toHaveLength(1);
  expect(parsed.tableDocument.id).toBe("main-results");
});

it("accepts a project entry under the shared root", () => {
  const parsed = projectEntrySchema.parse({
    name: "demo-study",
    path: "demo-study",
    kind: "directory",
  });

  expect(parsed.name).toBe("demo-study");
});
