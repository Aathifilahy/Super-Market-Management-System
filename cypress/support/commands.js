const API_BASE_URL = "http://localhost:5224/api";
const SUPERVISOR_EMAIL = "supervisor@example.com";
const SUPERVISOR_PASSWORD = "ChangeMe_Supervisor_123!";

const hasAvailableStock = (product) => {
  const expiryTime = new Date(product.expiryDate).getTime();
  return product.quantity > 0 && Number.isFinite(expiryTime) && expiryTime > Date.now();
};

Cypress.Commands.add("ensureAvailableProduct", () => {
  cy.request("GET", `${API_BASE_URL}/products`).then(({ body: products }) => {
    const availableProduct = products.find(hasAvailableStock);

    if (availableProduct) {
      return;
    }

    cy.request("POST", `${API_BASE_URL}/auth/login`, {
      email: SUPERVISOR_EMAIL,
      password: SUPERVISOR_PASSWORD,
    }).then(({ body }) => {
      cy.request({
        method: "POST",
        url: `${API_BASE_URL}/products`,
        headers: {
          Authorization: `Bearer ${body.token}`,
        },
        body: {
          name: `Cypress Demo Product ${Date.now()}`,
          category: "Demo",
          price: 3.5,
          quantity: 20,
          lowStockThreshold: 5,
          expiryDate: "2035-12-31T00:00:00Z",
          imageUrl: null,
        },
      });
    });
  });
});

Cypress.Commands.add("loginAsCustomer", () => {
  return cy.fixture("customer").then((customer) => {
    cy.request({
      method: "POST",
      url: `${API_BASE_URL}/auth/register`,
      body: customer,
      failOnStatusCode: false,
    });

    cy.request("POST", `${API_BASE_URL}/auth/login`, {
      email: customer.email,
      password: customer.password,
    }).then(({ body }) => {
      cy.visit("/login");
      cy.window().then((win) => {
        win.sessionStorage.setItem("supermarket_auth_token", body.token);
        win.sessionStorage.setItem("supermarket_auth_user", JSON.stringify(body.user));
      });
      cy.visit("/shop");
    });
  });
});

Cypress.Commands.add("clearCart", () => {
  return cy.window().then((win) => {
    const token = win.sessionStorage.getItem("supermarket_auth_token");

    cy.request({
      method: "DELETE",
      url: `${API_BASE_URL}/cart/clear`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
      failOnStatusCode: false,
    });
  });
});
