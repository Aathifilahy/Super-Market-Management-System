# Test Plan - Sprint 4
## Online Supermarket Management System

| Field | Details |
|---|---|
| Version | 1.0 |
| Sprint | Sprint 4 |
| Prepared by | QA Engineer |
| Date | 2026-04-22 |
| Status | Draft for Review |

---

## 1. Objectives

- Validate Sprint 4 features end-to-end across React frontend, ASP.NET Core Web API, and MySQL.
- Verify cashier POS workflows: product search, billing cart, payment simulation, digital receipt, print flow, and transaction history.
- Verify multiple billing sessions behavior (parallel sale tabs, active session isolation, clear/new transaction behavior, session limit).
- Validate advanced Admin report filtering and data correctness across all report types.
- Validate CSV export behavior for all report endpoints and UI export actions.
- Confirm role-based access rules for Sprint 4 paths and APIs (Cashier and Admin focus).
- Run targeted regression on previously delivered modules to ensure no high-impact breakage.
- Provide release readiness criteria with measurable exit thresholds.

---

## 2. Scope

### 2.1 In Scope

| Area | Feature | Coverage Type |
|---|---|---|
| Cashier POS | Product search by query/category/barcode | Functional, API, UI |
| Cashier POS | Include out-of-stock toggle, unavailable item indicators (out-of-stock/expired) | Functional, UI |
| Cashier POS | Cart operations (add, remove, quantity stepper, stock limit enforcement) | Functional, Integration |
| Cashier POS | Payment simulation (Cash, Card approval, Card decline) | Functional, Negative, API |
| Cashier POS | Checkout and receipt generation | Functional, Integration, Data integrity |
| Cashier POS | Receipt retrieval and print dialog flow | Functional, UI |
| Cashier POS | Recent transactions list and refresh | Functional, API |
| Cashier POS | Multiple billing sessions (up to 4, switch tabs, isolated carts) | Functional, UX, State handling |
| Admin Reports | Daily Sales report with filters | Functional, API, Data validation |
| Admin Reports | Monthly Revenue report with date/month filters | Functional, API, Data validation |
| Admin Reports | Top Products report with topN/sortBy/filters | Functional, API, Data validation |
| Admin Reports | Order Summary report with filters | Functional, API, Data validation |
| Report Export | CSV export for all report types | Functional, Contract, File handling |
| Security | RBAC checks for Cashier/Admin endpoints and routes | Security, Authorization |
| Regression | Smoke regression for customer/admin/inventory/supplier baseline paths | Regression |

### 2.2 Out of Scope

- Full penetration testing (OWASP Top 10 deep assessment, DAST, SAST hardening backlog).
- Distributed load/stress/endurance testing in production-like cloud infrastructure.
- Full accessibility certification (WCAG 2.2 AA audit) beyond major UX sanity checks.
- Cross-browser certification beyond primary browser baseline (Chrome latest).
- Hardware POS integrations (barcode scanner/printer peripherals) beyond browser simulation.
- Native mobile application testing (project is web-based frontend).

---

## 3. Test Environment

### 3.1 Application Stack

| Component | Technology | Target Version |
|---|---|---|
| Frontend | React + TypeScript + MUI | React 18.2, TypeScript 4.9 |
| Backend | ASP.NET Core Web API | .NET 10 (`net10.0`) |
| Database | MySQL (via Pomelo EF Core provider) | MySQL 8.x compatible |
| API Auth | JWT Bearer | Enabled |

### 3.2 QA Tooling

| Purpose | Tool |
|---|---|
| API functional tests | Swagger UI, Postman |
| UI/manual functional tests | Chrome latest |
| Automation baseline | Mocha + Selenium WebDriver |
| Integration checks | Node-based API tests (`tests/integration`) |
| Performance baseline | JMeter or existing Node baseline scripts |
| Defect tracking | Markdown defect log templates in `docs/` |

### 3.3 Environment Configuration

| Item | Value |
|---|---|
| Frontend URL | http://localhost:3000 |
| API Base URL | http://localhost:5224/api |
| Swagger | http://localhost:5224/swagger |
| CORS origins | `http://localhost:3000`, `http://localhost:3001` |
| Auth tokens | Role-specific JWTs (Admin, Cashier, InventoryManager, Customer) |

