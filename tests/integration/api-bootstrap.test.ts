/** @vitest-environment node */

import path from "node:path";

import { beforeEach, expect, it } from "vitest";

import {
  GET as projectActionGet,
  POST as projectActionPost,
} from "../../src/app/api/projects/[...projectPath]/route";

function buildRequest(pathname: string, init?: RequestInit) {
  return new Request(new URL(pathname, "http://localhost").toString(), init);
}

beforeEach(() => {
  process.env.TEXQUILL_SHARED_ROOT = path.resolve(process.cwd(), "examples/projects");
});

it("previews rows for a CSV beneath the shared root", async () => {
  const response = await projectActionGet(
    buildRequest("/api/projects/demo-study/preview?file=results/main.csv"),
    {
      params: { projectPath: ["demo-study", "preview"] },
    },
  );
  const body = await response.json();

  expect(response.status).toBe(200);
  expect(body.columns).toEqual(["model", "accuracy", "f1", "params_m"]);
  expect(body.rows[0]).toMatchObject({ model: "baseline", accuracy: "83.1" });
  expect(body.totalRows).toBe(3);
});

it("bootstraps source selection and a starter table document from selected CSVs", async () => {
  const response = await projectActionPost(
    buildRequest("/api/projects/demo-study/bootstrap", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        csvPaths: ["results/main.csv", "results/ablation.csv"],
        selectedColumns: ["model", "accuracy", "f1"],
      }),
    }),
    {
      params: { projectPath: ["demo-study", "bootstrap"] },
    },
  );
  const body = await response.json();

  expect(response.status).toBe(200);
  expect(body.sourceSelection.selectedFilePaths).toEqual([
    "results/main.csv",
    "results/ablation.csv",
  ]);
  expect(body.tableDocument.columns.map((column: { key: string }) => column.key)).toEqual([
    "model",
    "accuracy",
    "f1",
  ]);
  expect(body.tableDocument.rows).toHaveLength(6);
});
