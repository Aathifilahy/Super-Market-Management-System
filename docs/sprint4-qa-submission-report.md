# Sprint 4 QA Submission Report
## Online Supermarket Management System

Date: 2026-04-22  
Prepared by: QA Engineer  
Sprint: Sprint 4

---

## 1. Introduction

Sprint 4 focused on expanding the system with a cashier POS workflow, multiple billing sessions, enhanced report filtering/export capabilities, and staff-management refinements. QA was executed to verify both the new functionality and the stability of existing modules delivered in previous sprints.

This report consolidates the full QA effort into one submission-ready summary, highlighting what was tested, what worked well, what issues were identified, and the final quality assessment.

---

## 2. Testing Overview

### Short Test Plan (Sprint 4)

QA objectives for Sprint 4 were:

- Validate new Sprint 4 features end-to-end.
- Protect previous sprint functionality through focused regression testing.
- Confirm role-based access and API authorization behavior.
- Evaluate performance under moderate and high concurrent load.
- Maintain code quality confidence with coverage tracking.

### Scope Covered

- Functional testing:
  - POS flow (search, cart, payment, receipt)
  - Multiple billing sessions
  - Admin reports (filters and export)
  - Admin staff page (list, appoint, profile navigation)
- Regression testing:
  - Customer, admin, inventory manager, supplier, reporting baselines
- Security testing:
  - SQL injection, XSS, authentication bypass, RBAC, API authorization
- Performance testing (JMeter):
  - Login, POS search, report APIs at 50 and 100 users
- Code coverage review against the 80% target

### Test Case Summary

- Total Sprint 4 manual test cases designed: 72
- Coverage was balanced across positive, negative, edge, and validation paths
- Critical user journeys were prioritized as P0/P1

---

## 3. Key Results

### Test Execution Summary

| Stream | Executed | Passed | Failed | Pass Rate |
|---|---:|---:|---:|---:|
| Functional | 31 | 24 | 7 | 77.42% |
| Regression | 38 | 34 | 4 | 89.47% |
| Security | 25 | 23 | 2 | 92.00% |

### Code Coverage Summary

| Area | Line Coverage | Target (80%) |
|---|---:|---:|
| Frontend | 81.3% | Met |
| Backend | 84.7% | Met |
| Overall | 83.0% | Met |

### Key Achievements

- Core Sprint 4 features were validated with structured scenario coverage.
- Most regression checks passed, indicating strong stability for existing modules.
- Security controls performed well in tested paths, with no confirmed critical exploit.
- Coverage target was achieved across the codebase.

---

## 4. Highlights (Sample Test Evidence)

To make the submission more concrete, below are representative sample test cases and outcomes from each QA stream.

### 4.1 Functional Testing Samples

| Sample Test Case ID | Area | Sample Test | Expected | Actual | Status |
|---|---|---|---|---|---|
| POS-PAY-001 | POS Payment | Complete cash payment with exact tendered amount | Sale completes and receipt is generated | Transaction completed and receipt displayed with correct totals | Pass |
| POS-PAY-005 | POS Payment | Simulate card decline | Controlled failure and cart remains intact | Error shown and cart preserved | Pass |
| POS-PAY-007 | POS Payment | Rapid repeated submit on Complete Sale | Only one order should be created | Duplicate order created under rapid clicks in repeat run | Fail |
| ADM-STF-004 | Staff Page | Click staff row to open selected staff profile | Selected staff profile opens | Current admin profile opened instead of selected staff | Fail |
| RPT-FLT-003 | Reports | Apply invalid start/end date range | User-friendly validation error | Generic error message shown | Fail |

### 4.2 Regression Testing Samples

| Sample Check ID | Area | Sample Regression Check | Result |
|---|---|---|---|
| REG-CUS-003 | Customer Flow | Add in-stock product to cart | Pass |
| REG-CUS-005 | Customer Flow | Place customer order via checkout | Pass |
| REG-CUS-008 | Customer Flow | New order appears immediately in order history | Fail (delayed refresh observed) |
| REG-ADM-002 | Admin Pages | Product CRUD baseline after Sprint 4 changes | Pass |
| REG-POS-004 | POS Integration | Prevent duplicate orders on rapid payment submit | Fail |

### 4.3 Security Testing Samples

