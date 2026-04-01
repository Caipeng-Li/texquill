"use client";

import { useEffect, useReducer } from "react";

import type {
  ProjectEntry,
  ProjectFileEntry,
  TableDocument,
  WorkspaceDocument,
} from "../../../shared/types";
import { fetchJson } from "@/lib/fetch-json";

type ProjectsResponse = {
  projects: ProjectEntry[];
};

type ProjectFilesResponse = {
  entries: ProjectFileEntry[];
};

type PreviewResponse = {
  columns: string[];
  rows: Array<Record<string, string>>;
  totalRows: number;
};

type BootstrapResponse = {
  tableDocument: TableDocument;
};

type ExportResponse = {
  latex: string;
  exportPath: string;
};

type WorkspaceState = {
  projects: ProjectEntry[];
  selectedProject: string;
  recipeName: string;
  csvFiles: ProjectFileEntry[];
  selectedCsvPaths: string[];
  previewColumns: string[];
  previewRows: Array<Record<string, string>>;
  previewTotalRows: number;
  selectedColumns: string[];
  tableDocument: TableDocument | null;
  status: "idle" | "loading" | "ready" | "bootstrapping" | "saving" | "exporting";
  mode: "idle" | "ready" | "recovery";
  error: string | null;
  notice: string | null;
};

type WorkspaceAction =
  | { type: "projectsLoaded"; projects: ProjectEntry[] }
  | { type: "projectSelected"; projectPath: string }
  | { type: "workspaceLoaded"; workspace: WorkspaceDocument }
  | { type: "filesLoaded"; entries: ProjectFileEntry[] }
  | { type: "filesToggled"; csvPath: string }
  | { type: "previewLoaded"; columns: string[]; rows: Array<Record<string, string>>; totalRows: number }
  | { type: "columnToggled"; columnKey: string }
  | { type: "bootstrapStarted" }
  | { type: "bootstrapSucceeded"; tableDocument: TableDocument }
  | { type: "saveStarted" }
  | { type: "saveSucceeded"; recipeName: string; tableDocument: TableDocument }
  | { type: "exportStarted" }
  | { type: "exportSucceeded"; message: string; tableDocument: TableDocument }
  | { type: "noticeCleared" }
  | { type: "failed"; message: string };

const initialWorkspaceState: WorkspaceState = {
  projects: [],
  selectedProject: "",
  recipeName: "",
  csvFiles: [],
  selectedCsvPaths: [],
  previewColumns: [],
  previewRows: [],
  previewTotalRows: 0,
  selectedColumns: [],
  tableDocument: null,
  status: "idle",
  mode: "idle",
  error: null,
  notice: null,
};

function isMissingWorkspaceError(error: Error) {
  return /enoent|no such file|request failed with status 404/i.test(error.message);
}

