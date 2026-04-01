import {
  createHeaderGroup,
  renameColumnLabel,
  reorderColumn,
  resizeColumn,
  setTemplatePreset,
  toggleColumnHidden,
} from "../../../src/features/editor/editor-actions";
import { createInitialEditorState, editorReducer } from "../../../src/features/editor/editor-reducer";
import { tableDocumentSchema } from "../../../shared/schema/table-document";

const initialTableDocument = tableDocumentSchema.parse({
  id: "main-results",
  columns: [
    { key: "model", label: "Model", width: 220, hidden: false, align: "left" },
    { key: "accuracy", label: "Accuracy", width: 140, hidden: false, align: "decimal" },
    { key: "f1", label: "F1", width: 140, hidden: false, align: "decimal" },
  ],
  headerGroups: [],
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
  caption: "",
  footnotes: [],
  templatePreset: "custom",
  templateOverrides: {},
  emphasisRules: [],
});

it("renames a visible column label without mutating the source schema", () => {
  const initialState = createInitialEditorState(initialTableDocument);
  const nextState = editorReducer(initialState, renameColumnLabel("accuracy", "Acc."));

  expect(nextState.tableDocument.columns[1]?.label).toBe("Acc.");
  expect(initialState.tableDocument.columns[1]?.label).toBe("Accuracy");
});

it("toggles a column to hidden while keeping the column in the document", () => {
  const initialState = createInitialEditorState(initialTableDocument);
  const nextState = editorReducer(initialState, toggleColumnHidden("f1"));

  expect(nextState.tableDocument.columns[2]?.hidden).toBe(true);
  expect(nextState.tableDocument.columns).toHaveLength(3);
});

it("resizes a column in the document state", () => {
  const initialState = createInitialEditorState(initialTableDocument);
  const nextState = editorReducer(initialState, resizeColumn("model", 280));

  expect(nextState.tableDocument.columns[0]?.width).toBe(280);
});

it("reorders columns without losing row cell values", () => {
  const initialState = createInitialEditorState(initialTableDocument);
  const nextState = editorReducer(initialState, reorderColumn("f1", 1));

  expect(nextState.tableDocument.columns.map((column) => column.key)).toEqual([
    "model",
    "f1",
    "accuracy",
  ]);
  expect(nextState.tableDocument.rows[0]?.cells.f1).toBe("83.9");
});

it("creates a grouped header across adjacent visible columns", () => {
  const initialState = createInitialEditorState(initialTableDocument);
  const nextState = editorReducer(
    initialState,
    createHeaderGroup({
      label: "Main Metrics",
      columnKeys: ["accuracy", "f1"],
    }),
  );

  expect(nextState.tableDocument.headerGroups).toHaveLength(1);
  expect(nextState.tableDocument.headerGroups[0]).toMatchObject({
    label: "Main Metrics",
    startColumnKey: "accuracy",
    span: 2,
  });
});

it("updates the template preset and records matching override defaults", () => {
  const initialState = createInitialEditorState(initialTableDocument);
  const nextState = editorReducer(initialState, setTemplatePreset("neurips"));

  expect(nextState.tableDocument.templatePreset).toBe("neurips");
  expect(nextState.tableDocument.templateOverrides.ruleStyle).toBe("booktabs");
});
