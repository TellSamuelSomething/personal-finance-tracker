import { expect, signInThroughTheForm, test, navLink } from "./fixtures.js";

test.describe("statistics", () => {
  test("totals and charts reflect the transactions", async ({ page, account, seed }) => {
    await seed(account, [
      { type: "Income", amount: 3200, category: "Salary", date: "2026-09-01" },
      { type: "Expense", amount: 1250, category: "Rent", date: "2026-09-02" },
      { type: "Expense", amount: 86.4, category: "Food", date: "2026-09-05" },
      { type: "Expense", amount: 118.3, category: "Food", date: "2026-09-14" },
    ]);
    await signInThroughTheForm(page, account);

    await navLink(page, "Statistics").click();

    await expect(page.locator(".stat", { hasText: "Income" })).toContainText("3,200.00");
    await expect(page.locator(".stat", { hasText: "Expenses" })).toContainText("1,454.70");
    await expect(page.locator(".stat", { hasText: "Balance" })).toContainText("1,745.30");

    await expect(page.locator(".recharts-wrapper")).toHaveCount(2);
    // Two Food expenses collapse into one slice, so the legend has one entry per category.
    const legend = page.locator(".recharts-legend-item-text");
    await expect(legend).toHaveCount(2);
    expect((await legend.allTextContents()).sort()).toEqual(["Food", "Rent"]);
  });

  test("an account without transactions is told there is nothing to chart", async ({ page, signedIn }) => {
    await navLink(page, "Statistics").click();

    await expect(page.getByText("There is nothing to chart yet.")).toBeVisible();
  });
});
