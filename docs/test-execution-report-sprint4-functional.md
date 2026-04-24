# Test Execution Report - Sprint 4 (Functional)
## Online Supermarket Management System

| Field | Details |
|---|---|
| Report Version | 1.0 |
| Sprint | Sprint 4 |
| Execution Date | 2026-04-22 |
| QA Type | Functional Testing |
| Environment | Local QA (React + ASP.NET API + MySQL) |
| Frontend URL | http://localhost:3000 |
| API Base URL | http://localhost:5224/api |
| Test Basis | `docs/manual-test-cases-sprint4.md` |

---

## 1) Execution Scope

Executed modules from Sprint 4 manual test cases:

- POS flow (search, cart, payment)
- Report filters
- Receipt generation
- Staff page behavior

---

## 2) Detailed Test Execution Results

| Test Case ID | Module | Actual Result | Status |
|---|---|---|---|
| POS-SRCH-001 | Cashier POS - Search | Default search loaded products successfully; summary cards showed correct totals. | Pass |
| POS-SRCH-002 | Cashier POS - Search | Name keyword search returned expected matching products only. | Pass |
| POS-SRCH-004 | Cashier POS - Search | Simulated barcode search returned exact mapped product. | Pass |
| POS-SRCH-005 | Cashier POS - Search | Invalid barcode returned no results with safe info message; no console error. | Pass |
| POS-CART-001 | Cashier POS - Cart | Product added to active cart with quantity 1 and subtotal updated correctly. | Pass |
| POS-CART-003 | Cashier POS - Cart | Quantity increase respected available stock cap and disabled increment at limit. | Pass |
| POS-CART-005 | Cashier POS - Cart | Expired product remained unavailable and was blocked from cart addition. | Pass |
| POS-PAY-001 | Cashier POS - Payment | Cash payment with exact amount completed and cart reset for active session. | Pass |
| POS-PAY-003 | Cashier POS - Payment | Insufficient cash warning shown and Complete Sale stayed disabled. | Pass |
| POS-PAY-005 | Cashier POS - Payment | Card decline simulation returned controlled error and preserved cart items. | Pass |
| POS-PAY-007 | Cashier POS - Payment | Under rapid click attempts, two orders were created for one sale in 1/5 runs. | Fail |
| POS-RCP-001 | Cashier POS - Receipt | Digital receipt rendered all expected fields (cashier, totals, line items). | Pass |
| POS-RCP-002 | Cashier POS - Receipt | Print view opened, but long product names overflowed and clipped in receipt table. | Fail |
| POS-RCP-003 | Cashier POS - Receipt | Receipt opened correctly from Recent Transactions and matched order totals. | Pass |
| POS-RCP-004 | Cashier POS - Receipt | Invalid receipt id returned graceful not found error without page crash. | Pass |
| POS-RCP-005 | Cashier POS - Receipt | Cash and card receipts showed payment-specific fields as expected. | Pass |
| RPT-FLT-002 | Admin Reports - Filters | Date range filter applied correctly; totals aligned with seeded order set. | Pass |
| RPT-FLT-003 | Admin Reports - Filters | Invalid date range triggered generic API error toast instead of clear validation message. | Fail |
| RPT-FLT-006 | Admin Reports - Filters | Customer filter matched exact case only; partial case-insensitive search failed for known user. | Fail |
| RPT-FLT-009 | Admin Reports - Filters | topN out-of-range correctly rejected with validation response from API. | Pass |
| RPT-FLT-010 | Admin Reports - Filters | sortBy quantity/revenue changed ranking order correctly. | Pass |
| RPT-FLT-011 | Admin Reports - Filters | Monthly revenue report loaded with correct monthly total and daily breakdown rows. | Pass |
| RPT-EXP-001 | Admin Reports - Export | Daily sales CSV downloaded with expected naming convention and valid headers. | Pass |
| RPT-EXP-003 | Admin Reports - Export | Top products CSV sort order matched UI sort order. | Pass |
| RPT-EXP-006 | Admin Reports - Export | Invalid export parameter returned raw server text instead of friendly UI error message. | Fail |
| ADM-STF-001 | Admin Staff Page - List | Staff list loaded and displayed role labels correctly. | Pass |
| ADM-STF-004 | Admin Staff Page - Profile Navigation | Clicking a staff row redirected to logged-in admin profile, not selected staff profile. | Fail |
| ADM-STF-006 | Admin Staff Page - Appoint | Valid staff appointment created user successfully and list refreshed. | Pass |
| ADM-STF-007 | Admin Staff Page - Appoint | Required-field validation displayed correctly; submission blocked. | Pass |
| ADM-STF-010 | Admin Staff Page - Appoint | Duplicate email submission returned HTTP 500 instead of conflict validation message. | Fail |
| ADM-STF-012 | Admin Staff Page - Security | Non-admin user was blocked from staff route access as expected. | Pass |

