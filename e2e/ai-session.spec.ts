import { test, expect } from "@playwright/test";
import { loginAsTestUser } from "./helpers/auth";

test.describe("AI Tutor Session", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
  });

  test("tutor tab renders generate button", async ({ page }) => {
    await page.goto("/lessons");
    await page.click("text=Tutor");
    await expect(page.locator('button:has-text("Generate Session")')).toBeVisible();
  });
});
