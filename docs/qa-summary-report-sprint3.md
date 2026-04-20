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

(Reference: `docs/manual-test-cases-sprint3.md` and `docs/api-integration-test-checklist-sprint3.md`.)

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
- Supplier endpoints returned expected codes (`200/201/404/409` where applicable).
- Stock purchase creation was validated as an atomic operation at the application level (insert purchase + update product quantity).
- Inventory low‑stock endpoint was validated with valid and invalid thresholds.
- Report endpoints were verified for parameter validation (month bounds, empty dataset handling) and correct role restrictions.

(Reference: `docs/api-integration-test-checklist-sprint3.md`.)

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

(Reference: `docs/performance-testing-sprint3-jmeter.md`.)

---

## 11. Defect Summary
Defects were captured using a structured template with severity/priority classification and retest tracking.

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

(Reference: `docs/defect-log-template-sprint3.md`.)

---

## 12. Overall Quality Assessment
Based on the final test cycle outcomes, Sprint 3 is assessed as **acceptable for academic submission and demonstration in a local environment**.

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

**Recommendation:** **Sign‑off (Pass)** for Sprint 3 release in the local student environment, with the practical recommendation that the team continues improving report query performance and formalises automated regression coverage in future sprints.
