# Manual QA Test Cases – Sprint 3
## Online Supermarket Management System

| Field | Details |
|---|---|
| Version | 1.0 |
| Sprint | Sprint 3 |
| Prepared by | QA Engineer |
| Date | 2026-04-07 |
| Frontend URL | http://localhost:3000 (or next free port) |
| Backend URL | http://localhost:5224/api |
| Database | MySQL (local) |
| Status | Draft |

---

## Summary (Test Case Count by Module)

| Module | Count |
|---|---:|
| Supplier Management | 14 |
| Inventory / Stock Purchase | 16 |
| Low-Stock Alerts | 10 |
| Admin Reports | 15 |
| Admin Staff Page Enhancement | 10 |
| Role-based Access & Routing | 12 |
| Regression Checks | 12 |
| **Total** | **89** |

---

## Conventions

### Status values
- Not Run
- Pass
- Fail
- Blocked

### Priority
- P0 = Must test (core Sprint 3 acceptance)
- P1 = High
- P2 = Medium

### Severity (if failed)
- S1 = Critical (blocks core use / data integrity / security)
- S2 = Major (core feature broken, workaround may exist)
- S3 = Minor (cosmetic/low impact)

### Common Preconditions (reuse across cases)
- Backend is running and reachable at `http://localhost:5224/swagger`.
- Frontend is running and reachable at `http://localhost:3000`.
- Database schema is up to date (EF migrations applied).
- Test accounts exist:
  - Admin
  - Inventory Manager
  - Staff/Cashier (if applicable)
  - Customer
- Test data exists:
  - Products (including at least 2 low-stock products)
  - Suppliers
  - Stock purchase history (if applicable)
  - Orders (for Reports)

---

## 1) Supplier Management

| Test Case ID | Module | Title | Preconditions | Test Steps | Expected Result | Actual Result | Status | Priority | Severity if failed |
|---|---|---|---|---|---|---|---|---|---|
| SUP-ADD-001 | Supplier Management | Add supplier (valid data) | Logged in as Inventory Manager (or Admin) | 1. Navigate to Suppliers page<br>2. Click Add Supplier<br>3. Enter valid supplier details<br>4. Save | Supplier is created; success feedback shown; supplier appears in list after refresh |  | Not Run | P0 | S2 |
| SUP-ADD-002 | Supplier Management | Add supplier (required field validation) | Logged in as Inventory Manager (or Admin) | 1. Open Add Supplier form<br>2. Leave required fields empty<br>3. Click Save | Validation shown; request blocked or API returns 400; no supplier created |  | Not Run | P0 | S2 |
| SUP-ADD-003 | Supplier Management | Add supplier (duplicate identifier/email if constrained) | Logged in as Inventory Manager (or Admin); supplier with same unique field exists | 1. Add supplier using same unique value (e.g., email/name) | Error shown (friendly); duplicate not created |  | Not Run | P1 | S2 |
| SUP-LIST-001 | Supplier Management | Supplier list loads (happy path) | Logged in as Inventory Manager (or Admin); at least 1 supplier exists | 1. Navigate to Suppliers page | Supplier list renders with expected fields; no console errors |  | Not Run | P0 | S2 |
| SUP-LIST-002 | Supplier Management | Supplier list empty state | Logged in as Inventory Manager (or Admin); no suppliers in DB | 1. Navigate to Suppliers page | Empty state message shown; no crash |  | Not Run | P1 | S3 |
| SUP-SRCH-001 | Supplier Management | Search suppliers (exact match) | Logged in; suppliers exist | 1. Search by full supplier name | Matching supplier(s) shown; non-matching hidden |  | Not Run | P1 | S3 |
| SUP-SRCH-002 | Supplier Management | Search suppliers (partial/case-insensitive) | Logged in; suppliers exist | 1. Search using partial text and different casing | Search behaves consistently (either case-insensitive or documented behavior); results correct |  | Not Run | P2 | S3 |
| SUP-SRCH-003 | Supplier Management | Search suppliers (no results) | Logged in | 1. Search for random value | “No results” state shown; no errors |  | Not Run | P2 | S3 |
| SUP-EDIT-001 | Supplier Management | Edit supplier (valid update) | Logged in; supplier exists | 1. Open supplier row/details<br>2. Click Edit<br>3. Change phone/address<br>4. Save | Update persists; list reflects new values after refresh |  | Not Run | P0 | S2 |
| SUP-EDIT-002 | Supplier Management | Edit supplier (cancel/no save) | Logged in; supplier exists | 1. Edit supplier<br>2. Change fields<br>3. Click Cancel/back | No update is persisted; old values remain |  | Not Run | P2 | S3 |
| SUP-DEL-001 | Supplier Management | Delete supplier safely (confirm dialog) | Logged in; supplier exists | 1. Click Delete on supplier<br>2. Confirm action | Supplier is deleted/disabled as designed; removed from list; no orphan errors |  | Not Run | P0 | S2 |
| SUP-DEL-002 | Supplier Management | Delete supplier (cancel dialog) | Logged in; supplier exists | 1. Click Delete<br>2. Cancel | Supplier remains unchanged |  | Not Run | P2 | S3 |
| SUP-AUTH-001 | Supplier Management | Customer blocked from Suppliers page | Logged in as Customer | 1. Navigate directly to Suppliers route URL | Access denied or redirect to login/unauthorized page; no supplier data visible |  | Not Run | P0 | S1 |
| SUP-API-001 | Supplier Management | Unauthorized API access blocked | Not logged in | 1. Call supplier list endpoint via browser/Postman | API returns 401/403 (not 200); no sensitive data returned |  | Not Run | P0 | S1 |

