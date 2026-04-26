# Super-Market-Management-System

Supermarket Management System is a full-stack web application for managing products, user accounts, shopping cart flow, and customer orders.

It includes:

- ASP.NET Core Web API backend
- React + TypeScript frontend
- MySQL database
- JWT authentication and authorization
- Selenium smoke test for product flow
- JMeter performance tests (load + stress)

## Contents

- Overview
- Features
- Technology Stack
- Project Structure
- Prerequisites
- Configuration
- Run the Project Locally
- API Overview
- Frontend Routes
- Testing (including JMeter performance tests)
- Troubleshooting
- Security Notes

## Overview

The project started with product CRUD and has been expanded with authentication, profile management, shopping cart, checkout, and order history.

Backend base URL in development:

- http://localhost:5224

Frontend URL in development:

- http://localhost:3000

## Features

### Product Management

- Create, update, delete products
- List all products
- Filter by category
- View low stock products

### Authentication and Profile

- Register and login with JWT
- Password hashing with BCrypt
- Profile view and update
- Change password
- Remember me support in frontend (localStorage/sessionStorage)

### Cart

- Add items to cart
- Update quantities
- Remove items
- Clear cart
- Cart summary totals

### Checkout and Orders

- Checkout with shipping address and payment method
- Place order from cart
- Order list and order details
- Dedicated order details page and quick dialog view

## Technology Stack

### Backend

- ASP.NET Core (net10.0)
- Entity Framework Core + Pomelo MySQL provider
- AutoMapper
- JWT Bearer authentication
- BCrypt for password hashing
- Swagger

### Frontend

- React + TypeScript (Create React App)
- Material UI
- React Router
- React Hook Form
- Axios

### Database

- MySQL

### Testing Tools

- **Selenium** – smoke test (UI)
- **JMeter** – load & stress testing (performance)
- **Postman** – API testing (documentation)

## Project Structure

~~~text
Super-Market-Management-System/
├── SupermarketAPI/           # ASP.NET Core Web API
│   ├── Controllers/          # Auth, Cart, Orders, Products
│   ├── Data/                 # DbContext and EF config
│   ├── Models/               # Entity models and DTOs
│   ├── Services/             # Cart, Order, JWT services
│   └── Interfaces/           # Service and repository interfaces
├── frontend/                 # React app
│   └── src/
│       ├── pages/            # UI pages
│       ├── services/         # API client services
│       ├── types/            # TypeScript models
│       └── context/          # Auth context provider
├── tests/
│   ├── selenium/             # Selenium test script
│   ├── performance/          # JMeter load & stress tests
│   └── postman/              # Postman collections
└── docs/                     # Test reports, plans, QA sheets
~~~

## Prerequisites

- .NET SDK 10
- Node.js LTS and npm
- MySQL server running locally
- Google Chrome (for Selenium test)
- **Java** (for JMeter)
- **JMeter 5.6+** (download from https://jmeter.apache.org)

## Configuration

### Backend configuration file

File: SupermarketAPI/appsettings.json

Key sections:

- ConnectionStrings:DefaultConnection
- Jwt:Issuer
- Jwt:Audience
- Jwt:Key
- Jwt:ExpiresInMinutes

Important:

- Use your local MySQL credentials in DefaultConnection.
- Replace Jwt:Key with a strong random secret of at least 32 characters.

### Backend launch URL

File: SupermarketAPI/Properties/launchSettings.json

- Development HTTP URL: http://localhost:5224

### Frontend API URL

File: frontend/src/services/api.ts

- API base URL: http://localhost:5224/api

## Run the Project Locally

### 1) Start backend

~~~powershell
cd SupermarketAPI
dotnet restore
dotnet build
dotnet run
~~~

Swagger (development):

- http://localhost:5224/swagger

### 2) Start frontend

~~~powershell
cd frontend
npm install
npm start
~~~

Frontend app:

- http://localhost:3000

### 3) Optional Selenium smoke test

Prerequisite: backend and frontend must already be running.

~~~powershell
cd tests/selenium
npm install
npm test
~~~

### 4) JMeter performance tests (Members 4 & 5)

See detailed section below.

## Database Notes

The application uses EF Core and also includes features that were introduced with manual MySQL setup during development.

Ensure the database contains required tables:

- Products
- Users
- Cart
- CartItems
- Orders
- OrderItems

If your local database is fresh, run migrations for EF-managed schema and execute the required SQL setup for manually introduced tables/procedures used by auth/cart/order flows.

## API Overview

### Products (public)

- GET /api/products
- GET /api/products/{id}
- GET /api/products/category/{category}
- GET /api/products/lowstock?threshold=10

### Products (admin/staff only)

- POST /api/products (Admin, InventoryManager)
- PUT /api/products/{id} (Admin, InventoryManager)
- DELETE /api/products/{id} (Admin, InventoryManager)

### Auth

- POST /api/auth/register
- POST /api/auth/login
- GET /api/auth/profile (auth required)
- PUT /api/auth/profile (auth required)
- POST /api/auth/change-password (auth required)

### Cart (auth required)

- GET /api/cart
- POST /api/cart/items
- PUT /api/cart/items/{id}
- DELETE /api/cart/items/{id}
- DELETE /api/cart/clear

### Orders (auth required)

- POST /api/orders
- GET /api/orders
- GET /api/orders/{id}

## Frontend Routes

- / (Landing)
- /shop (Customer storefront)
- /admin/products (Inventory list)
- /add-product (Admin/InventoryManager)
- /edit-product/:id (Admin/InventoryManager)
- /register
- /login
- /profile
- /cart
- /checkout
- /orders
- /orders/:id

## Testing

### QA test sheet

Use this file for execution tracking:

- docs/qa-test-sheet-auth-cart-orders.md

### Manual E2E flow

Suggested verification flow:

1. Registration
2. Login
3. Profile update and password change
4. Add to cart and update cart
5. Checkout
6. Orders list and details

### JMeter Performance Tests (Members 4 & 5)

We use **Apache JMeter** to validate system performance under load and stress.

#### Test files location

All JMeter test plans and results are in `tests/performance/`:
