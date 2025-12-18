import { defineConfig } from '@mikro-orm/mysql'; 
import * as dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
  entities: ['./dist/entities'],
  entitiesTs: ['./src/entities'],
  dbName: process.env.DB_NAME,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '3306'),
  debug: true,

  migrations: {
    path: './src/migrations',
    disableForeignKeys: false,
  },
  seeder: {
    path: './src/seeders',         
    glob: '**/*.ts',              
  },  
});
