type RawDataSheetProps = {
  columns: string[];
  rows: Array<Record<string, string>>;
  totalRows: number;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
};

export function RawDataSheet({
  columns,
  rows,
  totalRows,
  isOpen,
  onOpenChange,
}: RawDataSheetProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      aria-modal="true"
      role="dialog"
      style={{
        position: "fixed",
        inset: "auto 0 0",
        zIndex: 30,
        background: "rgba(255, 251, 245, 0.98)",
        borderTop: "1px solid var(--border)",
        boxShadow: "0 -24px 48px rgba(36, 31, 24, 0.12)",
        padding: "24px",
      }}
    >
      <div
        style={{
          width: "min(1120px, 100%)",
          margin: "0 auto",
          display: "grid",
          gap: "16px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <div>
            <h2 style={{ margin: 0, fontSize: "1.1rem" }}>Raw data preview</h2>
            <p style={{ margin: "6px 0 0", color: "var(--muted)" }}>
              Showing {rows.length} preview rows out of {totalRows} total rows.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            style={{
              borderRadius: "999px",
              border: "1px solid var(--border)",
              background: "transparent",
              padding: "8px 14px",
              cursor: "pointer",
            }}
          >
            Close
          </button>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", background: "#fffefb" }}>
            <thead>
              <tr>
                {columns.map((column) => (
                  <th
                    key={column}
                    style={{
                      textAlign: "left",
                      padding: "12px",
                      borderBottom: "1px solid rgba(36, 31, 24, 0.14)",
                    }}
                  >
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={`preview-row-${rowIndex + 1}`}>
                  {columns.map((column) => (
                    <td
                      key={`${rowIndex + 1}-${column}`}
                      style={{
                        padding: "12px",
                        borderBottom: "1px solid rgba(36, 31, 24, 0.08)",
                        color: "var(--text)",
                      }}
                    >
                      {row[column] ?? "—"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
