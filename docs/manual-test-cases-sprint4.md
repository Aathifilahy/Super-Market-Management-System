# Manual QA Test Cases - Sprint 4
## Online Supermarket Management System

| Field | Details |
|---|---|
| Version | 1.0 |
| Sprint | Sprint 4 |
| Prepared by | QA Engineer |
| Date | 2026-04-22 |
| Status | Draft |

---

## Status and Priority Convention

- Priority: P0 (Critical), P1 (High), P2 (Medium)
- Status: Leave blank during planning; fill during execution

---

## A) Cashier POS System (Search, Cart, Payment, Receipt)

| ID | Module | Case Type | Steps | Expected Result | Actual Result | Status | Priority |
|---|---|---|---|---|---|---|---|
| POS-SRCH-001 | Cashier POS - Search | Positive | 1. Login as Cashier. 2. Open POS page. 3. Leave search empty. 4. Click Search Now. | Product list loads with available products and summary cards update. |  |  | P0 |
| POS-SRCH-002 | Cashier POS - Search | Positive | 1. Search by product name keyword (for example milk). 2. Submit search. | Matching products are listed. Non-matching products are hidden. |  |  | P0 |
| POS-SRCH-003 | Cashier POS - Search | Positive | 1. Select a category from Category filter. 2. Execute search. | Only products in selected category are shown. |  |  | P1 |
| POS-SRCH-004 | Cashier POS - Search | Positive | 1. Enter simulated barcode in Barcode field. 2. Search. | Only matching barcode product is returned. |  |  | P0 |
| POS-SRCH-005 | Cashier POS - Search | Negative | 1. Enter invalid barcode string. 2. Search. | No results shown with friendly no matching products message; no crash. |  |  | P1 |
| POS-SRCH-006 | Cashier POS - Search | Validation | 1. Enter mixed whitespace in search fields. 2. Execute search. | Search trims values and behaves consistently without error. |  |  | P2 |
| POS-SRCH-007 | Cashier POS - Search | Edge | 1. Enable Show out-of-stock items. 2. Search broad query. | Out-of-stock and expired items are visible with proper badges. |  |  | P1 |
| POS-SRCH-008 | Cashier POS - Search | Negative | 1. Disable Show out-of-stock items. 2. Search broad query. | Out-of-stock products are excluded from results. |  |  | P1 |
| POS-CART-001 | Cashier POS - Cart | Positive | 1. Search a sellable product. 2. Click Add to current sale. | Product is added to active cart with quantity 1. |  |  | P0 |
| POS-CART-002 | Cashier POS - Cart | Positive | 1. Add same product again. | Quantity increases and does not exceed available stock. |  |  | P0 |
| POS-CART-003 | Cashier POS - Cart | Validation | 1. In cart, use plus button until stock limit is reached. | Plus button disables at stock cap; quantity does not exceed stock. |  |  | P0 |
| POS-CART-004 | Cashier POS - Cart | Validation | 1. Decrease quantity using minus button to zero. | Item is removed automatically when quantity reaches zero. |  |  | P1 |
| POS-CART-005 | Cashier POS - Cart | Negative | 1. Try adding expired product. | Add button is unavailable or action is blocked; product not added. |  |  | P0 |
| POS-CART-006 | Cashier POS - Cart | Negative | 1. Try adding out-of-stock product. | Add button is unavailable or action is blocked; product not added. |  |  | P0 |
| POS-CART-007 | Cashier POS - Cart | Edge | 1. Add multiple different products. 2. Verify subtotal and total. | Total equals sum of all line totals with correct currency format. |  |  | P1 |
| POS-PAY-001 | Cashier POS - Payment | Positive | 1. Add products to cart. 2. Click Take Payment. 3. Choose Cash. 4. Enter exact tendered amount. 5. Complete sale. | Sale succeeds; receipt generated; cart cleared for active session. |  |  | P0 |
| POS-PAY-002 | Cashier POS - Payment | Positive | 1. Repeat payment with Cash and tendered amount greater than total. | Sale succeeds and Change due is correctly displayed in payment dialog and receipt. |  |  | P0 |
| POS-PAY-003 | Cashier POS - Payment | Validation | 1. Choose Cash. 2. Enter amount lower than total. | Complete Sale button is disabled and warning shows insufficient cash needed. |  |  | P0 |
| POS-PAY-004 | Cashier POS - Payment | Positive | 1. Choose Card. 2. Keep Simulate card approval enabled. 3. Complete sale. | Card payment succeeds and receipt shows paid status. |  |  | P0 |
| POS-PAY-005 | Cashier POS - Payment | Negative | 1. Choose Card. 2. Disable Simulate card approval. 3. Complete sale. | Controlled decline error shown; sale not completed; cart remains intact. |  |  | P0 |
| POS-PAY-006 | Cashier POS - Payment | Negative | 1. Open payment dialog. 2. Click Cancel. | Dialog closes without processing transaction and cart remains unchanged. |  |  | P1 |
| POS-PAY-007 | Cashier POS - Payment | Edge | 1. Open payment dialog. 2. While processing, attempt repeated Complete Sale clicks. | Only one transaction is processed; duplicate charge/order is prevented. |  |  | P0 |
| POS-RCP-001 | Cashier POS - Receipt | Positive | 1. Complete successful sale. 2. Observe Digital Receipt dialog. | Receipt displays receipt number, date/time, cashier, items, totals, and payment method. |  |  | P0 |
| POS-RCP-002 | Cashier POS - Receipt | Positive | 1. In receipt dialog, click Print. | Print window opens with receipt-friendly layout and correct receipt data. |  |  | P1 |
| POS-RCP-003 | Cashier POS - Receipt | Positive | 1. Close receipt dialog. 2. Open Recent Transactions. 3. Click View Receipt on latest order. | Receipt for selected transaction loads successfully. |  |  | P0 |
| POS-RCP-004 | Cashier POS - Receipt | Negative | 1. Attempt to open receipt with invalid/non-existent order id through API or UI history mismatch. | Not found or permission-safe error displayed; no crash. |  |  | P1 |
| POS-RCP-005 | Cashier POS - Receipt | Edge | 1. Complete a cash sale and a card sale. 2. Compare receipts. | Cash receipt includes tendered/change; card receipt includes card details when available. |  |  | P1 |
| POS-RCP-006 | Cashier POS - Receipt | Validation | 1. Open Recent Transactions with no completed transactions. | Informational empty state message shown. |  |  | P2 |