---

## 2) Inventory / Stock Purchase

| Test Case ID | Module | Title | Preconditions | Test Steps | Expected Result | Actual Result | Status | Priority | Severity if failed |
|---|---|---|---|---|---|---|---|---|---|
| INV-DASH-001 | Inventory / Stock Purchase | Inventory dashboard loads | Logged in as Inventory Manager (or Admin) | 1. Navigate to Inventory area | Dashboard loads successfully; key sections visible; no console errors |  | Not Run | P0 | S2 |
| INV-LIST-001 | Inventory / Stock Purchase | Inventory list shows products and quantities | Logged in; products exist | 1. Open inventory list page | Products displayed with correct quantity values |  | Not Run | P0 | S2 |
| INV-LIST-002 | Inventory / Stock Purchase | Inventory list empty state | Logged in; no products in DB | 1. Open inventory list | Empty state shown; no crash |  | Not Run | P2 | S3 |
| PUR-REC-001 | Inventory / Stock Purchase | Record stock purchase (valid) | Logged in; supplier exists; product exists | 1. Navigate to Stock Purchases<br>2. Click Record Purchase<br>3. Select supplier and product<br>4. Enter quantity and purchase price<br>5. Save | Purchase recorded; success feedback; inventory quantity increases accordingly |  | Not Run | P0 | S1 |
| PUR-REC-002 | Inventory / Stock Purchase | Purchase quantity validation (zero/negative) | Logged in | 1. Attempt purchase with quantity 0<br>2. Attempt purchase with quantity -1 | Validation prevents save or API rejects; no inventory update occurs |  | Not Run | P0 | S1 |
| PUR-REC-003 | Inventory / Stock Purchase | Purchase price validation (zero/negative) | Logged in | 1. Attempt purchase price 0<br>2. Attempt negative price | Validation prevents save or API rejects; no purchase recorded |  | Not Run | P1 | S2 |
| PUR-REC-004 | Inventory / Stock Purchase | Purchase with very large quantity (boundary) | Logged in; product exists | 1. Record purchase with large quantity (e.g., 100000) within allowed bounds | Either accepted and inventory updates correctly, or rejected with clear validation (no overflow/crash) |  | Not Run | P2 | S2 |
| PUR-REC-005 | Inventory / Stock Purchase | Purchase with invalid supplier/product | Logged in | 1. Attempt save with missing selection (if UI allows)<br>2. Attempt invalid IDs (API) | UI blocks or API returns 400/404; no changes persisted |  | Not Run | P1 | S2 |
| PUR-UPD-001 | Inventory / Stock Purchase | Inventory updates after purchase (UI refresh) | A purchase recorded for product X | 1. View product X quantity before purchase<br>2. Record purchase +Q<br>3. Refresh inventory/product list | Quantity increases by exactly Q |  | Not Run | P0 | S1 |
| PUR-HIST-001 | Inventory / Stock Purchase | Purchase history visible (if feature exists) | Logged in; purchases exist | 1. Open Purchase History/Stock Purchases list | New purchase appears with correct supplier/product/qty/price/date |  | Not Run | P1 | S2 |
| PUR-HIST-002 | Inventory / Stock Purchase | Purchase history empty state | Logged in; no purchases exist | 1. Open purchase history | Empty state shown; no crash |  | Not Run | P2 | S3 |
| INV-AUTH-001 | Inventory / Stock Purchase | Customer blocked from Inventory routes | Logged in as Customer | 1. Directly navigate to inventory URL(s) | Access denied/redirect; no data shown |  | Not Run | P0 | S1 |
| INV-AUTH-002 | Inventory / Stock Purchase | Staff without inventory role blocked (if applicable) | Logged in as Cashier/Staff | 1. Navigate to inventory URL(s) | Access denied/redirect according to spec |  | Not Run | P0 | S1 |
| PUR-API-001 | Inventory / Stock Purchase | Unauthorized purchase API call blocked | Not logged in | 1. Call stock purchase create endpoint | 401/403 returned; no inventory changed |  | Not Run | P0 | S1 |
| PUR-API-002 | Inventory / Stock Purchase | Purchase API rejects invalid payload | Logged in as Inventory Manager | 1. POST with missing required fields<br>2. POST with negative qty/price | 400 with validation message; no DB changes |  | Not Run | P1 | S2 |
| PUR-INT-001 | Inventory / Stock Purchase | Atomicity: purchase recorded and inventory updated together | Logged in; induce failure if possible (e.g., invalid column/DB) | 1. Attempt purchase when DB fails (simulate by stopping DB) | Operation fails cleanly; no partial update (no purchase record without inventory update) |  | Not Run | P1 | S1 |

