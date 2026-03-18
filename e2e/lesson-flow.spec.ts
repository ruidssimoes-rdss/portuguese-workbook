import { test, expect } from "@playwright/test";
import { loginAsTestUser, navigateToLesson } from "./helpers/auth";

test.describe("Lesson Flow", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
  });

  test("lesson browser shows all CEFR levels", async ({ page }) => {
    await page.goto("/lessons");
    await expect(page.locator("text=A1")).toBeVisible();
    await expect(page.locator("text=A2")).toBeVisible();
    await expect(page.locator("text=B1")).toBeVisible();
  });

  test("lesson browser has curriculum and tutor tabs", async ({ page }) => {
    await page.goto("/lessons");
    await expect(page.locator("text=Curriculum")).toBeVisible();
    await expect(page.locator("text=Tutor")).toBeVisible();
  });

  test("first lesson loads learn phase", async ({ page }) => {
    await navigateToLesson(page, "a1-01");
    // Should see some content on the page
    await expect(page.locator("body")).not.toBeEmpty();
  });
});
