"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseSeeder = void 0;
const User_1 = require("../entities/User");
const seeder_1 = require("@mikro-orm/seeder");
class DatabaseSeeder extends seeder_1.Seeder {
    async run(em) {
        const user = new User_1.User();
        user.name = 'Admin';
        user.email = 'admin@gmail.com';
        user.password = 'admin@123';
        await em.persistAndFlush([user]);
        console.log('Seed data inserted');
    }
}
exports.DatabaseSeeder = DatabaseSeeder;