---

## 3) Low-Stock Alerts

| Test Case ID | Module | Title | Preconditions | Test Steps | Expected Result | Actual Result | Status | Priority | Severity if failed |
|---|---|---|---|---|---|---|---|---|---|
| LOW-DET-001 | Low-Stock Alerts | Low-stock page shows items below threshold | Logged in as Inventory Manager (or Admin); low-stock products exist | 1. Navigate to Low Stock page | Only products meeting low-stock criteria are listed |  | Not Run | P0 | S2 |
| LOW-DET-002 | Low-Stock Alerts | Boundary: quantity equals threshold | Product exists with quantity == threshold | 1. Open Low Stock page | Behavior matches requirements (either included or excluded) and is consistent across UI/API |  | Not Run | P1 | S2 |
| LOW-DET-003 | Low-Stock Alerts | No low-stock products → empty state | Logged in; no low-stock products exist | 1. Open Low Stock page | Empty state shown; no errors |  | Not Run | P2 | S3 |
| LOW-VIS-001 | Low-Stock Alerts | Low-stock visible in inventory list/cards (if present) | Logged in; low-stock product exists | 1. View inventory/products list | Low-stock indicator/badge appears as designed |  | Not Run | P1 | S3 |
| LOW-UPD-001 | Low-Stock Alerts | Alert clears after replenishment | Low-stock product exists | 1. Confirm product appears in low-stock list<br>2. Record stock purchase to increase quantity above threshold<br>3. Refresh low-stock page | Product no longer appears in low-stock list after update |  | Not Run | P0 | S2 |
| LOW-UPD-002 | Low-Stock Alerts | Alert appears after reducing stock (if stock reduction exists) | Feature exists that reduces quantity (e.g., orders decrease stock) | 1. Reduce stock below threshold<br>2. Open low-stock page | Product appears in low-stock list |  | Not Run | P2 | S3 |
| LOW-AUTH-001 | Low-Stock Alerts | Customer blocked from low-stock view (if restricted) | Logged in as Customer | 1. Navigate to low-stock URL | Access denied/redirect if intended restricted feature |  | Not Run | P0 | S1 |
| LOW-AUTH-002 | Low-Stock Alerts | Direct URL attempt while logged out handled | Not logged in | 1. Navigate directly to low-stock URL | Redirect to login; no data rendered |  | Not Run | P0 | S1 |
| LOW-API-001 | Low-Stock Alerts | Low-stock API returns correct list | Logged in as permitted role | 1. Call low-stock endpoint (if exists) | Response includes correct products; schema correct |  | Not Run | P1 | S2 |
| LOW-API-002 | Low-Stock Alerts | Low-stock API blocked for unauthorized roles | Logged in as Customer | 1. Call low-stock endpoint | 403/401 returned; no data leaked |  | Not Run | P0 | S1 |

