import { EntityManager } from '@mikro-orm/core'; 
import { User } from '../entities/User';
import { Seeder } from '@mikro-orm/seeder';

export class DatabaseSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    const user = new User();
    user.name = 'Admin';
    user.email = 'admin@gmail.com';
    user.password = 'admin@123';

    await em.persistAndFlush([user]);

    console.log('Seed data inserted');
  }
}
