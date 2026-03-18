import type { Page } from "@playwright/test";

export async function loginAsTestUser(page: Page) {
  await page.goto("/auth/login");
  await page.fill('input[type="email"]', process.env.TEST_USER_EMAIL || "test@example.com");
  await page.fill('input[type="password"]', process.env.TEST_USER_PASSWORD || "testpassword123");
  await page.click('button[type="submit"]');
  await page.waitForURL("/", { timeout: 10000 });
}

export async function navigateToLesson(page: Page, lessonId: string) {
  await page.goto(`/lessons/${lessonId}`);
  await page.waitForTimeout(1000); // Wait for page to hydrate
}