---

## B) Multiple Billing Sessions

| ID | Module | Case Type | Steps | Expected Result | Actual Result | Status | Priority |
|---|---|---|---|---|---|---|---|
| BILL-SES-001 | Multiple Billing Sessions | Positive | 1. Login as Cashier. 2. Open POS page. | Default session Sale 1 exists and is active. |  |  | P0 |
| BILL-SES-002 | Multiple Billing Sessions | Positive | 1. Click Add Session. | New session tab is created and becomes active. |  |  | P0 |
| BILL-SES-003 | Multiple Billing Sessions | Positive | 1. Create up to 4 sessions using Add Session. | Up to 4 sessions are supported and visible as tabs. |  |  | P0 |
| BILL-SES-004 | Multiple Billing Sessions | Validation | 1. After 4 sessions exist, click Add Session again. | User sees message that max session limit is reached; no 5th session created. |  |  | P0 |
| BILL-SES-005 | Multiple Billing Sessions | Positive | 1. Add items to Sale 1. 2. Switch to Sale 2. 3. Add different items. 4. Switch back. | Each session maintains isolated cart state and quantities. |  |  | P0 |
| BILL-SES-006 | Multiple Billing Sessions | Positive | 1. In active session with items, click New Transaction. | Only active session cart is cleared; other session carts remain unchanged. |  |  | P0 |
| BILL-SES-007 | Multiple Billing Sessions | Positive | 1. Complete checkout in active session. | Completed session cart resets and can be reused for next customer. |  |  | P0 |
| BILL-SES-008 | Multiple Billing Sessions | Edge | 1. Keep one session empty and one with items. 2. Switch repeatedly. | Totals and item counts update correctly per active tab without stale data. |  |  | P1 |
| BILL-SES-009 | Multiple Billing Sessions | Negative | 1. Try Take Payment on empty active session. | Payment action is disabled or blocked until cart has items. |  |  | P1 |
| BILL-SES-010 | Multiple Billing Sessions | Edge | 1. Perform search refresh after products changed. 2. Check session carts. | Existing session items synchronize stock safely and invalid quantities are corrected. |  |  | P1 |

