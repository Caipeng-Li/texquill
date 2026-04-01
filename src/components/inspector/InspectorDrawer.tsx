"use client";

import { useState } from "react";

import type { TableColumn } from "../../../shared/types";
import {
  createHeaderGroup,
  setCaption,
  setFootnotes,
  setTemplatePreset,
  upsertEmphasisRule,
} from "@/features/editor/editor-actions";
import { useEditor } from "@/features/editor/EditorProvider";
import { CaptionEditor } from "./CaptionEditor";
import { TemplatePresetSelect } from "./TemplatePresetSelect";

type InspectorDrawerProps = {
  onOpenRawData: () => void;
};

function buildLatexPreview(
  visibleColumns: TableColumn[],
  rows: Array<Record<string, string | number | boolean | null>>,
  caption: string,
) {
  const alignment = visibleColumns
    .map((column) => (column.align === "decimal" ? "r" : "l"))
    .join("");
  const header = visibleColumns.map((column) => column.label).join(" & ");
  const body = rows
    .slice(0, 4)
    .map((row) => visibleColumns.map((column) => row[column.key] ?? "").join(" & "))
    .join(" \\\\\n");

  return [
    "\\begin{table}[t]",
    "\\centering",
    `\\begin{tabular}{${alignment}}`,
    "\\toprule",
    `${header} \\\\`,
    "\\midrule",
    body || "% no rows selected",
    "\\bottomrule",
    "\\end{tabular}",
    caption ? `\\caption{${caption}}` : "% caption omitted",
    "\\end{table}",
  ].join("\n");
}

