import { z } from "zod";

import { sourceSelectionSchema } from "./source-selection";
import { tableDocumentSchema } from "./table-document";

export const workspaceModeSchema = z.enum(["idle", "ready", "recovery"]);

export const bootstrapWorkspaceSchema = z.object({
  sourceSelection: sourceSelectionSchema,
  tableDocument: tableDocumentSchema,
});

export const workspacePayloadSchema = bootstrapWorkspaceSchema.extend({
  projectPath: z.string().min(1),
  recipeName: z.string().min(1),
});

export const workspaceDocumentSchema = workspacePayloadSchema.extend({
  mode: workspaceModeSchema.default("ready"),
  lastSavedAt: z.string().datetime().optional(),
});