| Sample Test Case ID | Category | Attack/Check | Result |
|---|---|---|---|
| SEC-SQL-001 | SQL Injection | Use `' OR 1=1 --` in POS search query | Pass (no injection effect) |
| SEC-XSS-002 | XSS | Submit `<img src=x onerror=alert(1)>` in input fields | Pass (no script execution) |
| SEC-AUTH-004 | Authentication | Use expired JWT token on protected endpoint | Pass (401 returned) |
| SEC-RBAC-002 | RBAC | Customer token calls admin reports API | Pass (403 returned) |
| SEC-API-005 | API Authorization/Error Contract | Duplicate staff create should return controlled conflict | Fail (500 response pattern) |

### 4.4 Performance Testing Samples (JMeter)

| Scenario | Users | Avg Response Time (ms) | Throughput (req/s) | Error Rate | Result |
|---|---:|---:|---:|---:|---|
| Login API | 50 | 182 | 28.6 | 0.20% | Pass |
| Login API | 100 | 346 | 51.4 | 1.80% | Pass (watch) |
| POS Search API | 50 | 238 | 35.9 | 0.40% | Pass |
| POS Search API | 100 | 512 | 61.7 | 2.60% | Partial Pass |
| Reports API (Daily Sales) | 100 | 1415 | 24.4 | 4.90% | Fail |

### 4.5 Sample Defect Records

| Defect ID | Summary | Severity | Current State |
|---|---|---|---|
| S4-DEF-001 | Duplicate POS checkout on rapid submit | Critical | Open |
| S4-DEF-006 | Staff profile navigation opens wrong profile | Critical | Open |
| S4-DEF-003 | Invalid report date range shows generic error | Major | Open |

---

## 5. Major Findings

### Defect Summary

| Severity | Count |
|---|---:|
| Critical | 2 |
| Major | 3 |
| Medium | 1 |
| Minor | 1 |

### Most Important Open Issues

1. Duplicate POS order creation under rapid payment submit (critical).
2. Staff profile navigation opening the wrong profile (critical).
3. Duplicate create flows (staff/supplier) returning HTTP 500 instead of controlled conflict/validation responses.
4. Report filter/export validation messaging not user-friendly in error paths.
5. Receipt print rendering robustness issue with long/hostile markup-like item names.

### Regression Summary

- Previous features are largely intact and stable.
- A limited set of regressions was identified, mainly in edge/error behavior rather than broad functional collapse.

---

## 6. Performance Summary

JMeter scenarios executed:

- Login API
- POS Search API
- Report APIs (daily sales, monthly revenue, top products)

Load levels:

- 50 users
- 100 users

Outcome summary:

- At 50 users: system mostly meets performance expectations.
- At 100 users: report APIs show significant latency/error growth and do not fully meet expectations.
- POS search remains usable at 100 users but shows noticeable degradation.

Performance verdict:

- Suitable for moderate concurrent use.
- Requires optimization for high concurrent reporting workloads.

---

## 7. Security Summary

Security coverage included:

- SQL injection attempts
- XSS attempts
- Authentication bypass attempts
- Role-based access validation
- API authorization checks

Outcome summary:

- No confirmed critical SQL injection, authentication bypass, or privilege-escalation vulnerability.
- Role boundaries and API authorization controls are mostly effective.
- Two medium-severity security weaknesses were identified (receipt print hardening and duplicate-staff error-contract handling).

Security verdict:

- Security baseline is good for sprint scope.
- Fixes are still required before a stronger production-grade sign-off.

---

## 8. Final Conclusion

Sprint 4 QA outcomes show a system that is feature-complete for submission with strong progress in functionality, regression stability, security controls, and coverage discipline. The team delivered meaningful improvements and the majority of critical workflows are operating correctly.

At the same time, a small number of high-impact defects remain, especially around rapid POS submission handling and staff profile navigation. Performance is acceptable at moderate load, but reporting endpoints need optimization for heavier concurrency.

Final QA decision:

- Ready for direct sprint submission with documented known issues.
- Conditionally acceptable quality for academic/demo release.
- Not fully production-ready until critical defects are fixed and targeted re-testing is completed.

---

## Summary of QA Activities Completed in Sprint 4

- Prepared and finalized Sprint 4 test plan and traceability mapping.
- Designed complete manual test case set (72 cases) across new Sprint 4 modules.
- Executed functional testing with pass/fail evidence and defect capture.
- Executed regression testing across all key legacy modules.
- Executed security testing across injection, XSS, auth, RBAC, and API authorization paths.
- Executed JMeter performance testing at 50-user and 100-user load levels.
- Consolidated defect inventory with severity and priority analysis.
- Reviewed code coverage and confirmed achievement of 80% target.
- Produced final QA quality assessment and submission-readiness recommendation.
