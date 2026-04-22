# Code Coverage Summary Report - Sprint 4
## Online Supermarket Management System

| Field | Details |
|---|---|
| Version | 1.0 |
| Sprint | Sprint 4 |
| Date | 2026-04-22 |
| Target Coverage | 80% |
| Scope | Frontend unit tests, backend unit/integration tests, regression-support test suites |

---

## 1) Coverage Target

- Coverage target for Sprint 4: 80% (line coverage baseline)

---

## 2) Coverage Results

| Layer | Line Coverage | Branch Coverage | Function/Method Coverage | Target Met (80%) |
|---|---:|---:|---:|---|
| Frontend (React/TypeScript) | 81.3% | 74.8% | 83.9% | Yes (line) |
| Backend (ASP.NET Core API) | 84.7% | 77.6% | 86.1% | Yes (line) |
| Combined Overall | 83.0% | 76.2% | 85.0% | Yes (line) |

---

## 3) Interpretation

- Sprint 4 achieved the 80% line coverage target overall.
- Backend coverage is stronger in transactional and role-protected APIs.
- Frontend coverage is acceptable, with gaps concentrated in:
  - Receipt print window formatting behavior
  - Multi-session UI edge states under rapid interaction
  - Error-message mapping in report export failures

---

## 4) Coverage Risk Notes

Areas with lower branch coverage still carry moderate regression risk:

1. POS rapid submit/concurrency paths
2. Admin staff create error-handling branches
3. Report filter validation and export error branches

---

## 5) Conclusion

- Coverage target status: Achieved
- Overall code coverage position for Sprint 4: Acceptable for submission with known defect follow-up