function workspaceReducer(state: WorkspaceState, action: WorkspaceAction): WorkspaceState {
  switch (action.type) {
    case "projectsLoaded":
      return {
        ...state,
        projects: action.projects,
        status: "ready",
        error: null,
      };
    case "projectSelected":
      return {
        ...state,
        selectedProject: action.projectPath,
        recipeName: "",
        csvFiles: [],
        selectedCsvPaths: [],
        previewColumns: [],
        previewRows: [],
        previewTotalRows: 0,
        selectedColumns: [],
        tableDocument: null,
        status: action.projectPath ? "loading" : "ready",
        mode: "idle",
        error: null,
        notice: null,
      };
    case "workspaceLoaded":
      return {
        ...state,
        recipeName: action.workspace.recipeName,
        selectedCsvPaths: action.workspace.sourceSelection.selectedFilePaths,
        selectedColumns: action.workspace.sourceSelection.columns.map(
          (column) => column.columnKey,
        ),
        tableDocument: action.workspace.tableDocument,
        status: "ready",
        mode: action.workspace.mode,
        error: null,
        notice: "Saved workspace restored.",
      };
    case "filesLoaded":
      return {
        ...state,
        csvFiles: action.entries,
        status: "ready",
        error: null,
      };
    case "filesToggled": {
      const nextSelectedCsvPaths = state.selectedCsvPaths.includes(action.csvPath)
        ? state.selectedCsvPaths.filter((csvPath) => csvPath !== action.csvPath)
        : [...state.selectedCsvPaths, action.csvPath];

      return {
        ...state,
        selectedCsvPaths: nextSelectedCsvPaths,
        previewColumns: nextSelectedCsvPaths.length === 0 ? [] : state.previewColumns,
        previewRows: nextSelectedCsvPaths.length === 0 ? [] : state.previewRows,
        previewTotalRows: nextSelectedCsvPaths.length === 0 ? 0 : state.previewTotalRows,
        selectedColumns: nextSelectedCsvPaths.length === 0 ? [] : state.selectedColumns,
        tableDocument: null,
        error: null,
        notice: null,
      };
    }
    case "previewLoaded":
      return {
        ...state,
        previewColumns: action.columns,
        previewRows: action.rows,
        previewTotalRows: action.totalRows,
        selectedColumns:
          state.selectedColumns.length > 0
            ? state.selectedColumns.filter((column) => action.columns.includes(column))
            : action.columns,
        error: null,
      };
    case "columnToggled": {
      const nextSelectedColumns = state.selectedColumns.includes(action.columnKey)
        ? state.selectedColumns.filter((column) => column !== action.columnKey)
        : [...state.selectedColumns, action.columnKey];

      return {
        ...state,
        selectedColumns: nextSelectedColumns,
        tableDocument: null,
        notice: null,
      };
    }
    case "bootstrapStarted":
      return {
        ...state,
        status: "bootstrapping",
        error: null,
        notice: null,
      };
    case "bootstrapSucceeded":
      return {
        ...state,
        recipeName: action.tableDocument.id,
        tableDocument: action.tableDocument,
        status: "ready",
        mode: "ready",
        error: null,
        notice: null,
      };
    case "saveStarted":
      return {
        ...state,
        status: "saving",
        error: null,
        notice: null,
      };
    case "saveSucceeded":
      return {
        ...state,
        recipeName: action.recipeName,
        tableDocument: action.tableDocument,
        status: "ready",
        mode: "ready",
        error: null,
        notice: "Workspace saved.",
      };
    case "exportStarted":
      return {
        ...state,
        status: "exporting",
        error: null,
        notice: null,
      };
    case "exportSucceeded":
      return {
        ...state,
        tableDocument: action.tableDocument,
        status: "ready",
        error: null,
        notice: action.message,
      };
    case "noticeCleared":
      return {
        ...state,
        notice: null,
      };
    case "failed":
      return {
        ...state,
        status: "ready",
        error: action.message,
      };
    default:
      return state;
  }
}