---

## C) Admin Reports (Filters + Export)

| ID | Module | Case Type | Steps | Expected Result | Actual Result | Status | Priority |
|---|---|---|---|---|---|---|---|
| RPT-FLT-001 | Admin Reports - Filters | Positive | 1. Login as Admin. 2. Open Reports page. 3. Load default Daily Sales report. | Daily sales report loads with valid totals and top products section. |  |  | P0 |
| RPT-FLT-002 | Admin Reports - Filters | Positive | 1. Apply date range start and end. 2. Refresh report. | Results reflect selected date range only. |  |  | P0 |
| RPT-FLT-003 | Admin Reports - Filters | Validation | 1. Set start date later than end date. 2. Apply filters. | Validation message appears and query is rejected safely. |  |  | P0 |
| RPT-FLT-004 | Admin Reports - Filters | Positive | 1. Apply Category filter with known category. | Report values change consistently to match filtered category data. |  |  | P1 |
| RPT-FLT-005 | Admin Reports - Filters | Positive | 1. Apply Payment Method filter as Cash then Card. | Results update correctly per payment method selection. |  |  | P1 |
| RPT-FLT-006 | Admin Reports - Filters | Positive | 1. Apply Customer filter by partial name/email. | Report only includes matching customer orders. |  |  | P1 |
| RPT-FLT-007 | Admin Reports - Filters | Edge | 1. Select a range with no paid orders. | Report displays zero values and safe empty state without failure. |  |  | P1 |
| RPT-FLT-008 | Admin Reports - Filters | Validation | 1. Open Top Products report. 2. Set topN to 1 then 100. | Limits are accepted and report returns correct number of records. |  |  | P1 |
| RPT-FLT-009 | Admin Reports - Filters | Negative | 1. Set topN to 0 or value above 100 via query or UI override. | API rejects request with clear validation error. |  |  | P0 |
| RPT-FLT-010 | Admin Reports - Filters | Positive | 1. Toggle Top Products sortBy quantity/revenue. | Ranking order changes according to selected sort field. |  |  | P1 |
| RPT-FLT-011 | Admin Reports - Filters | Positive | 1. Open Monthly Revenue with year/month input. | Monthly total and daily breakdown are displayed correctly. |  |  | P0 |
| RPT-FLT-012 | Admin Reports - Filters | Positive | 1. Open Order Summary report with filters. | Status counts and totals per status render correctly. |  |  | P1 |
| RPT-EXP-001 | Admin Reports - Export | Positive | 1. Open Daily Sales report with filters. 2. Click Export CSV. | CSV file downloads successfully with expected filename pattern. |  |  | P0 |
| RPT-EXP-002 | Admin Reports - Export | Positive | 1. Export Monthly Revenue CSV with custom range. | Downloaded CSV contains selected range data and headers. |  |  | P0 |
| RPT-EXP-003 | Admin Reports - Export | Positive | 1. Export Top Products CSV with topN and sortBy settings. | CSV order matches on-screen sorted report data. |  |  | P1 |
| RPT-EXP-004 | Admin Reports - Export | Positive | 1. Export Order Summary CSV with filters. | CSV contains status, count, and total value columns and filtered values. |  |  | P1 |
| RPT-EXP-005 | Admin Reports - Validation | 1. Open downloaded CSV files in spreadsheet editor. | CSV format is valid UTF-8 text and values are parseable. |  |  | P1 |
| RPT-EXP-006 | Admin Reports - Negative | 1. Trigger export with invalid date range parameters. | Export call fails gracefully with readable error message. |  |  | P1 |
| RPT-EXP-007 | Admin Reports - Edge | 1. Export report with no matching data. | CSV still downloads with headers and zero-row or summary-safe content. |  |  | P2 |
| RPT-EXP-008 | Admin Reports - Security | 1. Attempt export endpoint using non-admin token. | Request is blocked with 403/401 and no file is returned. |  |  | P0 |
| RPT-SEC-001 | Admin Reports - Security | Negative | 1. Login as Cashier or InventoryManager. 2. Try direct admin reports route. | Access is denied or redirected; reports not visible. |  |  | P0 |
| RPT-SEC-002 | Admin Reports - Security | Negative | 1. Call admin report API without token. | Unauthorized response returned and no sensitive data exposed. |  |  | P0 |

