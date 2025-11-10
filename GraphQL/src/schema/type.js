const { gql } = require("apollo-server-express");

const typeDefs = gql`
  type User {
    id: ID!
    name: String!
    email: String!
    role: String!
  }

  type Response {
    status: String!
    code: String!
    message: String!
    data: JSON
  }

  scalar JSON

  "Cursor-based pagination"
  type PageInfo {
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
    startCursor: String
    endCursor: String
  }

  type UserEdge {
    node: User!
    cursor: String!
  }

  type UserConnection {
    edges: [UserEdge!]!
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type Query {
    users: Response
    user(id: ID!): Response
    usersConnection(first: Int, after: String, last: Int, before: String): Response
  }

  type Mutation {
    register(name: String!, email: String!, password: String!, role: String): Response
    login(email: String!, password: String!): Response

  # Self-service mutations
    updateUser(name: String, email: String): Response
    deleteUser: Response

  # Admin-only mutations
    updateUserRole(id: ID!, role: String!): Response
    deleteUserByAdmin(id: ID!): Response
  }
`;

module.exports = typeDefs;
