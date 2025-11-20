module.exports = {
  development: {
    username: "root",
    password: "",
    database: "nest_sequelize",
    host: "127.0.0.1",
    dialect: "mysql",
  },
  test: {
    username: "root",
    password: "",
    database: "nest_sequelize_test",
    host: "127.0.0.1",
    dialect: "mysql",
  },
  production: {
    username: "root",
    password: "",
    database: "nest_sequelize_prod",
    host: "127.0.0.1",
    dialect: "mysql",
  }
};