---

## 4) Admin Reports

| Test Case ID | Module | Title | Preconditions | Test Steps | Expected Result | Actual Result | Status | Priority | Severity if failed |
|---|---|---|---|---|---|---|---|---|---|
| REP-ACC-001 | Admin Reports | Admin can access Reports page | Logged in as Admin | 1. Navigate to Admin Reports route | Reports page loads successfully |  | Not Run | P0 | S1 |
| REP-ACC-002 | Admin Reports | Inventory Manager blocked from Reports | Logged in as Inventory Manager | 1. Navigate to Admin Reports route | Access denied/redirect |  | Not Run | P0 | S1 |
| REP-ACC-003 | Admin Reports | Customer blocked from Reports | Logged in as Customer | 1. Navigate to Admin Reports route | Access denied/redirect |  | Not Run | P0 | S1 |
| REP-DAY-001 | Admin Reports | Daily sales report returns data | Logged in as Admin; orders exist for today | 1. Open Daily Sales report<br>2. Select today (if filter exists) | Totals match known orders; no errors |  | Not Run | P0 | S2 |
| REP-DAY-002 | Admin Reports | Daily sales no-data behavior | Logged in as Admin; no orders for selected date | 1. Select a date with no orders | “No data” state shown; totals are 0; no crash |  | Not Run | P1 | S3 |
| REP-MON-001 | Admin Reports | Monthly revenue report (happy path) | Logged in as Admin; orders exist across month | 1. Open Monthly Revenue report<br>2. Select month | Revenue total matches expected aggregation |  | Not Run | P0 | S2 |
| REP-MON-002 | Admin Reports | Monthly revenue invalid range/edge | Logged in as Admin | 1. Select future month with no orders | “No data” state; no errors |  | Not Run | P2 | S3 |
| REP-TOP-001 | Admin Reports | Top-selling products report (happy path) | Logged in as Admin; order items exist | 1. Open Top-selling Products report | Ranking and quantities make sense vs seeded orders |  | Not Run | P0 | S2 |
| REP-TOP-002 | Admin Reports | Top-selling empty state | Logged in as Admin; no order items exist | 1. Open report | Empty state; no crash |  | Not Run | P2 | S3 |
| REP-STAT-001 | Admin Reports | Order summary by status (happy path) | Logged in as Admin; multiple statuses exist | 1. Open Order Summary by Status | Counts per status equal DB reality |  | Not Run | P1 | S2 |
| REP-FLT-001 | Admin Reports | Filter behavior applies consistently | Logged in as Admin; filters exist | 1. Change filter values<br>2. Apply | Results update correctly; loading state shown if needed |  | Not Run | P1 | S2 |
| REP-FLT-002 | Admin Reports | Invalid filter values handled | Logged in as Admin | 1. Clear required filters or enter invalid range | Validation shown; no server error |  | Not Run | P2 | S2 |
| REP-API-001 | Admin Reports | Reports API unauthorized blocked | Not logged in | 1. Call reports endpoint via Postman | 401/403 returned |  | Not Run | P0 | S1 |
| REP-API-002 | Admin Reports | Reports API returns stable schema | Logged in as Admin | 1. Call each reports endpoint<br>2. Validate required fields exist | JSON shape stable; no unexpected nulls for required fields |  | Not Run | P1 | S2 |

---

## 5) Admin Staff Page Enhancement

