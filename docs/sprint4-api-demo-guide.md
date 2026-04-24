# Sprint 4 API Demo Guide

## Access

- Swagger UI: `http://localhost:5224/swagger`
- Base API URL: `http://localhost:5224/api`
- Auth: JWT Bearer token

In Swagger, use **Authorize** and paste:

```text
Bearer <jwt-token>
```

## Core Sprint 4 Endpoints

### Cashier POS

#### Search POS products

`GET /api/pos/products/search`

Query params:

- `q`
- `category`
- `barcode`
- `includeOutOfStock`

Example:

```http
GET /api/pos/products/search?q=milk&category=Dairy&includeOutOfStock=false
```

#### Complete POS checkout

`POST /api/pos/checkout`

Example request:

```json
{
  "items": [
    { "productId": 1, "quantity": 2 },
    { "productId": 5, "quantity": 1 }
  ],
  "paymentMethod": "Cash",
  "amountTendered": 50.00,
  "simulateCardApproval": true
}
```

Example response fields:

- `orderId`
- `receiptNumber`
- `transactionDateUtc`
- `cashierName`
- `paymentMethod`
- `subtotal`
- `total`
- `amountTendered`
- `changeGiven`
- `items`

#### Get POS receipt

`GET /api/pos/receipts/{orderId}`

#### Get recent cashier transactions

`GET /api/pos/transactions/recent?limit=10`

### Admin Reports

All report endpoints remain Admin-only.

Shared filter query params:

- `startDate`
- `endDate`
- `category`
- `paymentMethod`
- `customer`

Additional params:

- `daily-sales`: optional `date`
- `monthly-revenue`: optional `year`, `month`
- `top-products`: `topN`, `sortBy`

#### Daily sales

`GET /api/admin/reports/daily-sales`

#### Monthly revenue

`GET /api/admin/reports/monthly-revenue`

#### Top-selling products

`GET /api/admin/reports/top-products`

#### Order summary

`GET /api/admin/reports/order-summary`

### CSV Export Endpoints

- `GET /api/admin/reports/daily-sales/export`
- `GET /api/admin/reports/monthly-revenue/export`
- `GET /api/admin/reports/top-products/export`
- `GET /api/admin/reports/order-summary/export`

Each export returns a CSV download with the active filters applied.

## Suggested Demo Flow

1. Log in as `Cashier`
2. Search products and complete one cash sale
3. Open the digital receipt and print it
4. Start a new transaction and show a separate billing session
5. Log in as `Admin`
6. Open reports, apply date/category/payment filters
7. Export one report as CSV

## Role Checks

- `Cashier`: `/cashier/pos`, POS APIs
- `Admin`: reports, staff, admin product/report routes
- `InventoryManager`: inventory routes, order ops
- `Customer`: shop, cart, checkout, orders

Cashier access to customer cart/checkout/order routes is intentionally blocked in Sprint 4.
