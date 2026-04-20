# Defect Log / Bug Report Template — Sprint 3
## Online Supermarket Management System (React + ASP.NET Web API + MySQL)

| Field | Details |
|---|---|
| Sprint | Sprint 3 |
| Prepared by | QA Engineer |
| Date | 2026-04-07 |
| Status | Draft |

---

## 1) Severity & Priority Definitions

### Severity (Impact)
- **S1 — Critical**: Security/RBAC bypass, data corruption, system crash, core Sprint 3 feature unusable, or prevents testing/usage.
- **S2 — Major**: Core functionality broken but limited workaround exists; incorrect business behavior; significant UI/API failure.
- **S3 — Minor**: Non-blocking issue; cosmetic/UI alignment; minor validation message issues; low user impact.
- **S4 — Trivial**: Typos, minor layout inconsistencies, low-value improvements.

### Priority (Fix urgency)
- **P0 — Must Fix (Immediate)**: Must be fixed before Sprint 3 sign-off/release.
- **P1 — High**: Should be fixed in Sprint 3 if possible; may be acceptable only with explicit approval.
- **P2 — Medium**: Fix if time permits; can be scheduled.
- **P3 — Low**: Backlog/optional.

---

## 2) Defect Log Template (Submission Table)

| Defect ID | Title | Module | Environment | Reported By | Date Reported | Steps to Reproduce | Expected Result | Actual Result | Evidence (Screenshots/Logs) | Severity | Priority | Frequency | Status | Assigned To | Target Fix Version | Retest Result | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| DEF-S3-001 |  |  | Local (Win) | QA | 2026-04-__ |  |  |  |  |  |  | Always/Sometimes/Rare | New |  | Sprint 3 |  |  |

**Evidence guidance**
- UI defects: screenshot + browser console error
- API defects: request + response + HTTP status code
- DB defects: relevant table snapshots (row counts, changed fields)

---

## 3) Sample Filled Defect Log (Realistic Sprint 3 Examples)

