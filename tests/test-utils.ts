import { test as base } from '@playwright/test';
import { setupTestingEnvironment } from './firebase-setup';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword, 
  signOut 
} from 'firebase/auth';

// Extend Playwright's test context with our Firebase setup
export const test = base.extend({
  // Firebase context setup
  firebaseContext: async ({}, use) => {
    const firebase = setupTestingEnvironment();
    await use(firebase);
  },
  
  // Authenticated page context
  authenticatedPage: async ({ page, firebaseContext }, use) => {
    const { auth } = firebaseContext;
    
    // Create a test user
    const testEmail = `test-${Date.now()}@example.com`;
    const testPassword = 'Test123!';
    
    try {
      // Create a new user for this test
      await createUserWithEmailAndPassword(auth, testEmail, testPassword);
      
      // Navigate to login page and sign in
      await page.goto('/login');
      await page.fill('input[type="email"]', testEmail);
      await page.fill('input[type="password"]', testPassword);
      await page.click('button[type="submit"]');
      
      // Wait for navigation after login
      await page.waitForURL('/dashboard');
      
      // Use the authenticated page
      await use(page);
      
      // Clean up - sign out after the test
      await signOut(auth);
    } catch (error) {
      console.error('Authentication setup failed:', error);
      throw error;
    }
  },
});

// Re-export Playwright's expect
export { expect } from '@playwright/test';