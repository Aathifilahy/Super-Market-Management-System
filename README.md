# Super-Market-Management-System

Supermarket Management System is a full-stack web application for managing products, user accounts, shopping cart flow, and customer orders.

It includes:

- ASP.NET Core Web API backend
- React + TypeScript frontend
- MySQL database
- JWT authentication and authorization
- Selenium smoke test for product flow

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
- Testing
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

## Project Structure

~~~text
Super-Market-Management-System/
	SupermarketAPI/           # ASP.NET Core Web API
		Controllers/            # Auth, Cart, Orders, Products
		Data/                   # DbContext and EF config
		Models/                 # Entity models and DTOs
		Services/               # Cart, Order, JWT services
		Interfaces/             # Service and repository interfaces
	frontend/                 # React app
		src/pages/              # UI pages
		src/services/           # API client services
		src/types/              # TypeScript models/types
		src/context/            # Auth context provider
	tests/selenium/           # Selenium test script
	docs/                     # Test reports, plans, QA sheets, Postman docs
~~~

## Prerequisites

- .NET SDK 10
- Node.js LTS and npm
- MySQL server running locally
- Google Chrome (for Selenium test)

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

## Troubleshooting

### Backend cannot connect to database

- Verify MySQL is running on localhost:3306
- Verify username/password in appsettings.json
- Verify database name in connection string

### 401 Unauthorized on protected endpoints

- Login first to get JWT
- Ensure Authorization header is present as Bearer token
- Verify Jwt settings are consistent and key length is at least 32 chars

### Frontend cannot call backend

- Ensure backend is running on http://localhost:5224
- Ensure frontend API base URL matches backend URL
- Ensure CORS in Program.cs allows http://localhost:3000

### Cart update fails with product mismatch

- Current backend cart update requires the matching productId for the cart item.
- Frontend cartApi resolves this automatically before sending the update request.

## Security Notes

- Do not commit real production secrets to appsettings.json.
- Move JWT key and database credentials to environment variables or secret manager for production.
- Use HTTPS and secure cookie/token strategies in production environments.

### Dev note: create an Admin user (local)

Sprint 2 customer registration always creates a Customer account. For local testing of inventory actions,
promote a user to Admin directly in MySQL.

In the Users table the Role is stored as an integer enum:

- 0 = Customer
- 1 = Admin
- 2 = InventoryManager
- 3 = Cashier

Example:

~~~sql
SELECT id, email, role FROM users;
UPDATE users SET role = 1 WHERE email = 'admin@gmail.com';
~~~

## License

See LICENSE file in the repository root.