| Defect ID | Title | Module | Environment | Date Reported | Steps to Reproduce | Expected Result | Actual Result | Evidence | Severity | Priority | Frequency | Status |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| DEF-S3-001 | Duplicate supplier email not blocked | Supplier Management | Local | 2026-04-07 | 1. Login as InventoryManager<br>2. Add Supplier with email `abc@sup.com`<br>3. Add another supplier with same email | API returns 409 and UI shows duplicate error | Supplier created twice; list shows duplicates | Swagger POST logs + DB rows | S2 | P0 | Always | New |
| DEF-S3-002 | Supplier deletion allowed despite linked purchases | Supplier Management | Local | 2026-04-07 | 1. Create supplier S<br>2. Record stock purchase with supplier S<br>3. Delete supplier S | Delete blocked with 409 conflict | Supplier deleted; purchase history now has broken supplier reference | API response + DB FK error/log | S1 | P0 | Always | New |
| DEF-S3-003 | Stock purchase updates wrong product quantity | Stock Purchase | Local | 2026-04-07 | 1. Product A qty=10, Product B qty=20<br>2. Create purchase for Product A qty=5<br>3. Refresh inventory list | Product A qty becomes 15 | Product B qty becomes 25 (or A unchanged) | Before/after inventory screenshots | S1 | P0 | Always | New |
| DEF-S3-004 | Stock purchase saved but inventory not updated (non-atomic) | Stock Purchase | Local | 2026-04-07 | 1. Induce failure (stop DB mid-request) during purchase create | Transaction rolls back; no purchase saved | Purchase record exists but product qty unchanged | DB shows purchase row but no product update | S1 | P0 | Sometimes | New |
| DEF-S3-005 | Low-stock alert not clearing after replenishment | Low-Stock Alerts | Local | 2026-04-07 | 1. Product qty=2 appears low-stock<br>2. Record purchase qty=50<br>3. Refresh low-stock page | Product removed from low-stock list | Product still shown as low-stock | Low-stock page + inventory qty proof | S2 | P1 | Always | New |
| DEF-S3-006 | Daily sales report total does not match DB paid orders | Admin Reports | Local | 2026-04-07 | 1. Create 2 paid orders totalling 100<br>2. Open daily-sales report for date | totalSales=100, numberOfOrders=2 | totalSales shows 0 or wrong value | Report screenshot + DB query output | S2 | P0 | Always | New |
| DEF-S3-007 | Inventory Manager can see Admin Reports tab/link | RBAC / Routing | Local | 2026-04-07 | 1. Login as InventoryManager<br>2. Observe navigation | Admin-only tabs hidden | Admin Reports link visible and clickable | Screenshot of nav | S2 | P1 | Always | New |
| DEF-S3-008 | Customer can open protected URL directly (reports) | RBAC / Routing | Local | 2026-04-07 | 1. Login as Customer<br>2. Navigate to `/admin/reports` via URL bar | Redirect/Access denied | Reports page loads with data | Screen recording + API calls show 200 | S1 | P0 | Always | New |
| DEF-S3-009 | Staff list shows customer accounts | Admin Staff | Local | 2026-04-07 | 1. Login as Admin<br>2. Open staff list | Only non-customer roles displayed | Customers appear in staff list | Screenshot of list showing customer role/email | S2 | P0 | Always | New |
| DEF-S3-010 | Clicking staff opens wrong profile | Admin Staff | Local | 2026-04-07 | 1. Open staff list<br>2. Click staff user John<br>3. Profile page opens | John’s profile loaded | Logged-in user profile (or wrong staff) loads | Video + URL + network calls | S2 | P1 | Sometimes | New |
| DEF-S3-011 | Reports page crashes on empty dataset | Admin Reports | Local | 2026-04-07 | 1. Select date range with no paid orders<br>2. Load top-products report | Empty state renders | Blank page / JS error | Console stack trace screenshot | S2 | P1 | Always | New |
| DEF-S3-012 | Date filter off-by-one (timezone) | Admin Reports | Local | 2026-04-07 | 1. Create paid order at 00:30 local time<br>2. Run daily-sales for that date | Order counted in selected day | Order counted in previous/next day | DB orderDate + report output | S2 | P1 | Sometimes | New |

---

## 4) Bug Status Workflow (Recommended)

- **New** → QA logged defect, awaiting triage
- **Triaged** → confirmed validity, severity/priority agreed
- **Assigned** → developer owner set
- **In Progress** → fix being implemented
- **Fixed** → developer claims fix complete (PR merged)
- **Ready for Retest** → deployed/runnable in QA environment
- **Re-Test Pass** → QA verified fix; close defect
- **Re-Test Fail** → still reproducible; return to Assigned/In Progress
- **Blocked** → cannot validate due to environment/dependency
- **Deferred** → agreed not to fix in Sprint 3

---

## 5) Recommended Retest Checklist (After Fixes)

### Sprint 3 functional retest
- [ ] Suppliers: create/edit/search/delete (including duplicate and delete-with-purchases)
- [ ] Stock purchase: create purchase + verify inventory quantity + expiryDate update
- [ ] Low-stock: verify list updates after replenishment
- [ ] Reports: daily/monthly/top-products/order-summary with and without data
- [ ] Staff: staff list excludes customers; click staff opens correct profile; appoint staff works

### RBAC/security retest
- [ ] Customer blocked from Admin + Inventory pages and APIs (direct URL + API calls)
- [ ] InventoryManager blocked from Admin-only report/staff endpoints
- [ ] 401 vs 403 responses are correct (no token vs wrong role)

### Regression retest
- [ ] Login/logout still works
- [ ] Role-based redirects still correct
- [ ] Product list and product CRUD still work
- [ ] Cart/orders flows still work (smoke)

