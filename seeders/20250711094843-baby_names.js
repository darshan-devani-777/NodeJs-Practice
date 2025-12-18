const baby_names_british_boy = require("./baby_names_british_boy.json");
const baby_names_british_girl = require("./baby_names_british_girls.json");
const baby_names_english_boy = require("./baby_names_english_boy.json");
const baby_names_english_girl = require("./baby_names_english_girls.json");
const baby_names_hindu_boy = require("./baby_names_hindu_boys.json");
const baby_names_hindu_girl = require("./baby_names_hindu_girls.json");
const baby_names_muslim_boy = require("./baby_names_muslim_boys.json");
const baby_names_muslim_girl = require("./baby_names_muslim_girls.json");
const {v4: uuid} = require("uuid")

"use strict"

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const hinduBoys = baby_names_hindu_boy.map((name) => {
      return {
        name_id: uuid(),
        name: name.name,
        gender: "male",
        origin: "hindu",
        meaning: name.meaning,
      };
    });
    const hinduGirls = baby_names_hindu_girl.map((name) => {
      return {
        name_id: uuid(),
        name: name.name,
        gender: "female",
        origin: "hindu",
        meaning: name.meaning,
      };
    });

    const hinduNames = [...hinduBoys, ...hinduGirls];

    const muslimBoys = baby_names_muslim_boy.map((name) => {
      return {
        name_id: uuid(),
        name: name.name,
        gender: "male",
        origin: "muslim",
        meaning: name.meaning,
      };
    });
    const muslimGirls = baby_names_muslim_girl.map((name) => {
      return {
        name_id: uuid(),
        name: name.name,
        gender: "female",
        origin: "muslim",
        meaning: name.meaning,
      };
    });

    const muslimNames = [...muslimBoys, ...muslimGirls];

    const britishBoys = baby_names_british_boy.map((name) => {
      return {
        name_id: uuid(),
        name: name.name,
        gender: "male",
        origin: "british",
        meaning: name.meaning,
      };
    });
    const britishGirls = baby_names_british_girl.map((name) => {
      return {
        name_id: uuid(),
        name: name.name,
        gender: "female",
        origin: "british",
        meaning: name.meaning,
      };
    });

    const britishNames = [...britishBoys, ...britishGirls];

    const englishBoys = baby_names_english_boy.map((name) => {
      return {
        name_id: uuid(),
        name: name.name,
        gender: "male",
        origin: "english",
        meaning: name.meaning,
      };
    });
    const englishGirls = baby_names_english_girl.map((name) => {
      return {
        name_id: uuid(),
        name: name.name,
        gender: "female",
        origin: "english",
        meaning: name.meaning,
      };
    });

    const englishNames = [...englishBoys, ...englishGirls];

    await queryInterface.bulkInsert(
      "baby_names",
      [...hinduNames, ...muslimNames, ...britishNames, ...englishNames],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  },
};
