/** @vitest-environment node */

import path from "node:path";

import { beforeEach, expect, it } from "vitest";

import { buildInitialTableDocument } from "../../../server/services/document-builder";

beforeEach(() => {
  process.env.TEXQUILL_SHARED_ROOT = path.resolve(process.cwd(), "examples/projects");
});

it("builds a starter table document from compatible CSV sources", async () => {
  const document = await buildInitialTableDocument({
    projectPath: ["demo-study"],
    csvPaths: ["results/main.csv", "results/ablation.csv"],
    selectedColumns: ["model", "accuracy", "f1"],
  });

  expect(document.columns.map((column) => column.key)).toEqual(["model", "accuracy", "f1"]);
  expect(document.rows).toHaveLength(6);
});

it("rejects selected columns that are not compatible across all CSV sources", async () => {
  await expect(
    buildInitialTableDocument({
      projectPath: ["demo-study"],
      csvPaths: ["results/main.csv", "results/ablation.csv"],
      selectedColumns: ["model", "missing_column"],
    }),
  ).rejects.toThrow(/compatible/i);
});