### 3.4 Pre-test Setup Checklist

- [ ] Backend dependencies restored and API starts successfully.
- [ ] Frontend dependencies installed and app starts without compile errors.
- [ ] Database schema/migrations applied; seed data available.
- [ ] Role-based users available for Admin, Cashier, InventoryManager, Customer.
- [ ] Postman environment configured with base URL and token variables.
- [ ] Test data reset script or SQL prepared for repeatable runs.

---

## 4. Test Data

### 4.1 Core User Accounts

| Role | Purpose | Example Data Requirement |
|---|---|---|
| Cashier | POS operation | Valid credentials with Cashier role |
| Admin | Reports and exports | Valid credentials with Admin role |
| InventoryManager | Negative RBAC checks | Valid credentials with non-admin staff role |
| Customer | Negative RBAC checks | Valid customer account |

### 4.2 Product Data Set

| Data Category | Minimum Data |
|---|---|
| Sellable products | At least 15 items across at least 4 categories |
| Out-of-stock products | At least 3 items with quantity = 0 |
| Expired products | At least 2 items with expiry date less than current UTC date |
| Barcode coverage | Valid IDs and POS-prefixed barcode values (`POS-000001` pattern) |

### 4.3 Order and Payment Data

| Scenario | Seed Requirement |
|---|---|
| Paid orders | Multiple paid orders for report aggregation |
| Cancelled orders | At least 2 cancelled orders to verify exclusion logic |
| Payment methods | Both Cash and Card orders |
| Customer diversity | Orders from at least 3 distinct customers |
| Date spread | Orders distributed over at least 30 days |

### 4.4 POS Transaction Data for New Features

| Feature | Data Need |
|---|---|
| Multiple sessions | Distinct products and quantities per session |
| Cash payment | Amount tendered equal/greater than total |
| Insufficient cash negative path | Amount tendered lower than total |
| Card decline path | `simulateCardApproval = false` test case |
| Receipt/history | At least 5 completed POS orders by Cashier user |

---

## 5. Testing Strategy

### 5.1 Functional Testing

- Execute API-first validation for all Sprint 4 endpoints:
  - `GET /api/pos/products/search`
  - `POST /api/pos/checkout`
  - `GET /api/pos/receipts/{orderId}`
  - `GET /api/pos/transactions/recent`
  - `GET /api/admin/reports/*`
  - `GET /api/admin/reports/*/export`
- Execute UI functional flows for Cashier POS and Admin Reports pages.
- Cover happy path, validation errors, empty-state behavior, and controlled failure flows.
- Verify business rules:
  - Session cap of 4 billing sessions.
  - Checkout blocked on insufficient cash.
  - Card decline returns controlled error and preserves cart state.
  - Report filters applied consistently to on-screen data and CSV output.

### 5.2 Regression Testing

- Run focused smoke regression for prior features:
  - Authentication and role-based navigation.
  - Customer browsing/cart/order baseline.
  - Admin product and staff pages baseline.
  - Inventory and supplier baseline operations.
- Re-run critical Sprint 3 report and inventory checks to detect query or permission regressions.
- Execute selected existing automation suites from `tests/` where applicable.

### 5.3 Security Testing

- Validate authorization boundaries:
  - POS endpoints allow Cashier/Admin only.
  - Admin report endpoints allow Admin only.
  - Unauthorized requests return 401.
  - Forbidden role requests return 403 where applicable.
- Validate token and session handling in role-switch scenarios.
- Validate no sensitive data leakage in error payloads for invalid requests.

### 5.4 Performance Testing (Sprint 4 Baseline)

- Conduct local baseline performance checks for:
  - POS product search with and without filters.
  - POS checkout under short bursts.
  - Report retrieval and CSV export endpoints.
- Capture:
  - Average response time, p95 latency, error rate, throughput.
- Suggested local baseline target (non-production):
  - API error rate < 1%
  - p95 < 1500 ms for report endpoints under baseline load
  - p95 < 800 ms for POS search under baseline load

---

