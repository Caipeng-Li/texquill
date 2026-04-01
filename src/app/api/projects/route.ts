import { listProjects } from "../../../../server/filesystem/project-service";

export async function GET(_request?: Request) {
  const projects = await listProjects();

  return Response.json({ projects });
}
