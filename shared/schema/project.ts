import { z } from "zod";

export const projectEntrySchema = z.object({
  name: z.string().min(1),
  path: z.string().min(1),
  kind: z.literal("directory"),
});

export const projectFileEntrySchema = z.object({
  name: z.string().min(1),
  path: z.string().min(1),
  kind: z.enum(["directory", "file"]),
  extension: z.string().min(1).optional(),
});

export const projectListSchema = z.object({
  projects: z.array(projectEntrySchema),
});

export const projectFilesSchema = z.object({
  entries: z.array(projectFileEntrySchema),
});
