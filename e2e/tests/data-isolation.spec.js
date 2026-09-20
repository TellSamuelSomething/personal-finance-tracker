import { expect, signInThroughTheForm, test, navLink } from "./fixtures.js";

// The original version of this app had no owner on transactions, so anyone could read and delete
// everyone's data. These tests exist so that can never quietly come back.
test.describe("one user's data is invisible to another", () => {
  test("a second user sees an empty list, not the first user's transactions", async ({ page, request, account, seed }) => {
    await seed(account, [{ type: "Expense", amount: 999, category: "Secret", date: "2026-09-01" }]);

    const other = await (async () => {
      const username = `other${Date.now().toString(36)}`;
      await request.post("/api/auth/register", { data: { username, password: account.password } });
      return { username, password: account.password };
    })();

    await signInThroughTheForm(page, other);
    await navLink(page, "Transactions").click();

    await expect(page.getByText("No transactions yet.")).toBeVisible();
    await expect(page.getByText("Secret")).toHaveCount(0);
  });

  test("the API refuses to delete someone else's transaction and rejects requests without a token", async ({
    request,
    account,
  }) => {
    const created = await request.post("/api/transactions", {
      headers: { Authorization: `Bearer ${account.token}` },
      data: { type: "Expense", amount: 5, category: "Coffee", date: "2026-09-01" },
    });
    const { _id } = await created.json();

    const otherName = `intruder${Date.now().toString(36)}`;
    await request.post("/api/auth/register", { data: { username: otherName, password: account.password } });
    const login = await request.post("/api/auth/login", { data: { username: otherName, password: account.password } });
    const { token: otherToken } = await login.json();

    const stolenDelete = await request.delete(`/api/transactions/${_id}`, { headers: { Authorization: `Bearer ${otherToken}` } });
    expect(stolenDelete.status()).toBe(404);

    const noToken = await request.get("/api/transactions");
    expect(noToken.status()).toBe(401);

    // The owner still has the transaction.
    const mine = await request.get("/api/transactions", { headers: { Authorization: `Bearer ${account.token}` } });
    expect(await mine.json()).toHaveLength(1);
  });
});
