const { test, expect } = require('./test-utils');
const { setupTestingEnvironment } = require('./firebase-setup');
const { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword, 
  signOut 
} = require('firebase/auth');

test.describe('Authentication', () => {
  test('should allow user registration', async ({ firebaseContext }) => {
    const { auth } = firebaseContext;
    const email = `test-${Date.now()}@example.com`;
    const password = 'Test123!';
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      expect(userCredential.user).toBeTruthy();
      expect(userCredential.user.email).toBe(email);
    } finally {
      // Clean up
      await signOut(auth);
    }
  });

  test('should allow user login', async ({ firebaseContext }) => {
    const { auth } = firebaseContext;
    const email = `test-${Date.now()}@example.com`;
    const password = 'Test123!';
    
    try {
      // First create a user
      await createUserWithEmailAndPassword(auth, email, password);
      await signOut(auth);
      
      // Then try to sign in
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      expect(userCredential.user).toBeTruthy();
      expect(userCredential.user.email).toBe(email);
    } finally {
      // Clean up
      await signOut(auth);
    }
  });

  test('should handle invalid login attempts', async ({ firebaseContext }) => {
    const { auth } = firebaseContext;
    
    try {
      await expect(signInWithEmailAndPassword(auth, 'invalid@example.com', 'wrongpass'))
        .rejects
        .toThrow();
    } finally {
      await signOut(auth);
    }
  });
}); 