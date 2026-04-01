import { z } from "zod";

import { listProjectCsvFiles } from "../../../../../server/filesystem/project-service";
import { renderLatexTable } from "../../../../../server/export/latex-renderer";
import { buildBootstrapPayload } from "../../../../../server/services/document-builder";
import {
  loadWorkspace,
  saveLatexExport,
  saveWorkspace,
} from "../../../../../server/services/persistence-service";
import { previewCsvFile } from "../../../../../server/services/csv-service";
import { workspacePayloadSchema } from "../../../../../shared/schema/workspace";

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

    if (action === "workspace") {
      const { searchParams } = new URL(request.url);
      const recipeName = searchParams.get("recipe") ?? undefined;
      const workspace = await loadWorkspace(targetProjectPath, recipeName);

      return Response.json(workspace);
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

    if (action === "bootstrap") {
      const payload = bootstrapRequestSchema.parse(await request.json());
      const bootstrapPayload = await buildBootstrapPayload({
        projectPath: targetProjectPath,
        ...payload,
      });

      return Response.json(bootstrapPayload);
    }

    if (action === "workspace") {
      const payload = workspacePayloadSchema.parse(await request.json());
      const savedWorkspace = await saveWorkspace(targetProjectPath, {
        ...payload,
        projectPath: targetProjectPath.join("/"),
      });

      return Response.json(savedWorkspace);
    }

    if (action === "export") {
      const payload = workspacePayloadSchema.parse(await request.json());
      const normalizedPayload = {
        ...payload,
        projectPath: targetProjectPath.join("/"),
      };
      const latex = renderLatexTable(normalizedPayload.tableDocument);
      const exportPath = await saveLatexExport(
        targetProjectPath,
        normalizedPayload.recipeName,
        latex,
      );

      return Response.json({
        latex,
        exportPath,
      });
    }

    return Response.json({ error: "Unknown project action." }, { status: 404 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to handle project mutation.";

    return Response.json({ error: message }, { status: 400 });
  }
}
