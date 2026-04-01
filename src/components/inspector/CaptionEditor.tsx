type CaptionEditorProps = {
  value: string;
  onChange: (value: string) => void;
};

export function CaptionEditor({ value, onChange }: CaptionEditorProps) {
  return (
    <label style={{ display: "grid", gap: "8px" }}>
      <span style={{ fontSize: "0.9rem", color: "var(--muted)" }}>Caption</span>
      <textarea
        aria-label="Caption"
        rows={4}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Summarize the table for the paper."
        style={{
          borderRadius: "16px",
          border: "1px solid var(--border)",
          background: "rgba(255, 255, 255, 0.92)",
          padding: "12px 14px",
          font: "inherit",
          color: "var(--text)",
          resize: "vertical",
        }}
      />
    </label>
  );
}
