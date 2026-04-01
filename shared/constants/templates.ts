export const templatePresetIds = ["custom", "neurips", "icml", "acl"] as const;

export const templatePresetOptions = [
  {
    id: "custom",
    label: "Custom",
    description: "Manual defaults for lab-specific table layouts.",
    defaults: {
      ruleStyle: "booktabs",
      alignment: "left",
      fontScale: 1,
      dense: false,
    },
  },
  {
    id: "neurips",
    label: "NeurIPS",
    description: "Tighter spacing with booktabs-style rules for conference papers.",
    defaults: {
      ruleStyle: "booktabs",
      alignment: "decimal",
      fontScale: 0.96,
      dense: true,
    },
  },
  {
    id: "icml",
    label: "ICML",
    description: "Balanced spacing for numeric comparison tables.",
    defaults: {
      ruleStyle: "booktabs",
      alignment: "decimal",
      fontScale: 0.98,
      dense: false,
    },
  },
  {
    id: "acl",
    label: "ACL",
    description: "Readable text-first defaults for NLP result tables.",
    defaults: {
      ruleStyle: "booktabs",
      alignment: "left",
      fontScale: 1,
      dense: false,
    },
  },
] as const;
