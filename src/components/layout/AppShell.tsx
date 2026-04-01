"use client";

import { useState } from "react";

import { TableCanvas } from "@/components/canvas/TableCanvas";
import { InspectorDrawer } from "@/components/inspector/InspectorDrawer";
import { ProjectPicker } from "@/components/project/ProjectPicker";
import { RawDataSheet } from "@/components/raw-data/RawDataSheet";
import { SourceSelector } from "@/components/source/SourceSelector";
import { EditorProvider, useEditor } from "@/features/editor/EditorProvider";
import { useWorkspaceController } from "@/features/workspace/useWorkspaceController";

type EditorWorkspacePanelProps = {
  mode: "idle" | "ready" | "recovery";
  notice: string | null;
  status: "idle" | "loading" | "ready" | "bootstrapping" | "saving" | "exporting";
  onDismissNotice: () => void;
  onOpenRawData: () => void;
  onSaveWorkspace: ReturnType<typeof useWorkspaceController>["handleSaveWorkspace"];
  onExportLatex: ReturnType<typeof useWorkspaceController>["handleExportLatex"];
};

function EditorWorkspacePanel({
  mode,
  notice,
  status,
  onDismissNotice,
  onOpenRawData,
  onSaveWorkspace,
  onExportLatex,
}: EditorWorkspacePanelProps) {
  const { state } = useEditor();

  return (
    <div style={{ display: "grid", gap: "18px" }}>
      <section
        style={{
          display: "grid",
          gap: "10px",
          padding: "20px 24px",
          borderRadius: "22px",
          background: "rgba(166, 75, 42, 0.08)",
          border: "1px solid rgba(166, 75, 42, 0.18)",
        }}
      >
        <h2 style={{ margin: 0, fontSize: "1.1rem" }}>Starter table ready</h2>
        <p style={{ margin: 0, color: "var(--muted)" }}>
          {state.tableDocument.columns.length} columns and {state.tableDocument.rows.length} rows
          loaded into the draft document.
        </p>
      </section>

      {mode === "recovery" ? (
        <div
          role="alert"
          style={{
            padding: "14px 16px",
            borderRadius: "16px",
            border: "1px solid rgba(166, 75, 42, 0.24)",
            background: "rgba(166, 75, 42, 0.08)",
            color: "var(--text)",
          }}
        >
          A saved source file is missing. Relink or replace the source to continue.
        </div>
      ) : null}

      {notice ? (
        <div
          role="status"
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "16px",
            alignItems: "center",
            padding: "14px 16px",
            borderRadius: "16px",
            border: "1px solid rgba(36, 31, 24, 0.14)",
            background: "rgba(255, 255, 255, 0.85)",
          }}
        >
          <span>{notice}</span>
          <button
            type="button"
            onClick={onDismissNotice}
            style={{
              borderRadius: "999px",
              border: "1px solid var(--border)",
              background: "transparent",
              padding: "6px 10px",
              cursor: "pointer",
            }}
          >
            Dismiss
          </button>
        </div>
      ) : null}

      <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
        <button
          type="button"
          onClick={() => void onSaveWorkspace(state.tableDocument)}
          disabled={status === "saving" || status === "exporting"}
          style={{
            borderRadius: "999px",
            border: "none",
            background: "var(--accent)",
            color: "#fffaf4",
            padding: "12px 18px",
            font: "inherit",
            cursor: "pointer",
            opacity: status === "saving" || status === "exporting" ? 0.7 : 1,
          }}
        >
          {status === "saving" ? "Saving..." : "Save Workspace"}
        </button>
        <button
          type="button"
          onClick={() => void onExportLatex(state.tableDocument)}
          disabled={status === "saving" || status === "exporting"}
          style={{
            borderRadius: "999px",
            border: "1px solid var(--border)",
            background: "rgba(255, 255, 255, 0.92)",
            padding: "12px 18px",
            font: "inherit",
            cursor: "pointer",
            opacity: status === "saving" || status === "exporting" ? 0.7 : 1,
          }}
        >
          {status === "exporting" ? "Exporting..." : "Export LaTeX"}
        </button>
      </div>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "18px",
          alignItems: "flex-start",
        }}
      >
        <div style={{ flex: "1 1 560px", minWidth: 0 }}>
          <TableCanvas />
        </div>
        <div style={{ flex: "0 1 320px", minWidth: "280px" }}>
          <InspectorDrawer onOpenRawData={onOpenRawData} />
        </div>
      </div>
    </div>
  );
}

