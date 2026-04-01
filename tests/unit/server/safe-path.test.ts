/** @vitest-environment node */

import path from "node:path";

import { beforeEach, expect, it } from "vitest";

import { getSharedRoot } from "../../../server/filesystem/root-config";
import { resolveProjectPath } from "../../../server/filesystem/safe-path";

beforeEach(() => {
  process.env.TEXQUILL_SHARED_ROOT = path.resolve(process.cwd(), "examples/projects");
});

it("rejects path traversal outside the shared root", () => {
  expect(() => resolveProjectPath(["..", "..", "etc"])).toThrow(
    /outside the configured root/i,
  );
});

it("resolves a project path within the shared root", () => {
  expect(resolveProjectPath(["demo-study"])).toBe(path.join(getSharedRoot(), "demo-study"));
});
