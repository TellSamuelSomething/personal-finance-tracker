import { expect, test, navLink } from "./fixtures.js";

async function addTransaction(page, { type, amount, category, date }) {
  await navLink(page, "Add").click();
  await page.getByLabel("Type").selectOption(type);
  await page.getByLabel("Amount").fill(String(amount));
  await page.getByLabel("Category").fill(category);
  if (date) await page.getByLabel("Date").fill(date);
  await page.getByRole("button", { name: "Add transaction" }).click();
}

test.describe("transactions", () => {
  test("a new account starts with an empty list", async ({ page, signedIn }) => {
    await navLink(page, "Transactions").click();

    await expect(page.getByText("No transactions yet.")).toBeVisible();
  });

  test("income and expenses are listed with the right sign, newest first", async ({ page, signedIn }) => {
    await addTransaction(page, { type: "Income", amount: 3000, category: "Salary", date: "2026-09-01" });
    await addTransaction(page, { type: "Expense", amount: 85.5, category: "Food", date: "2026-09-05" });

    await expect(page).toHaveURL(/\/transactions$/);
    const rows = page.locator("tbody tr");
    await expect(rows).toHaveCount(2);
    await expect(rows.nth(0)).toContainText("2026-09-05");
    await expect(rows.nth(0)).toContainText("Food");
    await expect(rows.nth(0)).toContainText("-85.50");
    await expect(rows.nth(1)).toContainText("Salary");
    await expect(rows.nth(1)).toContainText("+3,000.00");
  });

  test("an amount of zero is rejected with a message next to the field", async ({ page, signedIn }) => {
    await addTransaction(page, { type: "Expense", amount: 0, category: "Food" });

    await expect(page.getByText("Amount must be greater than 0")).toBeVisible();
    await expect(page).toHaveURL(/\/add-transaction$/);
  });

  test("a missing category is rejected", async ({ page, signedIn }) => {
    await addTransaction(page, { type: "Expense", amount: 10, category: "" });

    await expect(page.getByText("Category is required")).toBeVisible();
  });

  test("deleting asks for confirmation, and cancelling keeps the transaction", async ({ page, account, seed }) => {
    await seed(account, [{ type: "Expense", amount: 40, category: "Transport", date: "2026-09-07" }]);
    await page.goto("/login");
    await page.getByLabel("Username").fill(account.username);
    await page.getByLabel("Password").fill(account.password);
    await page.getByRole("button", { name: "Log in" }).click();
    await navLink(page, "Transactions").click();

    page.once("dialog", (dialog) => dialog.dismiss());
    await page.getByRole("button", { name: "Delete" }).click();
    await expect(page.locator("tbody tr")).toHaveCount(1);

    page.once("dialog", (dialog) => dialog.accept());
    await page.getByRole("button", { name: "Delete" }).click();
    await expect(page.getByText("No transactions yet.")).toBeVisible();
  });
});
