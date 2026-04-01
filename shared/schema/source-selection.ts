import { z } from "zod";

const filterValueSchema = z.union([z.string(), z.number(), z.boolean()]);

export const sourceColumnSelectionSchema = z.object({
  sourcePath: z.string().min(1),
  columnKey: z.string().min(1),
  label: z.string().min(1),
  hidden: z.boolean().optional(),
  jsonPath: z.string().min(1).optional(),
});

export const sourceRowFilterSchema = z.object({
  columnKey: z.string().min(1),
  operator: z.enum(["equals", "notEquals", "contains", "gt", "gte", "lt", "lte"]),
  value: filterValueSchema,
});

export const jsonFieldSelectionSchema = z.object({
  sourcePath: z.string().min(1),
  columnKey: z.string().min(1),
  jsonPath: z.string().min(1),
  outputKey: z.string().min(1),
});

export const sourceSelectionSchema = z.object({
  selectedFilePaths: z.array(z.string().min(1)).min(1),
  columns: z.array(sourceColumnSelectionSchema).min(1),
  rowFilters: z.array(sourceRowFilterSchema).default([]),
  jsonFieldSelections: z.array(jsonFieldSelectionSchema).default([]),
});
