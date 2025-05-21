import { test, expect } from './test-utils';

test.describe('Component tests', () => {
  test('should render the homepage correctly', async ({ page }) => {
    await page.goto('/');
    
    // Check for main elements
    await expect(page.getByRole('heading', { name: /welcome/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /login/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /signup/i })).toBeVisible();
  });
  
  test('should display user data from Firestore', async ({ authenticatedPage: page, firebaseContext }) => {
    const { db } = firebaseContext;
    
    // Go to a page that displays user data
    await page.goto('/dashboard');
    
    // Check if data is loaded and displayed
    const dataContainer = page.locator('.user-data-container');
    await expect(dataContainer).toBeVisible();
    
    // You may need to wait for data to load
    await expect(page.locator('.loading-indicator')).toBeHidden({ timeout: 10000 });
    
    // Verify specific data elements are shown
    await expect(page.getByText(/your projects/i)).toBeVisible();
  });
  
  test('should toggle theme correctly', async ({ page }) => {
    await page.goto('/');
    
    // Find the theme toggle button
    const themeToggle = page.getByRole('button', { name: /dark mode|light mode|theme/i });
    
    // Get current theme state
    const initialTheme = await page.evaluate(() => {
      return document.documentElement.getAttribute('data-theme') || 
             document.body.classList.contains('dark-theme') ? 'dark' : 'light';
    });
    
    // Toggle theme
    await themeToggle.click();
    
    // Verify theme changed
    const newTheme = await page.evaluate(() => {
      return document.documentElement.getAttribute('data-theme') || 
             document.body.classList.contains('dark-theme') ? 'dark' : 'light';
    });
    
    expect(newTheme).not.toEqual(initialTheme);
  });
});