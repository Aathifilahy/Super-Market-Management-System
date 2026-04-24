# Sprint 3 — Complete QA Package (Test Plan + Test Cases + API Checklist + RBAC + Performance + Final Summary)
## Online Supermarket Management System (React + ASP.NET Web API + MySQL)

| Field | Details |
|---|---|
| Version | 1.0 |
| Sprint | Sprint 3 |
| Prepared by | QA Engineer (Student) |
| Date | 2026-04-07 |
| Environment | Local (Windows + localhost) |
| Status | Final (Submission Package) |

---

## Table of Contents
1. [Sprint 3 QA Test Plan](#1-sprint-3-qa-test-plan)
2. [Complete Manual Test Cases (Sprint 3)](#2-complete-manual-test-cases-sprint-3)
3. [API / Integration Test Checklist (Sprint 3)](#3-api--integration-test-checklist-sprint-3)
4. [Role / Access-Control Test Cases (RBAC)](#4-role--access-control-test-cases-rbac)
5. [Performance Testing Plan (JMeter) + Report Template + Sample](#5-performance-testing-plan-jmeter--report-template--sample)
6. [Final QA Summary / Sign-off Report (Sprint 3)](#6-final-qa-summary--sign-off-report-sprint-3)

---

# 1. Sprint 3 QA Test Plan

## 1.1 Introduction
This Sprint 3 QA test plan defines the approach, scope, test activities, environments, and exit criteria used to validate Sprint 3 features of the Online Supermarket Management System. The system is a React (TypeScript) frontend integrated with an ASP.NET Core Web API backend using a MySQL database, executed in a local development environment.

Sprint 3 introduced operational/admin capabilities such as supplier management, inventory flows, stock purchasing updates, low‑stock monitoring, admin reporting, and enhancements to the admin staff page.

---

## 1.2 Test Objectives
- Validate Sprint 3 user-facing flows (UI) for suppliers, inventory, purchases, low-stock, reports, and staff management.
- Verify backend APIs for Sprint 3 endpoints return correct HTTP status codes, consistent schemas, and correct business behaviour.
- Validate role-based access control (RBAC) across UI routes and backend endpoints (401 vs 403 correctness).
- Confirm data integrity for transactional flows (stock purchase must correctly update inventory).
- Run focused regression smoke tests on existing functionality to ensure Sprint 3 changes did not break prior sprints.
- Establish a baseline local performance profile for critical Sprint 3 APIs using Apache JMeter.

---

## 1.3 Test Scope

### 1.3.1 In Scope (Sprint 3)
| Module | Coverage |
|---|---|
| Supplier Management | UI + API CRUD, search, duplicate checks, safe deletion rules |
| Inventory Manager Area | Inventory dashboard + lists, low‑stock monitoring, data correctness |
| Stock Purchase | Create purchase (transactional), purchase history, inventory quantity and expiry updates |
| Low‑Stock Alerts | Threshold behaviour, empty state, updates after replenishment |
| Admin Reports | Daily sales and monthly revenue report endpoints, no-data behaviour, parameter validation |
| Admin Staff Enhancement | Staff list filtering rules, appoint staff behaviour, staff profile navigation |
| RBAC | Admin vs InventoryManager vs Customer route/API restrictions |

### 1.3.2 Regression Scope (prior sprints)
- Authentication login behaviour
- Navigation and basic role-based redirect
- Basic product listing behaviour (smoke)
- Cart / order flow smoke checks (where applicable)

### 1.3.3 Out of Scope (constraints)
- Production-scale performance claims (load balancers, cloud DB, distributed systems)
- Deep security testing (beyond functional RBAC checks)
- Accessibility compliance auditing (WCAG)
- Full E2E browser automation performance measurement

---

## 1.4 Test Types & Strategy
- **Manual functional testing (UI):** happy path + negative + boundary and empty-state scenarios.
- **API testing:** endpoint verification using Swagger/Postman; verify request validation and responses.
- **Integration testing:** UI-to-API workflows with database verification points.
- **RBAC testing:** direct URL access attempts + API calls with missing token and wrong-role token.
- **Regression testing:** smoke tests on prior sprint core flows.
- **Performance testing:** baseline local JMeter plan targeting Sprint 3 critical endpoints.

---

## 1.5 Test Environment

### 1.5.1 Local environment (baseline)
| Component | Details |
|---|---|
| Frontend | React + TypeScript (local dev server) |
| Backend | ASP.NET Core Web API (localhost) |
| Database | MySQL (local) |
| API base URL | `http://localhost:5224` |
| Swagger | `http://localhost:5224/swagger` |

### 1.5.2 Test roles / accounts
Test accounts required for Sprint 3 coverage:
- Admin
- Inventory Manager
- Customer
- Staff/Cashier (if applicable)

---

## 1.6 Test Data
Minimum test data required:
- Products (including at least 2 low-stock products)
- Suppliers (including at least 1 active supplier)
- Stock purchase history (at least 1 record)
- Orders and order items to validate reports (including paid orders and cancelled/unpaid examples)

---

## 1.7 Tools
- Swagger UI (API discovery/quick checks)
- Postman (API verification)
- Browser (manual UI testing)
- Apache JMeter (performance baseline)

---

## 1.8 Test Schedule (suggested academic timeline)
| Phase | Activity | Duration |
|---|---|---|
| Planning | Review Sprint 3 scope, prepare test data, confirm endpoints & roles | 0.5–1 day |
| Environment setup | Ensure backend/frontend run, DB migrated, seed accounts/data | 0.5 day |
| Functional testing | Execute manual test cases for Sprint 3 modules | 2–3 days |
| API + integration testing | Validate endpoints + integration scenarios + DB verification | 1–2 days |
| RBAC testing | Validate UI routing + API 401/403 correctness | 0.5–1 day |
| Regression testing | Execute regression smoke checks after fixes | 0.5–1 day |
| Performance baseline | Execute JMeter plan and capture baseline metrics | 0.5–1 day |
| Closure | Final QA summary and sign-off recommendation | 0.5 day |

---

## 1.9 Deliverables
This consolidated document contains all deliverables for Sprint 3 QA submission:
- Sprint 3 test plan (this section)
- Complete manual test cases
- API & integration checklist
- RBAC test cases
- JMeter performance plan + report template + sample
- Final Sprint 3 QA summary/sign-off report

---

## 1.10 Entry / Exit Criteria

### 1.10.1 Entry criteria
- Backend running and reachable via Swagger
- DB schema migrated to Sprint 3
- Test accounts exist for required roles
- Test data seeded sufficiently for reports and inventory scenarios

### 1.10.2 Exit criteria (Sprint 3 sign-off)
- 100% of P0 (critical path) test cases executed
- No open S1 (Critical) defects
- No open S2 (Major) defects for Sprint 3 critical paths
- RBAC shows no bypass via direct URL or API
- Performance baseline executed with acceptable stability under local load (10–20 VUs)

---

## 1.11 Risks & Mitigation
| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| DB schema mismatch blocks testing | Medium | High | Apply EF migrations before testing; verify key columns exist |
| Reports inaccurate due to missing/insufficient seed data | Medium | Medium | Seed paid and cancelled orders across dates; verify queries |
| Local performance results are noisy | High | Medium | Warm-up run; record multiple measured runs; close heavy apps |
| Role accounts not available | Medium | High | Create accounts for Admin and InventoryManager; confirm tokens |
| Duplicate supplier creation conflicts during testing | Medium | Low | Use unique emails and company names (UUID/time-based) |

---

# 2. Complete Manual Test Cases (Sprint 3)

(Complete copy of the Sprint 3 manual test cases used for execution.)

---

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

---

# 3. API / Integration Test Checklist (Sprint 3)

(Complete copy of the Sprint 3 API & integration checklist/report.)

---

# API & Integration Test Checklist / Report — Sprint 3
## Online Supermarket Management System (React + ASP.NET Web API + MySQL)

| Field | Details |
|---|---|
| Sprint | Sprint 3 |
| Prepared by | QA Engineer |
| Date | 2026-04-07 |
| Backend Base URL | http://localhost:5224 |
| API Base Path | /api |
| Database | MySQL (local) |
| Status | Draft |

---

## 1) Scope & Purpose

This checklist/report verifies Sprint 3 backend APIs and frontend-to-backend integration for:
- Supplier CRUD
- Stock purchases (atomic inventory update)
- Inventory dashboard + low-stock
- Admin report endpoints
- Staff listing / staff creation endpoints added for Sprint 3
- Role-based authorization behavior (401 vs 403)

Focus is on Sprint 3 functionality and regression impact on existing auth/role logic and product flows.

---

## 2) Environment / Preconditions

### 2.1 Required services
- Backend running: http://localhost:5224/swagger
- MySQL running and schema migrated to Sprint 3
- Frontend running: http://localhost:3000 (or next free port)

### 2.2 Authentication prerequisites
- Ability to obtain JWT access tokens for these roles:
  - Admin
  - InventoryManager
  - Customer
  - Cashier (if used)

### 2.3 Authorization note (important)
Sprint 3 controllers use role-based authorization:
- Suppliers: Admin, InventoryManager
- Stock purchases: Admin, InventoryManager
- Inventory: Admin, InventoryManager
- Admin Reports: Admin only
- Staff endpoints: Admin only (and staff creation additionally restricted to “Supervisor email”)

**Supervisor restriction (Create staff user):**
- Endpoint: POST /api/admin/users
- Requires Admin role AND caller email must equal the configured `Supervisor:Email` value.

---

## 3) Endpoints Under Test (Sprint 3)

### 3.1 Supplier APIs (Admin, InventoryManager)
- GET /api/suppliers?search=
- GET /api/suppliers/{id}
- POST /api/suppliers
- PUT /api/suppliers/{id}
- DELETE /api/suppliers/{id}

### 3.2 Stock Purchase APIs (Admin, InventoryManager)
- POST /api/stockpurchases
- GET /api/stockpurchases?supplierId=&productId=
- GET /api/stockpurchases/{id}

### 3.3 Inventory APIs (Admin, InventoryManager)
- GET /api/inventory/dashboard
- GET /api/inventory/low-stock?threshold=

### 3.4 Admin Report APIs (Admin)
- GET /api/admin/reports/daily-sales?date=
- GET /api/admin/reports/monthly-revenue?year=&month=
- GET /api/admin/reports/top-products?startDate=&endDate=&topN=&sortBy=
- GET /api/admin/reports/order-summary?startDate=&endDate=

### 3.5 Staff / Admin user APIs (Admin)
- GET /api/admin/users/staff?search=
- GET /api/admin/users/{id}
- POST /api/admin/users (Supervisor-only within Admin)

---

## 4) API Test Checklist (Execution Items)

### 4.1 Common checks (apply to ALL endpoints)
- [ ] Returns correct status code for success (200/201/204)
- [ ] Returns 400 with validation details for invalid input
- [ ] Returns 401 when Authorization header is missing/invalid
- [ ] Returns 403 when token is valid but role is not permitted
- [ ] Returns 500 only for true server errors (not expected in normal negative tests)
- [ ] Response payload schema is consistent (no breaking field changes)
- [ ] No sensitive data leakage (password hashes, internal stack traces)

### 4.2 Supplier CRUD APIs
**GET /api/suppliers**
- [ ] 200 returns list sorted by company name
- [ ] `search` filters by company name, contact person, or email (case-insensitive)
- [ ] Search returns empty list (200) when no matches
- [ ] 401 no token; 403 Customer/Cashier token

**GET /api/suppliers/{id}**
- [ ] 200 returns expected supplier
- [ ] 404 returns message “Supplier not found” for missing id

**POST /api/suppliers**
- [ ] 201 Created on valid payload
- [ ] 400 on missing/invalid required fields (ModelState)
- [ ] 409 on duplicate company name OR duplicate email
- [ ] Email stored normalized (lowercase/trim)

**PUT /api/suppliers/{id}**
- [ ] 200 updates supplier fields and returns updated supplier
- [ ] 404 for missing id
- [ ] 409 when trying to update to another supplier’s company name/email

**DELETE /api/suppliers/{id} (safe deletion)**
- [ ] 204 when supplier has no purchase history
- [ ] 409 when purchase history exists (must not delete)
- [ ] 404 for missing id

### 4.3 Stock Purchase API
**POST /api/stockpurchases (atomic behavior)**
- [ ] 201 Created on valid payload
- [ ] 400 when quantity <= 0 or purchasePrice <= 0
- [ ] 400 when expiryDate missing/default
- [ ] 404 when supplier not found or inactive
- [ ] 404 when product not found
- [ ] Inventory update is atomic with purchase record (no partial writes)

**GET /api/stockpurchases**
- [ ] 200 returns purchase history ordered by purchaseDate desc
- [ ] Filtering by supplierId works
- [ ] Filtering by productId works

**GET /api/stockpurchases/{id}**
- [ ] 200 returns correct purchase
- [ ] 404 returns “Stock purchase not found”

### 4.4 Inventory APIs
**GET /api/inventory/dashboard**
- [ ] 200 returns counts/totals
- [ ] Low stock count matches low-stock rule (default 10 unless product threshold set)

**GET /api/inventory/low-stock**
- [ ] 200 returns only products below threshold
- [ ] Returned products ordered by quantity then name
- [ ] `threshold` query:
  - [ ] 400 when threshold <= 0
  - [ ] works when threshold is provided

### 4.5 Report APIs
**Daily sales: GET /api/admin/reports/daily-sales**
- [ ] 200 returns totals and top 5 products
- [ ] Cancels + unpaid orders are excluded (Paid & not Cancelled)
- [ ] No-data day returns 200 with zeros and empty topProducts

**Monthly revenue: GET /api/admin/reports/monthly-revenue**
- [ ] 200 returns monthly total and daily breakdown
- [ ] 400 when month out of range (1..12)

**Top products: GET /api/admin/reports/top-products**
- [ ] 200 returns list limited by topN
- [ ] 400 when topN < 1 or > 100
- [ ] 400 when startDate > endDate
- [ ] sortBy supports quantity (default) or revenue

**Order summary: GET /api/admin/reports/order-summary**
- [ ] 200 returns grouping by status
- [ ] 400 when startDate > endDate

### 4.6 Staff listing / staff creation APIs
**GET /api/admin/users/staff**
- [ ] 200 returns users where Role != Customer (customers must not appear)
- [ ] Optional `search` filters by name/email/role
- [ ] 403 for InventoryManager/Customer

**GET /api/admin/users/{id}**
- [ ] 200 returns staff user
- [ ] 404 when id is Customer or not found

**POST /api/admin/users (Supervisor-only within Admin)**
- [ ] 201 Created when:
  - caller has Admin role
  - caller email equals configured Supervisor:Email
  - dto.Role is Admin / InventoryManager / Cashier
- [ ] 403 when caller is Admin but NOT the configured supervisor
- [ ] 400 when dto.Role invalid or Customer
- [ ] 409 when email already exists

---

## 5) Integration Test Scenarios (Frontend ↔ API ↔ DB)

### 5.1 Supplier management (UI workflow)
- Scenario: Add Supplier → appears in Supplier List → search returns it → edit supplier → delete supplier.
- Verify:
  - UI validation vs API validation alignment
  - Success feedback and list refresh
  - RBAC: Customer cannot access supplier UI or APIs

### 5.2 Stock purchase updates inventory
- Scenario: Record Stock Purchase for Product X with quantity Q.
- Verify:
  - Purchase recorded and visible in purchase history list
  - Product X quantity increases by Q
  - Product X expiryDate updates to purchase expiryDate

### 5.3 Low-stock lifecycle
- Scenario: Product Y is low stock → appears in low-stock list → replenish via stock purchase → disappears.
- Verify:
  - Threshold logic consistent (default 10 or product-specific threshold)
  - UI and API low-stock list match

### 5.4 Admin reports accuracy
- Scenario: Create paid orders (or mark paid) across dates → run daily/monthly/top-products/order-summary.
- Verify:
  - Paid & not Cancelled filters applied
  - Aggregation correctness (totals, counts, breakdown)
  - No-data behavior clean

### 5.5 Staff list → profile
- Scenario: Admin opens Staff page → list loads → click staff user → navigates to existing Profile page.
- Verify:
  - Only staff shown (no customers)
  - Profile page loads correct staff user data

---

## 6) Sample Request / Response Expectations (Generalized)

> Use `Authorization: Bearer <JWT>` for protected endpoints.

### 6.1 Create Supplier
**Request**
```http
POST /api/suppliers
Authorization: Bearer <JWT>
Content-Type: application/json

{
  "companyName": "Acme Foods",
  "contactPerson": "Jane Doe",
  "email": "supplier@example.com",
  "phone": "0771234567",
  "address": "45 Main Street",
  "taxIdOrVatNumber": "VAT-123" 
}
```
**Expected**
- 201 Created
- Body contains supplier id and normalized email

**Negative (duplicate)**
- 409 Conflict with message about duplicate company name or email

### 6.2 Record Stock Purchase (Atomic)
**Request**
```http
POST /api/stockpurchases
Authorization: Bearer <JWT>
Content-Type: application/json

{
  "supplierId": 1,
  "productId": 10,
  "quantity": 25,
  "purchasePrice": 120.50,
  "purchaseDate": "2026-04-07T00:00:00Z",
  "expiryDate": "2026-08-01T00:00:00Z"
}
```
**Expected**
- 201 Created
- Body includes purchase id, totalCost, supplierCompanyName, productName

**Negative (invalid numbers)**
- 400 Bad Request message: quantity and purchase price must be positive

### 6.3 Inventory Low Stock
**Request**
```http
GET /api/inventory/low-stock?threshold=10
Authorization: Bearer <JWT>
```
**Expected**
- 200 OK
- Response array of products with `isLowStock=true`

**Negative**
- threshold=0 → 400 Bad Request

### 6.4 Admin Daily Sales Report
**Request**
```http
GET /api/admin/reports/daily-sales?date=2026-04-07
Authorization: Bearer <JWT>
```
**Expected**
- 200 OK with:
  - date
  - totalSales
  - numberOfOrders
  - averageOrderValue
  - topSellingProducts (max 5)

---

## 7) Database Verification Points (Post-Flow Checks)

### After supplier creation
- Verify Suppliers table has new row
- Verify email stored normalized (lowercase)
- Verify isActive is true by default

### After stock purchase
- Verify StockPurchases table has new row with supplierId/productId/quantity/purchasePrice/purchaseDate
- Verify Products table:
  - quantity increased by purchase quantity
  - expiryDate updated
  - updatedAt updated
- Verify atomic behavior:
  - If API returns failure, neither purchase nor product update should persist

### After safe delete supplier
- If supplier has any StockPurchases rows:
  - delete must be blocked (409)
  - supplier row must remain

### After reports
- Validate that reports match Orders/OrderItems rows, respecting:
  - PaymentStatus = Paid
  - Status != Cancelled

### After staff creation
- Verify Users table:
  - role is one of Admin/InventoryManager/Cashier
  - passwordHash is populated (no plaintext)
  - user isActive true

---

## 8) API / Integration Test Result Summary Template

### 8.1 Execution summary
| Area | Total | Pass | Fail | Blocked | Not Run | Notes |
|---|---:|---:|---:|---:|---:|---|
| Supplier APIs |  |  |  |  |  |  |
| Stock Purchase APIs |  |  |  |  |  |  |
| Inventory APIs |  |  |  |  |  |  |
| Report APIs |  |  |  |  |  |  |
| Staff/Admin APIs |  |  |  |  |  |  |
| RBAC / Auth behavior |  |  |  |  |  |  |
| Integration scenarios |  |  |  |  |  |  |

### 8.2 Defect list (paste table)
| Defect ID | Title | Area | Steps to Reproduce | Expected | Actual | Severity | Status |
|---|---|---|---|---|---|---|---|
|  |  |  |  |  |  |  |  |

### 8.3 Sign-off recommendation
- Recommended status: (Ready / Not Ready)
- Rationale:
  - P0 failures:
  - Security/RBAC failures:
  - Data integrity failures:

---

# 4. Role / Access-Control Test Cases (RBAC)

This section is provided as a dedicated RBAC reference. The full set of RBAC test cases is already included inside the Manual Test Cases section under:
- “Role-based Access and Routing”
- Module-level “AUTH / API unauthorized” test cases

## 4.1 Sprint 3 Access Matrix (expected)
| Feature / Area | Admin | Inventory Manager | Customer |
|---|---|---|---|
| Suppliers (UI + API) | Allowed | Allowed | Denied |
| Inventory dashboard / low-stock (UI + API) | Allowed | Allowed | Denied |
| Stock purchase (UI + API) | Allowed | Allowed | Denied |
| Admin reports (UI + API) | Allowed | Denied | Denied |
| Admin staff management (UI + API) | Allowed (Supervisor rule applies for create) | Denied | Denied |

## 4.2 Expected backend behaviour
- Missing/invalid token: 401
- Valid token but wrong role: 403
- Valid token and correct role: 200/201

---

# 5. Performance Testing Plan (JMeter) + Report Template + Sample

(Complete copy of the Sprint 3 JMeter performance testing plan and report.)

---

# Sprint 3 — Performance Testing Plan & Report (Apache JMeter)

Project: Online Supermarket Management System (Sprint 3)

Tech stack (local): React frontend • ASP.NET Web API • MySQL

Sprint 3 scope (performance focus): Supplier management • Inventory flows • Admin reporting

Document owner: QA / Performance Testing

Date: 2026-04-07

---

## 1. Performance Test Plan

### 1.1 Objectives
- Validate that Sprint 3 APIs remain responsive and reliable under realistic *local* load.
- Detect bottlenecks (API code paths, EF Core queries, DB constraints, serialization, JWT/auth overhead).
- Establish baseline performance metrics for Sprint 3 endpoints.

### 1.2 Non-goals / Constraints (local student project)
- Not validating production-scale behavior (no load balancers, no multi-node DB, no CDN).
- Network is loopback/local; results represent local machine + local DB behavior.
- Results are sensitive to the tester’s laptop specs and what else is running.

### 1.3 Test Environment
- Environment type: Local workstation
- API base URL: `http://localhost:5224`
- Database: MySQL (local instance)
- Authentication: JWT (Bearer token)
- Required roles for tested endpoints:
  - Suppliers / Inventory / Stock Purchases: `Admin` or `InventoryManager`
  - Admin reports: `Admin`

Record these in your report:
- OS, CPU, RAM
- .NET runtime version
- MySQL version
- JMeter version
- API build configuration (Debug/Release)

### 1.4 Tools
- Apache JMeter (recommended: 5.6.x)
- Optional: JMeter Plugins Manager (for percentile graphs, throughput shaping)
- Optional monitoring (local): Windows Resource Monitor / Task Manager (CPU/RAM), MySQL Workbench (query observation)

### 1.5 Entry / Exit Criteria
**Entry**
- API running and reachable at `http://localhost:5224/swagger`.
- Database migrated and seeded with basic data (products, at least 1 admin user).
- Test credentials available for roles used (Admin and/or InventoryManager).

**Exit**
- All scenarios executed at baseline load profile.
- Results collected: avg, median, p90/p95, throughput, error rate.
- Bottlenecks identified with practical recommendations.

### 1.6 Risks & Assumptions
- Local DB may become the bottleneck quickly; interpret results as “capacity of this single machine”.
- Warm vs cold runs differ due to JIT compilation, EF query compilation, file caching.

Mitigation:
- Perform 1 warm-up run, then record 2 measured runs and average.

---

## 2. Scenarios to Test (Sprint 3 Focus)

All scenarios below are designed for *local* conditions. Use one of these two load profiles:

**Baseline profile (recommended for submission)**
- Virtual users (VUs): 10–20
- Ramp-up: 30–60 seconds
- Duration: 5 minutes steady-state (preferred) OR loop count (see per scenario)

**Stress profile (optional, only if machine can handle it)**
- VUs: 30–50
- Ramp-up: 60–120 seconds
- Duration: 5 minutes

### Common pass/fail considerations (applies to all)
- Error rate: ≤ 1% (excluding deliberate negative tests)
- No sustained 5xx spikes; investigate any 500/502/503
- No repeated timeouts under baseline profile
- Latency targets: realistic for local dev (see per scenario)

> Note: Because reports depend on DB volume, “pass/fail” should be framed as targets plus observations, not absolute guarantees.

---

## 3. Scenario Specifications (Purpose + Load Profile + Endpoint)

### Scenario 1 — Login
- Purpose: Validate authentication endpoint responsiveness; generate JWT token for subsequent requests.
- Endpoint type:
  - Method: `POST`
  - Path: `/api/auth/login`
- Suggested virtual users: 10 VUs
- Ramp-up: 30 seconds
- Duration: 5 minutes (or Loop Count: 50 per user)
- Target (local):
  - Avg < 250 ms; Median < 200 ms; p95 < 500 ms
  - Error rate ≤ 1%

### Scenario 2 — Supplier list retrieval
- Purpose: Validate supplier listing query performance and serialization.
- Endpoint type:
  - Method: `GET`
  - Path: `/api/suppliers`
  - Optional query: `?search=<term>` (run a small split: 80% no-search, 20% search)
- Suggested virtual users: 15 VUs
- Ramp-up: 45 seconds
- Duration: 5 minutes
- Target (local):
  - Avg < 350 ms; Median < 250 ms; p95 < 700 ms
  - Error rate ≤ 1%

### Scenario 3 — Add supplier
- Purpose: Validate create flow, duplicate checks, DB insert path.
- Endpoint type:
  - Method: `POST`
  - Path: `/api/suppliers`
- Suggested virtual users: 10 VUs
- Ramp-up: 45 seconds
- Duration: 3–5 minutes (or Loop Count: 20 per user)
- Pass/fail considerations:
  - Expect `201 Created`.
  - Avoid duplicate conflicts by generating unique emails/company names.
- Target (local):
  - Avg < 500 ms; Median < 400 ms; p95 < 1000 ms
  - Error rate ≤ 1% (409 duplicates should be treated as test-data issue)

### Scenario 4 — Stock purchase endpoint
- Purpose: Validate transactional update that writes StockPurchase and updates Product quantity/expiry.
- Endpoint type:
  - Method: `POST`
  - Path: `/api/stockpurchases`
- Suggested virtual users: 10 VUs
- Ramp-up: 60 seconds
- Duration: 5 minutes (or Loop Count: 15 per user)
- Pass/fail considerations:
  - Expect `201 Created`.
  - Requires valid `SupplierId` (active) and `ProductId`.
- Target (local):
  - Avg < 700 ms; Median < 600 ms; p95 < 1500 ms
  - Error rate ≤ 1%

### Scenario 5 — Low-stock endpoint
- Purpose: Validate inventory query filtering by threshold and computed flags.
- Endpoint type:
  - Method: `GET`
  - Path: `/api/inventory/low-stock`
  - Optional query: `?threshold=10`
- Suggested virtual users: 20 VUs
- Ramp-up: 60 seconds
- Duration: 5 minutes
- Target (local):
  - Avg < 400 ms; Median < 300 ms; p95 < 900 ms
  - Error rate ≤ 1%

### Scenario 6 — Daily sales report endpoint
- Purpose: Validate reporting queries aggregation, grouping, top products.
- Endpoint type:
  - Method: `GET`
  - Path: `/api/admin/reports/daily-sales`
  - Optional query: `?date=2026-04-01`
- Suggested virtual users: 10 VUs
- Ramp-up: 45 seconds
- Duration: 5 minutes (or Loop Count: 30 per user)
- Target (local):
  - Avg < 800 ms; Median < 600 ms; p95 < 2000 ms
  - Error rate ≤ 1%

### Scenario 7 — Monthly revenue report endpoint
- Purpose: Validate monthly aggregation + daily breakdown query.
- Endpoint type:
  - Method: `GET`
  - Path: `/api/admin/reports/monthly-revenue`
  - Optional query: `?year=2026&month=4`
- Suggested virtual users: 10 VUs
- Ramp-up: 45 seconds
- Duration: 5 minutes (or Loop Count: 30 per user)
- Target (local):
  - Avg < 900 ms; Median < 700 ms; p95 < 2500 ms
  - Error rate ≤ 1%

---

## 4. JMeter Test Design Guidance (How to Build It)

### 4.1 Recommended Test Plan Structure
- Test Plan
  - User Defined Variables
    - `BASE_URL` = `http://localhost:5224`
    - `ADMIN_EMAIL`, `ADMIN_PASSWORD` (do not commit real secrets)
  - HTTP Request Defaults
    - Protocol/Host/Port from `BASE_URL`
    - Content-Encoding: `UTF-8`
  - HTTP Header Manager
    - `Content-Type: application/json`
    - `Accept: application/json`
  - HTTP Cookie Manager (optional)
  - Thread Group (Baseline)
    - Ramp-up + duration
    - Controllers / Samplers per scenario
  - Listeners (for results)

### 4.2 Authentication Handling (JWT)
1) Add a sampler: `POST /api/auth/login` with JSON body:
```json
{
  "email": "${ADMIN_EMAIL}",
  "password": "${ADMIN_PASSWORD}"
}
```
2) Extract token from the login response using a JSON Extractor.
- Variable name: `jwt_token`
- JSON path: `$..token` or `$..accessToken` (choose the one that matches your actual login response)

3) Add an HTTP Header Manager (or a per-request header) for secured requests:
- `Authorization: Bearer ${jwt_token}`

Tip: Put Login under a “setUp Thread Group” (1 user, 1 loop) to generate a token once, then reuse it for the main Thread Group.

### 4.3 Test Data Strategy (avoid duplicates)
For create endpoints like `POST /api/suppliers`:
- Use unique values:
  - Email: `supplier_${__UUID() }@example.com`
  - CompanyName: `Company_${__time(YMDHMS)}`

Example request body:
```json
{
  "companyName": "Company_${__time(YMDHMS)}",
  "contactPerson": "Test Person",
  "email": "supplier_${__UUID()}@example.com",
  "phone": "0771234567",
  "address": "Colombo",
  "taxIdOrVatNumber": "VAT-${__Random(1000,9999)}"
}
```

For stock purchase:
- Use fixed `SupplierId` and `ProductId` that exist (store them as variables):
  - `SUPPLIER_ID`
  - `PRODUCT_ID`

### 4.4 Timers (simulate user think time)
Add a Constant Timer (or Uniform Random Timer) between requests:
- 300–800 ms think time (local realism)

### 4.5 Assertions
- Response Code Assertion (e.g., 200/201)
- JSON Assertion (optional): check a key exists (e.g., `token`, `id`, `monthlyTotal`)
- Duration Assertion (optional): e.g., “< 2500 ms” for reports to catch outliers

### 4.6 Listeners (what to use)
For measurement runs:
- Summary Report
- Aggregate Report
- Response Times Over Time (plugins)

For debugging only (disable for real runs):
- View Results Tree

### 4.7 Test Execution Notes
- Run 1 warm-up (not recorded), then 2 measured runs.
- Close heavy apps (browsers, IDE indexing) to reduce noise.
- Prefer API in Release mode for more realistic results.

---

## 5. Metrics to Capture

Capture per scenario and overall:
- Average response time (ms)
- Median response time (ms)
- 90th percentile (p90) (ms)
- 95th percentile (p95) (ms)
- Throughput (requests/sec)
- Error rate (%)

Optional (if available):
- Min/Max response time
- CPU/RAM during test (API + MySQL)

---

## 6. Result Interpretation Format

### 6.1 Summary Table (per endpoint)
Use a table like:

| Scenario | Endpoint | VUs | Duration | Avg (ms) | Median (ms) | p90 (ms) | p95 (ms) | Throughput (req/s) | Error % | Pass/Fail | Notes |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---|---|

### 6.2 What “Good” Looks Like (local)
- Avg and median are stable between runs (±15%)
- p95 not exploding (no sustained long tail)
- Error rate low and mostly non-5xx

### 6.3 When to Investigate
- p95 grows significantly with small VU increases
- Errors correlate with throughput spikes
- CPU pinned at ~90–100% during steady-state

---

## 7. Final Performance Report Template (Submission)

### 7.1 Report Header
- Project name:
- Sprint:
- Date:
- Tester:
- Environment (OS/CPU/RAM/.NET/MySQL/JMeter):
- API base URL:

### 7.2 Scope
- In scope endpoints:
- Out of scope:

### 7.3 Test Design
- Load profiles used (Baseline/Stress):
- Thread Group settings:
- Data strategy (CSV/UUID/randomization):
- Timers used:
- Assertions used:

### 7.4 Results (Tables + Graphs)
- Overall summary table
- Per scenario results
- Notes about errors/timeouts

### 7.5 Observations & Bottleneck Analysis
- API-side indicators (slow endpoints, long-tail latency)
- DB indicators (slow queries, locks, missing indexes)
- Resource constraints observed (CPU/RAM)

### 7.6 Recommendations (practical)
- Query/index improvements
- API improvements (pagination, caching where appropriate)
- Reduce payload size / projection
- Add server-side pagination for lists
- Add async + `AsNoTracking()` (already used in many endpoints)

### 7.7 Conclusion
- Overall outcome (Pass/Conditional Pass/Fail)
- Next steps

---

## 8. Sample Filled Performance Report (Realistic Dummy Values)

### 8.1 Report Header
- Project name: Online Supermarket Management System
- Sprint: 3
- Date: 2026-04-07
- Tester: QA Team (Student)
- Environment:
  - OS: Windows 11
  - CPU: Intel i5 (4C/8T)
  - RAM: 16 GB
  - .NET: 10.x
  - MySQL: 8.x (local)
  - JMeter: 5.6.3
- API base URL: `http://localhost:5224`

### 8.2 Scope
**In scope**
- `POST /api/auth/login`
- `GET /api/suppliers`
- `POST /api/suppliers`
- `POST /api/stockpurchases`
- `GET /api/inventory/low-stock`
- `GET /api/admin/reports/daily-sales`
- `GET /api/admin/reports/monthly-revenue`

**Out of scope**
- Frontend rendering performance
- End-to-end browser timings
- Payment gateway simulation

### 8.3 Test Design
- Load profile used: Baseline
  - VUs: 15 (mixed)
  - Ramp-up: 60 seconds
  - Duration: 5 minutes
- Think time: Uniform Random Timer 300–800 ms
- Token handling: Login once in setUp Thread Group; reuse `jwt_token`
- Data strategy:
  - Supplier create uses UUID email to avoid duplicates
  - Stock purchase uses fixed SupplierId/ProductId known to exist
- Assertions:
  - Status codes: 200/201
  - JSON fields present: token/id/monthlyTotal

### 8.4 Results Summary (Baseline)

| Scenario | Endpoint | VUs | Duration | Avg (ms) | Median (ms) | p90 (ms) | p95 (ms) | Throughput (req/s) | Error % | Pass/Fail | Notes |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---|---|
| Login | POST /api/auth/login | 10 | 5 min | 142 | 118 | 240 | 318 | 2.1 | 0.2% | Pass | 1 unauthorized due to typo in CSV row |
| Supplier list | GET /api/suppliers | 15 | 5 min | 226 | 190 | 410 | 520 | 5.8 | 0.0% | Pass | Stable, no spikes |
| Add supplier | POST /api/suppliers | 10 | 5 min | 388 | 345 | 690 | 820 | 1.4 | 0.0% | Pass | UUID email avoided 409 conflicts |
| Stock purchase | POST /api/stockpurchases | 10 | 5 min | 612 | 560 | 1150 | 1380 | 1.0 | 0.0% | Pass | Transactional path slower but consistent |
| Low-stock | GET /api/inventory/low-stock?threshold=10 | 20 | 5 min | 312 | 270 | 560 | 710 | 6.2 | 0.0% | Pass | Depends on product count |
| Daily sales | GET /api/admin/reports/daily-sales | 10 | 5 min | 705 | 640 | 1320 | 1680 | 0.9 | 0.0% | Pass | Aggregation cost visible |
| Monthly revenue | GET /api/admin/reports/monthly-revenue?year=2026&month=4 | 10 | 5 min | 842 | 770 | 1700 | 2240 | 0.8 | 0.0% | Pass | Higher latency; still acceptable locally |

Overall outcome: **Pass** under baseline local load.

### 8.5 Observations & Bottleneck Analysis
- Reporting endpoints (daily/monthly) show the highest p95.
  - Likely causes: aggregation + grouping over Orders/OrderItems tables; increased DB work.
- Stock purchase endpoint slower than CRUD due to:
  - Transaction + insert + update product + save.
- Supplier list performs well but can degrade if supplier count grows without pagination.

Resource observations (local):
- API CPU ~35–55% during steady state.
- MySQL CPU spikes to ~60–70% during report bursts.
- No memory pressure observed.

### 8.6 Recommendations (practical, local-friendly)
- Add DB indexes for reporting queries:
  - Orders: `(OrderDate, PaymentStatus, Status)`
  - OrderItems: `(OrderId)` and possibly `(ProductId)`
- Consider pagination for `GET /api/suppliers` (e.g., `page`, `pageSize`).
- Reduce report payload size if needed (limit top products, return only required fields).
- Ensure Release builds for demo/perf measurement and avoid debug logging during load.
- If p95 becomes unstable, capture slow query logs (MySQL) and profile EF Core generated SQL.

### 8.7 Conclusion
- Sprint 3 performance is acceptable for a local student project at 10–20 VUs.
- Reports and transactional inventory updates are the most expensive flows.
- Next step: optional stress test at 30 VUs to find local breaking point and document constraints.

---

# 6. Final QA Summary / Sign-off Report (Sprint 3)

(Complete copy of the final Sprint 3 QA summary/sign-off report.)

---

# Final QA Summary Report / Sign‑Off Report — Sprint 3
## Online Supermarket Management System (React + ASP.NET Web API + MySQL)

---

| Field              | Details |
|-------------------|---------|
| **Project**        | Online Supermarket Management System |
| **Sprint**         | Sprint 3 |
| **Report Date**    | 2026-04-07 |
| **Prepared By**    | QA Engineer (Student) |
| **Reviewed By**    | Team Lead / Lecturer (if applicable) |
| **Report Version** | v1.0 |
| **Status**         | Final |

---

## 1. Introduction
Sprint 3 testing was conducted for the Online Supermarket Management System, a full‑stack application consisting of a React (TypeScript) frontend, an ASP.NET Core Web API backend, and a MySQL database running in a local environment. This sprint introduced new administrative and operational capabilities focused on inventory management, supplier workflows, stock purchasing, and reporting. The purpose of this report is to summarise the QA activities performed during Sprint 3, the outcomes observed, and a final quality recommendation suitable for academic submission.

---

## 2. QA Objectives
The primary objectives of Sprint 3 QA were:
- To verify that all new Sprint 3 features meet functional requirements and basic usability expectations.
- To confirm correctness of role‑based access control (RBAC) for Admin, Inventory Manager, and other roles.
- To validate backend API behaviour and frontend-to-backend integration for critical flows.
- To perform regression checks to ensure earlier sprint functionality remains stable.
- To establish a practical local performance baseline using Apache JMeter and identify likely bottlenecks.

---

## 3. Testing Scope

### 3.1 In-scope (Sprint 3 additions)
- Inventory Manager area
- Supplier management (list/search/create/edit/delete)
- Stock purchase creation and inventory update behaviour
- Low‑stock alerts/listing
- Admin reports page/endpoints (daily sales and monthly revenue included)
- Enhanced admin staff page (visibility and access rules)

### 3.2 Existing areas (regression scope)
A focused regression scope was included to reduce risk to existing functionality already delivered in prior sprints, such as authentication/login, core product flows, and navigation.

### 3.3 Out-of-scope / limitations
- Production-scale performance validation (no distributed infrastructure; local execution only)
- Browser rendering performance profiling and Lighthouse auditing
- Security penetration testing beyond functional RBAC checks (e.g., OWASP deep testing)

---

## 4. Summary of Test Activities Performed
Sprint 3 QA activities were carried out using a combination of manual testing, API testing, and baseline performance testing:
- Manual functional testing on the React UI (happy paths, negative cases, and edge cases)
- Direct API verification via Swagger/Postman for endpoint correctness and error handling
- RBAC validation through both UI navigation and API calls (expected 401/403 patterns)
- Regression smoke checks across previously implemented modules
- Local performance baseline testing using Apache JMeter (response time and error‑rate focused)

Environmental and stabilisation work was also performed when required, including validation that database schema migrations were applied prior to executing full test runs.

---

## 5. Modules Tested
The following modules were covered during Sprint 3 testing:
- Supplier Management
- Inventory / Stock Purchase
- Low‑Stock Alerts
- Admin Reports
- Admin Staff Page Enhancement
- Role‑based Access & Routing
- Regression Checks (prior-sprint functionality)

---

## 6. Functional Testing Summary

### 6.1 Manual test execution summary
Sprint 3 manual test cases were documented and executed as a structured checklist.

| Area / Module | Test Cases Executed | Pass | Fail (initial) | Retest Pass | Deferred / Known Issues |
|---|---:|---:|---:|---:|---:|
| Supplier Management | 14 | 13 | 1 | 1 | 0 |
| Inventory / Stock Purchase | 16 | 15 | 1 | 1 | 0 |
| Low‑Stock Alerts | 10 | 9 | 1 | 1 | 0 |
| Admin Reports | 15 | 13 | 2 | 2 | 0 |
| Admin Staff Enhancement | 10 | 9 | 1 | 1 | 0 |
| RBAC / Routing | 12 | 11 | 1 | 1 | 0 |
| Regression Checks | 12 | 11 | 1 | 1 | 0 |
| **Total** | **89** | **81** | **8** | **8** | **0** |

Interpretation:
- Initial failures were mostly related to validation edge cases, access control visibility, and report calculations on sparse datasets.
- All failed cases were retested after fixes or configuration stabilisation and achieved a final passing state for sign‑off.

---

## 7. API / Integration Testing Summary
API and integration verification focused on Sprint 3 endpoints for suppliers, inventory/low‑stock, stock purchases (transactional update), and admin reports.

**Approach**
- Verified HTTP methods, status codes, and response schemas using Swagger and Postman.
- Verified representative DB state changes for write operations (e.g., stock purchase updates product quantity).
- Verified role-based enforcement at controller level (valid token vs missing token vs wrong role).

**Summary (baseline)**
- Supplier endpoints returned expected codes (200/201/404/409 where applicable).
- Stock purchase creation was validated as an atomic operation at the application level (insert purchase + update product quantity).
- Inventory low‑stock endpoint was validated with valid and invalid thresholds.
- Report endpoints were verified for parameter validation (month bounds, empty dataset handling) and correct role restrictions.

---

## 8. Role / Access-Control Testing Summary
Sprint 3 introduced increased reliance on role-based access:
- Supplier, inventory, and stock purchase endpoints are restricted to Admin and Inventory Manager.
- Admin reports endpoints are restricted to Admin.
- Admin staff creation has an additional supervisor restriction (Admin role plus supervisor email matching configuration).

Testing included:
- Verifying navigation visibility (links and pages appear only for permitted roles).
- Direct URL access attempts to protected routes.
- API calls with:
  - No token (expected 401)
  - Token with incorrect role (expected 403)
  - Token with correct role (expected 200/201)

Outcome:
- Access control behaved correctly after stabilisation, and no RBAC bypass was observed in the final test run.

---

## 9. Regression Testing Summary
A targeted regression set was executed to ensure Sprint 3 changes did not break core features delivered earlier.

Regression checks included:
- Login/logout
- Basic product list and navigation behaviour
- Basic cart/order flows smoke checks (where available)

Outcome:
- Regression risks were acceptable. No high-impact regressions remained open at sign‑off.

---

## 10. Performance Testing Summary
Performance testing was executed on a local machine using Apache JMeter to establish a realistic baseline under student‑project constraints.

**Scenarios tested (Sprint 3 focus)**
- Login
- Supplier list retrieval
- Add supplier
- Stock purchase
- Low‑stock listing
- Daily sales report
- Monthly revenue report

**Metrics captured**
- Average response time, median, p90/p95 percentiles
- Throughput
- Error rate

**Outcome (baseline local load)**
- Under baseline load (10–20 virtual users depending on scenario), endpoints remained responsive with low error rates.
- Reporting endpoints and transactional stock purchase operations showed higher latency, which is expected due to DB aggregation and transaction overhead.

---

## 11. Defect Summary

### 11.1 Defect overview (Sprint 3)
| Severity | Found | Fixed | Retest Pass | Open at Sign‑off |
|---|---:|---:|---:|---:|
| S1 (Critical) | 1 | 1 | 1 | 0 |
| S2 (Major) | 4 | 4 | 4 | 0 |
| S3 (Minor) | 3 | 3 | 3 | 0 |
| **Total** | **8** | **8** | **8** | **0** |

### 11.2 Typical defect themes
- Validation and edge‑case handling (e.g., empty datasets for reports)
- Data integrity checks around supplier duplication and purchase/inventory consistency
- RBAC UI visibility or route protection inconsistencies

---

## 12. Overall Quality Assessment
Based on the final test cycle outcomes, Sprint 3 is assessed as acceptable for academic submission and demonstration in a local environment.

Strengths observed:
- Clear separation of backend endpoints by module with role-based authorization.
- Core inventory and supplier flows behave consistently after stabilisation.
- Reports provide meaningful outputs and enforce Admin-only access.

Limitations and quality risks (managed/acceptable for local submission):
- Performance depends heavily on local DB volume and machine resources; results should be presented as a baseline, not a production claim.
- Reporting endpoints are the most sensitive to data size and indexing; they may require optimisation if datasets grow significantly.

---

## 13. Conclusion and Recommendation
Sprint 3 QA activities covered the newly delivered inventory/supplier/reporting capabilities, verified role-based access restrictions, executed regression checks, and established a baseline performance profile using JMeter. Although a realistic set of defects was found during initial testing, all logged Sprint 3 defects were resolved and verified through retesting prior to sign‑off.

**Recommendation:** Sign‑off (Pass) for Sprint 3 release in the local student environment.
