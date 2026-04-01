import { readdir } from "node:fs/promises";
import path from "node:path";

import { projectFilesSchema, projectListSchema } from "../../shared/schema/project";
import { getSharedRoot } from "./root-config";
import { resolveProjectPath, toProjectRelativePath } from "./safe-path";

async function collectCsvFiles(projectRoot: string, currentDirectory: string): Promise<string[]> {
  const entries = await readdir(currentDirectory, { withFileTypes: true });
  const nestedFiles = await Promise.all(
    entries.map(async (entry) => {
      const absoluteEntryPath = path.join(currentDirectory, entry.name);

      if (entry.isDirectory()) {
        return collectCsvFiles(projectRoot, absoluteEntryPath);
      }

      if (entry.isFile() && absoluteEntryPath.toLowerCase().endsWith(".csv")) {
        return [toProjectRelativePath(projectRoot, absoluteEntryPath)];
      }

      return [];
    }),
  );

  return nestedFiles.flat();
}

export async function listProjects() {
  const root = getSharedRoot();
  const entries = await readdir(root, { withFileTypes: true });
  const projects = entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => ({
      name: entry.name,
      path: entry.name,
      kind: "directory" as const,
    }))
    .sort((left, right) => left.name.localeCompare(right.name));

  return projectListSchema.parse({ projects }).projects;
}

export async function listProjectCsvFiles(projectPath: string | string[]) {
  const projectRoot = resolveProjectPath(projectPath);
  const relativeCsvPaths = await collectCsvFiles(projectRoot, projectRoot);
  const entries = relativeCsvPaths
    .sort((left, right) => left.localeCompare(right))
    .map((relativePath) => ({
      name: path.basename(relativePath),
      path: relativePath,
      kind: "file" as const,
      extension: "csv",
    }));

  return projectFilesSchema.parse({ entries }).entries;
}
