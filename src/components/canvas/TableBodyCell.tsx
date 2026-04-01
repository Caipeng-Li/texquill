type TableBodyCellProps = {
  align: "left" | "center" | "right" | "decimal" | undefined;
  emphasized?: boolean;
  value: string | number | boolean | null | undefined;
};

export function TableBodyCell({ align, emphasized = false, value }: TableBodyCellProps) {
  return (
    <td
      style={{
        padding: "14px",
        borderBottom: "1px solid rgba(36, 31, 24, 0.08)",
        textAlign: align === "decimal" ? "right" : align ?? "left",
        color: "var(--text)",
        fontWeight: emphasized ? 700 : 400,
      }}
    >
      {value ?? "—"}
    </td>
  );
}
