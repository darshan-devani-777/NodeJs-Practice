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
  }' | jq
  
  Expected response:

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
  }' | jq
  
  Sample response:

{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6..."
}Copy this `token` for next requests.

---

### 3.3. Get All Users (Protected, with Drizzle pagination, search, sorting & field selection) – `GET /users`

- Requires **Authorization header**: `Bearer <token>`
- Uses `verifyToken` middleware (checks JWT).
- Returns all **non-deleted** users (where `deletedAt IS NULL`) without password.
- Supports **optional query params** using Drizzle query builder:
  - `page` – page number (default 1)
  - `limit` – page size (default: all)
  - `search` – filters by `name` or `email` using `LIKE '%search%'`
  - `sortBy` – field to sort by: `id`, `name`, `email`, `createdAt`, `updatedAt` (default: `createdAt`)
  - `order` – sort order: `asc` or `desc` (default: `desc`)
  - `fields` – comma-separated list of fields to return: `id,name,email,createdAt,updatedAt` (default: all fields)

**Basic example:**

```bash
TOKEN=put_your_token_here

curl -X GET "http://localhost:6000/users?page=1&limit=10&search=test" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" | jq
```

**With sorting (Drizzle `orderBy`):**

```bash
TOKEN=put_your_token_here

# Sort by name ascending
curl -X GET "http://localhost:6000/users?sortBy=name&order=asc" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" | jq

# Sort by createdAt descending (newest first - default)
curl -X GET "http://localhost:6000/users?sortBy=createdAt&order=desc" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" | jq
```

**With field selection (Drizzle column projection):**

```bash
TOKEN=put_your_token_here

# Get only id, name, and email fields
curl -X GET "http://localhost:6000/users?fields=id,name,email" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" | jq
```

**Combined example (pagination + search + sorting + field selection):**

```bash
TOKEN=put_your_token_here

curl -X GET "http://localhost:6000/users?page=1&limit=5&search=test&sortBy=name&order=asc&fields=id,name,email" \
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
      "email": "test@example.com"
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

### 3.5. Update User Profile (Protected, Drizzle `update().set()`) – `PUT /users/:id`

- **Feature:** Demonstrates Drizzle's **`update().set()`** API for conditional field updates.
- Requires `Authorization: Bearer <token>`.
- **Body (JSON):** `name` and/or `email` (at least one required).
- Uses Drizzle `update(users).set({ name, email }).where(eq(users.id, id))`.
- Automatically updates `updatedAt` timestamp (handled by MySQL `ON UPDATE CURRENT_TIMESTAMP`).

```bash
TOKEN=put_your_token_here

# Update name only
curl -X PUT http://localhost:6000/users/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Updated Name"
  }' | jq

# Update email only
curl -X PUT http://localhost:6000/users/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "email": "newemail@example.com"
  }' | jq

# Update both name and email
curl -X PUT http://localhost:6000/users/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Updated Name",
    "email": "newemail@example.com"
  }' | jq
```

Example response:

```json
{
  "message": "User updated successfully",
  "data": {
    "id": 1,
    "name": "Updated Name",
    "email": "newemail@example.com",
    "createdAt": "...",
    "updatedAt": "...",
    "deletedAt": null
  }
}
```

**Why Drizzle?**  
Drizzle's `update().set()` allows you to **conditionally build update objects** in JavaScript, making it easy to update only the fields that are provided, without writing raw SQL strings.

---

### 3.6. Soft Delete User (Protected, Drizzle `update`) – `DELETE /users/:id`

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

### 3.7. User Stats (Protected, Drizzle aggregate) – `GET /users/stats`

- Demonstrates Drizzle **aggregates with `sql\`\``**:
  - `total` – count of all rows
  - `active` – count where `deletedAt IS NULL`

```bash
TOKEN=put_your_token_here

curl -X GET http://localhost:6000/users/stats \
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

---

## 4. Drizzle ORM Features Demonstrated

This project showcases the following **Drizzle ORM features**:

### ✅ **Query Builder Features:**
- **`select()`** – Select queries with column projection
- **`from()`** – Table references
- **`where()`** – Conditional filtering with `eq`, `and`, `or`, `like`, `isNull`
- **`orderBy()`** – Sorting with `asc()` and `desc()`
- **`limit()` & `offset()`** – Pagination
- **`insert().values()`** – Insert operations
- **`update().set()`** – Update operations with conditional field updates
- **`sql\`\``** – Raw SQL expressions for aggregates

### ✅ **Advanced Features:**
- **Soft Delete Pattern** – Using `deletedAt` with automatic filtering
- **Dynamic Query Building** – Composing queries based on request parameters
- **Column Projection** – Selecting only specific fields for performance
- **Conditional Updates** – Updating only provided fields

### ✅ **Why Drizzle ORM?**
1. **Type-Safe Queries** – Column references (`users.name`) instead of raw strings
2. **Composable** – Build queries step-by-step with method chaining
3. **SQL-like Syntax** – Familiar API that maps directly to SQL
4. **Flexible** – Mix typed queries with raw SQL when needed
5. **No Runtime Overhead** – Generates optimized SQL queries
