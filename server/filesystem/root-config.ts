import path from "node:path";

const DEFAULT_SHARED_ROOT = "examples/projects";

export function getSharedRoot() {
  const configuredRoot = process.env.TEXQUILL_SHARED_ROOT?.trim() || DEFAULT_SHARED_ROOT;

  return path.resolve(process.cwd(), configuredRoot);
}
