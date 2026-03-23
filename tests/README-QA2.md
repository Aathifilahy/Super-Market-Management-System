# QA2 Automation Guide (Sprint 2)

This folder contains only QA2 scope:
- Selenium E2E tests
- API integration tests
- Coverage runner
- Performance baseline
- Master test runner
- Postman collection for API checks

## 1. Install dependencies

```bash
cd tests
npm install
```

## 2. Environment setup

Copy and edit env file:

```bash
cp .env.example .env
```

Minimum useful values:
- `API_BASE_URL` (default: `http://localhost:5224/api`)
- `FRONTEND_URL` (default: `http://localhost:3000`)
- `TEST_USER_EMAIL`
- `TEST_USER_PASSWORD`
- `TEST_PRODUCT_ID`

## 3. Run test suites

```bash
npm run test:selenium
npm run test:integration
npm run test:performance
npm run test:all
```

Coverage script:

```bash
npm run test:coverage
```

If your backend test project is not auto-detected:

```bash
TEST_PROJECT="path/to/Your.Tests.csproj" npm run test:coverage
```

## 4. Postman collection

Import:
- `tests/postman/Sprint2-QA2.postman_collection.json`

Run requests in numbered order (1 -> 13).
The login request auto-saves JWT token to collection variable `jwtToken`.

## 5. Notes

- Selenium selectors use common defaults and may require updates to match final UI selectors.
- API tests are designed to be resilient (skip where dependent data is missing).
- Performance output is saved to `tests/reports/performance-baseline.json`.
- Master summary is saved to `tests/reports/qa2-summary.json`.
