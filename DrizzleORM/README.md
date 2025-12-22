# Drizzle ORM + MySQL + JWT Auth Demo

Simple Node.js + Express project using **Drizzle ORM (MySQL)**, **bcrypt** (password hash) and **JWT** (token based auth).

Server runs on: `http://localhost:6000`

---

## 1. Setup

### 1.1. Install dependencies

npm install(Already in `package.json`: `express`, `drizzle-orm`, `mysql2`, `bcryptjs`, `jsonwebtoken`, `dotenv`)

### 1.2. MySQL database & tables

Create database and tables:

```sql
CREATE DATABASE drizzle_demo;
USE drizzle_demo;

-- Users table
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deletedAt TIMESTAMP NULL,
  INDEX email_idx (email),
  INDEX created_at_idx (createdAt)
);

-- Posts table (for Relations/Joins demo)
CREATE TABLE posts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deletedAt TIMESTAMP NULL,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  INDEX user_id_idx (userId),
  INDEX post_created_at_idx (createdAt)
);
```

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

### 3.8. Get User Count (Protected, Drizzle count query) – `GET /users/count`

- **Feature:** Demonstrates Drizzle **separate count queries** (different from stats).
- Returns total count of users matching search criteria.
- Uses Drizzle `sql\`COUNT(*)\`` with same filters as `findAll`.

```bash
TOKEN=put_your_token_here

# Get total count
curl -X GET "http://localhost:6000/users/count" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" | jq

# Get count with search filter
curl -X GET "http://localhost:6000/users/count?search=test" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" | jq
```

Example response:

```json
{
  "message": "User count fetched successfully",
  "data": { "count": 10 }
}
```

---

### 3.9. Batch Create Users (Protected, Drizzle batch insert) – `POST /users/batch`

- **Feature:** Demonstrates Drizzle **batch insert** - insert multiple records at once.
- Uses Drizzle `.insert(users).values([{...}, {...}])` for performance.

```bash
TOKEN=put_your_token_here

curl -X POST http://localhost:6000/users/batch \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "users": [
      { "name": "User 1", "email": "user1@example.com", "password": "pass123" },
      { "name": "User 2", "email": "user2@example.com", "password": "pass123" },
      { "name": "User 3", "email": "user3@example.com", "password": "pass123" }
    ]
  }' | jq
```

Example response:

```json
{
  "message": "Users created successfully",
  "data": { "insertedCount": 3 }
}
```

**Why Drizzle?**  
Batch insert is much faster than individual inserts. Drizzle's `.values([...])` makes it easy to insert multiple records in a single query.

---

### 3.10. Register User with Post (Drizzle Transactions) – `POST /users/register-with-post`

- **Feature:** Demonstrates Drizzle **transactions** - atomic operations.
- Creates user + default post in a transaction (if one fails, both rollback).
- Uses Drizzle `db.transaction(async (tx) => { ... })`.

```bash
curl -X POST http://localhost:6000/users/register-with-post \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "mypassword",
    "createDefaultPost": true
  }' | jq
```

**Why Drizzle?**  
Transactions ensure data integrity. If user creation succeeds but post creation fails, the entire operation rolls back automatically.

---

### 3.11. Get User Posts (Protected, Drizzle Relations/Joins) – `GET /users/:id/posts`

- **Feature:** Demonstrates Drizzle **relations with `innerJoin`**.
- Returns all posts for a user with user details included.
- Uses Drizzle `.innerJoin(users, eq(posts.userId, users.id))`.

```bash
TOKEN=put_your_token_here

# Get all posts for user
curl -X GET "http://localhost:6000/users/1/posts" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" | jq

# With pagination and sorting
curl -X GET "http://localhost:6000/users/1/posts?page=1&limit=5&sortBy=createdAt&order=desc" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" | jq
```

Example response:

