"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({
    path: path_1.default.resolve(process.cwd(), ".env")
});
const db_1 = require("../../app/lib/db");
async function createLoginHistoryTable() {
    try {
        console.log("🚀 Running login_history migration...");
        const [result] = await db_1.db.execute(`
      CREATE TABLE IF NOT EXISTS login_history (
        id INT(11) NOT NULL AUTO_INCREMENT,
        user_id INT(11) DEFAULT NULL,
        ip VARCHAR(45) DEFAULT NULL,
        user_agent TEXT DEFAULT NULL,
        status VARCHAR(50) DEFAULT NULL,
        createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        INDEX user_id_index (user_id),
        CONSTRAINT fk_login_user
          FOREIGN KEY (user_id) REFERENCES users(id)
          ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
        if (result.warningStatus === 0) {
            console.log("✅ login_history table ready");
        }
        else {
            console.log("⚠️ login_history table already exists");
        }
        process.exit(0);
    }
    catch (error) {
        console.error("❌ login_history migration failed");
        console.error(error);
        process.exit(1);
    }
}
createLoginHistoryTable();
