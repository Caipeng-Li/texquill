import type { z } from "zod";

import type { projectEntrySchema, projectFileEntrySchema } from "../schema/project";
import type {
  jsonFieldSelectionSchema,
  sourceColumnSelectionSchema,
  sourceRowFilterSchema,
  sourceSelectionSchema,
} from "../schema/source-selection";
import type {
  emphasisRuleSchema,
  headerGroupSchema,
  tableColumnSchema,
  tableDocumentSchema,
  tableRowSchema,
  templatePresetSchema,
} from "../schema/table-document";
import type {
  bootstrapWorkspaceSchema,
  workspaceDocumentSchema,
  workspacePayloadSchema,
} from "../schema/workspace";

export type ProjectEntry = z.infer<typeof projectEntrySchema>;
export type ProjectFileEntry = z.infer<typeof projectFileEntrySchema>;
export type SourceColumnSelection = z.infer<typeof sourceColumnSelectionSchema>;
export type SourceRowFilter = z.infer<typeof sourceRowFilterSchema>;
export type JsonFieldSelection = z.infer<typeof jsonFieldSelectionSchema>;
export type SourceSelection = z.infer<typeof sourceSelectionSchema>;
export type TableColumn = z.infer<typeof tableColumnSchema>;
export type HeaderGroup = z.infer<typeof headerGroupSchema>;
export type TableRow = z.infer<typeof tableRowSchema>;
export type EmphasisRule = z.infer<typeof emphasisRuleSchema>;
export type TemplatePreset = z.infer<typeof templatePresetSchema>;
export type TableDocument = z.infer<typeof tableDocumentSchema>;
export type BootstrapWorkspace = z.infer<typeof bootstrapWorkspaceSchema>;
export type WorkspacePayload = z.infer<typeof workspacePayloadSchema>;
export type WorkspaceDocument = z.infer<typeof workspaceDocumentSchema>;
