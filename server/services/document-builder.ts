import { sourceSelectionSchema } from "../../shared/schema/source-selection";
import { tableDocumentSchema } from "../../shared/schema/table-document";
import { getCompatibleColumns, readCsvFile } from "./csv-service";

type BuildInitialTableDocumentOptions = {
  projectPath: string | string[];
  csvPaths: string[];
  selectedColumns: string[];
  tableId?: string;
};

function formatColumnLabel(columnKey: string) {
  return columnKey
    .split(/[_-]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function guessColumnAlignment(columnKey: string) {
  return /(acc|score|f1|bleu|rouge|auc|mrr|map|loss|params|count|time|latency|ms)$/i.test(
    columnKey,
  )
    ? "decimal"
    : "left";
}

export async function buildInitialTableDocument({
  projectPath,
  csvPaths,
  selectedColumns,
  tableId = "main-results",
}: BuildInitialTableDocumentOptions) {
  if (csvPaths.length === 0) {
    throw new Error("At least one CSV source must be selected.");
  }

  const csvFiles = await Promise.all(
    csvPaths.map((csvPath) => readCsvFile({ projectPath, csvPath })),
  );
  const compatibleColumns = getCompatibleColumns(csvFiles);
  const incompatibleColumns = selectedColumns.filter(
    (column) => !compatibleColumns.includes(column),
  );

  if (incompatibleColumns.length > 0) {
    throw new Error(
      `Selected columns are not compatible across CSV sources: ${incompatibleColumns.join(", ")}`,
    );
  }

  const columns = selectedColumns.map((columnKey, index) => ({
    key: columnKey,
    label: formatColumnLabel(columnKey),
    width: index === 0 ? 220 : 140,
    hidden: false,
    align: guessColumnAlignment(columnKey),
  }));

  const rows = csvFiles.flatMap((csvFile, csvIndex) =>
    csvFile.rows.map((record, rowIndex) => ({
      id: `row-${csvIndex + 1}-${rowIndex + 1}`,
      cells: Object.fromEntries(
        selectedColumns.map((columnKey) => [columnKey, record[columnKey] ?? null]),
      ),
    })),
  );

  return tableDocumentSchema.parse({
    id: tableId,
    columns,
    headerGroups: [],
    rows,
    caption: "",
    footnotes: [],
    templatePreset: "custom",
    templateOverrides: {},
    emphasisRules: [],
  });
}

export async function buildBootstrapPayload(options: BuildInitialTableDocumentOptions) {
  const tableDocument = await buildInitialTableDocument(options);
  const sourceSelection = sourceSelectionSchema.parse({
    selectedFilePaths: options.csvPaths,
    columns: options.selectedColumns.map((columnKey) => ({
      columnKey,
      label: formatColumnLabel(columnKey),
    })),
    rowFilters: [],
    jsonFieldSelections: [],
  });

  return {
    sourceSelection,
    tableDocument,
  };
}
