module.exports = {
  out: "./drizzle",

  dialect: "mysql",

  schema: "./src/models/schema.js",

  dbCredentials: {
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || undefined,
    database: process.env.DB_NAME || "drizzle_demo",
    port: Number(process.env.DB_PORT) || 3306,
  },

  schemaFilter: "*",

  introspect: {
    casing: "camel",
  },

  migrations: {
    prefix: "timestamp",
    table: "__drizzle_migrations__",
    schema: "public",
  },

  breakpoints: true,
  strict: true,
  verbose: true,

  drizzleStudio: {
    enabled: true,
    port: 3001,
  },
};
