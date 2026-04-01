import { expect, test } from "@playwright/test";

test("reopens a saved project, edits the table, and exports latex", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Project").selectOption("demo-study");
  await page.getByLabel("results/main.csv").check();
  await page.getByLabel("results/ablation.csv").check();
  await page.getByRole("button", { name: /start table/i }).click();

  await expect(page.getByText(/starter table ready/i)).toBeVisible();

  await page.getByRole("button", { name: /save workspace/i }).click();
  await expect(page.getByText(/workspace saved/i)).toBeVisible();

  await page.reload();
  await page.getByLabel("Project").selectOption("demo-study");
  await expect(page.getByText(/saved workspace restored/i)).toBeVisible();

  await page.getByRole("button", { name: "Accuracy" }).click();
  await page.getByLabel("Edit Accuracy").fill("Acc.");
  await page.getByLabel("Edit Accuracy").press("Enter");
  await expect(page.getByRole("button", { name: "Acc." })).toBeVisible();

  await page.getByRole("button", { name: /export latex/i }).click();
  await expect(page.getByText(/export complete/i)).toBeVisible();
});
