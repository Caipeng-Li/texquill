"use client";

import { renameColumnLabel, reorderColumn, resizeColumn, toggleColumnHidden } from "@/features/editor/editor-actions";
import { useEditor } from "@/features/editor/EditorProvider";
import { TableBodyCell } from "./TableBodyCell";
import { TableHeaderCell } from "./TableHeaderCell";

export function TableCanvas() {
  const { state, dispatch } = useEditor();
  const visibleColumns = state.tableDocument.columns.filter((column) => !column.hidden);
  const hiddenColumns = state.tableDocument.columns.filter((column) => column.hidden);

  return (
    <section
      style={{
        display: "grid",
        gap: "18px",
        padding: "24px",
        borderRadius: "24px",
        background: "rgba(255, 255, 255, 0.82)",
        border: "1px solid var(--border)",
        boxShadow: "0 20px 44px rgba(85, 53, 30, 0.08)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
        <div>
          <h2 style={{ margin: 0, fontSize: "1.15rem" }}>Paper-like table canvas</h2>
          <p style={{ margin: "6px 0 0", color: "var(--muted)" }}>
            Rename columns, hide them, resize widths, and reorder the draft before export.
          </p>
        </div>
        {hiddenColumns.length > 0 ? (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {hiddenColumns.map((column) => (
              <button
                key={column.key}
                type="button"
                onClick={() => dispatch(toggleColumnHidden(column.key))}
                style={{
                  borderRadius: "999px",
                  border: "1px solid var(--border)",
                  background: "rgba(255, 255, 255, 0.92)",
                  padding: "8px 12px",
                  cursor: "pointer",
                }}
              >
                Show {column.label}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            background: "#fffefb",
            borderRadius: "18px",
            overflow: "hidden",
          }}
        >
          <thead>
            <tr>
              {visibleColumns.map((column) => {
                const currentIndex = state.tableDocument.columns.findIndex(
                  (candidate) => candidate.key === column.key,
                );

                return (
                  <TableHeaderCell
                    key={column.key}
                    canMoveLeft={currentIndex > 0}
                    canMoveRight={currentIndex < state.tableDocument.columns.length - 1}
                    column={column}
                    onMoveLeft={() => dispatch(reorderColumn(column.key, currentIndex - 1))}
                    onMoveRight={() => dispatch(reorderColumn(column.key, currentIndex + 1))}
                    onRename={(nextLabel) => dispatch(renameColumnLabel(column.key, nextLabel))}
                    onResize={(delta) =>
                      dispatch(resizeColumn(column.key, column.width + delta))
                    }
                    onToggleHidden={() => dispatch(toggleColumnHidden(column.key))}
                  />
                );
              })}
            </tr>
          </thead>
          <tbody>
            {state.tableDocument.rows.map((row) => (
              <tr key={row.id}>
                {visibleColumns.map((column) => (
                  <TableBodyCell
                    key={`${row.id}-${column.key}`}
                    align={column.align}
                    value={row.cells[column.key]}
                  />
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
