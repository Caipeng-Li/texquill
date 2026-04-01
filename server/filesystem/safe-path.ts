import path from "node:path";

import { getSharedRoot } from "./root-config";

function normalizeProjectPath(projectPath: string | string[]) {
  const rawSegments = Array.isArray(projectPath) ? projectPath : [projectPath];

  return rawSegments
    .flatMap((segment) => segment.split("/"))
    .map((segment) => segment.trim())
    .filter(Boolean);
}

function resolveWithin(basePath: string, targetPath: string | string[]) {
  const segments = normalizeProjectPath(targetPath);
  const absolutePath = path.resolve(basePath, ...segments);
  const relativePath = path.relative(basePath, absolutePath);

  if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
    throw new Error("Requested path is outside the configured root.");
  }

  return absolutePath;
}

export function resolveProjectPath(projectPath: string | string[]) {
  return resolveWithin(getSharedRoot(), projectPath);
}

export function resolveProjectFilePath(projectPath: string | string[], filePath: string | string[]) {
  return resolveWithin(resolveProjectPath(projectPath), filePath);
}

export function toProjectRelativePath(projectRoot: string, absolutePath: string) {
  return path.relative(projectRoot, absolutePath).replaceAll(path.sep, "/");
}
