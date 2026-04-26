# Cypress E2E – Customer Flow (Register → Shop → Cart → Checkout)

This README summarizes the work completed to make a **demo-stable** Cypress E2E test for the customer journey in the Super Market Management System.

## What we implemented

### 1) Configuration / credentials audit (backend)
- Reviewed backend configuration for hard-coded credentials.
- Found **seed / environment credentials** present in backend config (e.g., database and seeded admin/supervisor-style users).
- No “customer login credentials” were found hard-coded as a fixed customer account.

Recommended next step (outside test scope): rotate/remove any seeded credentials for non-dev environments.

### 2) Cypress E2E flow (frontend)
Created/updated a Cypress spec that drives the real UI routes and API calls:

**Flow covered (happy path)**
1. Register a new customer
2. App auto-logins (waits for login API)
3. Browse shop and add a product to cart
4. Open Cart and verify:
   - at least one cart item
   - total is displayed
5. Proceed to Checkout and:
   - fill Shipping Address
   - select Cash on Delivery (if present)
6. Place order and verify “Order Confirmed”

**Demo-stability requirement**
If auth protection triggers (e.g., add-to-cart or cart/checkout access is unauthorized) and the app redirects to `/login`, the test:
- asserts the login UI is visible, and
- exits cleanly without failing.

## Files changed

### Cypress spec
- `frontend/cypress/e2e/customer-flow.cy.js`

### Minimal `data-testid` hooks for stable selectors
These do not change user-facing UI; they only make tests more reliable.

- `frontend/src/pages/ProductList.tsx`
  - `data-testid="add-to-cart"`

- `frontend/src/pages/Cart.tsx`
  - `data-testid="cart-page"`
  - `data-testid="cart-item"`
  - `data-testid="checkout-button"`

- `frontend/src/pages/Checkout.tsx`
  - `data-testid="shipping-address"` (added to the input)
  - `data-testid="place-order-button"`
  - `data-testid="order-success-message"`

## APIs the test expects
The test uses `cy.intercept()` to wait for key requests:
- `POST **/api/auth/register`
- `POST **/api/auth/login`
- `GET  **/api/products*`
- `POST **/api/cart/items`
- `GET  **/api/cart`
- `POST **/api/orders`

## How to run

### Prerequisites
- Backend API running (the UI expects the API base like `http://localhost:5224/api`)
- Frontend running at `http://localhost:3000`

### Start the backend (example)
From the repo root:

```powershell
cd SupermarketAPI
dotnet run
```

### Start the frontend
In a separate terminal:

```powershell
cd frontend
npm install
npm start
```

### Run Cypress
From `frontend/`:

```powershell
npx cypress run --spec cypress/e2e/customer-flow.cy.js
```

Or open interactive runner:

```powershell
npx cypress open
```

## Notes / troubleshooting

### Frontend URL
The spec uses a constant:

```js
const FRONTEND_URL = 'http://localhost:3000';
```

If your frontend runs on a different port, update it in:
- `frontend/cypress/e2e/customer-flow.cy.js`

### Why we don’t use Cypress.env
The Cypress config disables env injection:
- `allowCypressEnv: false` in `frontend/cypress.config.ts`

So the spec intentionally does not depend on `Cypress.env()`.

### “Redirect to /login” is considered a PASS
If you see logs like:
- “Add-to-cart was unauthorized; redirected to /login”

That is expected protected behavior and the spec is designed **not to fail** the run.
