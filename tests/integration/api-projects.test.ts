/** @vitest-environment node */

import path from "node:path";

import { beforeEach, expect, it } from "vitest";

import { GET as listProjects } from "../../src/app/api/projects/route";
import { GET as listProjectFiles } from "../../src/app/api/projects/[...projectPath]/files/route";

function buildRequest(pathname: string) {
  return new Request(new URL(pathname, "http://localhost").toString());
}

beforeEach(() => {
  process.env.TEXQUILL_SHARED_ROOT = path.resolve(process.cwd(), "examples/projects");
});

it("lists projects beneath the shared root", async () => {
  const response = await listProjects(buildRequest("/api/projects"));
  const body = await response.json();

  expect(response.status).toBe(200);
  expect(body.projects).toEqual(
    expect.arrayContaining([expect.objectContaining({ name: "demo-study", path: "demo-study" })]),
  );
});

it("lists CSV files for a project beneath the shared root", async () => {
  const response = await listProjectFiles(buildRequest("/api/projects/demo-study/files"), {
    params: { projectPath: ["demo-study"] },
  });
  const body = await response.json();

  expect(response.status).toBe(200);
  expect(body.entries).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        path: "results/main.csv",
        extension: "csv",
      }),
    ]),
  );
});
