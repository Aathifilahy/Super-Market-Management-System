describe('Cashier POS sale flow', () => {
  it('completes a cashier sale end-to-end', () => {
    const cashierEmail = 'pos@gmail.com';
    const cashierPassword = 'pos12345';
    const productName = 'brinjal';

    // Visit login page
    cy.visit('/login');

    // Login as cashier
    cy.get('[data-cy=login-email]').clear().type(cashierEmail);
    cy.get('[data-cy=login-password]').clear().type(cashierPassword, { log: false });
    cy.get('[data-cy=login-submit]').click();

    // Navigate to cashier/POS page
    cy.url().should('include', '/cashier/pos');
    cy.get('[data-cy=pos-page]').should('be.visible');

    // Search/select a product
    cy.get('[data-cy=product-search]').clear().type(productName);
    cy.contains('button', 'Search Now').click();

    // Add product to cart
    cy.get('[data-cy=product-item]').first().within(() => {
      cy.get('[data-cy=add-to-cart]').click();
    });
    cy.get('[data-cy=cart-item]').should('have.length.at.least', 1);

    // Complete the sale
    cy.contains('button', 'Take Payment').click();

    // Wait for modal
    cy.get('[data-cy=payment-modal]').should('be.visible');

    // Enter amount
    cy.get('[data-cy=amount-tendered-input]')
      .trigger('mouseover')
      .click({ force: true })
      .clear({ force: true })
      .type('500', { force: true });

    // Click complete
    cy.get('[data-cy=complete-sale]')
      .should('not.be.disabled')
      .click();

    // Assert success
    cy.get('[data-cy=sale-success]').should('be.visible');
  });
});
