/**
 * Fix User Roles and Emails Script
 * 
 * Purpose: Corrects user data based on calendar analysis:
 * 1. Users extracted from event summaries (e.g., "Buyer's Inspection for Todd Litchfield") 
 *    were incorrectly marked as 'client' - they should be 'agent' (real estate agents)
 * 2. Adds test emails to all users for development/testing
 * 3. Creates test client records since actual clients weren't in the calendar data
 * 4. Updates appointments: sets agentId from current clientId, creates new clientId links, 
 *    and randomly assigns scheduledById
 * 
 * LEARNING: Calendar event summaries show agent names, not client names
 * WHY: Real estate agents schedule home inspections for their clients
 * PATTERN: Data correction script with transactional safety
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { Appointment, User, sequelize, initializeDatabase } from '../config/app.js';
import { Op } from 'sequelize';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../../.env.development');
dotenv.config({ path: envPath });

if (!process.env.DB_HOST) {
  dotenv.config({ path: path.resolve(__dirname, '../../.env') });
}

function generateTestEmail(firstName: string, lastName: string, role: 'agent' | 'client', userId?: string): string {
  const slug = `${firstName}.${lastName}`.toLowerCase().replace(/\s+/g, '.').replace(/[^a-z0-9.]/g, '');
  const idSuffix = userId ? `.${userId.substring(0, 6)}` : '';
  return `test.${role}.${slug}${idSuffix}@districthomepro.com`;
}

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Test client names for creating sample client records
 * LEARNING: Since actual client names weren't in calendar data, we create test clients
 */
const TEST_CLIENT_NAMES = [
  { firstName: 'John', lastName: 'Homebuyer' },
  { firstName: 'Sarah', lastName: 'Purchaser' },
  { firstName: 'Michael', lastName: 'Newowner' },
  { firstName: 'Emily', lastName: 'Houseseeker' },
  { firstName: 'David', lastName: 'Propertybuyer' },
  { firstName: 'Jessica', lastName: 'Homeshopper' },
  { firstName: 'Robert', lastName: 'Estateclient' },
  { firstName: 'Amanda', lastName: 'Realestateclient' },
];

/**
 * Main function to fix user data
 */
async function fixUserRolesAndEmails(): Promise<void> {
  const transaction = await sequelize.transaction();
  
  try {
    console.log('🔧 Starting user data fix script...\n');

    const existingUsers = await User.findAll({ transaction });
    console.log(`📊 Found ${existingUsers.length} existing users\n`);

    console.log('🔄 Step 1: Updating user roles from client to agent...');
    
    const clientUsers = existingUsers.filter(u => u.userRole === 'client');
    console.log(`   Found ${clientUsers.length} users with role='client' (should be agents)`);
    
    for (const user of clientUsers) {
      await user.update({ userRole: 'agent' }, { transaction });
      console.log(`   ✅ Updated ${user.firstName} ${user.lastName}: client → agent`);
    }

    console.log('\n🔄 Step 2: Adding test emails to existing users...');
    
    const agentUsers = await User.findAll({ 
      where: { userRole: 'agent' }, 
      transaction 
    });
    
    for (const user of agentUsers) {
      const testEmail = generateTestEmail(user.firstName, user.lastName, 'agent', user.id);
      await user.update({ email: testEmail }, { transaction });
      console.log(`   ✅ ${user.firstName} ${user.lastName}: email → ${testEmail}`);
    }

    console.log('\n🔄 Step 3: Creating test client records...');
    
    const createdClients: typeof User.prototype[] = [];
    
    // Use an index for client uniqueness since we don't have IDs yet
    for (let i = 0; i < TEST_CLIENT_NAMES.length; i++) {
      const clientName = TEST_CLIENT_NAMES[i];
      // Use index as suffix for clients since they don't have IDs yet
      const testEmail = `test.client.${clientName.firstName.toLowerCase()}.${clientName.lastName.toLowerCase()}.${i + 1}@districthomepro.com`;
      
      const existingClient = await User.findOne({ 
        where: { email: testEmail }, 
        transaction 
      });
      
      if (existingClient) {
        console.log(`   ⏭️  Client ${clientName.firstName} ${clientName.lastName} already exists`);
        createdClients.push(existingClient);
        continue;
      }
      
      const newClient = await User.create({
        firstName: clientName.firstName,
        lastName: clientName.lastName,
        email: testEmail,
        phone: '555-0100',
        userRole: 'client',
      }, { transaction });
      
      createdClients.push(newClient);
      console.log(`   ✅ Created client: ${clientName.firstName} ${clientName.lastName} (${testEmail})`);
    }

    // - Move current clientId to agentId (since those were actually agents)
    console.log('\n🔄 Step 4: Updating appointments...');
    
    const appointments = await Appointment.findAll({ transaction });
    console.log(`   Found ${appointments.length} appointments to update`);
    
    const allUsers = await User.findAll({ transaction });
    
    // NOTE: clientId/agentId columns have been removed from appointments table
    // Attendees are now stored in the appointment_attendees junction table
    // This section is deprecated - use appointment_attendees table instead
    for (const appointment of appointments) {
      const updates: Partial<{
        scheduledById: string | null;
      }> = {};
      
      if (allUsers.length > 0) {
        const randomScheduler = getRandomElement(allUsers);
        updates.scheduledById = randomScheduler.id;
      }
      
      if (Object.keys(updates).length > 0) {
        await appointment.update(updates, { transaction });
        
        const schedulerName = updates.scheduledById
          ? allUsers.find(u => u.id === updates.scheduledById)?.firstName || 'Unknown'
          : 'None';
          
        console.log(`   ✅ Updated appointment ${appointment.id.substring(0, 8)}...: scheduledBy=${schedulerName}`);
      }
    }

    await transaction.commit();
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ USER DATA FIX COMPLETED SUCCESSFULLY');
    console.log('='.repeat(60));
    
    console.log('\n📊 SUMMARY:');
    console.log(`   - Users changed from client to agent: ${clientUsers.length}`);
    console.log(`   - Agent emails updated: ${agentUsers.length}`);
    console.log(`   - Test clients created: ${createdClients.length}`);
    console.log(`   - Appointments updated: ${appointments.length}`);
    
  } catch (error) {
    await transaction.rollback();
    console.error('\n❌ Error during data fix:', error);
    throw error;
  }
}

async function main(): Promise<void> {
  try {
    await initializeDatabase();
    
    await fixUserRolesAndEmails();
    
  } catch (error) {
    console.error('❌ Script failed:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

main()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });

