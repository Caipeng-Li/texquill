type ProjectPickerProps = {
  projects: Array<{ name: string; path: string }>;
  value: string;
  onChange: (projectPath: string) => void;
};

export function ProjectPicker({ projects, value, onChange }: ProjectPickerProps) {
  return (
    <label style={{ display: "grid", gap: "8px", minWidth: "240px" }}>
      <span style={{ fontSize: "0.9rem", color: "var(--muted)" }}>Project</span>
      <select
        aria-label="Project"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        style={{
          borderRadius: "14px",
          border: "1px solid var(--border)",
          background: "var(--surface-strong)",
          color: "var(--text)",
          padding: "12px 14px",
          font: "inherit",
        }}
      >
        <option value="">Choose a project</option>
        {projects.map((project) => (
          <option key={project.path} value={project.path}>
            {project.name}
          </option>
        ))}
      </select>
    </label>
  );
}
