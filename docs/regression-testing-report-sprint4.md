# Regression Testing Report - Sprint 4
## Online Supermarket Management System

| Field | Details |
|---|---|
| Report Version | 1.0 |
| Sprint | Sprint 4 |
| Test Type | Regression Testing |
| Execution Date | 2026-04-22 |
| Environment | Local QA (React + ASP.NET API + MySQL) |
| Frontend URL | http://localhost:3000 |
| API URL | http://localhost:5224/api |
| Prepared by | QA Engineer |

---

## 1) Regression Scope

Regression coverage executed for:

- Customer flow (shop, cart, orders)
- Login and role-based redirects
- Admin pages
- Inventory manager pages
- Supplier management
- Reports
- POS integration impact on shared features

---

## 2) Regression Checklist and Results

### A. Customer Flow (Shop, Cart, Orders)

| Check ID | Regression Check | Result | Notes |
|---|---|---|---|
| REG-CUS-001 | Customer login lands on customer flow (shop entry) | Pass | Redirect behavior correct for Customer role. |
| REG-CUS-002 | Product shop listing loads with valid pricing and stock badges | Pass | No rendering issues; product cards stable. |
| REG-CUS-003 | Add in-stock product to cart | Pass | Cart updates quantity and totals correctly. |
| REG-CUS-004 | Update cart quantity and remove item | Pass | Recalculation logic works as expected. |
| REG-CUS-005 | Checkout with valid shipping/payment data | Pass | Order created successfully and cart cleared. |
| REG-CUS-006 | Checkout blocked for empty cart | Pass | UI validation correctly blocks submission. |
| REG-CUS-007 | Customer order history page loads and details open | Pass | Existing order history accessible. |
| REG-CUS-008 | Newly placed customer order appears in history immediately | Fail | Delay/stale state observed until manual refresh in 2/4 runs. |

### B. Login + Role Redirects

| Check ID | Regression Check | Result | Notes |
|---|---|---|---|
| REG-AUTH-001 | Admin login redirects to admin area | Pass | Expected route behavior observed. |
| REG-AUTH-002 | Inventory Manager login redirects to inventory area | Pass | Correct role-based route. |
| REG-AUTH-003 | Cashier login redirects to POS page | Pass | Lands on `/cashier/pos` as expected. |
| REG-AUTH-004 | Customer login redirects to customer area | Pass | No cross-role leakage detected. |
| REG-AUTH-005 | Invalid credentials show friendly error | Pass | Authentication error handling stable. |
| REG-AUTH-006 | Unauthorized direct URL access is blocked | Pass | Protected routes enforce access control. |

### C. Admin Pages

| Check ID | Regression Check | Result | Notes |
|---|---|---|---|
| REG-ADM-001 | Admin dashboard/navigation links function | Pass | Navigation paths remain valid. |
| REG-ADM-002 | Admin products page CRUD baseline | Pass | No regression in product operations. |
| REG-ADM-003 | Admin staff list page loads | Pass | Staff list visible and data loads. |
| REG-ADM-004 | Click staff member opens selected profile | Fail | Redirects to current admin profile instead of selected staff profile. |
| REG-ADM-005 | Admin order operations page loads pending items | Pass | Data load and actions available. |

### D. Inventory Manager Pages

| Check ID | Regression Check | Result | Notes |
|---|---|---|---|
| REG-INV-001 | Inventory dashboard loads KPI blocks | Pass | Dashboard loads without errors. |
| REG-INV-002 | Inventory low-stock view returns expected products | Pass | Threshold behavior unchanged. |
| REG-INV-003 | Stock purchase creation updates inventory count | Pass | Data persistence and quantity increment validated. |
| REG-INV-004 | Inventory manager blocked from admin-only pages | Pass | RBAC enforcement working. |

### E. Supplier Management

| Check ID | Regression Check | Result | Notes |
|---|---|---|---|
| REG-SUP-001 | Supplier list loads for allowed roles | Pass | UI and API responses stable. |
| REG-SUP-002 | Create supplier with valid data | Pass | Supplier created and visible in list. |
| REG-SUP-003 | Edit supplier details | Pass | Changes persist after refresh. |
| REG-SUP-004 | Delete supplier with confirmation | Pass | Record removed as expected. |
| REG-SUP-005 | Duplicate supplier submission handled gracefully | Fail | Returns server error instead of controlled conflict message. |

