import { Migration } from "@mikro-orm/migrations";

export class CreateUserTable extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `create table \`user\` (
        \`id\` int unsigned not null auto_increment primary key,
        \`name\` varchar(255) not null,
        \`email\` varchar(255) unique not null,
        \`password\` varchar(255) not null,
        \`created_at\` timestamp not null default CURRENT_TIMESTAMP,
        \`updated_at\` timestamp not null default CURRENT_TIMESTAMP on update CURRENT_TIMESTAMP,
        \`deleted_at\` timestamp null
      ) default character set utf8mb4 engine = InnoDB;`
    );
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists \`user\`;`);
  }
}
