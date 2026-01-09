/**
 * Script to set differential=true for services that support differential scheduling
 * Run with: node server/src/scripts/setDifferentialServices.mjs
 */

import 'dotenv/config';
import { Sequelize } from 'sequelize';

const sequelize = new Sequelize(
  process.env.DB_NAME || 'scheduler_db',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || 'jklJKL',
  {
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false
  }
);

async function setDifferentialServices() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established\n');

    // Services that should have differential=true
    const differentialServiceNames = [
      "Buyer's Inspection",
      "Buyers Inspection", // Also check without apostrophe
      "Investor's Inspection",
      "Investors Inspection" // Also check without apostrophe
    ];

    console.log('🔍 Searching for services to update...');
    
    // Find services by name (case-insensitive, flexible matching)
    const [services] = await sequelize.query(`
      SELECT id, name, differential, active
      FROM block_instances
      WHERE (
        LOWER(name) LIKE LOWER('%Buyer''s Inspection%')
        OR LOWER(name) LIKE LOWER('%Buyers Inspection%')
        OR LOWER(name) LIKE LOWER('%Investor''s Inspection%')
        OR LOWER(name) LIKE LOWER('%Investors Inspection%')
      )
      AND active = true
    `);

    console.log(`Found ${services.length} service(s):`);
    services.forEach(s => {
      console.log(`  - ${s.name} (id: ${s.id}, current differential: ${s.differential})`);
    });

    if (services.length === 0) {
      console.log('\n⚠️  No services found. Checking all services...');
      const [allServices] = await sequelize.query(`
        SELECT id, name, differential
        FROM block_instances
        WHERE active = true
        LIMIT 20
      `);
      console.log('Sample of active services:');
      allServices.forEach(s => {
        console.log(`  - ${s.name} (id: ${s.id}, differential: ${s.differential})`);
      });
      return;
    }

    // Update differential flag
    const serviceIds = services.map(s => `'${s.id}'`).join(',');
    const [updateResult] = await sequelize.query(`
      UPDATE block_instances
      SET differential = true
      WHERE id IN (${serviceIds})
    `);

    console.log(`\n✅ Updated ${services.length} service(s) with differential=true`);

    // Verify updates
    const [updatedServices] = await sequelize.query(`
      SELECT id, name, differential
      FROM block_instances
      WHERE id IN (${serviceIds})
    `);

    console.log('\n📋 Verification - Updated services:');
    updatedServices.forEach(s => {
      console.log(`  - ${s.name}: differential = ${s.differential}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

setDifferentialServices()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
