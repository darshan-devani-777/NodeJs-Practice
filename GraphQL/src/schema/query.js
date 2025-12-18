// ====================
// GRAPHQL QUERIES 
// ====================

// Get all users
query GetUsers {
  users {
    status
    code
    message
    data
  }
}

// Get single user by ID
query GetUser($id: ID!) {
  user(id: $id) {
    status
    code
    message
    data
    }
  }

// Get users with pagination
query GetUsersConnection($first: Int, $after: String, $last: Int, $before: String) {
  usersConnection(first: $first, after: $after, last: $last, before: $before) {
    status
    code
    message
    data
  }
}

// ====================
// GRAPHQL MUTATIONS 
// ====================

// Register new user
mutation RegisterUser($name: String!, $email: String!, $password: String!, $role: String) {
  register(name: $name, email: $email, password: $password, role: $role) {
    status
    code
    message
    data
  }
}

// Login user
mutation LoginUser($email: String!, $password: String!) {
  login(email: $email, password: $password) {
    status
    code
    message
    data
  }
}

// Update own profile (self-service)
mutation UpdateUser($name: String, $email: String) {
  updateUser(name: $name, email: $email) {
    status
    code
    message
    data
  }
}

// Delete own account (self-service)
mutation DeleteUser {
  deleteUser {
    status
    code
    message
    data
  }
}

// Update user role (admin only)
mutation UpdateUserRole($id: ID!, $role: String!) {
  updateUserRole(id: $id, role: $role) {
    status
    code
    message
    data 
  }
}

// Delete user by admin (admin only)
mutation DeleteUserByAdmin($id: ID!) {
  deleteUserByAdmin(id: $id) {
    status
    code
    message
    data 
  }
}

// ========================================
// READY-TO-USE EXAMPLES (NO VARIABLES)
// ========================================

// Register a new user
mutation {
  register(name: "John Doe", email: "john@example.com", password: "password123", role: "user") {
    status
    message
    data 
  }
}

// Register a new admin user
mutation {
  register(name: "Admin User", email: "admin@example.com", password: "password123", role: "admin") {
    status
    message
    data 
  }
}

// Login user
mutation {
  login(email: "john@example.com", password: "password123") {
    status
    message
    data 
  }
}

// Get all users
query {
  users {
    status
    message
    data
  }
}

// Get single user (replace USER_ID_HERE with actual ID)
query {
  user(id: "USER_ID_HERE") {
    status
    message
    data
  }
}

// Update own profile (replace with actual values)
mutation {
  updateUser(name: "New Name", email: "newemail@example.com") {
    status
    message
    data 
  }
}

// Delete own account
mutation {
  deleteUser {
    status
    message
    data 
  }
}

// Admin: Update user role (replace USER_ID_HERE with actual ID)
mutation {
  updateUserRole(id: "USER_ID_HERE", role: "admin") {
    status
    message
    data 
  }
}

// Admin: Delete any user (replace USER_ID_HERE with actual ID)
mutation {
  deleteUserByAdmin(id: "USER_ID_HERE") {
    status
    message
    data 
  }
}

// Get users with pagination
query {
  usersConnection(first: 2) {
    status
    message
    data 
  }
}