## 6. Traceability Matrix (Feature -> Coverage)

| Feature ID | Sprint 4 Feature | Modules/Endpoints | Coverage Type | Planned Test Assets |
|---|---|---|---|---|
| S4-F01 | POS product search | UI `CashierDashboard`, `GET /api/pos/products/search` | Functional, API, UI | Manual TC set: POS-SEARCH-01..12, Postman collection folder |
| S4-F02 | POS cart operations | UI cart panel and quantity controls | Functional, State, UX | Manual TC set: POS-CART-01..10 |
| S4-F03 | POS checkout (cash/card) | `POST /api/pos/checkout` | Functional, Negative, Integration | API TC set: POS-CHECKOUT-01..14 |
| S4-F04 | Digital receipt + history | `GET /api/pos/receipts/{orderId}`, `GET /api/pos/transactions/recent` | Functional, API, UI | Manual/API TC: POS-RECEIPT-01..08 |
| S4-F05 | Multiple billing sessions | Session tabs, add-session/new-transaction actions | Functional, State management | Manual TC: POS-SESSION-01..09 |
| S4-F06 | Advanced report filters | `daily-sales`, `monthly-revenue`, `top-products`, `order-summary` | Functional, Data validation | API/UI TC: RPT-FILTER-01..20 |
| S4-F07 | Report CSV export | `/export` endpoints for all reports | Functional, Contract, File validation | API/UI TC: RPT-EXPORT-01..12 |
| S4-F08 | RBAC for Sprint 4 routes | POS + Admin report APIs, protected frontend routes | Security, Authorization | Security TC: AUTHZ-S4-01..16 |
| S4-F09 | Regression stability | Existing customer/admin/inventory/supplier flows | Regression | Regression smoke checklist: REG-SMOKE-S4-01..30 |

Coverage goal:
- 100% of Sprint 4 feature IDs mapped to at least one functional test set.
- 100% of critical and high-risk features (`S4-F01` to `S4-F08`) include negative-path and authorization checks.

---

## 7. Entry and Exit Criteria

### 7.1 Entry Criteria

Testing for Sprint 4 may start when all conditions are true:

- [ ] Sprint 4 development stories are code complete and merged into test branch.
- [ ] POS and report APIs are deployed to QA/local environment and reachable.
- [ ] Frontend POS and Admin Reports pages load without blocking runtime errors.
- [ ] Required role-based test accounts are available and validated.
- [ ] Sprint 4 test data set is seeded and verified.
- [ ] Test plan and traceability matrix are reviewed by QA lead/dev lead.
- [ ] Defect logging template and severity workflow are agreed.

### 7.2 Exit Criteria

Sprint 4 QA sign-off can be recommended when:

- [ ] 100% of planned Critical and High test cases executed.
- [ ] At least 95% overall planned Sprint 4 test execution completed.
- [ ] 0 open Critical defects.
- [ ] 0 open High defects.
- [ ] All fixed defects retested and passed.
- [ ] No unresolved blocker on POS checkout, receipt generation, report filtering, or CSV export.
- [ ] Security authorization checks for Cashier/Admin paths pass.
- [ ] Regression smoke suite completed with no unresolved high-impact regression.
- [ ] QA summary report drafted with release recommendation.

---

## 8. Risks and Mitigation

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Data quality issues affect report accuracy validation | Medium | High | Use controlled seed data with known expected totals |
| Timezone/date boundary mismatches in report filters | Medium | Medium | Include boundary test cases around UTC day transitions |
| Flaky UI behavior due to asynchronous loading | Medium | Medium | Add retry-safe test steps and explicit wait conditions |
| Role/token misconfiguration causes false failures | Medium | High | Maintain pre-validated token set and role verification checklist |
| Performance variability in local environment | High | Medium | Treat results as baseline only; compare relative trends |

---

## 9. Deliverables

- Sprint 4 QA test plan (this document).
- Sprint 4 traceability matrix (section 6).
- Detailed test cases (manual/API/security/regression/performance) to be executed next.
- Defect log and retest evidence.
- Final Sprint 4 QA summary report with sign-off recommendation.

---

End of Sprint 4 Test Plan.