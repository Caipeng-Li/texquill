"use client";

import {
  createContext,
  type Dispatch,
  type ReactNode,
  useContext,
  useEffect,
  useReducer,
} from "react";

import type { TableDocument } from "../../../shared/types";
import { replaceDocument } from "./editor-actions";
import { createInitialEditorState, editorReducer, type EditorAction, type EditorState } from "./editor-reducer";

type EditorContextValue = {
  state: EditorState;
  dispatch: Dispatch<EditorAction>;
};

const EditorContext = createContext<EditorContextValue | null>(null);

type EditorProviderProps = {
  children: ReactNode;
  initialTableDocument: TableDocument;
};

export function EditorProvider({ children, initialTableDocument }: EditorProviderProps) {
  const [state, dispatch] = useReducer(
    editorReducer,
    initialTableDocument,
    createInitialEditorState,
  );

  useEffect(() => {
    dispatch(replaceDocument(initialTableDocument));
  }, [initialTableDocument]);

  return <EditorContext.Provider value={{ state, dispatch }}>{children}</EditorContext.Provider>;
}

export function useEditor() {
  const context = useContext(EditorContext);

  if (!context) {
    throw new Error("useEditor must be used within an EditorProvider.");
  }

  return context;
}
