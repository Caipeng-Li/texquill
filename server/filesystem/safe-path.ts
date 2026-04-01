import path from "node:path";

import { getSharedRoot } from "./root-config";

function normalizeProjectPath(projectPath: string | string[]) {
  const rawSegments = Array.isArray(projectPath) ? projectPath : [projectPath];

  return rawSegments
    .flatMap((segment) => segment.split("/"))
    .map((segment) => segment.trim())
    .filter(Boolean);
}

export function resolveProjectPath(projectPath: string | string[]) {
  const root = getSharedRoot();
  const segments = normalizeProjectPath(projectPath);
  const absolutePath = path.resolve(root, ...segments);
  const relativePath = path.relative(root, absolutePath);

  if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
    throw new Error("Requested path is outside the configured root.");
  }

  return absolutePath;
}

export function toProjectRelativePath(projectRoot: string, absolutePath: string) {
  return path.relative(projectRoot, absolutePath).replaceAll(path.sep, "/");
}
