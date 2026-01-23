# 🚀 Node.js End-to-End Testing Demo

A comprehensive, **production-ready Node.js backend application** showcasing industry-standard **API testing strategies** used by experienced backend developers.

This project demonstrates how to structure, implement, and run **unit, integration, API end-to-end, and browser end-to-end tests** in a real-world Node.js application.

---

## ✨ Key Features

* ✅ **Complete User Management System** (CRUD + Authentication)
* 🧪 **Full Testing Pyramid**: Unit, Integration, API E2E, Browser E2E
* 🏗 **Production-Ready Architecture** with clean separation of concerns
* 🛡 **Security Best Practices** (Helmet, validation, error handling)
* 🗄 **Real Database Testing** using MongoDB (isolated per test run)
* 🌐 **Browser Automation** with Playwright (cross-browser)
* 🧩 **Simple Frontend UI** for manual and browser-based testing

---

## 🛠 Tech Stack

### Backend

* **Node.js 18+** – Runtime
* **Express.js** – Web framework
* **MongoDB + Mongoose** – Database & ODM
* **JWT** – Authentication
* **bcryptjs** – Password hashing

### Testing

* **Jest** – Test runner & assertions
* **Supertest** – HTTP & API testing
* **Playwright** – Browser E2E automation
* **mongodb-memory-server** – In-memory MongoDB for test isolation

### Tooling & DevOps

* **ESLint** – Code linting
* **Helmet** – Security headers
* **CORS** – Cross-origin support

---

## 📁 Project Structure

```
├── src/
│   ├── config/                 # App & database configuration
│   ├── controllers/            # HTTP request handlers
│   ├── middleware/             # Express middleware
│   ├── models/                 # Mongoose schemas
│   ├── routes/                 # API routes & validation
│   ├── services/               # Business logic layer
│   ├── utils/                  # Shared utilities
│   └── server.js               # App entry point
│
├── tests/
│   ├── setup.js                # Global test setup
│   ├── unit/                   # Unit tests
│   ├── integration/            # Integration & API E2E tests
│   └── playwright/             # Browser E2E tests
│
├── public/                     # Simple frontend UI
├── playwright.config.js        # Playwright configuration
├── run-tests.js                # Full test runner
├── package.json                # Scripts & dependencies
└── README.md                   # Documentation
```

---

## 🚀 Getting Started

### Prerequisites

* **Node.js 18+**
* **npm** or **yarn**

---

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd nodejs-e2e-testing-demo
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment configuration (optional)**

   ```bash
   cp config.env.example .env
   ```

4. **Start the application**

   ```bash
   # Development
   npm run dev

   # Production
   npm start
   ```

---

### Application URLs

* **API**: [http://localhost:3000/api](http://localhost:3000/api)
* **Frontend UI**: [http://localhost:3000](http://localhost:3000)
* **Health Check**: [http://localhost:3000/health](http://localhost:3000/health)

---

## 🧪 Testing Strategy

This project follows a **testing pyramid** approach:

```
Browser E2E (Playwright)
        ▲
API E2E (Supertest + Jest)
        ▲
Integration Tests
        ▲
Unit Tests
```

---

### 1️⃣ Unit Tests (Jest)

**Scope**

* Models
* Services
* Utilities

**Characteristics**

* No HTTP server
* No real database
* Fast and isolated

---

### 2️⃣ Integration Tests (Jest + Supertest)

**Scope**

* API routes
* Middleware
* Controllers + database

**Characteristics**

* Real Express app
* In-memory MongoDB
* Validates request/response behavior

---

### 3️⃣ API End-to-End Tests (Jest + Supertest)

**Scope**

* Full user workflows

  * Register → Login → Update → Delete
* Error handling scenarios
* Multi-user interactions

**Characteristics**

* Real HTTP calls
* Real database behavior
* No browser involved

---

### 4️⃣ Browser End-to-End Tests (Playwright)

**Scope**

* Frontend UI flows
* Real user interactions

**Characteristics**

* Runs in Chromium, Firefox, WebKit
* Uses real backend APIs
* Tests the full system from UI → DB

---

## 🏃 Running Tests

### Run All Tests

```bash
npm run test:full
```

---

### Individual Test Suites

```bash
# Unit tests
npm run test:unit

# Integration tests
npm run test:integration

# API E2E tests
npm run test:e2e-api

# Browser E2E tests
npm run test:e2e-browser
```

---

### Coverage

```bash
npm run test:coverage
```

---

### Advanced Usage

```bash
# Run a specific Jest file
npx jest tests/unit/models/User.test.js

# Watch mode
npx jest --watch

# Run a single Playwright test
npx playwright test tests/playwright/browser-e2e.spec.js
```

---

## 📚 API Documentation

### Base URL

```
http://localhost:1010/api
```

---

### User Endpoints

| Method | Endpoint                   | Description      |
| ------ | -------------------------- | ---------------- |
| GET    | /users                     | Get all users    |
| GET    | /users/:id                 | Get user by ID   |
| POST   | /users                     | Create user      |
| PUT    | /users/:id                 | Update user      |
| DELETE | /users/:id                 | Soft delete user |
| POST   | /users/login               | User login       |
| PUT    | /users/:id/change-password | Change password  |

---

### Example Request

```js
await fetch('/api/users', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    password: 'password@123'
  })
});
```

---

## 🎯 Best Practices Demonstrated

### Testing

* Test isolation with in-memory DB
* Realistic workflows
* Clean setup & teardown
* Cross-browser testing
* Clear separation of test layers

### Architecture

* Layered design (Routes → Controllers → Services → Models)
* Centralized error handling
* Validation at API boundaries
* Middleware-driven design

### Production Readiness

* Health checks
* Secure headers
* Environment-based configuration
* Graceful shutdown patterns

---