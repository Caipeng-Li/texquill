import { previewCsvFile } from "../../../../../../server/services/csv-service";

type RouteContext = {
  params: Promise<{ projectPath: string[] }> | { projectPath: string[] };
};

export async function GET(request: Request, context: RouteContext) {
  try {
    const { projectPath } = await Promise.resolve(context.params);
    const { searchParams } = new URL(request.url);
    const file = searchParams.get("file");

    if (!file) {
      return Response.json({ error: "Missing file query parameter." }, { status: 400 });
    }

    const preview = await previewCsvFile({
      projectPath,
      csvPath: file,
    });

    return Response.json(preview);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to preview CSV file.";

    return Response.json({ error: message }, { status: 400 });
  }
}
