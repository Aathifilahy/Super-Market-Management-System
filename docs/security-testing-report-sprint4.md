# Security Testing Report - Sprint 4
## Online Supermarket Management System

| Field | Details |
|---|---|
| Report Version | 1.0 |
| Sprint | Sprint 4 |
| Test Type | Security Testing |
| Execution Date | 2026-04-22 |
| Environment | Local QA (React + ASP.NET API + MySQL) |
| Frontend URL | http://localhost:3000 |
| API URL | http://localhost:5224/api |
| Prepared by | QA Engineer |

---

## 1) Security Scope

Security validation executed for:

- SQL injection testing
- XSS testing
- Authentication bypass attempts
- Role-based access validation
- API authorization checks

---

## 2) Security Test Cases and Results

### A. SQL Injection Testing

| Test Case ID | Target | Test Input / Attack Pattern | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|
| SEC-SQL-001 | POS product search query | ' OR 1=1 -- in q parameter | Request safely handled; no query expansion; no data leakage | API returned normal filtered/empty response; no SQL error signature exposed | Pass |
| SEC-SQL-002 | POS barcode search | POS-000001' OR '1'='1 | Input treated as plain text; no injection effect | No unauthorized data returned; invalid barcode path handled | Pass |
| SEC-SQL-003 | Reports customer filter | ' UNION SELECT password FROM Users -- | No schema/data leakage; request safely rejected or sanitized | No SQL trace leaked; request produced safe empty result | Pass |
| SEC-SQL-004 | Staff appoint email field | test@example.com'; DROP TABLE Users;-- | Payload stored/validated as invalid input; no DB impact | Validation blocked creation; no DB side effects observed | Pass |
| SEC-SQL-005 | Login email field | admin@example.com' OR '1'='1 | Authentication should fail without valid credentials | Login failed with standard invalid credentials response | Pass |

### B. XSS Testing

| Test Case ID | Target | Payload | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|
| SEC-XSS-001 | Supplier name input | <script>alert(1)</script> | Script should not execute; payload escaped/sanitized | Input not executed in UI rendering; no script popup observed | Pass |
| SEC-XSS-002 | Staff name input | <img src=x onerror=alert(1)> | Event handler script should not execute | UI displayed encoded/plain text; no code execution | Pass |
| SEC-XSS-003 | Customer profile name | <svg onload=alert(1)> | No script execution across profile and navigation header | No execution observed; rendering safe in tested views | Pass |
| SEC-XSS-004 | Report filter customer field | "><script>alert(1)</script> | Query must be handled safely; no reflected script in response | No reflected script execution in UI or API response | Pass |
| SEC-XSS-005 | Receipt print view item name | Product name with HTML tags and script pattern | Print view should render as text and not execute scripts | No script execution observed, but long HTML-like names caused layout distortion | Fail |

### C. Authentication Bypass Attempts

| Test Case ID | Scenario | Expected Result | Actual Result | Status |
|---|---|---|---|---|
| SEC-AUTH-001 | Access protected route without token | Redirect/deny access | Access blocked and redirected to login | Pass |
| SEC-AUTH-002 | Call protected API without Authorization header | 401 Unauthorized | 401 returned with safe message | Pass |
| SEC-AUTH-003 | Use malformed JWT token | 401 Unauthorized | Request rejected; token parse/validation failed safely | Pass |
| SEC-AUTH-004 | Use expired JWT token | 401 Unauthorized | Access denied as expected | Pass |
| SEC-AUTH-005 | Tamper JWT payload role claim without valid signature | Request rejected due to invalid signature | API returned 401; no privilege escalation | Pass |

### D. Role-Based Access Validation

| Test Case ID | Role | Access Attempt | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|
| SEC-RBAC-001 | Customer | Access admin reports page | Denied/redirected | Access denied correctly | Pass |
| SEC-RBAC-002 | Customer | Call admin reports API endpoint | 403/401 | 403 returned | Pass |
| SEC-RBAC-003 | InventoryManager | Access admin staff page | Denied | Access denied correctly | Pass |
| SEC-RBAC-004 | Cashier | Access customer cart/checkout routes (blocked in Sprint 4 design) | Denied | Route access blocked as expected | Pass |
| SEC-RBAC-005 | Admin | Access POS receipt by order id | Allowed for authorized scope | Access granted with valid token | Pass |

### E. API Authorization Checks

| Test Case ID | Endpoint Category | Check | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|
| SEC-API-001 | POS APIs | Cashier token can access POS search/checkout/receipt/history | Allowed | All tested POS endpoints accessible with cashier token | Pass |
| SEC-API-002 | POS APIs | Customer token attempts POS checkout | Forbidden | 403 returned | Pass |
| SEC-API-003 | Admin reports APIs | Admin token access | Allowed | Access works for all tested report endpoints | Pass |
| SEC-API-004 | Admin reports APIs | Non-admin token access export endpoints | Forbidden | 403 returned | Pass |
| SEC-API-005 | Staff/admin APIs | Duplicate staff create error response content | Should not reveal sensitive internals | Response returned generic server error; no stack trace leaked, but API contract weak | Fail |

---

## 3) Findings

### Confirmed Findings

1. Receipt print rendering weakness for hostile/HTML-like long product names.
2. Staff creation duplicate-email path returns server error (500) instead of controlled authorization-safe validation contract.

### Not Observed During This Cycle

- No successful SQL injection was observed.
- No successful stored or reflected XSS execution was observed in tested UI paths.
- No authentication bypass was achieved.
- No role escalation was achieved.
- No unauthorized API data exposure was observed through tested role boundaries.

---

## 4) Vulnerability Register

| Vulnerability ID | Title | Area | Severity | Risk | Recommendation |
|---|---|---|---|---|---|
| S4-SEC-001 | Receipt print view vulnerable to markup/layout abuse (potential UI injection vector) | POS receipt printing | Medium | Can misrender printed receipts and may open future vector if rendering strategy changes | Escape and normalize receipt strings in print template, enforce max length and safe encoding |
| S4-SEC-002 | Duplicate staff email returns HTTP 500 instead of controlled conflict response | Admin staff API | Medium | Weak error contract can aid endpoint probing and reduces predictable security behavior | Return 409 conflict with structured validation body; centralize exception mapping |

---

## 5) Security Result Summary

| Metric | Count |
|---|---:|
| Total Security Tests Executed | 25 |
| Passed | 23 |
| Failed | 2 |
| Pass Rate | 92.00% |

---

## Final Summary

### Major Vulnerabilities Found

- No critical SQL injection, authentication bypass, or privilege escalation vulnerability was confirmed.
- Two medium-severity security weaknesses were found:
  - Receipt print rendering is not robust against hostile/HTML-like product-name content.
  - Staff duplicate-email API path returns internal-server style failure instead of controlled validation conflict.

### System Security Status

System security status is moderately strong for Sprint 4 core controls:

- Authentication and token validation are functioning correctly.
- Role-based and API authorization boundaries are largely enforced.
- Injection and XSS protections were effective in tested mainline paths.

However, the system is not yet security-clean for release sign-off until the two medium findings are remediated and re-tested.
