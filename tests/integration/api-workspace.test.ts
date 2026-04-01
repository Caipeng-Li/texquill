/** @vitest-environment node */

import { access, rm } from "node:fs/promises";
import path from "node:path";

import { afterEach, beforeEach, expect, it } from "vitest";

import {
  GET as projectActionGet,
  POST as projectActionPost,
} from "../../src/app/api/projects/[...projectPath]/route";
import { workspacePayloadSchema } from "../../shared/schema/workspace";

function buildRequest(pathname: string, init?: RequestInit) {
  return new Request(new URL(pathname, "http://localhost").toString(), init);
}

async function exists(targetPath: string) {
  try {
    await access(targetPath);
    return true;
  } catch {
    return false;
  }
}

const workspacePayload = workspacePayloadSchema.parse({
  projectPath: "demo-study",
  recipeName: "main-results",
  sourceSelection: {
    selectedFilePaths: ["results/main.csv", "results/ablation.csv"],
    columns: [
      { columnKey: "model", label: "Model" },
      { columnKey: "accuracy", label: "Accuracy" },
      { columnKey: "f1", label: "F1" },
    ],
    rowFilters: [],
    jsonFieldSelections: [],
  },
  tableDocument: {
    id: "main-results",
    columns: [
      { key: "model", label: "Model", width: 220, hidden: false, align: "left" },
      { key: "accuracy", label: "Accuracy", width: 140, hidden: false, align: "decimal" },
      { key: "f1", label: "F1", width: 140, hidden: false, align: "decimal" },
    ],
    headerGroups: [
      {
        id: "main-metrics",
        label: "Main Metrics",
        startColumnKey: "accuracy",
        span: 2,
      },
    ],
    rows: [
      {
        id: "row-1",
        cells: {
          model: "TeXquill",
          accuracy: "85.7",
          f1: "83.9",
        },
      },
    ],
    caption: "Main results.",
    footnotes: ["Higher is better."],
    templatePreset: "neurips",
    templateOverrides: {
      ruleStyle: "booktabs",
    },
    emphasisRules: [],
  },
});

beforeEach(async () => {
  process.env.TEXQUILL_SHARED_ROOT = path.resolve(process.cwd(), "examples/projects");
  await rm(path.resolve(process.cwd(), "examples/projects/demo-study/.texquill"), {
    recursive: true,
    force: true,
  });
});

afterEach(async () => {
  await rm(path.resolve(process.cwd(), "examples/projects/demo-study/.texquill"), {
    recursive: true,
    force: true,
  });
});

it("writes project-local TeXquill state under .texquill and loads it back", async () => {
  const saveResponse = await projectActionPost(
    buildRequest("/api/projects/demo-study/workspace", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(workspacePayload),
    }),
    {
      params: { projectPath: ["demo-study", "workspace"] },
    },
  );

  expect(saveResponse.status).toBe(200);
  expect(
    await exists(
      path.resolve(
        process.cwd(),
        "examples/projects/demo-study/.texquill/tables/main-results.table.json",
      ),
    ),
  ).toBe(true);

  const loadResponse = await projectActionGet(
    buildRequest("/api/projects/demo-study/workspace?recipe=main-results"),
    {
      params: { projectPath: ["demo-study", "workspace"] },
    },
  );
  const body = await loadResponse.json();

  expect(loadResponse.status).toBe(200);
  expect(body.recipeName).toBe("main-results");
  expect(body.tableDocument.id).toBe("main-results");
});

it("writes a deterministic LaTeX export and returns its project-local path", async () => {
  const response = await projectActionPost(
    buildRequest("/api/projects/demo-study/export", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(workspacePayload),
    }),
    {
      params: { projectPath: ["demo-study", "export"] },
    },
  );
  const body = await response.json();

  expect(response.status).toBe(200);
  expect(body.latex).toContain("\\toprule");
  expect(body.exportPath).toBe(".texquill/exports/main-results.tex");
  expect(
    await exists(
      path.resolve(
        process.cwd(),
        "examples/projects/demo-study/.texquill/exports/main-results.tex",
      ),
    ),
  ).toBe(true);
});
