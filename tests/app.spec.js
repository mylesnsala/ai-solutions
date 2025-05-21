import { test, expect } from '@playwright/test';

test('homepage loads correctly', async ({ page }) => {
  await page.goto('http://localhost:3000'); // change if needed
  await expect(page).toHaveTitle(/Your App Title/);
  await expect(page.locator('text=Login')).toBeVisible();
});
