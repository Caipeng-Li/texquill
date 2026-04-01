type SourceSelectorProps = {
  files: Array<{ path: string; name: string }>;
  selectedFiles: string[];
  previewColumns: string[];
  selectedColumns: string[];
  onFileToggle: (csvPath: string) => void;
  onColumnToggle: (columnKey: string) => void;
  onBootstrap: () => void;
  isBootstrapping: boolean;
};

export function SourceSelector({
  files,
  selectedFiles,
  previewColumns,
  selectedColumns,
  onFileToggle,
  onColumnToggle,
  onBootstrap,
  isBootstrapping,
}: SourceSelectorProps) {
  return (
    <section
      style={{
        display: "grid",
        gap: "20px",
        borderRadius: "22px",
        border: "1px solid var(--border)",
        background: "var(--surface-strong)",
        padding: "24px",
      }}
    >
      <div style={{ display: "grid", gap: "12px" }}>
        <h2 style={{ margin: 0, fontSize: "1.1rem" }}>CSV sources</h2>
        <div style={{ display: "grid", gap: "10px" }}>
          {files.length === 0 ? (
            <p style={{ margin: 0, color: "var(--muted)" }}>
              Select a project to load available CSV files.
            </p>
          ) : (
            files.map((file) => (
              <label
                key={file.path}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  color: "var(--text)",
                }}
              >
                <input
                  aria-label={file.path}
                  checked={selectedFiles.includes(file.path)}
                  type="checkbox"
                  onChange={() => onFileToggle(file.path)}
                />
                <span>{file.path}</span>
              </label>
            ))
          )}
        </div>
      </div>

      {previewColumns.length > 0 ? (
        <div style={{ display: "grid", gap: "12px" }}>
          <h3 style={{ margin: 0, fontSize: "1rem" }}>Columns</h3>
          <div style={{ display: "grid", gap: "10px", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))" }}>
            {previewColumns.map((column) => (
              <label
                key={column}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <input
                  aria-label={column}
                  checked={selectedColumns.includes(column)}
                  type="checkbox"
                  onChange={() => onColumnToggle(column)}
                />
                <span>{column}</span>
              </label>
            ))}
          </div>
        </div>
      ) : null}

      <button
        type="button"
        disabled={selectedFiles.length === 0 || selectedColumns.length === 0 || isBootstrapping}
        onClick={onBootstrap}
        style={{
          justifySelf: "start",
          borderRadius: "999px",
          border: "none",
          background: "var(--accent)",
          color: "#fffaf4",
          padding: "12px 20px",
          font: "inherit",
          cursor: "pointer",
          opacity: selectedFiles.length === 0 || selectedColumns.length === 0 || isBootstrapping ? 0.6 : 1,
        }}
      >
        {isBootstrapping ? "Starting..." : "Start Table"}
      </button>
    </section>
  );
}
