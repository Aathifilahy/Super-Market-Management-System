# Sprint 3 — Performance Testing Plan & Report (Apache JMeter)

Project: Online Supermarket Management System (Sprint 3)

Tech stack (local): React frontend • ASP.NET Core Web API • MySQL

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
