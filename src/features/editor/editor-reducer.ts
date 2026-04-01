import type { TableDocument } from "../../../shared/types";

export type EditorState = {
  tableDocument: TableDocument;
};

export type EditorAction =
  | { type: "document/replaced"; payload: { tableDocument: TableDocument } }
  | { type: "column/labelRenamed"; payload: { columnKey: string; nextLabel: string } }
  | { type: "column/hiddenToggled"; payload: { columnKey: string } }
  | { type: "column/resized"; payload: { columnKey: string; width: number } }
  | { type: "column/reordered"; payload: { columnKey: string; targetIndex: number } };

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
    default:
      return state;
  }
}
