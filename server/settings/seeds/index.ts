import { seedDatabase } from './seed.js';
import  sequelize  from '../../config/connection.js';
const seedAll = async (): Promise<void> => {

  try {
    console.log('\n----- Synching database ... -----\n');
    await sequelize.sync({ force: true });
    console.log('\n----- DATABASE SYNCED -----\n');

    console.log('\n----- Seeding database ... -----\n');
    await seedDatabase();
    console.log('\n----- DATABASE SEEDED -----\n');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedAll();
