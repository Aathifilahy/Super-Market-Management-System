## JMeter Performance Tests

We use Apache JMeter for load and stress testing of the Supermarket API.  
All test plans are located in `tests/performance/`.

### Member 4 – Load Test (Normal Traffic)

**Feature:** Simulate 50 concurrent customers browsing products.

**Test plan:** `tests/performance/load_test_member4.jmx`

**Configuration:**
- Threads: 50
- Ramp‑up: 30 seconds
- Loops per user: 3
- Think times: 1–2 seconds (realistic browsing)

**Test flow (per user):**
1. `POST /api/auth/login` – authenticate and extract JWT token.
2. `GET /api/products` – fetch all products.
3. `GET /api/products/category/food` – search products by existing category (`food`).

**Assertions:**
- HTTP response code = 200 for every request.
- Duration < 2000 ms (performance SLA).

**How to run (GUI mode):**
```bash
cd tests/performance
jmeter -t load_test_member4.jmx