```json
{
  "message": "User posts fetched successfully",
  "data": [
    {
      "id": 1,
      "title": "My First Post",
      "content": "This is my first post!",
      "userId": 1,
      "createdAt": "...",
      "updatedAt": "...",
      "user": {
        "id": 1,
        "name": "Test User",
        "email": "test@example.com"
      }
    }
  ]
}
```

**Why Drizzle?**  
Drizzle's join API is type-safe and composable. You can join multiple tables and select specific columns from each.

---

### 3.12. Get Posts Grouped by User (Protected, Drizzle Group By) – `GET /users/posts/grouped-by-user`

- **Feature:** Demonstrates Drizzle **`groupBy()` and `having()`**.
- Groups posts by user and counts posts per user.
- Uses Drizzle `.groupBy(posts.userId).having(sql\`COUNT(*) > 0\`)`.

```bash
TOKEN=put_your_token_here

curl -X GET http://localhost:6000/users/posts/grouped-by-user \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" | jq
```

Example response:

```json
{
  "message": "Posts grouped by user fetched successfully",
  "data": [
    {
      "userId": 1,
      "userName": "Test User",
      "userEmail": "test@example.com",
      "postCount": 5
    },
    {
      "userId": 2,
      "userName": "Another User",
      "userEmail": "another@example.com",
      "postCount": 3
    }
  ]
}
```

**Why Drizzle?**  
Group by operations are common in analytics. Drizzle's `groupBy()` and `having()` make it easy to aggregate data.

---

### 3.13. Get Users Grouped by Creation Date (Protected, Drizzle Group By) – `GET /users/grouped-by-date`

- **Feature:** Demonstrates Drizzle **`groupBy()` with date functions**.
- Groups users by creation date and counts users per day.
- Uses Drizzle `.groupBy(sql\`DATE(createdAt)\`)`.

```bash
TOKEN=put_your_token_here

curl -X GET http://localhost:6000/users/grouped-by-date \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" | jq
```

Example response:

```json
{
  "message": "Users grouped by creation date fetched successfully",
  "data": [
    {
      "date": "2024-01-15",
      "userCount": 5
    },
    {
      "date": "2024-01-16",
      "userCount": 3
    }
  ]
}
```

---

### 3.14. Create Post (Protected, Drizzle Relations) – `POST /posts`

- **Feature:** Demonstrates Drizzle **foreign key relationships**.
- Creates a post linked to a user via `userId` foreign key.

```bash
TOKEN=put_your_token_here

curl -X POST http://localhost:6000/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "userId": 1,
    "title": "My Post Title",
    "content": "This is the post content"
  }' | jq
```

---

### 3.15. Get Post by ID (Protected, Drizzle Join) – `GET /posts/:id`

- **Feature:** Demonstrates Drizzle **join with user data**.
- Returns post with user information included.

```bash
TOKEN=put_your_token_here

curl -X GET http://localhost:6000/posts/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" | jq
```

---

### ✅ **Drizzle Studio**
- Drizzle Kit is a CLI tool for managing SQL database
npm i -D drizzle-kit 

- Create drizzle.config.js file
use db credentials & schema & dialect

- Run Drizzle Studio
npx drizzle-kit studio

