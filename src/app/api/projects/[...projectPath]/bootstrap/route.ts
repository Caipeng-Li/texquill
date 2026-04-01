import { z } from "zod";

import { buildBootstrapPayload } from "../../../../../../server/services/document-builder";

const bootstrapRequestSchema = z.object({
  csvPaths: z.array(z.string().min(1)).min(1),
  selectedColumns: z.array(z.string().min(1)).min(1),
  tableId: z.string().min(1).optional(),
});

type RouteContext = {
  params: Promise<{ projectPath: string[] }> | { projectPath: string[] };
};

export async function POST(request: Request, context: RouteContext) {
  try {
    const { projectPath } = await Promise.resolve(context.params);
    const payload = bootstrapRequestSchema.parse(await request.json());
    const bootstrapPayload = await buildBootstrapPayload({
      projectPath,
      ...payload,
    });

    return Response.json(bootstrapPayload);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to bootstrap table document.";

    return Response.json({ error: message }, { status: 400 });
  }
}
