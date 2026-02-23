# Role-Based Access Control (RBAC) API with Audit Logging

A **Node.js**, **Express**, and **MongoDB** application implementing **Role-Based Access Control (RBAC)**, JWT authentication, permission requests, and audit logging. This API allows user registration, login, role management, permission approvals, and dashboard access.

---

## Features

- **User Management**
  - Register and login users
  - Password hashing with bcrypt
  - Assign roles and permissions
- **Role-Based Access Control (RBAC)**
  - Roles with specific permissions
  - Middleware to restrict access based on permissions
- **Permission Requests**
  - Users can request specific permissions
  - Admins can review requests
  - SuperAdmin can finalize approvals
- **Audit Logging**
  - Track user actions and admin activities
  - Detailed logs with trace IDs, IP, and user-agent
- **JWT Authentication**
  - Secure endpoints using JSON Web Tokens
  - Token expiration and verification
- **Trace Middleware**
  - Logs request/response lifecycle for debugging

---

## Tech Stack

- **Node.js** & **Express.js**
- **MongoDB** & **Mongoose**
- **JWT Authentication**
- **bcrypt.js** for password hashing
- **uuid** for trace IDs

---

## Installation

**Install dependencies:****

npm install

**API**

**Auth:-**

| Method | Endpoint  | Description         | Middleware      |
| ------ | --------- | ------------------- | --------------- |
| POST   | /register | Register a new user | traceMiddleware |
| POST   | /login    | User login          | traceMiddleware |

**User:-**

| Method | Endpoint            | Description              | Middleware  |
| ------ | ------------------- | ------------------------ | ----------- |
| POST   | /request-permission | Request a new permission | trace, auth |

**Admin:-**

| Method | Endpoint                   | Description                 | Middleware                             |
| ------ | -------------------------- | --------------------------- | -------------------------------------- |
| POST   | /create-user               | Admin creates a new user    | trace, auth, rbac("USERS:CREATE")      |
| POST   | /assign-role/:userId       | Assign a role to a user     | trace, auth, rbac("USERS:ASSIGN_ROLE") |
| POST   | /review-request/:requestId | Review a permission request | trace, auth, rbac("REVIEW_PERMISSION") |

**SuperAdmin:-**

| Method | Endpoint           | Description              | Middleware                                          |
| ------ | ------------------ | ------------------------ | --------------------------------------------------- |
| POST   | /create-role       | Create a new role        | trace, auth, SuperAdmin check, rbac("ROLES:CREATE") |
| POST   | /final-approve/:id | Final approve permission | trace, auth, rbac("APPROVE_PERMISSION")             |
| GET    | /audit-logs        | View audit logs          | trace, auth, rbac("VIEW_AUDIT_LOGS")                |

**Dashboard:-**

| Method | Endpoint        | Description      | Middleware                          |
| ------ | --------------- | ---------------- | ----------------------------------- |
| GET    | /view-dashboard | Access dashboard | trace, auth, rbac("DASHBOARD:VIEW") |

**Middleware**

auth.js: Verifies JWT and attaches user to request

rbac.js: Checks if user has required permissions

trace.js: Generates trace IDs, logs request/response, and duration

**Models**

*User*

name, email, password, role, permissions, roles

*Role*

name, permissions

*PermissionRequest*

user, permission, reason, status, reviewedBy

*AuditLog*

traceId, performedBy, target, resource, action, status, oldValues, newValues, metadata

**SuperAdmin Seeder**

- The API automatically ensures a SuperAdmin exists when the server starts:

*Default credentials:*

Email: superadmin@gmail.com
Password: SuperAdmin@123
Role: SuperAdmin
Permissions:
- APPROVE_PERMISSION
- VIEW_AUDIT_LOGS
- USERS:CREATE
- USERS:ASSIGN_ROLE
- REVIEW_PERMISSION
- DASHBOARD:VIEW
- ROLES:CREATE

**Only SuperAdmin can create Admin users in register API**