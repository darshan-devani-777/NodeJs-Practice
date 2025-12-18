# Drizzle ORM + MySQL + JWT Auth Demo

Simple Node.js + Express project using **Drizzle ORM (MySQL)**, **bcrypt** (password hash) and **JWT** (token based auth).

Server runs on: `http://localhost:6000`

---

## 1. Setup

### 1.1. Install dependencies

npm install(Already in `package.json`: `express`, `drizzle-orm`, `mysql2`, `bcryptjs`, `jsonwebtoken`, `dotenv`)

### 1.2. MySQL database & table

Create database and `users` table:

CREATE DATABASE drizzle_demo;
USE drizzle_demo;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deletedAt TIMESTAMP NULL
);

### 1.3. Environment variables

You can set these in your terminal (or `.env` if you add dotenv config):

export DB_HOST=localhost
export DB_PORT=3306
export DB_USER=root
export DB_PASSWORD=your_mysql_password
export DB_NAME=drizzle_demo

export JWT_SECRET=your_jwt_secret_key---

## 2. Run server

npm startServer log:

Server running on port http://localhost:6000---

## 3. REST APIs

Base URL: `http://localhost:6000`

### 3.1. Register User – `POST /users/register`

- **Body (JSON):** `name`, `email`, `password`
- Password is **hashed with bcrypt** before saving.
- Password is **never returned** in response.

curl -X POST http://localhost:6000/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "mypassword"
  }' | jqExpected response:

{
  "message": "User registered successfully",
  "data": {
    "id": 1,
    "name": "Test User",
    "email": "test@example.com"
  }
}---

### 3.2. Login User – `POST /users/login`

- **Body (JSON):** `email`, `password`
- Compares password using **bcrypt.compare**
- On success, returns a **JWT token**.

curl -X POST http://localhost:6000/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "mypassword"
  }' | jqSample response:

{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6..."
}Copy this `token` for next requests.

---

### 3.3. Get All Users (Protected, with Drizzle pagination & search) – `GET /users`

- Requires **Authorization header**: `Bearer <token>`
- Uses `verifyToken` middleware (checks JWT).
- Returns all **non-deleted** users (where `deletedAt IS NULL`) without password.
- Supports **optional query params** using Drizzle query builder:
  - `page` – page number (default 1)
  - `limit` – page size (default: all)
  - `search` – filters by `name` or `email` using `LIKE '%search%'`

```bash
TOKEN=put_your_token_here

curl -X GET "http://localhost:6000/users?page=1&limit=10&search=test" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" | jq
```

Example response:

```json
{
  "message": "Fetched users successfully",
  "data": [
    {
      "id": 1,
      "name": "Test User",
      "email": "test@example.com",
      "createdAt": "...",
      "updatedAt": "...",
      "deletedAt": null
    }
  ]
}
```

---

### 3.4. Get Single User by ID (Protected, ignores soft-deleted) – `GET /users/:id`

- Requires `Authorization: Bearer <token>`.
- Internally uses Drizzle `where(and(eq(id), isNull(deletedAt)))`.

```bash
TOKEN=put_your_token_here

curl -X GET http://localhost:6000/users/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" | jq
```

---

### 3.5. Soft Delete User (Protected, Drizzle `update`) – `DELETE /users/:id`

- Marks user as deleted by setting `deletedAt = NOW()` using Drizzle `update`.
- Deleted users are automatically excluded from:
  - `GET /users`
  - `GET /users/:id`

```bash
TOKEN=put_your_token_here

curl -X DELETE http://localhost:6000/users/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" | jq
```

Sample response:

```json
{
  "message": "User soft-deleted successfully"
}
```

---

### 3.6. User Stats (Protected, Drizzle aggregate) – `GET /users/stats`

- Demonstrates Drizzle **aggregates with `sql\`\``**:
  - `total` – count of all rows
  - `active` – count where `deletedAt IS NULL`

```bash
TOKEN=put_your_token_here

curl -X GET http://localhost:6000/users/stats/summary \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" | jq
```

Example response:

```json
{
  "message": "User stats fetched successfully",
  "data": {
    "total": 5,
    "active": 4
  }
}
```