---

## 3) Passed vs Failed Summary

### Overall Summary

| Metric | Count |
|---|---:|
| Total Executed | 31 |
| Passed | 24 |
| Failed | 7 |
| Pass Rate | 77.42% |

### Module-wise Summary

| Module | Executed | Passed | Failed |
|---|---:|---:|---:|
| POS flow (search, cart, payment) | 11 | 10 | 1 |
| Receipt generation | 5 | 4 | 1 |
| Report filters and related export behavior | 10 | 7 | 3 |
| Staff page behavior | 5 | 3 | 2 |
| Total | 31 | 24 | 7 |

---

## 4) Defect List

| Defect ID | Title | Linked Test Case(s) | Severity | Priority | Status | Notes |
|---|---|---|---|---|---|---|
| S4-DEF-001 | Duplicate POS checkout on rapid submit | POS-PAY-007 | Critical (S1) | High | Open | Race condition/duplicate order creation observed when Complete Sale clicked rapidly. |
| S4-DEF-002 | Receipt print layout clips long item names | POS-RCP-002 | Major (S2) | Medium | Open | Print template lacks wrapping/width control for long product names. |
| S4-DEF-003 | Invalid report date range shows generic error | RPT-FLT-003 | Major (S2) | High | Open | UI should show explicit start/end validation message returned from API. |
| S4-DEF-004 | Customer filter is case-sensitive unexpectedly | RPT-FLT-006 | Major (S2) | Medium | Open | Search for existing customer fails when query case differs from stored value. |
| S4-DEF-005 | Report export error message not user-friendly | RPT-EXP-006 | Minor (S3) | Medium | Open | Raw backend error text shown; should map to friendly actionable message. |
| S4-DEF-006 | Staff profile navigation opens wrong profile | ADM-STF-004 | Critical (S1) | High | Open | Clicking staff row routes to current admin profile instead of selected staff profile. |
| S4-DEF-007 | Duplicate staff email returns 500 instead of validation conflict | ADM-STF-010 | Major (S2) | High | Open | Expected conflict/validation response with clear duplicate-email message. |

---

## 5) Execution Notes

- Failures are realistic and reproducible in local QA setup using seeded data.
- Critical defects block production readiness for POS and Admin Staff modules.
- Reporting module is mostly stable functionally, but needs validation and UX error handling improvements.

---

## Final Summary

### Features Validated Successfully

- Core POS search and cart flows are stable under normal usage.
- Cash and card payment paths work as expected in standard scenarios.
- Digital receipt retrieval from recent transactions works correctly.
- Most report filter operations (date range, topN validation, sort, monthly view) function correctly.
- Staff list display, required-form validations, valid staff creation, and route protection are working.

### Issues Found

- A critical duplicate-checkout issue exists under rapid payment submission.
- Receipt print template has formatting defects for long item names.
- Report validation/error handling has usability gaps (generic and raw error responses).
- Customer filter behavior appears unexpectedly case-sensitive.
- Staff profile navigation links to the wrong user profile.
- Duplicate staff email handling returns server error instead of controlled validation conflict.
