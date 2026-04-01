type ColumnResizeHandleProps = {
  onNarrower: () => void;
  onWider: () => void;
};

export function ColumnResizeHandle({ onNarrower, onWider }: ColumnResizeHandleProps) {
  const buttonStyle = {
    borderRadius: "999px",
    border: "1px solid var(--border)",
    background: "rgba(255, 255, 255, 0.92)",
    color: "var(--muted)",
    width: "28px",
    height: "28px",
    cursor: "pointer",
  } as const;

  return (
    <div style={{ display: "flex", gap: "6px" }}>
      <button aria-label="Narrower column" style={buttonStyle} type="button" onClick={onNarrower}>
        -
      </button>
      <button aria-label="Wider column" style={buttonStyle} type="button" onClick={onWider}>
        +
      </button>
    </div>
  );
}
