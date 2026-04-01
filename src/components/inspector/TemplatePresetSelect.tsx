import { templatePresetOptions } from "../../../shared/constants/templates";
import type { TemplatePreset } from "../../../shared/types";

type TemplatePresetSelectProps = {
  value: TemplatePreset;
  onChange: (value: TemplatePreset) => void;
};

export function TemplatePresetSelect({ value, onChange }: TemplatePresetSelectProps) {
  return (
    <label style={{ display: "grid", gap: "8px" }}>
      <span style={{ fontSize: "0.9rem", color: "var(--muted)" }}>Template preset</span>
      <select
        aria-label="Template preset"
        value={value}
        onChange={(event) => onChange(event.target.value as TemplatePreset)}
        style={{
          borderRadius: "14px",
          border: "1px solid var(--border)",
          background: "rgba(255, 255, 255, 0.92)",
          padding: "12px 14px",
          font: "inherit",
          color: "var(--text)",
        }}
      >
        {templatePresetOptions.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