function encodeProjectPath(projectPath: string) {
  return projectPath
    .split("/")
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

export function useWorkspaceController() {
  const [workspaceState, dispatch] = useReducer(workspaceReducer, initialWorkspaceState);

  useEffect(() => {
    let isActive = true;

    fetchJson<ProjectsResponse>("/api/projects")
      .then((response) => {
        if (isActive) {
          dispatch({ type: "projectsLoaded", projects: response.projects });
        }
      })
      .catch((error) => {
        if (isActive) {
          dispatch({
            type: "failed",
            message: error instanceof Error ? error.message : "Unable to load projects.",
          });
        }
      });

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    if (!workspaceState.selectedProject) {
      return;
    }

    let isActive = true;

    fetchJson<ProjectFilesResponse>(
      `/api/projects/${encodeProjectPath(workspaceState.selectedProject)}/files`,
    )
      .then((response) => {
        if (isActive) {
          dispatch({ type: "filesLoaded", entries: response.entries });
        }
      })
      .catch((error) => {
        if (isActive) {
          dispatch({
            type: "failed",
            message: error instanceof Error ? error.message : "Unable to load project files.",
          });
        }
      });

    return () => {
      isActive = false;
    };
  }, [workspaceState.selectedProject]);

  useEffect(() => {
    if (!workspaceState.selectedProject) {
      return;
    }

    let isActive = true;

    fetchJson<WorkspaceDocument>(
      `/api/projects/${encodeProjectPath(workspaceState.selectedProject)}/workspace`,
    )
      .then((workspace) => {
        if (isActive) {
          dispatch({ type: "workspaceLoaded", workspace });
        }
      })
      .catch((error) => {
        if (isActive && error instanceof Error && !isMissingWorkspaceError(error)) {
          dispatch({
            type: "failed",
            message: error.message,
          });
        }
      });

    return () => {
      isActive = false;
    };
  }, [workspaceState.selectedProject]);

  useEffect(() => {
    if (!workspaceState.selectedProject || !workspaceState.selectedCsvPaths[0]) {
      return;
    }

    let isActive = true;

    fetchJson<PreviewResponse>(
      `/api/projects/${encodeProjectPath(workspaceState.selectedProject)}/preview?file=${encodeURIComponent(
        workspaceState.selectedCsvPaths[0],
      )}`,
    )
      .then((response) => {
        if (isActive) {
          dispatch({
            type: "previewLoaded",
            columns: response.columns,
            rows: response.rows,
            totalRows: response.totalRows,
          });
        }
      })
      .catch((error) => {
        if (isActive) {
          dispatch({
            type: "failed",
            message: error instanceof Error ? error.message : "Unable to preview CSV columns.",
          });
        }
      });

    return () => {
      isActive = false;
    };
  }, [workspaceState.selectedCsvPaths, workspaceState.selectedProject]);

  const handleProjectChange = (projectPath: string) => {
    dispatch({ type: "projectSelected", projectPath });
  };

  const handleFileToggle = (csvPath: string) => {
    dispatch({ type: "filesToggled", csvPath });
  };

  const handleColumnToggle = (columnKey: string) => {
    dispatch({ type: "columnToggled", columnKey });
  };

  const handleBootstrap = async () => {
    if (!workspaceState.selectedProject) {
      return;
    }

    dispatch({ type: "bootstrapStarted" });

    try {
      const response = await fetchJson<BootstrapResponse>(
        `/api/projects/${encodeProjectPath(workspaceState.selectedProject)}/bootstrap`,
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({
            csvPaths: workspaceState.selectedCsvPaths,
            selectedColumns: workspaceState.selectedColumns,
          }),
        },
      );

      dispatch({
        type: "bootstrapSucceeded",
        tableDocument: response.tableDocument,
      });
    } catch (error) {
      dispatch({
        type: "failed",
        message: error instanceof Error ? error.message : "Unable to start a table document.",
      });
    }
  };

  const buildWorkspacePayload = (tableDocument: TableDocument) => ({
    projectPath: workspaceState.selectedProject,
    recipeName: workspaceState.recipeName || tableDocument.id,
    sourceSelection: {
      selectedFilePaths: workspaceState.selectedCsvPaths,
      columns: workspaceState.selectedColumns.map((columnKey) => {
        const matchingColumn = tableDocument.columns.find((column) => column.key === columnKey);

        return {
          columnKey,
          label: matchingColumn?.label ?? columnKey,
        };
      }),
      rowFilters: [],
      jsonFieldSelections: [],
    },
    tableDocument,
  });

  const handleSaveWorkspace = async (tableDocument: TableDocument) => {
    if (!workspaceState.selectedProject) {
      return;
    }

    dispatch({ type: "saveStarted" });

    try {
      const payload = buildWorkspacePayload(tableDocument);
      const response = await fetchJson<WorkspaceDocument>(
        `/api/projects/${encodeProjectPath(workspaceState.selectedProject)}/workspace`,
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      dispatch({
        type: "saveSucceeded",
        recipeName: response.recipeName,
        tableDocument,
      });
    } catch (error) {
      dispatch({
        type: "failed",
        message: error instanceof Error ? error.message : "Unable to save workspace.",
      });
    }
  };

  const handleExportLatex = async (tableDocument: TableDocument) => {
    if (!workspaceState.selectedProject) {
      return;
    }

    dispatch({ type: "exportStarted" });

    try {
      const payload = buildWorkspacePayload(tableDocument);
      const response = await fetchJson<ExportResponse>(
        `/api/projects/${encodeProjectPath(workspaceState.selectedProject)}/export`,
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      dispatch({
        type: "exportSucceeded",
        message: `Export complete: ${response.exportPath}`,
        tableDocument,
      });
    } catch (error) {
      dispatch({
        type: "failed",
        message: error instanceof Error ? error.message : "Unable to export LaTeX.",
      });
    }
  };

  const clearNotice = () => {
    dispatch({ type: "noticeCleared" });
  };

  return {
    workspaceState,
    handleProjectChange,
    handleFileToggle,
    handleColumnToggle,
    handleBootstrap,
    handleSaveWorkspace,
    handleExportLatex,
    clearNotice,
  };
}
