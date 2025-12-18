"use strict";

const groupTagsData = require("./group_tags.json");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("group_tags", groupTagsData, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("group_tags", null, {});
  },
};
