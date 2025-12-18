"use strict";

const topicsData = require("./article_topics.json");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("article_topics", topicsData, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("article_topics", null, {});
  },
};
