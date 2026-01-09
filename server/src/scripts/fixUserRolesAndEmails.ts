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

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../../.env.development');
dotenv.config({ path: envPath });

if (!process.env.DB_HOST) {
  dotenv.config({ path: path.resolve(__dirname, '../../.env') });
}

/**
 * Generate a slugified email from name and user ID
 * LEARNING: Creates unique test emails from user names
 * WHY: Some users may have the same name, so we append a short ID suffix for uniqueness
 */
function generateTestEmail(firstName: string, lastName: string, role: 'agent' | 'client', userId?: string): string {
  const slug = `${firstName}.${lastName}`.toLowerCase().replace(/\s+/g, '.').replace(/[^a-z0-9.]/g, '');
  // Append first 6 chars of user ID to ensure uniqueness for duplicate names
  const idSuffix = userId ? `.${userId.substring(0, 6)}` : '';
  return `test.${role}.${slug}${idSuffix}@districthomepro.com`;
}

/**
 * Get a random element from an array
 */
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

    // ============================================
    // STEP 1: Get all existing users
    // ============================================
    const existingUsers = await User.findAll({ transaction });
    console.log(`📊 Found ${existingUsers.length} existing users\n`);

    // ============================================
    // STEP 2: Update users with role='client' to role='agent'
    // These are the agents extracted from calendar event summaries
    // ============================================
    console.log('🔄 Step 1: Updating user roles from client to agent...');
    
    const clientUsers = existingUsers.filter(u => u.userRole === 'client');
    console.log(`   Found ${clientUsers.length} users with role='client' (should be agents)`);
    
    for (const user of clientUsers) {
      await user.update({ userRole: 'agent' }, { transaction });
      console.log(`   ✅ Updated ${user.firstName} ${user.lastName}: client → agent`);
    }

    // ============================================
    // STEP 3: Update emails for all existing users (now agents)
    // ============================================
    console.log('\n🔄 Step 2: Adding test emails to existing users...');
    
    // Refresh the user list after role updates
    const agentUsers = await User.findAll({ 
      where: { userRole: 'agent' }, 
      transaction 
    });
    
    for (const user of agentUsers) {
      const testEmail = generateTestEmail(user.firstName, user.lastName, 'agent', user.id);
      await user.update({ email: testEmail }, { transaction });
      console.log(`   ✅ ${user.firstName} ${user.lastName}: email → ${testEmail}`);
    }

    // ============================================
    // STEP 4: Create test client records
    // ============================================
    console.log('\n🔄 Step 3: Creating test client records...');
    
    const createdClients: typeof User.prototype[] = [];
    
    // Use an index for client uniqueness since we don't have IDs yet
    for (let i = 0; i < TEST_CLIENT_NAMES.length; i++) {
      const clientName = TEST_CLIENT_NAMES[i];
      // Use index as suffix for clients since they don't have IDs yet
      const testEmail = `test.client.${clientName.firstName.toLowerCase()}.${clientName.lastName.toLowerCase()}.${i + 1}@districthomepro.com`;
      
      // Check if client with this email already exists
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

    // ============================================
    // STEP 5: Update appointments
    // - Move current clientId to agentId (since those were actually agents)
    // - Assign new random clientId from test clients
    // - Randomly assign scheduledById from all users
    // ============================================
    console.log('\n🔄 Step 4: Updating appointments...');
    
    const appointments = await Appointment.findAll({ transaction });
    console.log(`   Found ${appointments.length} appointments to update`);
    
    // Get all users for random scheduledById assignment
    const allUsers = await User.findAll({ transaction });
    
    for (const appointment of appointments) {
      const updates: Partial<{
        agentId: string | null;
        clientId: string | null;
        scheduledById: string | null;
      }> = {};
      
      // Move clientId to agentId (since the "client" was actually the agent)
      if (appointment.clientId && !appointment.agentId) {
        updates.agentId = appointment.clientId;
      }
      
      // Assign a random test client as the actual client
      if (createdClients.length > 0) {
        const randomClient = getRandomElement(createdClients);
        updates.clientId = randomClient.id;
      }
      
      // Randomly assign scheduledById from all users
      if (allUsers.length > 0) {
        const randomScheduler = getRandomElement(allUsers);
        updates.scheduledById = randomScheduler.id;
      }
      
      if (Object.keys(updates).length > 0) {
        await appointment.update(updates, { transaction });
        
        const agentName = updates.agentId 
          ? agentUsers.find(u => u.id === updates.agentId)?.firstName || 'Unknown'
          : 'None';
        const clientName = updates.clientId
          ? createdClients.find(c => c.id === updates.clientId)?.firstName || 'Unknown'
          : 'None';
        const schedulerName = updates.scheduledById
          ? allUsers.find(u => u.id === updates.scheduledById)?.firstName || 'Unknown'
          : 'None';
          
        console.log(`   ✅ Updated appointment ${appointment.id.substring(0, 8)}...: agent=${agentName}, client=${clientName}, scheduledBy=${schedulerName}`);
      }
    }

    // ============================================
    // COMMIT TRANSACTION
    // ============================================
    await transaction.commit();
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ USER DATA FIX COMPLETED SUCCESSFULLY');
    console.log('='.repeat(60));
    
    // Print summary
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

/**
 * Main entry point
 */
async function main(): Promise<void> {
  try {
    // Connect to database
    await initializeDatabase();
    
    // Run the fix
    await fixUserRolesAndEmails();
    
  } catch (error) {
    console.error('❌ Script failed:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Run the script
main()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });

