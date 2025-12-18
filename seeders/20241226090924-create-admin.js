'use strict';

const { db } = require("../models/dbconfig");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    try {
      await db.users.create({
        first_name: 'tim',
        last_name: 'david',
        password: '123456',
        email: 'tim@yopmail.com',
        profile_image: '',
        is_admin: 1
      })
    } catch (error) {
      console.log('error: ', error);      
    }
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  }
};
