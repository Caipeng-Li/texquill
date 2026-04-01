type TableBodyCellProps = {
  align: "left" | "center" | "right" | "decimal" | undefined;
  value: string | number | boolean | null | undefined;
};

export function TableBodyCell({ align, value }: TableBodyCellProps) {
  return (
    <td
      style={{
        padding: "14px",
        borderBottom: "1px solid rgba(36, 31, 24, 0.08)",
        textAlign: align === "decimal" ? "right" : align ?? "left",
        color: "var(--text)",
      }}
    >
      {value ?? "—"}
    </td>
  );
}