export function InspectorDrawer({ onOpenRawData }: InspectorDrawerProps) {
  const { state, dispatch } = useEditor();
  const [headerLabel, setHeaderLabel] = useState("Main Metrics");
  const [selectedGroupColumns, setSelectedGroupColumns] = useState<string[]>([]);
  const [showLatexPreview, setShowLatexPreview] = useState(false);
  const visibleColumns = state.tableDocument.columns.filter((column) => !column.hidden);
  const numericColumns = visibleColumns.filter((column) => column.align === "decimal");

  return (
    <aside
      style={{
        display: "grid",
        gap: "18px",
        alignSelf: "start",
        padding: "22px",
        borderRadius: "24px",
        border: "1px solid var(--border)",
        background: "rgba(255, 255, 255, 0.86)",
        boxShadow: "0 18px 40px rgba(36, 31, 24, 0.08)",
      }}
    >
      <div>
        <h2 style={{ margin: 0, fontSize: "1.05rem" }}>Inspector</h2>
        <p style={{ margin: "8px 0 0", color: "var(--muted)" }}>
          Template, caption, grouped headers, emphasis, and preview controls.
        </p>
      </div>

      <TemplatePresetSelect
        value={state.tableDocument.templatePreset}
        onChange={(value) => dispatch(setTemplatePreset(value))}
      />

      <CaptionEditor
        value={state.tableDocument.caption}
        onChange={(value) => dispatch(setCaption(value))}
      />

      <label style={{ display: "grid", gap: "8px" }}>
        <span style={{ fontSize: "0.9rem", color: "var(--muted)" }}>Footnotes</span>
        <textarea
          aria-label="Footnotes"
          rows={4}
          value={state.tableDocument.footnotes.join("\n")}
          onChange={(event) =>
            dispatch(
              setFootnotes(
                event.target.value
                  .split("\n")
                  .map((line) => line.trim())
                  .filter(Boolean),
              ),
            )
          }
          placeholder="One footnote per line."
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

      <section style={{ display: "grid", gap: "10px" }}>
        <h3 style={{ margin: 0, fontSize: "0.98rem" }}>Grouped headers</h3>
        <input
          aria-label="Header group label"
          value={headerLabel}
          onChange={(event) => setHeaderLabel(event.target.value)}
          style={{
            borderRadius: "12px",
            border: "1px solid var(--border)",
            background: "rgba(255, 255, 255, 0.92)",
            padding: "10px 12px",
            font: "inherit",
          }}
        />
        <div style={{ display: "grid", gap: "8px" }}>
          {numericColumns.length === 0 ? (
            <p style={{ margin: 0, color: "var(--muted)" }}>No visible numeric columns to group.</p>
          ) : (
            numericColumns.map((column) => (
              <label
                key={column.key}
                style={{ display: "flex", alignItems: "center", gap: "10px" }}
              >
                <input
                  checked={selectedGroupColumns.includes(column.key)}
                  type="checkbox"
                  onChange={() =>
                    setSelectedGroupColumns((current) =>
                      current.includes(column.key)
                        ? current.filter((value) => value !== column.key)
                        : [...current, column.key],
                    )
                  }
                />
                <span>{column.label}</span>
              </label>
            ))
          )}
        </div>
        <button
          type="button"
          disabled={selectedGroupColumns.length < 2}
          onClick={() => {
            dispatch(
              createHeaderGroup({
                label: headerLabel,
                columnKeys: selectedGroupColumns,
              }),
            );
          }}
          style={{
            justifySelf: "start",
            borderRadius: "999px",
            border: "1px solid var(--border)",
            background: "transparent",
            padding: "8px 14px",
            cursor: selectedGroupColumns.length < 2 ? "not-allowed" : "pointer",
            opacity: selectedGroupColumns.length < 2 ? 0.6 : 1,
          }}
        >
          Create header group
        </button>
      </section>

      <section style={{ display: "grid", gap: "10px" }}>
        <h3 style={{ margin: 0, fontSize: "0.98rem" }}>Emphasis rules</h3>
        <div style={{ display: "grid", gap: "8px" }}>
          {numericColumns.map((column) => (
            <button
              key={column.key}
              type="button"
              onClick={() =>
                dispatch(
                  upsertEmphasisRule({
                    columnKey: column.key,
                    type: "max",
                    style: "bold",
                  }),
                )
              }
              style={{
                justifyContent: "space-between",
                display: "flex",
                gap: "12px",
                borderRadius: "14px",
                border: "1px solid var(--border)",
                background: "rgba(255, 255, 255, 0.92)",
                padding: "10px 12px",
                cursor: "pointer",
              }}
            >
              <span>Best in bold for {column.label}</span>
              <span style={{ color: "var(--muted)" }}>
                {state.tableDocument.emphasisRules.some(
                  (rule) => rule.columnKey === column.key && rule.style === "bold",
                )
                  ? "On"
                  : "Off"}
              </span>
            </button>
          ))}
        </div>
      </section>

      <section style={{ display: "grid", gap: "10px" }}>
        <h3 style={{ margin: 0, fontSize: "0.98rem" }}>Preview and raw data</h3>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={() => setShowLatexPreview((value) => !value)}
            style={{
              borderRadius: "999px",
              border: "1px solid var(--border)",
              background: "transparent",
              padding: "8px 14px",
              cursor: "pointer",
            }}
          >
            {showLatexPreview ? "Hide LaTeX preview" : "Preview LaTeX"}
          </button>
          <button
            type="button"
            onClick={onOpenRawData}
            style={{
              borderRadius: "999px",
              border: "1px solid var(--border)",
              background: "transparent",
              padding: "8px 14px",
              cursor: "pointer",
            }}
          >
            Inspect raw data
          </button>
        </div>
        {showLatexPreview ? (
          <pre
            style={{
              margin: 0,
              padding: "14px",
              borderRadius: "18px",
              background: "#241f18",
              color: "#f9f2e7",
              overflowX: "auto",
              fontSize: "0.82rem",
              lineHeight: 1.6,
            }}
          >
            {buildLatexPreview(
              visibleColumns,
              state.tableDocument.rows.map((row) => row.cells),
              state.tableDocument.caption,
            )}
          </pre>
        ) : null}
      </section>
    </aside>
  );
}
