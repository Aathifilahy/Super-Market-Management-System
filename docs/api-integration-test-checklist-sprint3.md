# API & Integration Test Checklist / Report — Sprint 3
## Online Supermarket Management System (React + ASP.NET Web API + MySQL)

| Field | Details |
|---|---|
| Sprint | Sprint 3 |
| Prepared by | QA Engineer |
| Date | 2026-04-07 |
| Backend Base URL | http://localhost:5224 |
| API Base Path | /api |
| Database | MySQL (local) |
| Status | Draft |

---

## 1) Scope & Purpose

This checklist/report verifies Sprint 3 backend APIs and frontend-to-backend integration for:
- Supplier CRUD
- Stock purchases (atomic inventory update)
- Inventory dashboard + low-stock
- Admin report endpoints
- Staff listing / staff creation endpoints added for Sprint 3
- Role-based authorization behavior (401 vs 403)

Focus is on Sprint 3 functionality and regression impact on existing auth/role logic and product flows.

---

## 2) Environment / Preconditions

### 2.1 Required services
- Backend running: http://localhost:5224/swagger
- MySQL running and schema migrated to Sprint 3
- Frontend running: http://localhost:3000 (or next free port)

### 2.2 Authentication prerequisites
- Ability to obtain JWT access tokens for these roles:
  - Admin
  - InventoryManager
  - Customer
  - Cashier (if used)

### 2.3 Authorization note (important)
Sprint 3 controllers use role-based authorization:
- Suppliers: Admin, InventoryManager
- Stock purchases: Admin, InventoryManager
- Inventory: Admin, InventoryManager
- Admin Reports: Admin only
- Staff endpoints: Admin only (and staff creation additionally restricted to “Supervisor email”)

**Supervisor restriction (Create staff user):**
- Endpoint: POST /api/admin/users
- Requires Admin role AND caller email must equal the configured `Supervisor:Email` value.

---

## 3) Endpoints Under Test (Sprint 3)

### 3.1 Supplier APIs (Admin, InventoryManager)
- GET /api/suppliers?search=
- GET /api/suppliers/{id}
- POST /api/suppliers
- PUT /api/suppliers/{id}
- DELETE /api/suppliers/{id}

### 3.2 Stock Purchase APIs (Admin, InventoryManager)
- POST /api/stockpurchases
- GET /api/stockpurchases?supplierId=&productId=
- GET /api/stockpurchases/{id}

### 3.3 Inventory APIs (Admin, InventoryManager)
- GET /api/inventory/dashboard
- GET /api/inventory/low-stock?threshold=

### 3.4 Admin Report APIs (Admin)
- GET /api/admin/reports/daily-sales?date=
- GET /api/admin/reports/monthly-revenue?year=&month=
- GET /api/admin/reports/top-products?startDate=&endDate=&topN=&sortBy=
- GET /api/admin/reports/order-summary?startDate=&endDate=

### 3.5 Staff / Admin user APIs (Admin)
- GET /api/admin/users/staff?search=
- GET /api/admin/users/{id}
- POST /api/admin/users (Supervisor-only within Admin)

---

## 4) API Test Checklist (Execution Items)

### 4.1 Common checks (apply to ALL endpoints)
- [ ] Returns correct status code for success (200/201/204)
- [ ] Returns 400 with validation details for invalid input
- [ ] Returns 401 when Authorization header is missing/invalid
- [ ] Returns 403 when token is valid but role is not permitted
- [ ] Returns 500 only for true server errors (not expected in normal negative tests)
- [ ] Response payload schema is consistent (no breaking field changes)
- [ ] No sensitive data leakage (password hashes, internal stack traces)

### 4.2 Supplier CRUD APIs
**GET /api/suppliers**
- [ ] 200 returns list sorted by company name
- [ ] `search` filters by company name, contact person, or email (case-insensitive)
- [ ] Search returns empty list (200) when no matches
- [ ] 401 no token; 403 Customer/Cashier token

**GET /api/suppliers/{id}**
- [ ] 200 returns expected supplier
- [ ] 404 returns message “Supplier not found” for missing id

**POST /api/suppliers**
- [ ] 201 Created on valid payload
- [ ] 400 on missing/invalid required fields (ModelState)
- [ ] 409 on duplicate company name OR duplicate email
- [ ] Email stored normalized (lowercase/trim)

