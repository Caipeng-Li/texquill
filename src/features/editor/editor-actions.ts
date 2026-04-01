import type { TableDocument } from "../../../shared/types";
import type { TemplatePreset } from "../../../shared/types";
import type { EditorAction } from "./editor-reducer";

export function replaceDocument(tableDocument: TableDocument) {
  return {
    type: "document/replaced",
    payload: {
      tableDocument,
    },
  } satisfies EditorAction;
}

export function renameColumnLabel(columnKey: string, nextLabel: string) {
  return {
    type: "column/labelRenamed",
    payload: {
      columnKey,
      nextLabel,
    },
  } satisfies EditorAction;
}

export function toggleColumnHidden(columnKey: string) {
  return {
    type: "column/hiddenToggled",
    payload: {
      columnKey,
    },
  } satisfies EditorAction;
}

export function resizeColumn(columnKey: string, width: number) {
  return {
    type: "column/resized",
    payload: {
      columnKey,
      width,
    },
  } satisfies EditorAction;
}

export function reorderColumn(columnKey: string, targetIndex: number) {
  return {
    type: "column/reordered",
    payload: {
      columnKey,
      targetIndex,
    },
  } satisfies EditorAction;
}

export function createHeaderGroup(payload: { label: string; columnKeys: string[] }) {
  return {
    type: "headerGroup/created",
    payload,
  } satisfies EditorAction;
}

export function setTemplatePreset(templatePreset: TemplatePreset) {
  return {
    type: "template/presetSet",
    payload: {
      templatePreset,
    },
  } satisfies EditorAction;
}

export function setCaption(caption: string) {
  return {
    type: "caption/changed",
    payload: {
      caption,
    },
  } satisfies EditorAction;
}

export function setFootnotes(footnotes: string[]) {
  return {
    type: "footnotes/changed",
    payload: {
      footnotes,
    },
  } satisfies EditorAction;
}

export function upsertEmphasisRule(payload: {
  columnKey: string;
  style: "bold" | "italic";
  type: "max" | "min" | "match";
}) {
  return {
    type: "emphasisRule/upserted",
    payload,
  } satisfies EditorAction;
}
