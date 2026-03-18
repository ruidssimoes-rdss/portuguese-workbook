import { test, expect } from "@playwright/test";
import { loginAsTestUser } from "./helpers/auth";

test.describe("Content Pages", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
  });

  test("vocabulary index renders", async ({ page }) => {
    await page.goto("/vocabulary");
    await expect(page.locator("body")).not.toBeEmpty();
  });

  test("grammar index renders", async ({ page }) => {
    await page.goto("/grammar");
    await expect(page.locator("body")).not.toBeEmpty();
  });

  test("conjugation index renders", async ({ page }) => {
    await page.goto("/conjugations");
    await expect(page.locator("body")).not.toBeEmpty();
  });

  test("culture page renders", async ({ page }) => {
    await page.goto("/culture");
    await expect(page.locator("body")).not.toBeEmpty();
  });

  test("progress dashboard renders", async ({ page }) => {
    await page.goto("/progress");
    await expect(page.locator("body")).not.toBeEmpty();
  });
});
