import { z } from "zod";

import { templatePresetIds } from "../constants/templates";

export const templatePresetSchema = z.enum(templatePresetIds);
export const columnAlignmentSchema = z.enum(["left", "center", "right", "decimal"]);
export const tableRuleStyleSchema = z.enum(["booktabs", "grid"]);

const cellValueSchema = z.union([z.string(), z.number(), z.boolean(), z.null()]);

export const numericFormatSchema = z.object({
  minimumFractionDigits: z.number().int().nonnegative().optional(),
  maximumFractionDigits: z.number().int().nonnegative().optional(),
  trimTrailingZeros: z.boolean().optional(),
});

export const tableColumnSchema = z.object({
  key: z.string().min(1),
  label: z.string().min(1),
  width: z.number().positive(),
  hidden: z.boolean(),
  align: columnAlignmentSchema.optional(),
  format: numericFormatSchema.optional(),
});

export const headerGroupSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  startColumnKey: z.string().min(1),
  span: z.number().int().positive(),
});

export const emphasisRuleSchema = z.object({
  id: z.string().min(1),
  columnKey: z.string().min(1),
  type: z.enum(["max", "min", "match"]),
  style: z.enum(["bold", "italic"]),
  matchValue: cellValueSchema.optional(),
});

export const tableRowSchema = z.object({
  id: z.string().min(1),
  cells: z.record(z.string(), cellValueSchema),
});

export const templateOverrideSchema = z.object({
  ruleStyle: tableRuleStyleSchema.optional(),
  fontScale: z.number().positive().optional(),
  dense: z.boolean().optional(),
  alignment: columnAlignmentSchema.optional(),
});

export const tableDocumentSchema = z.object({
  id: z.string().min(1),
  columns: z.array(tableColumnSchema).min(1),
  headerGroups: z.array(headerGroupSchema).default([]),
  rows: z.array(tableRowSchema),
  caption: z.string(),
  footnotes: z.array(z.string()).default([]),
  templatePreset: templatePresetSchema.default("custom"),
  templateOverrides: templateOverrideSchema.default({}),
  emphasisRules: z.array(emphasisRuleSchema).default([]),
});