| Test Case ID | Module | Title | Preconditions | Test Steps | Expected Result | Actual Result | Status | Priority | Severity if failed |
|---|---|---|---|---|---|---|---|---|---|
| STF-LIST-001 | Admin Staff Enhancement | Staff list visible to Admin | Logged in as Admin; staff accounts exist | 1. Open Admin Staff page | Staff list renders successfully |  | Not Run | P0 | S2 |
| STF-LIST-002 | Admin Staff Enhancement | Only staff shown (no customers) | Logged in as Admin; both staff and customers exist | 1. Open staff list | Customer accounts are excluded from staff list |  | Not Run | P0 | S2 |
| STF-CLICK-001 | Admin Staff Enhancement | Click staff redirects to existing Profile page | Logged in as Admin; staff exists | 1. Click a staff row/card | Redirects to Profile page for that user; details load correctly |  | Not Run | P0 | S2 |
| STF-CLICK-002 | Admin Staff Enhancement | Staff profile page access rules enforced | Logged in as Admin | 1. Navigate directly to staff profile URL (if direct route exists) | Access allowed for Admin; data shown correctly |  | Not Run | P1 | S2 |
| STF-APP-001 | Admin Staff Enhancement | Appoint new staff (valid) | Logged in as Admin | 1. In appoint staff section, enter valid details<br>2. Submit | Staff user created; appears in staff list; can login with assigned role |  | Not Run | P0 | S1 |
| STF-APP-002 | Admin Staff Enhancement | Appoint staff validation (missing required fields) | Logged in as Admin | 1. Submit appoint staff with missing fields | Validation shown; no user created |  | Not Run | P0 | S2 |
| STF-APP-003 | Admin Staff Enhancement | Appoint staff duplicate email rejected | Logged in as Admin; user exists with email | 1. Attempt appoint with same email | Error shown; no duplicate created |  | Not Run | P1 | S2 |
| STF-AUTH-001 | Admin Staff Enhancement | Inventory Manager blocked from Staff page | Logged in as Inventory Manager | 1. Navigate to Staff page | Access denied/redirect |  | Not Run | P0 | S1 |
| STF-AUTH-002 | Admin Staff Enhancement | Customer blocked from Staff page | Logged in as Customer | 1. Navigate to Staff page | Access denied/redirect |  | Not Run | P0 | S1 |
| STF-API-001 | Admin Staff Enhancement | Staff management API unauthorized blocked | Not logged in | 1. Call staff list/create endpoints | 401/403; no data leaked |  | Not Run | P0 | S1 |

---

## 6) Role-based Access and Routing

| Test Case ID | Module | Title | Preconditions | Test Steps | Expected Result | Actual Result | Status | Priority | Severity if failed |
|---|---|---|---|---|---|---|---|---|---|
| RBAC-ROUTE-001 | Access & Routing | Customer blocked from Admin routes | Logged in as Customer | 1. Attempt direct URL: Admin Reports<br>2. Attempt direct URL: Staff page | Redirect/denied; no admin content visible |  | Not Run | P0 | S1 |
| RBAC-ROUTE-002 | Access & Routing | Customer blocked from Inventory routes | Logged in as Customer | 1. Attempt direct URL: Inventory Dashboard<br>2. Attempt direct URL: Suppliers | Redirect/denied; no inventory content visible |  | Not Run | P0 | S1 |
| RBAC-ROUTE-003 | Access & Routing | Inventory Manager blocked from Admin routes | Logged in as Inventory Manager | 1. Attempt direct URL: Admin Reports<br>2. Attempt direct URL: Staff page | Redirect/denied |  | Not Run | P0 | S1 |
| RBAC-ROUTE-004 | Access & Routing | Admin allowed to access Admin routes | Logged in as Admin | 1. Open Admin Reports<br>2. Open Staff page | Access granted; pages load |  | Not Run | P0 | S1 |
| RBAC-ROUTE-005 | Access & Routing | Admin allowed to access Inventory routes | Logged in as Admin (if intended) | 1. Open Inventory pages | Access granted (or blocked if spec says Admin cannot) but consistent with requirements |  | Not Run | P1 | S2 |
| RBAC-ROUTE-006 | Access & Routing | Unauthorized user redirected to login | Not logged in | 1. Open protected URL directly | Redirect to login; after login, redirects back if designed |  | Not Run | P0 | S1 |
| RBAC-TOKEN-001 | Access & Routing | Expired/invalid token handled gracefully | Have expired token (or modify storage) | 1. Set invalid token in storage<br>2. Refresh protected page | User is logged out/redirected; no crash |  | Not Run | P1 | S2 |
| RBAC-API-001 | Access & Routing | API returns 401 when no token provided | Not logged in | 1. Call protected endpoint (reports/inventory/suppliers) | 401 returned; no data |  | Not Run | P0 | S1 |
| RBAC-API-002 | Access & Routing | API returns 403 for wrong role | Logged in as Customer | 1. Call admin endpoint with Customer token | 403 returned |  | Not Run | P0 | S1 |
| RBAC-API-003 | Access & Routing | Direct URL unauthorized shows friendly UX | Logged in as wrong role | 1. Navigate direct URL to protected page | Shows access denied message or redirects (no blank screen) |  | Not Run | P1 | S2 |
| RBAC-NAV-001 | Access & Routing | Nav menu hides unauthorized links | Logged in as Customer | 1. Inspect navigation menu | Admin/Inventory links hidden or disabled as designed |  | Not Run | P1 | S3 |
| RBAC-NAV-002 | Access & Routing | Nav menu shows correct links per role | Logged in as Admin and Inventory Manager | 1. Compare nav options per role | Correct links visible for each role |  | Not Run | P1 | S3 |

