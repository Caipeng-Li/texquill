import type { TableColumn } from "../../../shared/types";
import { ColumnResizeHandle } from "./ColumnResizeHandle";
import { InlineEditableText } from "./InlineEditableText";

type TableHeaderCellProps = {
  column: TableColumn;
  canMoveLeft: boolean;
  canMoveRight: boolean;
  onMoveLeft: () => void;
  onMoveRight: () => void;
  onRename: (nextLabel: string) => void;
  onToggleHidden: () => void;
  onResize: (delta: number) => void;
};

export function TableHeaderCell({
  column,
  canMoveLeft,
  canMoveRight,
  onMoveLeft,
  onMoveRight,
  onRename,
  onToggleHidden,
  onResize,
}: TableHeaderCellProps) {
  return (
    <th
      style={{
        width: `${column.width}px`,
        minWidth: `${column.width}px`,
        padding: "16px 14px",
        verticalAlign: "top",
        borderBottom: "1px solid rgba(36, 31, 24, 0.14)",
        textAlign: column.align === "decimal" ? "right" : "left",
      }}
    >
      <div style={{ display: "grid", gap: "12px" }}>
        <InlineEditableText value={column.label} onCommit={onRename} />
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
          <button
            type="button"
            disabled={!canMoveLeft}
            onClick={onMoveLeft}
            style={{
              borderRadius: "999px",
              border: "1px solid var(--border)",
              background: "transparent",
              padding: "6px 10px",
              cursor: canMoveLeft ? "pointer" : "not-allowed",
            }}
          >
            Move left
          </button>
          <button
            type="button"
            disabled={!canMoveRight}
            onClick={onMoveRight}
            style={{
              borderRadius: "999px",
              border: "1px solid var(--border)",
              background: "transparent",
              padding: "6px 10px",
              cursor: canMoveRight ? "pointer" : "not-allowed",
            }}
          >
            Move right
          </button>
          <button
            type="button"
            onClick={onToggleHidden}
            style={{
              borderRadius: "999px",
              border: "1px solid var(--border)",
              background: "transparent",
              padding: "6px 10px",
              cursor: "pointer",
            }}
          >
            Hide
          </button>
        </div>
        <ColumnResizeHandle onNarrower={() => onResize(-24)} onWider={() => onResize(24)} />
      </div>
    </th>
  );
}
