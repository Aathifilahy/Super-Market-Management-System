describe("Customer Cart and Checkout Flow", () => {
  const addFirstAvailableProductToCart = () => {
    cy.visit("/shop");

    cy.get('[data-testid="product-card"]', { timeout: 10000 }).should(
      "have.length.greaterThan",
      0
    );

    cy.get('[data-testid="product-card"]').then(($cards) => {
      const availableCard = [...$cards].find((card) =>
        card.querySelector('[data-testid="add-to-cart-btn"]:not(:disabled)')
      );

      expect(availableCard, "available product with enabled Add to Cart button").to.exist;

      cy.wrap(availableCard).find('[data-testid="add-to-cart-btn"]').click();
    });
  };

  beforeEach(() => {
    cy.ensureAvailableProduct();
    cy.loginAsCustomer();
    cy.clearCart();
  });

  it("adds an item, updates quantity, shows total, and checks out", () => {
    addFirstAvailableProductToCart();

    cy.visit("/cart");
    cy.get('[data-testid="quantity-input"]').first().should("be.visible").type("{selectall}2");
    cy.get('[data-testid="cart-total"]').should("be.visible").and("contain", "$");

    cy.get('[data-testid="checkout-btn"]').should("be.visible").click();
    cy.get('[data-testid="shipping-address-input"]')
      .should("be.visible")
      .type("123 Demo Street, Colombo");
    cy.get('[data-testid="checkout-btn"]').should("be.visible").click();
    cy.get('[data-testid="checkout-success-message"]').should("be.visible");
  });

  it("removes an item from the cart", () => {
    addFirstAvailableProductToCart();

    cy.visit("/cart");
    cy.get('[data-testid="remove-cart-item"]').first().should("be.visible").click();
    cy.get('[data-testid="empty-cart-message"]').should("be.visible");
  });

  it("blocks checkout when the cart is empty", () => {
    cy.visit("/checkout");
    cy.get('[data-testid="empty-cart-message"]').should("be.visible");
    cy.get('[data-testid="checkout-error-message"]').should("be.visible");
    cy.get('[data-testid="checkout-btn"]').should("not.exist");
  });
});
