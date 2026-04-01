import { readFile } from "node:fs/promises";

import { parse } from "csv-parse/sync";

import { resolveProjectFilePath } from "../filesystem/safe-path";

type CsvRecord = Record<string, string>;

export type ParsedCsvFile = {
  csvPath: string;
  columns: string[];
  rows: CsvRecord[];
};

function parseColumns(csvText: string) {
  const [headerRow] = parse(csvText, {
    to_line: 1,
    relax_column_count: true,
    trim: true,
  }) as string[][];

  return headerRow ?? [];
}

export async function readCsvFile(options: {
  projectPath: string | string[];
  csvPath: string;
}) {
  const absoluteCsvPath = resolveProjectFilePath(options.projectPath, options.csvPath);
  const csvText = await readFile(absoluteCsvPath, "utf8");
  const rows = parse(csvText, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as CsvRecord[];

  return {
    csvPath: options.csvPath,
    columns: parseColumns(csvText),
    rows,
  } satisfies ParsedCsvFile;
}

export async function previewCsvFile(options: {
  projectPath: string | string[];
  csvPath: string;
  limit?: number;
}) {
  const parsed = await readCsvFile(options);

  return {
    csvPath: parsed.csvPath,
    columns: parsed.columns,
    rows: parsed.rows.slice(0, options.limit ?? 10),
    totalRows: parsed.rows.length,
  };
}

export function getCompatibleColumns(csvFiles: ParsedCsvFile[]) {
  if (csvFiles.length === 0) {
    return [];
  }

  return csvFiles[0].columns.filter((column) =>
    csvFiles.every((csvFile) => csvFile.columns.includes(column)),
  );
}
