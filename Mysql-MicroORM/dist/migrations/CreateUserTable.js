"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateUserTable = void 0;
const migrations_1 = require("@mikro-orm/migrations");
class CreateUserTable extends migrations_1.Migration {
    async up() {
        this.addSql(`create table \`user\` (
        \`id\` int unsigned not null auto_increment primary key,
        \`name\` varchar(255) not null,
        \`email\` varchar(255) unique not null,
        \`password\` varchar(255) not null,
        \`created_at\` timestamp not null default CURRENT_TIMESTAMP,
        \`updated_at\` timestamp not null default CURRENT_TIMESTAMP on update CURRENT_TIMESTAMP,
        \`deleted_at\` timestamp null
      ) default character set utf8mb4 engine = InnoDB;`);
    }
    async down() {
        this.addSql(`drop table if exists \`user\`;`);
    }
}
exports.CreateUserTable = CreateUserTable;