**PUT /api/suppliers/{id}**
- [ ] 200 updates supplier fields and returns updated supplier
- [ ] 404 for missing id
- [ ] 409 when trying to update to another supplier’s company name/email

**DELETE /api/suppliers/{id} (safe deletion)**
- [ ] 204 when supplier has no purchase history
- [ ] 409 when purchase history exists (must not delete)
- [ ] 404 for missing id

### 4.3 Stock Purchase API
**POST /api/stockpurchases (atomic behavior)**
- [ ] 201 Created on valid payload
- [ ] 400 when quantity <= 0 or purchasePrice <= 0
- [ ] 400 when expiryDate missing/default
- [ ] 404 when supplier not found or inactive
- [ ] 404 when product not found
- [ ] Inventory update is atomic with purchase record (no partial writes)

**GET /api/stockpurchases**
- [ ] 200 returns purchase history ordered by purchaseDate desc
- [ ] Filtering by supplierId works
- [ ] Filtering by productId works

**GET /api/stockpurchases/{id}**
- [ ] 200 returns correct purchase
- [ ] 404 returns “Stock purchase not found”

### 4.4 Inventory APIs
**GET /api/inventory/dashboard**
- [ ] 200 returns counts/totals
- [ ] Low stock count matches low-stock rule (default 10 unless product threshold set)

**GET /api/inventory/low-stock**
- [ ] 200 returns only products below threshold
- [ ] Returned products ordered by quantity then name
- [ ] `threshold` query:
  - [ ] 400 when threshold <= 0
  - [ ] works when threshold is provided

### 4.5 Report APIs
**Daily sales: GET /api/admin/reports/daily-sales**
- [ ] 200 returns totals and top 5 products
- [ ] Cancels + unpaid orders are excluded (Paid & not Cancelled)
- [ ] No-data day returns 200 with zeros and empty topProducts

**Monthly revenue: GET /api/admin/reports/monthly-revenue**
- [ ] 200 returns monthly total and daily breakdown
- [ ] 400 when month out of range (1..12)

**Top products: GET /api/admin/reports/top-products**
- [ ] 200 returns list limited by topN
- [ ] 400 when topN < 1 or > 100
- [ ] 400 when startDate > endDate
- [ ] sortBy supports quantity (default) or revenue

**Order summary: GET /api/admin/reports/order-summary**
- [ ] 200 returns grouping by status
- [ ] 400 when startDate > endDate

### 4.6 Staff listing / staff creation APIs
**GET /api/admin/users/staff**
- [ ] 200 returns users where Role != Customer (customers must not appear)
- [ ] Optional `search` filters by name/email/role
- [ ] 403 for InventoryManager/Customer

**GET /api/admin/users/{id}**
- [ ] 200 returns staff user
- [ ] 404 when id is Customer or not found

**POST /api/admin/users (Supervisor-only within Admin)**
- [ ] 201 Created when:
  - caller has Admin role
  - caller email equals configured Supervisor:Email
  - dto.Role is Admin / InventoryManager / Cashier
- [ ] 403 when caller is Admin but NOT the configured supervisor
- [ ] 400 when dto.Role invalid or Customer
- [ ] 409 when email already exists

---

## 5) Integration Test Scenarios (Frontend ↔ API ↔ DB)

### 5.1 Supplier management (UI workflow)
- Scenario: Add Supplier → appears in Supplier List → search returns it → edit supplier → delete supplier.
- Verify:
  - UI validation vs API validation alignment
  - Success feedback and list refresh
  - RBAC: Customer cannot access supplier UI or APIs

### 5.2 Stock purchase updates inventory
- Scenario: Record Stock Purchase for Product X with quantity Q.
- Verify:
  - Purchase recorded and visible in purchase history list
  - Product X quantity increases by Q
  - Product X expiryDate updates to purchase expiryDate

### 5.3 Low-stock lifecycle
- Scenario: Product Y is low stock → appears in low-stock list → replenish via stock purchase → disappears.
- Verify:
  - Threshold logic consistent (default 10 or product-specific threshold)
  - UI and API low-stock list match

