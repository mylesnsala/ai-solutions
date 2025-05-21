describe("Inquiry Form", () => {
  it("should submit an inquiry successfully", () => {
    cy.visit("http://localhost:3000");

    cy.get('input[name="name"]').type("John Doe");
    cy.get('input[name="email"]').type("john@example.com");
    cy.get('textarea[name="message"]').type("Hello, I have a question.");

    cy.get('button[type="submit"]').click();

    cy.contains("Thank you for your inquiry").should("be.visible");
  });
});

describe("Event Listing", () => {
  it("should display event cards", () => {
    cy.visit("http://localhost:3000/events");

    cy.get(".event-card").should("have.length.at.least", 1);
    cy.get(".event-card").first().contains("Details");
  });
});
