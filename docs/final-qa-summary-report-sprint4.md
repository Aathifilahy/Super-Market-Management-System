# Final QA Summary Report - Sprint 4
## Online Supermarket Management System (React + ASP.NET Core API + MySQL)

| Field | Details |
|---|---|
| Report Version | 1.0 |
| Sprint | Sprint 4 |
| Report Date | 2026-04-22 |
| Prepared By | QA Engineer |
| Status | Final QA Consolidation |

---

## 1) Testing Scope

Sprint 4 QA execution covered:

1. Functional testing
2. Regression testing
3. Security testing
4. Performance testing (JMeter)
5. Code coverage evaluation (target 80%)

Feature areas included:

- Cashier POS flow (search, cart, payment, receipt)
- Multiple billing sessions
- Admin reports (filters and export)
- Admin staff operations
- Core legacy flows (customer, admin, inventory manager, supplier paths)

---

## 2) Functional Results

Source: Sprint 4 functional execution report.

| Metric | Value |
|---|---:|
| Total Executed | 31 |
| Passed | 24 |
| Failed | 7 |
| Pass Rate | 77.42% |

Key outcome:
- Core business paths are mostly working, but important defects remain in POS submit protection, receipt print layout robustness, report validation UX, and staff profile navigation.

---

## 3) Regression Results

Source: Sprint 4 regression testing report.

| Metric | Value |
|---|---:|
| Total Executed | 38 |
| Passed | 34 |
| Failed | 4 |
| Pass Rate | 89.47% |

Key outcome:
- Most prior-sprint functionality remains stable.
- Regression breaks are concentrated in a small number of high-impact edge paths.

---

## 4) Security Results

Source: Sprint 4 security testing report.

| Metric | Value |
|---|---:|
| Total Executed | 25 |
| Passed | 23 |
| Failed | 2 |
| Pass Rate | 92.00% |

Key outcome:
- No confirmed critical SQL injection, authentication bypass, or privilege-escalation exploit.
- Two medium-severity weaknesses remain (receipt print input-hardening and duplicate-staff error-contract handling).

---

## 5) Performance Results

Source: Sprint 4 JMeter performance report.

| Load Level | Overall Outcome |
|---|---|
| 50 concurrent users | Meets expectations for login, POS search, and report APIs baseline |
| 100 concurrent users | Does not fully meet expectations due to high report API latency/error rate and partial POS-search degradation |

Key outcome:
- System is acceptable for moderate concurrent usage.
- High concurrent analytics workloads require optimization before production-level confidence.

---

## 6) Code Coverage Summary

Source: Sprint 4 coverage summary report.

| Metric | Value |
|---|---:|
| Coverage Target | 80% |
| Frontend Line Coverage | 81.3% |
| Backend Line Coverage | 84.7% |
| Combined Overall Line Coverage | 83.0% |
| Target Met | Yes |

---

## 7) Defect Summary

### Consolidated High-Priority Issues

1. POS duplicate-order creation under rapid submit (Critical)
2. Admin staff profile navigation opens wrong profile (Critical)
3. Duplicate create paths returning 500 instead of controlled conflict/validation in staff/supplier flows (Major)
4. Report validation and export error handling not user-friendly (Major/Minor)
5. Receipt print rendering robustness issue for hostile/long markup-like product names (Medium)

### Defect Severity Snapshot

| Severity | Count (Unique Consolidated) |
|---|---:|
| Critical (S1) | 2 |
| Major (S2) | 3 |
| Medium (S3/Medium risk) | 1 |
| Minor | 1 |

---

## 8) Final System Quality Assessment

### Quality Position

- Functional completeness: Good, with targeted high-impact defects.
- Regression stability: Strong for most legacy features.
- Security posture: Good baseline controls; no critical exploit confirmed.
- Performance posture: Adequate at moderate load; insufficient at higher concurrent reporting load.
- Testability and maintainability: Acceptable, supported by coverage above target.

### Release/Submission Assessment

- For academic sprint submission: Acceptable with documented known issues and remediation plan.
- For production-grade release: Not ready until critical defects are fixed and re-validated.

Required pre-signoff fixes for stronger quality status:

1. Fix POS rapid-submit duplicate transaction issue.
2. Fix staff profile navigation defect.
3. Normalize duplicate-entity API errors to 409/validation responses.
4. Improve report validation/export error messaging.
5. Re-run targeted functional, regression, and security retests on affected paths.

---

## Final Summary - Overall System Readiness for Submission

- Sprint 4 is ready for submission with clear documentation of known defects and risk areas.
- Overall system quality is stable for demo and moderate-use scenarios.
- Final readiness status: Conditionally ready for submission, not fully release-ready for high-load production without the critical fixes above.
