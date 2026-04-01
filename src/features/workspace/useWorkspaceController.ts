"use client";

import { useEffect, useEffectEvent, useReducer } from "react";

import type { ProjectEntry, ProjectFileEntry, TableDocument } from "../../../shared/types";
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

type WorkspaceState = {
  projects: ProjectEntry[];
  selectedProject: string;
  csvFiles: ProjectFileEntry[];
  selectedCsvPaths: string[];
  previewColumns: string[];
  selectedColumns: string[];
  tableDocument: TableDocument | null;
  status: "idle" | "loading" | "ready" | "bootstrapping";
  error: string | null;
};

type WorkspaceAction =
  | { type: "projectsLoaded"; projects: ProjectEntry[] }
  | { type: "projectSelected"; projectPath: string }
  | { type: "filesLoaded"; entries: ProjectFileEntry[] }
  | { type: "filesToggled"; csvPath: string }
  | { type: "previewLoaded"; columns: string[] }
  | { type: "columnToggled"; columnKey: string }
  | { type: "bootstrapStarted" }
  | { type: "bootstrapSucceeded"; tableDocument: TableDocument }
  | { type: "failed"; message: string };

const initialWorkspaceState: WorkspaceState = {
  projects: [],
  selectedProject: "",
  csvFiles: [],
  selectedCsvPaths: [],
  previewColumns: [],
  selectedColumns: [],
  tableDocument: null,
  status: "idle",
  error: null,
};

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
        csvFiles: [],
        selectedCsvPaths: [],
        previewColumns: [],
        selectedColumns: [],
        tableDocument: null,
        status: action.projectPath ? "loading" : "ready",
        error: null,
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
        selectedColumns: nextSelectedCsvPaths.length === 0 ? [] : state.selectedColumns,
        tableDocument: null,
        error: null,
      };
    }
    case "previewLoaded":
      return {
        ...state,
        previewColumns: action.columns,
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
      };
    }
    case "bootstrapStarted":
      return {
        ...state,
        status: "bootstrapping",
        error: null,
      };
    case "bootstrapSucceeded":
      return {
        ...state,
        tableDocument: action.tableDocument,
        status: "ready",
        error: null,
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

  const loadProjectFiles = useEffectEvent(async (projectPath: string) => {
    if (!projectPath) {
      return;
    }

    try {
      const response = await fetchJson<ProjectFilesResponse>(
        `/api/projects/${encodeProjectPath(projectPath)}/files`,
      );

      dispatch({ type: "filesLoaded", entries: response.entries });
    } catch (error) {
      dispatch({
        type: "failed",
        message: error instanceof Error ? error.message : "Unable to load project files.",
      });
    }
  });

  const loadPreviewColumns = useEffectEvent(async (projectPath: string, csvPath: string) => {
    if (!projectPath || !csvPath) {
      return;
    }

    try {
      const response = await fetchJson<PreviewResponse>(
        `/api/projects/${encodeProjectPath(projectPath)}/preview?file=${encodeURIComponent(csvPath)}`,
      );

      dispatch({ type: "previewLoaded", columns: response.columns });
    } catch (error) {
      dispatch({
        type: "failed",
        message: error instanceof Error ? error.message : "Unable to preview CSV columns.",
      });
    }
  });

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
    if (workspaceState.selectedProject) {
      void loadProjectFiles(workspaceState.selectedProject);
    }
  }, [loadProjectFiles, workspaceState.selectedProject]);

  useEffect(() => {
    if (workspaceState.selectedProject && workspaceState.selectedCsvPaths[0]) {
      void loadPreviewColumns(
        workspaceState.selectedProject,
        workspaceState.selectedCsvPaths[0],
      );
    }
  }, [loadPreviewColumns, workspaceState.selectedCsvPaths, workspaceState.selectedProject]);

  const handleProjectChange = useEffectEvent((projectPath: string) => {
    dispatch({ type: "projectSelected", projectPath });
  });

  const handleFileToggle = useEffectEvent((csvPath: string) => {
    dispatch({ type: "filesToggled", csvPath });
  });

  const handleColumnToggle = useEffectEvent((columnKey: string) => {
    dispatch({ type: "columnToggled", columnKey });
  });

  const handleBootstrap = useEffectEvent(async () => {
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
  });

  return {
    workspaceState,
    handleProjectChange,
    handleFileToggle,
    handleColumnToggle,
    handleBootstrap,
  };
}
