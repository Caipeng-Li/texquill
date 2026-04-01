import { templatePresetOptions } from "../../../shared/constants/templates";
import type { TableDocument, TemplatePreset } from "../../../shared/types";

export type EditorState = {
  tableDocument: TableDocument;
};

export type EditorAction =
  | { type: "document/replaced"; payload: { tableDocument: TableDocument } }
  | { type: "column/labelRenamed"; payload: { columnKey: string; nextLabel: string } }
  | { type: "column/hiddenToggled"; payload: { columnKey: string } }
  | { type: "column/resized"; payload: { columnKey: string; width: number } }
  | { type: "column/reordered"; payload: { columnKey: string; targetIndex: number } }
  | { type: "headerGroup/created"; payload: { label: string; columnKeys: string[] } }
  | { type: "template/presetSet"; payload: { templatePreset: TemplatePreset } }
  | { type: "caption/changed"; payload: { caption: string } }
  | { type: "footnotes/changed"; payload: { footnotes: string[] } }
  | {
      type: "emphasisRule/upserted";
      payload: { columnKey: string; style: "bold" | "italic"; type: "max" | "min" | "match" };
    };

export function createInitialEditorState(tableDocument: TableDocument): EditorState {
  return {
    tableDocument,
  };
}

function reorderColumns(
  tableDocument: TableDocument,
  payload: { columnKey: string; targetIndex: number },
) {
  const sourceIndex = tableDocument.columns.findIndex((column) => column.key === payload.columnKey);

  if (sourceIndex === -1) {
    return tableDocument;
  }

  const nextColumns = [...tableDocument.columns];
  const [movedColumn] = nextColumns.splice(sourceIndex, 1);

  nextColumns.splice(Math.max(0, Math.min(payload.targetIndex, nextColumns.length)), 0, movedColumn);

  return {
    ...tableDocument,
    columns: nextColumns,
  };
}

function getVisibleColumnKeys(tableDocument: TableDocument) {
  return tableDocument.columns.filter((column) => !column.hidden).map((column) => column.key);
}

function getCoveredColumnKeys(tableDocument: TableDocument, startColumnKey: string, span: number) {
  const startIndex = tableDocument.columns.findIndex((column) => column.key === startColumnKey);

  if (startIndex === -1) {
    return [];
  }

  return tableDocument.columns.slice(startIndex, startIndex + span).map((column) => column.key);
}

function createHeaderGroupForVisibleColumns(
  tableDocument: TableDocument,
  payload: { label: string; columnKeys: string[] },
) {
  const normalizedColumnKeys = payload.columnKeys.filter(Boolean);

  if (normalizedColumnKeys.length < 2) {
    return tableDocument;
  }

  const visibleColumnKeys = getVisibleColumnKeys(tableDocument);
  const visibleIndexes = normalizedColumnKeys.map((columnKey) => visibleColumnKeys.indexOf(columnKey));

  if (visibleIndexes.some((index) => index === -1)) {
    return tableDocument;
  }

  const sortedIndexes = [...visibleIndexes].sort((left, right) => left - right);
  const areAdjacent = sortedIndexes.every(
    (index, position) => position === 0 || index === sortedIndexes[position - 1] + 1,
  );

  if (!areAdjacent) {
    return tableDocument;
  }

  const orderedColumnKeys = sortedIndexes.map((index) => visibleColumnKeys[index]);
  const nextGroup = {
    id: `group-${orderedColumnKeys.join("-")}`,
    label: payload.label.trim() || "Grouped Columns",
    startColumnKey: orderedColumnKeys[0],
    span: orderedColumnKeys.length,
  };

  const remainingGroups = tableDocument.headerGroups.filter((group) => {
    const coveredKeys = getCoveredColumnKeys(tableDocument, group.startColumnKey, group.span);

    return !coveredKeys.some((columnKey) => orderedColumnKeys.includes(columnKey));
  });

  return {
    ...tableDocument,
    headerGroups: [...remainingGroups, nextGroup],
  };
}

function setTemplatePresetDefaults(tableDocument: TableDocument, templatePreset: TemplatePreset) {
  const preset = templatePresetOptions.find((option) => option.id === templatePreset);

  if (!preset) {
    return tableDocument;
  }

  return {
    ...tableDocument,
    templatePreset,
    templateOverrides: {
      ...preset.defaults,
    },
  };
}

export function editorReducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case "document/replaced":
      return createInitialEditorState(action.payload.tableDocument);
    case "column/labelRenamed":
      return {
        ...state,
        tableDocument: {
          ...state.tableDocument,
          columns: state.tableDocument.columns.map((column) =>
            column.key === action.payload.columnKey
              ? {
                  ...column,
                  label: action.payload.nextLabel,
                }
              : column,
          ),
        },
      };
    case "column/hiddenToggled":
      return {
        ...state,
        tableDocument: {
          ...state.tableDocument,
          columns: state.tableDocument.columns.map((column) =>
            column.key === action.payload.columnKey
              ? {
                  ...column,
                  hidden: !column.hidden,
                }
              : column,
          ),
        },
      };
    case "column/resized":
      return {
        ...state,
        tableDocument: {
          ...state.tableDocument,
          columns: state.tableDocument.columns.map((column) =>
            column.key === action.payload.columnKey
              ? {
                  ...column,
                  width: Math.max(96, action.payload.width),
                }
              : column,
          ),
        },
      };
    case "column/reordered":
      return {
        ...state,
        tableDocument: reorderColumns(state.tableDocument, action.payload),
      };
    case "headerGroup/created":
      return {
        ...state,
        tableDocument: createHeaderGroupForVisibleColumns(state.tableDocument, action.payload),
      };
    case "template/presetSet":
      return {
        ...state,
        tableDocument: setTemplatePresetDefaults(
          state.tableDocument,
          action.payload.templatePreset,
        ),
      };
    case "caption/changed":
      return {
        ...state,
        tableDocument: {
          ...state.tableDocument,
          caption: action.payload.caption,
        },
      };
    case "footnotes/changed":
      return {
        ...state,
        tableDocument: {
          ...state.tableDocument,
          footnotes: action.payload.footnotes,
        },
      };
    case "emphasisRule/upserted":
      return {
        ...state,
        tableDocument: {
          ...state.tableDocument,
          emphasisRules: [
            ...state.tableDocument.emphasisRules.filter(
              (rule) => rule.columnKey !== action.payload.columnKey,
            ),
            {
              id: `emphasis-${action.payload.columnKey}`,
              columnKey: action.payload.columnKey,
              type: action.payload.type,
              style: action.payload.style,
            },
          ],
        },
      };
    default:
      return state;
  }
}
