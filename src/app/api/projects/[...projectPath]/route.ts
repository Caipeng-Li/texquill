import { z } from "zod";

import { listProjectCsvFiles } from "../../../../../server/filesystem/project-service";
import { buildBootstrapPayload } from "../../../../../server/services/document-builder";
import { previewCsvFile } from "../../../../../server/services/csv-service";

const bootstrapRequestSchema = z.object({
  csvPaths: z.array(z.string().min(1)).min(1),
  selectedColumns: z.array(z.string().min(1)).min(1),
  tableId: z.string().min(1).optional(),
});

type RouteContext = {
  params: Promise<{ projectPath: string[] }> | { projectPath: string[] };
};

function splitProjectAction(projectPath: string[]) {
  const action = projectPath.at(-1);
  const targetProjectPath = projectPath.slice(0, -1);

  if (!action || targetProjectPath.length === 0) {
    throw new Error("Project path must include a target project and action.");
  }

  return {
    action,
    targetProjectPath,
  };
}

export async function GET(request: Request, context: RouteContext) {
  try {
    const { projectPath } = await Promise.resolve(context.params);
    const { action, targetProjectPath } = splitProjectAction(projectPath);

    if (action === "files") {
      const entries = await listProjectCsvFiles(targetProjectPath);

      return Response.json({ entries });
    }

    if (action === "preview") {
      const { searchParams } = new URL(request.url);
      const file = searchParams.get("file");

      if (!file) {
        return Response.json({ error: "Missing file query parameter." }, { status: 400 });
      }

      const preview = await previewCsvFile({
        projectPath: targetProjectPath,
        csvPath: file,
      });

      return Response.json(preview);
    }

    return Response.json({ error: "Unknown project action." }, { status: 404 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to handle project request.";

    return Response.json({ error: message }, { status: 400 });
  }
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const { projectPath } = await Promise.resolve(context.params);
    const { action, targetProjectPath } = splitProjectAction(projectPath);

    if (action !== "bootstrap") {
      return Response.json({ error: "Unknown project action." }, { status: 404 });
    }

    const payload = bootstrapRequestSchema.parse(await request.json());
    const bootstrapPayload = await buildBootstrapPayload({
      projectPath: targetProjectPath,
      ...payload,
    });

    return Response.json(bootstrapPayload);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to bootstrap table document.";

    return Response.json({ error: message }, { status: 400 });
  }
}
