# Cypress Testing – Cashier Module

Cypress is used here to run end-to-end tests against the cashier POS flow in the browser.

The cashier workflow test logs in, searches for a product, adds it to the cart, completes payment, and confirms a success message.

## How to run

1. Start the frontend app.
2. Run `npm run cypress:open` (interactive) or `npm run cypress:run` (headless).

## Expected output

The test should pass and show a successful cashier sale flow.

This test validates the cashier workflow used for in-store billing.