---

## 7) Regression Checks (Related Existing Features)

| Test Case ID | Module | Title | Preconditions | Test Steps | Expected Result | Actual Result | Status | Priority | Severity if failed |
|---|---|---|---|---|---|---|---|---|---|
| REG-AUTH-001 | Regression | Login success (existing) | User exists | 1. Login with valid credentials | Login succeeds; redirected appropriately |  | Not Run | P0 | S1 |
| REG-AUTH-002 | Regression | Login invalid password (existing) | User exists | 1. Login with wrong password | Error shown; no login |  | Not Run | P1 | S2 |
| REG-REDIR-001 | Regression | Role-based redirect after login | Users with different roles exist | 1. Login as Admin<br>2. Login as Inventory Manager<br>3. Login as Customer | Each role redirected to correct landing area |  | Not Run | P0 | S2 |
| REG-PROF-001 | Regression | View own profile works | Logged in | 1. Open Profile page | Profile loads; no server error |  | Not Run | P0 | S2 |
| REG-PROF-002 | Regression | Update profile persists | Logged in | 1. Update profile fields<br>2. Save<br>3. Refresh | Values persist |  | Not Run | P1 | S2 |
| REG-PROD-001 | Regression | Product list loads (customer/shop) | Backend running; products exist | 1. Navigate to product listing | Products load without 500 errors |  | Not Run | P0 | S1 |
| REG-PROD-002 | Regression | Create product (if permitted role) | Logged in as permitted role | 1. Add product via UI | Product created; appears in list |  | Not Run | P1 | S2 |
| REG-CART-001 | Regression | Add to cart still works | Logged in as Customer; product in stock | 1. Add product to cart<br>2. Open cart | Item appears; totals correct |  | Not Run | P1 | S2 |
| REG-ORD-001 | Regression | Place order still works | Logged in as Customer; cart has item | 1. Checkout flow | Order created; cart cleared |  | Not Run | P1 | S2 |
| REG-ORD-002 | Regression | Order history loads | Logged in; orders exist | 1. Open Orders page | Orders list loads; details accessible |  | Not Run | P2 | S2 |
| REG-ERR-001 | Regression | API error handling UX remains friendly | Stop backend temporarily | 1. Load a page that calls API | Friendly error shown; no infinite spinner |  | Not Run | P2 | S3 |
| REG-NAV-001 | Regression | Navigation to existing routes works | Logged in | 1. Use top nav to move between pages | No broken links; correct pages load |  | Not Run | P2 | S3 |

---

## Execution Notes (for submission)
- Record browser screenshots for failed UI cases.
- For API failures, capture request/response (status code + JSON body) and backend console stack trace.
- Re-run P0 tests after any bug fix touching auth, routing, inventory, suppliers, or reports.
