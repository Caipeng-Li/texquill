import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, vi } from "vitest";

import HomePage from "@/app/page";

const fetchMock = vi.fn<typeof fetch>();

function jsonResponse(body: unknown) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: {
      "content-type": "application/json",
    },
  });
}

beforeEach(() => {
  fetchMock.mockImplementation(async (input) => {
    const url = typeof input === "string" ? input : input.toString();

    if (url.endsWith("/api/projects")) {
      return jsonResponse({
        projects: [{ name: "demo-study", path: "demo-study", kind: "directory" }],
      });
    }

    if (url.endsWith("/api/projects/demo-study/files")) {
      return jsonResponse({
        entries: [
          {
            name: "main.csv",
            path: "results/main.csv",
            kind: "file",
            extension: "csv",
          },
          {
            name: "ablation.csv",
            path: "results/ablation.csv",
            kind: "file",
            extension: "csv",
          },
        ],
      });
    }

    if (url.endsWith("/api/projects/demo-study/workspace")) {
      return new Response(JSON.stringify({ error: "No saved workspace yet." }), {
        status: 404,
        headers: {
          "content-type": "application/json",
        },
      });
    }

    if (url.includes("/api/projects/demo-study/preview?file=results%2Fmain.csv")) {
      return jsonResponse({
        columns: ["model", "accuracy", "f1", "params_m"],
        rows: [{ model: "baseline", accuracy: "83.1", f1: "80.4", params_m: "110" }],
        totalRows: 3,
      });
    }

    if (url.endsWith("/api/projects/demo-study/bootstrap")) {
      return jsonResponse({
        sourceSelection: {
          selectedFilePaths: ["results/main.csv", "results/ablation.csv"],
          columns: [
            { columnKey: "model", label: "Model" },
            { columnKey: "accuracy", label: "Accuracy" },
            { columnKey: "f1", label: "F1" },
            { columnKey: "params_m", label: "Params M" },
          ],
          rowFilters: [],
          jsonFieldSelections: [],
        },
        tableDocument: {
          id: "main-results",
          columns: [
            { key: "model", label: "Model", width: 220, hidden: false, align: "left" },
            {
              key: "accuracy",
              label: "Accuracy",
              width: 140,
              hidden: false,
              align: "decimal",
            },
            { key: "f1", label: "F1", width: 140, hidden: false, align: "decimal" },
            {
              key: "params_m",
              label: "Params M",
              width: 140,
              hidden: false,
              align: "decimal",
            },
          ],
          headerGroups: [],
          rows: [
            {
              id: "row-1-1",
              cells: {
                model: "baseline",
                accuracy: "83.1",
                f1: "80.4",
                params_m: "110",
              },
            },
          ],
          caption: "",
          footnotes: [],
          templatePreset: "custom",
          templateOverrides: {},
          emphasisRules: [],
        },
      });
    }

    throw new Error(`Unhandled fetch URL in test: ${url}`);
  });

  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
  fetchMock.mockReset();
});

it("renders the TeXquill workspace shell", async () => {
  render(<HomePage />);

  expect(screen.getByRole("heading", { name: /texquill/i })).toBeInTheDocument();
  expect(screen.getByText(/paper-ready tables/i)).toBeInTheDocument();
  expect(await screen.findByLabelText(/project/i)).toBeInTheDocument();
});

it("lets the user choose a project and start a table document", async () => {
  render(<HomePage />);

  fireEvent.change(await screen.findByLabelText(/project/i), {
    target: { value: "demo-study" },
  });

  fireEvent.click(await screen.findByLabelText(/results\/main\.csv/i));
  fireEvent.click(await screen.findByLabelText(/results\/ablation\.csv/i));
  fireEvent.click(await screen.findByRole("button", { name: /start table/i }));

  expect(await screen.findByText(/starter table ready/i)).toBeInTheDocument();
  expect(screen.getByText(/4 columns/i)).toBeInTheDocument();

  await waitFor(() => {
    expect(fetchMock).toHaveBeenCalled();
  });
});
