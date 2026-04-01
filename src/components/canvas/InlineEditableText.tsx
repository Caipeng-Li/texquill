"use client";

import { useState } from "react";

type InlineEditableTextProps = {
  value: string;
  onCommit: (nextValue: string) => void;
};

export function InlineEditableText({ value, onCommit }: InlineEditableTextProps) {
  const [draftValue, setDraftValue] = useState(value);
  const [isEditing, setIsEditing] = useState(false);

  const commit = () => {
    const nextValue = draftValue.trim() || value;

    onCommit(nextValue);
    setDraftValue(nextValue);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <input
        aria-label={`Edit ${value}`}
        autoFocus
        value={draftValue}
        onBlur={commit}
        onChange={(event) => setDraftValue(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            commit();
          }

          if (event.key === "Escape") {
            setDraftValue(value);
            setIsEditing(false);
          }
        }}
        style={{
          width: "100%",
          borderRadius: "10px",
          border: "1px solid var(--border)",
          padding: "6px 8px",
          font: "inherit",
        }}
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setIsEditing(true)}
      style={{
        border: "none",
        background: "transparent",
        color: "inherit",
        font: "inherit",
        textAlign: "left",
        padding: 0,
        cursor: "text",
      }}
    >
      {value}
    </button>
  );
}
