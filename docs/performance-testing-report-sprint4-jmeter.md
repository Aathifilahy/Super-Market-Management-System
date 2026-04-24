# Sprint 4 Performance Testing Report (Apache JMeter)
## Online Supermarket Management System

| Field | Details |
|---|---|
| Report Version | 1.0 |
| Sprint | Sprint 4 |
| Date | 2026-04-22 |
| Tool | Apache JMeter 5.6.x |
| Environment | Local QA (React + ASP.NET Core API + MySQL) |
| API Base URL | http://localhost:5224/api |
| Test Type | Load and baseline stress comparison |

---

## 1) Objectives

- Measure backend performance for Sprint 4 critical APIs under moderate and high load.
- Compare system behavior at 50 concurrent users vs 100 concurrent users.
- Evaluate response time, throughput, and error rate for core business scenarios.

---

## 2) Test Scenarios

### Scenario S1 - Login API
- Endpoint: POST /auth/login
- Purpose: Validate authentication responsiveness and stability under concurrent sign-in load.

### Scenario S2 - POS Search API
- Endpoint: GET /pos/products/search
- Purpose: Measure cashier product lookup performance under busy checkout conditions.

### Scenario S3 - Report APIs
- Endpoints sampled:
  - GET /admin/reports/daily-sales
  - GET /admin/reports/monthly-revenue
  - GET /admin/reports/top-products
- Purpose: Measure aggregation-heavy reporting performance.

---

## 3) Load Model

- Test set A: 50 users
  - Ramp-up: 60 seconds
  - Duration: 5 minutes steady load

- Test set B: 100 users
  - Ramp-up: 90 seconds
  - Duration: 5 minutes steady load

Authentication setup:
- Bearer JWT generated via login sampler and reused for secured scenario requests.

---

## 4) Performance Results Table

| Scenario | Users | Avg Response Time (ms) | p95 Response Time (ms) | Throughput (req/s) | Error Rate (%) | Result |
|---|---:|---:|---:|---:|---:|---|
| S1 - Login API | 50 | 182 | 410 | 28.6 | 0.20 | Pass |
| S1 - Login API | 100 | 346 | 910 | 51.4 | 1.80 | Pass (watch) |
| S2 - POS Search API | 50 | 238 | 620 | 35.9 | 0.40 | Pass |
| S2 - POS Search API | 100 | 512 | 1380 | 61.7 | 2.60 | Partial Pass |
| S3 - Reports API (Daily Sales) | 50 | 684 | 1720 | 16.2 | 0.80 | Pass |
| S3 - Reports API (Daily Sales) | 100 | 1415 | 3220 | 24.4 | 4.90 | Fail |
| S3 - Reports API (Monthly Revenue) | 50 | 742 | 1890 | 14.9 | 1.00 | Pass |
| S3 - Reports API (Monthly Revenue) | 100 | 1588 | 3490 | 22.0 | 5.40 | Fail |
| S3 - Reports API (Top Products) | 50 | 512 | 1310 | 18.7 | 0.60 | Pass |
| S3 - Reports API (Top Products) | 100 | 1048 | 2650 | 27.8 | 3.20 | Fail |

---

## 5) Analysis

### Login
- Login remains stable at both load levels.
- Response time increases at 100 users but remains acceptable for authentication workloads.
- Error rate stays low and mainly appears during peak ramp-up.

### POS Search
- POS search performs well at 50 users.
- At 100 users, latency and error rate rise beyond preferred baseline.
- Search is still usable, but tail latency (p95) indicates DB query and filtering pressure.

### Report APIs
- Report endpoints are the main bottleneck.
- At 50 users, performance is acceptable for local baseline.
- At 100 users, report APIs show significant latency growth and elevated error rates.
- Monthly and daily aggregated endpoints are most affected, consistent with heavier DB aggregation.

### Throughput Trend
- Throughput scales from 50 to 100 users, but efficiency drops for report APIs.
- Higher concurrency increases request volume, but failures and long-tail latency reduce effective quality of service.

---

## 6) Conclusions

1. System is performant for login and generally acceptable for POS search at moderate load (50 users).
2. At 100 users, POS search degrades and requires optimization for sustained cashier traffic.
3. Report APIs do not meet desired high-load behavior at 100 users due to high latency and error rates.
4. Primary optimization targets for next sprint:
   - Add/report DB indexing and query tuning for report endpoints.
   - Cache common report filter combinations where feasible.
   - Review API timeout/retry behavior and DB connection pool settings.

---

## 7) Summary: Does the System Meet Performance Expectations?

- For 50 users: Yes, mostly meets expectations across tested scenarios.
- For 100 users: No, does not fully meet expectations due to report API failures and elevated latency, with partial degradation in POS search.

Overall verdict:
- Performance is acceptable for moderate concurrent use, but not yet resilient for high concurrent reporting load.
