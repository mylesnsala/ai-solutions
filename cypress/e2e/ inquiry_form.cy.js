describe('Inquiry Form Test', () => {
    it('visits the login page', () => {
      // Visit the login page
      cy.visit('/login');
      
      // Wait for the page to load and check for login form elements
      cy.get('form').should('exist');
      
      // Check for common login form elements
      cy.get('input[type="email"]').should('exist');
      cy.get('input[type="password"]').should('exist');
      cy.get('button[type="submit"]').should('exist');
    });
});
  