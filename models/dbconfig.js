const { Sequelize, DataTypes } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(
  process.env.DATABASE_NAME,
  process.env.DATABASE_USERNAME,
  process.env.DATABASE_PASSWORD,
  {
    host: process.env.DATABASE_HOST,
    port: process.env.DATABASE_PORT,
    dialect: process.env.DATABASE_DIALECT,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000, // Timeout before throwing error when trying to connect
      idle: 10000,
    },
    dialectOptions: {
      connectTimeout: 60000, // increase the connection timeout to 60 seconds
    },
    maxAllowedPacket: 512 * 1024 * 1024
  }
);

const db = {};

db["users"] = require("./users")(sequelize, DataTypes);
db["articles"] = require("./articles")(sequelize, DataTypes);
// db["community"] = require("./community")(sequelize, DataTypes);
db["tags"] = require("./tags")(sequelize, DataTypes);
db["likes"] = require("./likes")(sequelize, DataTypes);
db["comments"] = require("./comments")(sequelize, DataTypes);
db["coupons"] = require("./coupons")(sequelize, DataTypes);
db["purchases"] = require("./purchases")(sequelize, DataTypes);
db["email_topics"] = require("./email_topics")(sequelize, DataTypes);
db["email_sub_topics"] = require("./email_sub_topics")(sequelize, DataTypes);
db["bookmarks"] = require("./bookmark")(sequelize, DataTypes);
db["groups"] = require("./groups")(sequelize, DataTypes);
db["group_members"] = require("./group_members")(sequelize, DataTypes);
db["posts"] = require("./posts")(sequelize, DataTypes);
db["group_tags"] = require("./group_tags")(sequelize, DataTypes);
db["faqs"] = require("./faqs")(sequelize, DataTypes);
db["feedbacks"] = require("./feedbacks")(sequelize, DataTypes);
db["reports"] = require("./report")(sequelize, DataTypes);
db["courses"] = require("./courses")(sequelize, DataTypes);
db["course_chapters"] = require("./course_chapters")(sequelize, DataTypes);
db["chapter_topics"] = require("./chapter_topics")(sequelize, DataTypes);
db["topic_subtopics"] = require("./topic_subtopics")(sequelize, DataTypes);
db["article_topics"] = require("./articleTopics")(sequelize, DataTypes);
db["article_tags"] = require("./articleTags")(sequelize, DataTypes);
db["saved_names"] = require("./saved_names")(sequelize, DataTypes);
db["baby_names"] = require("./baby_names")(sequelize, DataTypes);
db["blog"] = require("./blog")(sequelize, DataTypes);
db["subscriptions"] = require("./subscriptions")(sequelize, DataTypes);
db["about_us"] = require("./aboutsUs")(sequelize, DataTypes);
db["privacy_policy"] = require("./privacyPolicy")(sequelize, DataTypes);
db["terms_of_use"] = require("./termsOfUse")(sequelize, DataTypes);
db["contact_form"] = require("./contactForm")(sequelize, DataTypes);
db["contact_info"] = require("./contactInfo")(sequelize, DataTypes);

Object.keys(db).forEach((model) => {
  if ("associate" in db[model]) {
    db[model].associate(db);
  }
});

sequelize.sync({force: false, alter: true})
  .then(() => {
    console.log("✅ Mysql connected...");
  })
  .catch((err) => {
    console.log("Database connection error: ", err);
  });

module.exports = { db, sequelize };
