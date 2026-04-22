# Sprint 4 Traceability Matrix
## Online Supermarket Management System

| Feature ID | Sprint 4 Feature | Business Goal | Components Covered | Test Coverage | Status |
|---|---|---|---|---|---|
| S4-F01 | POS product search | Cashier can find products quickly | Frontend POS search UI, `GET /api/pos/products/search` | POS-SEARCH-01..12 | Planned |
| S4-F02 | POS cart operations | Cashier can build and adjust bill items safely | Frontend cart panel and quantity controls | POS-CART-01..10 | Planned |
| S4-F03 | POS checkout (cash/card) | Complete in-store payment reliably | `POST /api/pos/checkout`, POS payment dialog | POS-CHECKOUT-01..14 | Planned |
| S4-F04 | POS receipt and history | Provide transaction proof and retrieval | `GET /api/pos/receipts/{orderId}`, `GET /api/pos/transactions/recent` | POS-RECEIPT-01..08 | Planned |
| S4-F05 | Multiple billing sessions | Support concurrent customer queues | Session tabs, add/new-transaction logic | POS-SESSION-01..09 | Planned |
| S4-F06 | Advanced report filters | Improve admin reporting accuracy | `daily-sales`, `monthly-revenue`, `top-products`, `order-summary` | RPT-FILTER-01..20 | Planned |
| S4-F07 | Report export | Allow offline/shareable analytics | `/export` endpoints + frontend export actions | RPT-EXPORT-01..12 | Planned |
| S4-F08 | RBAC restrictions | Protect role-specific functions | Protected routes + API authorization attributes | AUTHZ-S4-01..16 | Planned |
| S4-F09 | Regression stability | Keep previous sprints stable | Customer/Admin/Inventory/Supplier baseline flows | REG-SMOKE-S4-01..30 | Planned |

## Coverage Rules

- Every feature ID must map to at least one API or UI test case set.
- Critical user journeys (`S4-F01` to `S4-F08`) require both positive and negative-path coverage.
- Any failed critical-path case blocks exit criteria until fixed and retested.

## Execution Notes

- Update `Status` from `Planned` -> `In Progress` -> `Completed` during execution.
- Link defects to feature IDs for impact visibility in closure reporting.
- Regressions found during Sprint 4 should be tagged against `S4-F09` and original feature owner.