### F. Reports

| Check ID | Regression Check | Result | Notes |
|---|---|---|---|
| REG-REP-001 | Daily sales report loads with default filters | Pass | Report renders and totals appear plausible. |
| REG-REP-002 | Monthly revenue report returns valid breakdown | Pass | Breakdown values render correctly. |
| REG-REP-003 | Top products report sorting works | Pass | Quantity/revenue toggles change order correctly. |
| REG-REP-004 | Invalid date range handling shows clear validation | Fail | Generic error shown; expected specific date validation message. |
| REG-REP-005 | CSV export downloads and opens correctly | Pass | Files are downloadable and parseable. |

### G. POS Integration Impact (Cross-Module Regression)

| Check ID | Regression Check | Result | Notes |
|---|---|---|---|
| REG-POS-001 | POS checkout decreases product stock reflected in shop/inventory | Pass | Stock sync observed across modules after refresh. |
| REG-POS-002 | POS-generated orders do not break customer order listing endpoint | Pass | Endpoint stable for mixed order types. |
| REG-POS-003 | Reports include POS paid orders in aggregates | Pass | Totals include POS transactions. |
| REG-POS-004 | Rapid POS payment submission prevents duplicate order creation | Fail | Duplicate order created under rapid submit attempts. |
| REG-POS-005 | POS receipt retrieval does not affect non-POS order details | Pass | Non-POS order detail behavior unaffected. |

---

## 3) Result Summary (Pass/Fail)

| Metric | Count |
|---|---:|
| Total Regression Checks Executed | 38 |
| Passed | 34 |
| Failed | 4 |
| Pass Rate | 89.47% |

### Module-wise Summary

| Area | Executed | Passed | Failed |
|---|---:|---:|---:|
| Customer flow | 8 | 7 | 1 |
| Login + role redirects | 6 | 6 | 0 |
| Admin pages | 5 | 4 | 1 |
| Inventory manager pages | 4 | 4 | 0 |
| Supplier management | 5 | 4 | 1 |
| Reports | 5 | 4 | 1 |
| POS integration impact | 5 | 4 | 1 |

---

## 4) Broken Features After Sprint 4

The following regressions/broken behaviors were identified:

1. Customer order history is not always refreshed immediately after checkout.
2. Admin staff profile navigation opens the wrong profile.
3. Duplicate supplier creation returns a server error instead of controlled validation/conflict handling.
4. Report invalid date range handling is not user-friendly (generic error).
5. POS rapid submit can create duplicate orders (high-impact integration defect).

---

## 5) Regression Defect List

| Defect ID | Defect Title | Area | Severity | Priority | Linked Check ID |
|---|---|---|---|---|---|
| S4-REG-001 | Customer orders list does not auto-refresh after checkout | Customer flow | S3 (Minor) | Medium | REG-CUS-008 |
| S4-REG-002 | Staff profile navigation opens current user profile instead of selected staff | Admin pages | S1 (Critical) | High | REG-ADM-004 |
| S4-REG-003 | Duplicate supplier returns HTTP 500 instead of conflict/validation | Supplier management | S2 (Major) | High | REG-SUP-005 |
| S4-REG-004 | Invalid report date range shows generic error message | Reports | S2 (Major) | Medium | REG-REP-004 |
| S4-REG-005 | Duplicate POS order created on rapid payment submit | POS integration impact | S1 (Critical) | High | REG-POS-004 |

---

## Final Summary

### Did Sprint 4 break any previous features?

Yes. Most legacy features remain stable, but a small set of regressions was detected in customer order refresh behavior, staff profile navigation, supplier duplicate handling, report validation UX, and POS duplicate-submit protection.

### Overall System Stability

Overall system stability is good for standard flows (89.47% regression pass rate), but not release-ready for production due to two critical regressions:

- Duplicate POS order creation on rapid submit
- Incorrect staff profile navigation

Recommendation: fix critical regressions first, then run targeted re-regression on POS checkout, staff navigation, supplier validation, and report filter error handling before Sprint 4 sign-off.