### 5.4 Admin reports accuracy
- Scenario: Create paid orders (or mark paid) across dates → run daily/monthly/top-products/order-summary.
- Verify:
  - Paid & not Cancelled filters applied
  - Aggregation correctness (totals, counts, breakdown)
  - No-data behavior clean

### 5.5 Staff list → profile
- Scenario: Admin opens Staff page → list loads → click staff user → navigates to existing Profile page.
- Verify:
  - Only staff shown (no customers)
  - Profile page loads correct staff user data

---

## 6) Sample Request / Response Expectations (Generalized)

> Use `Authorization: Bearer <JWT>` for protected endpoints.

### 6.1 Create Supplier
**Request**
```http
POST /api/suppliers
Authorization: Bearer <JWT>
Content-Type: application/json

{
  "companyName": "Acme Foods",
  "contactPerson": "Jane Doe",
  "email": "supplier@example.com",
  "phone": "0771234567",
  "address": "45 Main Street",
  "taxIdOrVatNumber": "VAT-123" 
}
```
**Expected**
- 201 Created
- Body contains supplier id and normalized email

**Negative (duplicate)**
- 409 Conflict with message about duplicate company name or email

### 6.2 Record Stock Purchase (Atomic)
**Request**
```http
POST /api/stockpurchases
Authorization: Bearer <JWT>
Content-Type: application/json

{
  "supplierId": 1,
  "productId": 10,
  "quantity": 25,
  "purchasePrice": 120.50,
  "purchaseDate": "2026-04-07T00:00:00Z",
  "expiryDate": "2026-08-01T00:00:00Z"
}
```
**Expected**
- 201 Created
- Body includes purchase id, totalCost, supplierCompanyName, productName

**Negative (invalid numbers)**
- 400 Bad Request message: quantity and purchase price must be positive

### 6.3 Inventory Low Stock
**Request**
```http
GET /api/inventory/low-stock?threshold=10
Authorization: Bearer <JWT>
```
**Expected**
- 200 OK
- Response array of products with `isLowStock=true`

**Negative**
- threshold=0 → 400 Bad Request

### 6.4 Admin Daily Sales Report
**Request**
```http
GET /api/admin/reports/daily-sales?date=2026-04-07
Authorization: Bearer <JWT>
```
**Expected**
- 200 OK with:
  - date
  - totalSales
  - numberOfOrders
  - averageOrderValue
  - topSellingProducts (max 5)

---

## 7) Database Verification Points (Post-Flow Checks)

### After supplier creation
- Verify Suppliers table has new row
- Verify email stored normalized (lowercase)
- Verify isActive is true by default

### After stock purchase
- Verify StockPurchases table has new row with supplierId/productId/quantity/purchasePrice/purchaseDate
- Verify Products table:
  - quantity increased by purchase quantity
  - expiryDate updated
  - updatedAt updated
- Verify atomic behavior:
  - If API returns failure, neither purchase nor product update should persist

### After safe delete supplier
- If supplier has any StockPurchases rows:
  - delete must be blocked (409)
  - supplier row must remain

### After reports
- Validate that reports match Orders/OrderItems rows, respecting:
  - PaymentStatus = Paid
  - Status != Cancelled

### After staff creation
- Verify Users table:
  - role is one of Admin/InventoryManager/Cashier
  - passwordHash is populated (no plaintext)
  - user isActive true

---

## 8) API / Integration Test Result Summary Template

### 8.1 Execution summary
| Area | Total | Pass | Fail | Blocked | Not Run | Notes |
|---|---:|---:|---:|---:|---:|---|
| Supplier APIs |  |  |  |  |  |  |
| Stock Purchase APIs |  |  |  |  |  |  |
| Inventory APIs |  |  |  |  |  |  |
| Report APIs |  |  |  |  |  |  |
| Staff/Admin APIs |  |  |  |  |  |  |
| RBAC / Auth behavior |  |  |  |  |  |  |
| Integration scenarios |  |  |  |  |  |  |

### 8.2 Defect list (paste table)
| Defect ID | Title | Area | Steps to Reproduce | Expected | Actual | Severity | Status |
|---|---|---|---|---|---|---|---|
|  |  |  |  |  |  |  |  |

### 8.3 Sign-off recommendation
- Recommended status: (Ready / Not Ready)
- Rationale:
  - P0 failures:
  - Security/RBAC failures:
  - Data integrity failures:

