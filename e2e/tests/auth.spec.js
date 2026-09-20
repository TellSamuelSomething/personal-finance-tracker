import { expect, PASSWORD, signInThroughTheForm, test, navLink } from "./fixtures.js";

test.describe("access control", () => {
  test("visitors without an account are sent to the login page", async ({ page }) => {
    await page.goto("/transactions");

    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole("heading", { name: "Log in" })).toBeVisible();
  });

  test("a rejected token signs the user out instead of leaving a broken page", async ({ page, signedIn }) => {
    await page.evaluate(() => localStorage.setItem("token", "not.a.real.token"));
    await navLink(page, "Statistics").click();

    await expect(page).toHaveURL(/\/login$/);
    expect(await page.evaluate(() => localStorage.getItem("token"))).toBeNull();
  });
});

test.describe("registering", () => {
  test("creates the account and signs the user straight in", async ({ page }) => {
    const username = `newuser${Date.now().toString(36)}`;

    await page.goto("/register");
    await page.getByLabel("Username").fill(username);
    await page.getByLabel("Password").fill(PASSWORD);
    await page.getByRole("button", { name: "Register" }).click();

    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByRole("heading", { name: `Hello, ${username}` })).toBeVisible();
  });

  test("explains a password that is too short", async ({ page }) => {
    await page.goto("/register");
    await page.getByLabel("Username").fill("someone");
    await page.getByLabel("Password").fill("short");
    await page.getByRole("button", { name: "Register" }).click();

    await expect(page.getByText("Password must be at least 8 characters")).toBeVisible();
    await expect(page).toHaveURL(/\/register$/);
  });

  test("refuses a username that is already taken", async ({ page, account }) => {
    await page.goto("/register");
    await page.getByLabel("Username").fill(account.username);
    await page.getByLabel("Password").fill(PASSWORD);
    await page.getByRole("button", { name: "Register" }).click();

    await expect(page.getByRole("alert")).toHaveText("Username is already taken");
  });
});

test.describe("logging in and out", () => {
  test("a wrong password gets the same generic message as an unknown user", async ({ page, account }) => {
    await page.goto("/login");
    await page.getByLabel("Username").fill(account.username);
    await page.getByLabel("Password").fill("wrong-password-1");
    await page.getByRole("button", { name: "Log in" }).click();

    await expect(page.getByRole("alert")).toHaveText("Invalid username or password");

    await page.getByLabel("Username").fill("nobody-has-this-name");
    await page.getByRole("button", { name: "Log in" }).click();
    await expect(page.getByRole("alert")).toHaveText("Invalid username or password");
  });

  test("the session survives a page reload", async ({ page, account }) => {
    await signInThroughTheForm(page, account);

    await page.reload();

    await expect(page.getByRole("heading", { name: `Hello, ${account.username}` })).toBeVisible();
  });

  test("logging out closes the protected pages again", async ({ page, signedIn }) => {
    await page.getByRole("button", { name: "Log out" }).click();
    await expect(page).toHaveURL(/\/login$/);

    await page.goto("/transactions");
    await expect(page).toHaveURL(/\/login$/);
  });
});
