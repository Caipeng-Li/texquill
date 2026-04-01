import { listProjectCsvFiles } from "../../../../../../server/filesystem/project-service";

type RouteContext = {
  params: Promise<{ projectPath: string[] }> | { projectPath: string[] };
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { projectPath } = await Promise.resolve(context.params);
    const entries = await listProjectCsvFiles(projectPath);

    return Response.json({ entries });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to list project CSV files.";

    return Response.json({ error: message }, { status: 400 });
  }
}
