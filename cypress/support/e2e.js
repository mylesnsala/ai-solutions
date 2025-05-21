describe('Inquiry Form', () => {
    it('loads the home page', () => {
      cy.visit('/login');
      cy.contains('Next Generation'); // adjust to match something visible on your page
    });
  });
  