export function AppShell() {
  const [isRawDataOpen, setIsRawDataOpen] = useState(false);
  const {
    workspaceState,
    handleProjectChange,
    handleFileToggle,
    handleColumnToggle,
    handleBootstrap,
    handleSaveWorkspace,
    handleExportLatex,
    clearNotice,
  } = useWorkspaceController();

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "48px 24px",
      }}
    >
      <section
        style={{
          width: "min(920px, 100%)",
          borderRadius: "28px",
          border: "1px solid var(--border)",
          background: "var(--surface)",
          boxShadow: "var(--shadow)",
          backdropFilter: "blur(12px)",
          padding: "40px",
        }}
      >
        <p
          style={{
            margin: 0,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "var(--accent)",
            fontSize: "0.82rem",
          }}
        >
          Shared research workspace
        </p>
        <h1
          style={{
            margin: "16px 0 12px",
            fontSize: "clamp(2.6rem, 7vw, 4.8rem)",
            lineHeight: 0.96,
          }}
        >
          TeXquill
        </h1>
        <p
          style={{
            margin: 0,
            maxWidth: "42rem",
            color: "var(--muted)",
            fontSize: "1.1rem",
            lineHeight: 1.7,
          }}
        >
          Paper-ready tables from shared experiment results, built for fast review,
          precise iteration, and deterministic LaTeX export.
        </p>

        <div
          style={{
            display: "grid",
            gap: "24px",
            marginTop: "32px",
          }}
        >
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "16px",
              alignItems: "end",
            }}
          >
            <ProjectPicker
              projects={workspaceState.projects}
              value={workspaceState.selectedProject}
              onChange={handleProjectChange}
            />
            <div
              style={{
                padding: "12px 16px",
                borderRadius: "16px",
                border: "1px solid var(--border)",
                background: "rgba(255, 255, 255, 0.55)",
                color: "var(--muted)",
              }}
            >
              {workspaceState.selectedProject
                ? `${workspaceState.csvFiles.length} CSV files ready`
                : "Choose a project to load CSV sources"}
            </div>
          </div>

          <SourceSelector
            files={workspaceState.csvFiles}
            selectedFiles={workspaceState.selectedCsvPaths}
            previewColumns={workspaceState.previewColumns}
            selectedColumns={workspaceState.selectedColumns}
            onFileToggle={handleFileToggle}
            onColumnToggle={handleColumnToggle}
            onBootstrap={handleBootstrap}
            isBootstrapping={workspaceState.status === "bootstrapping"}
          />

          {workspaceState.error ? (
            <p
              role="alert"
              style={{
                margin: 0,
                color: "var(--accent)",
              }}
            >
              {workspaceState.error}
            </p>
          ) : null}

          {workspaceState.tableDocument ? (
            <div style={{ display: "grid", gap: "18px" }}>
              <EditorProvider initialTableDocument={workspaceState.tableDocument}>
                <EditorWorkspacePanel
                  mode={workspaceState.mode}
                  notice={workspaceState.notice}
                  status={workspaceState.status}
                  onDismissNotice={clearNotice}
                  onOpenRawData={() => setIsRawDataOpen(true)}
                  onSaveWorkspace={handleSaveWorkspace}
                  onExportLatex={handleExportLatex}
                />
              </EditorProvider>

              <RawDataSheet
                columns={workspaceState.previewColumns}
                rows={workspaceState.previewRows}
                totalRows={workspaceState.previewTotalRows}
                isOpen={isRawDataOpen}
                onOpenChange={setIsRawDataOpen}
              />
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}
