describe('Click Counter — integration', () => {
  it('increments the counter when the button is clicked', () => {
    cy.visit('/');

    // The counter should start at 0
    cy.get('#counter-value').should('have.text', '0');

    // Click the button 3 times
    cy.get('#increment-btn').click();
    cy.get('#counter-value').should('have.text', '1');

    cy.get('#increment-btn').click();
    cy.get('#counter-value').should('have.text', '2');

    cy.get('#increment-btn').click();
    cy.get('#counter-value').should('have.text', '3');
  });

  it('shows the correct page title', () => {
    cy.visit('/');
    cy.title().should('include', 'Click Counter');
  });

  it('has the click button visible', () => {
    cy.visit('/');
    cy.get('#increment-btn').should('be.visible');
  });
});