---

## D) Admin Staff Page (List + Appoint + Profile Navigation)

| ID | Module | Case Type | Steps | Expected Result | Actual Result | Status | Priority |
|---|---|---|---|---|---|---|---|
| ADM-STF-001 | Admin Staff Page - List | Positive | 1. Login as Admin. 2. Open staff page. | Staff list loads successfully with expected columns/details. |  |  | P0 |
| ADM-STF-002 | Admin Staff Page - List | Positive | 1. Verify staff roles in list. | Existing Admin, InventoryManager, and Cashier staff are visible as expected. |  |  | P1 |
| ADM-STF-003 | Admin Staff Page - List | Edge | 1. Open page when no staff records are available (or filtered out). | Empty state message shown without UI errors. |  |  | P2 |
| ADM-STF-004 | Admin Staff Page - Profile Navigation | Positive | 1. Click a staff user from list. | Navigation opens profile/details page for selected staff user. |  |  | P0 |
| ADM-STF-005 | Admin Staff Page - Profile Navigation | Positive | 1. From profile/details, navigate back to staff page. | Return navigation works and list remains accessible. |  |  | P2 |
| ADM-STF-006 | Admin Staff Page - Appoint | Positive | 1. Click appoint/create staff. 2. Enter valid data. 3. Submit. | Staff account is created successfully and appears in staff list. |  |  | P0 |
| ADM-STF-007 | Admin Staff Page - Appoint | Validation | 1. Submit appoint form with required fields empty. | Validation messages shown; submission blocked. |  |  | P0 |
| ADM-STF-008 | Admin Staff Page - Appoint | Validation | 1. Enter invalid email format in appoint form. 2. Submit. | Validation error shown for email format. |  |  | P1 |
| ADM-STF-009 | Admin Staff Page - Appoint | Validation | 1. Enter weak or invalid password format if rule exists. 2. Submit. | Password rule message shown and user is not created. |  |  | P1 |
| ADM-STF-010 | Admin Staff Page - Appoint | Negative | 1. Create staff with duplicate email that already exists. | Duplicate error shown and no duplicate account is created. |  |  | P0 |
| ADM-STF-011 | Admin Staff Page - Appoint | Edge | 1. Create staff with each supported role one by one. | Each created user has correct role assignment in list/profile. |  |  | P1 |
| ADM-STF-012 | Admin Staff Page - Security | Negative | 1. Login as non-admin role. 2. Access staff list route directly. | Access denied or redirected; page content is protected. |  |  | P0 |

---

## End Summary

### Total Number of Test Cases

- Total test cases: 72

### Coverage Per Module

| Module | Count |
|---|---:|
| Cashier POS system (search, cart, payment, receipt) | 28 |
| Multiple billing sessions | 10 |
| Admin reports (filters + export) | 22 |
| Admin staff page (list + appoint + profile navigation) | 12 |
| Total | 72 |

### What We Are Ready to Test in the System

- End-to-end cashier sales flow from product search to receipt generation and print.
- Multi-customer handling through concurrent billing sessions and session isolation rules.
- Admin analytics reliability using advanced filters across daily, monthly, top products, and order summary reports.
- CSV export correctness and security controls for admin-only report downloads.
- Admin staff operations including list visibility, staff appointment validation, and profile navigation behavior.
- Critical role-based access controls for protected Sprint 4 pages and APIs.