- starting Drizzle Studio, the web interface (by default, it should be at http://localhost:3000/)


## 4. Drizzle ORM Features Demonstrated

This project showcases the following **Drizzle ORM features**:

### ✅ **Query Builder Features:**
- **`select()`** – Select queries with column projection
- **`from()`** – Table references
- **`where()`** – Conditional filtering with `eq`, `and`, `or`, `like`, `isNull`
- **`orderBy()`** – Sorting with `asc()` and `desc()`
- **`limit()` & `offset()`** – Pagination
- **`insert().values()`** – Insert operations (single & batch)
- **`update().set()`** – Update operations with conditional field updates
- **`sql\`\``** – Raw SQL expressions for aggregates

### ✅ **Relations & Joins:**
- **`innerJoin()`** – Inner joins between tables
- **Foreign Keys** – Referential integrity with `references()`
- **Relations** – One-to-many relationships (users → posts)

### ✅ **Advanced Features:**
- **Transactions** – `db.transaction()` for atomic operations
- **Batch Operations** – Insert multiple records at once
- **Count Queries** – Separate count methods
- **Group By / Having** – `groupBy()` and `having()` for aggregations
- **Indexes** – Performance optimization with `index()`
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

### **Implemented Drizzle ORM features — summary**

**Core features**
**Setup MVC structure with MySQL + Drizzle ORM**
Separated models, controllers, routes
Centralized schema in schema.js with table definitions
Connected Drizzle to MySQL using mysql2 pool

**Implemented authentication flow with bcrypt + JWT**
**Added user registration with password hashing
Added login with credential validation and JWT token generation
Created verifyToken middleware for protected routes

**Query builder features**
**Added Drizzle-powered user queries**
Implemented findAll, findOne, findByEmail using Drizzle select, where, eq
Replaced raw SQL strings with Drizzle column references

**Integrated Drizzle-based soft delete**
Added softDelete using update().set({ deletedAt })
Auto-filtered soft-deleted records in all queries with isNull(deletedAt)

**Applied pagination and search with Drizzle query builder**
**Added limit, offset for pagination
Implemented search with like, or, and operators

**Created Drizzle aggregate stats endpoint**
Used sql\\`` for COUNT(*) and conditional SUM() aggregations

**Advanced Drizzle features**
**Implemented update user profile with Drizzle update().set()**
Conditional field updates (name and/or email)
Dynamic update object building without raw SQL

**Added ordering/sorting with Drizzle orderBy**
Implemented sortBy and order params using asc() and desc()
Default sorting by createdAt DESC

**Applied column projection for performance**
Added fields param to select specific columns
Dynamic select({ id: users.id, name: users.name, ... }) building

**Implemented relations/joins with Drizzle**
Created posts table with foreign key to users
Added innerJoin to fetch user posts with user details
Demonstrated one-to-many relationships

**Added transactions for atomic operations**
Implemented db.transaction() for user + post creation
Automatic rollback on 

**Created batch insert functionality**
Added batchCreate using .insert().values([...])
Insert multiple users in a single query

**Implemented separate count queries**
Added count() method with same filters as findAll
Uses sql\COUNT()\`` for efficient counting

**Applied Group By / Having aggregations**
Implemented groupBy() and having() for posts grouped by user
Added date-based grouping for users with GROUP_CONCAT

**Added indexes in schema for performance**
Defined indexes on email, createdAt, userId columns
Used Drizzle index() function in schema definition


**Generate Seeder Files**
- create user & post seeder files
- create index.js file and require both user & post seeder files
- const { faker } = require("@faker-js/faker"); 
  -  use faker library to generate dummy content data

<!-- Apply Seeder commands -->
npm run seed - node src/seeders/index.js

log details :-
<!-- 🌱 Seeder started...
🌍 ENV: development
🧹 Cleaning OLD seeded users & posts...
🗑️ Deleting posts marked as seeded...
🗑️ Deleting seeded users...
✅ Seeded users & posts deleted successfully
👤 [USER] Creating 20 seeded users...
✅ [USER] 20 seeded users inserted
📝 [POST] Creating EXACT 1 hacker-style post per seeded user...
📝 [POST] 20 seeded users found
✅ [POST] 20 seeded posts created
🎉 Seeder finished successfully -->

**Database & Migrations**
<!-- 1. Generate migration -->
npx drizzle-kit generate


Reads src/models/schema.js

Detects changes in tables (users, posts)

Generates SQL migration file in drizzle/ folder

<!-- 2. Apply migration -->
npx drizzle-kit push


<!-- ✅ Creates tables automatically in your database: -->

<!-- users -->

Fields: id, name, email, password, isSeeded, createdAt, updatedAt, deletedAt

Indexes: email, createdAt

<!-- posts -->

Fields: id, userId, title, content, isSeeded, createdAt, updatedAt, deletedAt

Indexes: userId, createdAt

Foreign key: userId → users.id with ON DELETE CASCADE