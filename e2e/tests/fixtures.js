import { expect, test as base } from "@playwright/test";

export const PASSWORD = "correct-horse-battery";

/** A username nobody else in the run uses, so tests can run in parallel against one shared database. */
function uniqueUsername() {
  return `user${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

/** Creates an account through the API (fast, and it keeps these tests about what they are testing). */
async function createAccount(request) {
  const username = uniqueUsername();
  const registered = await request.post("/api/auth/register", { data: { username, password: PASSWORD } });
  expect(registered.status()).toBe(201);
  const login = await request.post("/api/auth/login", { data: { username, password: PASSWORD } });
  const { token } = await login.json();
  return { username, password: PASSWORD, token };
}

async function seedTransactions(request, token, transactions) {
  for (const transaction of transactions) {
    const response = await request.post("/api/transactions", {
      headers: { Authorization: `Bearer ${token}` },
      data: transaction,
    });
    expect(response.status()).toBe(201);
  }
}

/** A link in the top navigation bar (the dashboard cards contain similar link text). */
export function navLink(page, name) {
  return page.getByRole("navigation", { name: "Main" }).getByRole("link", { name, exact: true });
}

export async function signInThroughTheForm(page, { username, password }) {
  await page.goto("/login");
  await page.getByLabel("Username").fill(username);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Log in" }).click();
  await expect(page.getByRole("heading", { name: `Hello, ${username}` })).toBeVisible();
}

export const test = base.extend({
  /** A fresh account that has not signed in yet. */
  account: async ({ request }, use) => {
    await use(await createAccount(request));
  },

  /** A fresh account that is already signed in on `page`. */
  signedIn: async ({ page, account }, use) => {
    await signInThroughTheForm(page, account);
    await use(account);
  },

  seed: async ({ request }, use) => {
    await use((account, transactions) => seedTransactions(request, account.token, transactions));
  },
});

export { expect };
