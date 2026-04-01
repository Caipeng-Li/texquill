"use client";

import { TableCanvas } from "@/components/canvas/TableCanvas";
import { ProjectPicker } from "@/components/project/ProjectPicker";
import { SourceSelector } from "@/components/source/SourceSelector";
import { EditorProvider } from "@/features/editor/EditorProvider";
import { useWorkspaceController } from "@/features/workspace/useWorkspaceController";

export function AppShell() {
  const {
    workspaceState,
    handleProjectChange,
    handleFileToggle,
    handleColumnToggle,
    handleBootstrap,
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
                  {workspaceState.tableDocument.columns.length} columns and{" "}
                  {workspaceState.tableDocument.rows.length} rows loaded into the draft
                  document.
                </p>
              </section>

              <EditorProvider initialTableDocument={workspaceState.tableDocument}>
                <TableCanvas />
              </EditorProvider>
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}
