import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { workspaceDocumentSchema, workspacePayloadSchema } from "../../shared/schema/workspace";
import type { WorkspacePayload } from "../../shared/types";
import { resolveProjectFilePath, resolveProjectPath } from "../filesystem/safe-path";

type StoredRecipeDocument = {
  recipeName: string;
  tableId: string;
  sourceSelection: WorkspacePayload["sourceSelection"];
  lastSavedAt: string;
};

type LastOpenedDocument = {
  recipeName: string;
  lastSavedAt: string;
};

function getProjectStateRoot(projectPath: string | string[]) {
  return path.join(resolveProjectPath(projectPath), ".texquill");
}

function getRecipeFilePath(projectPath: string | string[], recipeName: string) {
  return path.join(getProjectStateRoot(projectPath), "recipes", `${recipeName}.recipe.json`);
}

function getTableFilePath(projectPath: string | string[], tableId: string) {
  return path.join(getProjectStateRoot(projectPath), "tables", `${tableId}.table.json`);
}

function getExportFilePath(projectPath: string | string[], recipeName: string) {
  return path.join(getProjectStateRoot(projectPath), "exports", `${recipeName}.tex`);
}

function getLastOpenedFilePath(projectPath: string | string[]) {
  return path.join(getProjectStateRoot(projectPath), "ui-state", "last-opened.json");
}

async function ensureProjectStateDirectories(projectPath: string | string[]) {
  const stateRoot = getProjectStateRoot(projectPath);

  await Promise.all([
    mkdir(path.join(stateRoot, "recipes"), { recursive: true }),
    mkdir(path.join(stateRoot, "tables"), { recursive: true }),
    mkdir(path.join(stateRoot, "exports"), { recursive: true }),
    mkdir(path.join(stateRoot, "ui-state"), { recursive: true }),
  ]);
}

async function readJsonFile<T>(targetPath: string) {
  const text = await readFile(targetPath, "utf8");

  return JSON.parse(text) as T;
}

async function exists(targetPath: string) {
  try {
    await access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function detectWorkspaceMode(
  projectPath: string | string[],
  selectedFilePaths: string[],
): Promise<"ready" | "recovery"> {
  const fileChecks = await Promise.all(
    selectedFilePaths.map(async (selectedFilePath) =>
      exists(resolveProjectFilePath(projectPath, selectedFilePath)),
    ),
  );

  return fileChecks.every(Boolean) ? "ready" : "recovery";
}

export async function saveWorkspace(projectPath: string | string[], workspacePayload: WorkspacePayload) {
  const parsed = workspacePayloadSchema.parse(workspacePayload);
  const lastSavedAt = new Date().toISOString();
  const recipeDocument: StoredRecipeDocument = {
    recipeName: parsed.recipeName,
    tableId: parsed.tableDocument.id,
    sourceSelection: parsed.sourceSelection,
    lastSavedAt,
  };
  const lastOpenedDocument: LastOpenedDocument = {
    recipeName: parsed.recipeName,
    lastSavedAt,
  };

  await ensureProjectStateDirectories(projectPath);
  await Promise.all([
    writeFile(
      getRecipeFilePath(projectPath, parsed.recipeName),
      `${JSON.stringify(recipeDocument, null, 2)}\n`,
      "utf8",
    ),
    writeFile(
      getTableFilePath(projectPath, parsed.tableDocument.id),
      `${JSON.stringify(parsed.tableDocument, null, 2)}\n`,
      "utf8",
    ),
    writeFile(
      getLastOpenedFilePath(projectPath),
      `${JSON.stringify(lastOpenedDocument, null, 2)}\n`,
      "utf8",
    ),
  ]);

  return workspaceDocumentSchema.parse({
    ...parsed,
    mode: await detectWorkspaceMode(projectPath, parsed.sourceSelection.selectedFilePaths),
    lastSavedAt,
  });
}

export async function loadWorkspace(projectPath: string | string[], recipeName?: string) {
  const resolvedRecipeName =
    recipeName ||
    (await readJsonFile<LastOpenedDocument>(getLastOpenedFilePath(projectPath))).recipeName;
  const recipeDocument = await readJsonFile<StoredRecipeDocument>(
    getRecipeFilePath(projectPath, resolvedRecipeName),
  );
  const tableDocument = await readJsonFile<WorkspacePayload["tableDocument"]>(
    getTableFilePath(projectPath, recipeDocument.tableId),
  );

  return workspaceDocumentSchema.parse({
    projectPath: Array.isArray(projectPath) ? projectPath.join("/") : projectPath,
    recipeName: recipeDocument.recipeName,
    sourceSelection: recipeDocument.sourceSelection,
    tableDocument,
    mode: await detectWorkspaceMode(
      projectPath,
      recipeDocument.sourceSelection.selectedFilePaths,
    ),
    lastSavedAt: recipeDocument.lastSavedAt,
  });
}

export async function saveLatexExport(
  projectPath: string | string[],
  recipeName: string,
  latex: string,
) {
  await ensureProjectStateDirectories(projectPath);

  const exportFilePath = getExportFilePath(projectPath, recipeName);
  await writeFile(exportFilePath, `${latex}\n`, "utf8");

  return path.relative(resolveProjectPath(projectPath), exportFilePath).replaceAll(path.sep, "/");
}
