/**
 * Fix Appointment Block Instance References
 * 
 * This script fixes misaligned block instance IDs in the appointments table:
 * - Moves Base Service IDs from user_type_id to base_service_id
 * - Clears Availability Option IDs from base_service_id
 * - Sets default User Type for NULL user_type_id values
 */

import 'dotenv/config'
import { Sequelize } from 'sequelize'

const sequelize = new Sequelize(
  process.env.DB_NAME || 'scheduler_db',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || 'jklJKL',
  {
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: console.log
  }
)

const DEFAULT_USER_TYPE_ID = '09a62303-ed6e-46b5-9e5d-6454836d57cd' // Buyer

async function fixAppointmentBlockInstances() {
  try {
    await sequelize.authenticate()
    console.log('✅ Database connection established\n')

    // Update 1: Move Base Service IDs from user_type_id to base_service_id and set default User Type
    // Only applies when base_service_id is NULL (to avoid overwriting existing values)
    console.log('📝 Update 1: Moving Base Service IDs from user_type_id to base_service_id (when base_service_id is NULL)...')
    const update1Result = await sequelize.query(`
      UPDATE appointments
      SET 
        base_service_id = user_type_id,
        user_type_id = :defaultUserType
      WHERE 
        user_type_id IN (
          SELECT bi.id 
          FROM block_instances bi 
          JOIN block_shapes bs ON bi.block_shape_ref = bs.id 
          WHERE bs.name = 'Base Service'
        )
        AND base_service_id IS NULL
    `, {
      replacements: { defaultUserType: DEFAULT_USER_TYPE_ID },
      type: Sequelize.QueryTypes.UPDATE
    })
    console.log(`   ✅ Updated ${update1Result[1]} appointment(s)\n`)

    // Update 1b: Handle edge case - Base Service ID in user_type_id but base_service_id is already set
    // Just set user_type_id to default User Type, leave base_service_id as-is
    console.log('📝 Update 1b: Setting default User Type for appointments with Base Service in user_type_id (base_service_id already set)...')
    const update1bResult = await sequelize.query(`
      UPDATE appointments
      SET 
        user_type_id = :defaultUserType
      WHERE 
        user_type_id IN (
          SELECT bi.id 
          FROM block_instances bi 
          JOIN block_shapes bs ON bi.block_shape_ref = bs.id 
          WHERE bs.name = 'Base Service'
        )
        AND base_service_id IS NOT NULL
    `, {
      replacements: { defaultUserType: DEFAULT_USER_TYPE_ID },
      type: Sequelize.QueryTypes.UPDATE
    })
    console.log(`   ✅ Updated ${update1bResult[1]} appointment(s)\n`)

    // Update 2: Set Availability Option IDs in base_service_id to NULL
    // Availability Options belong in selected_availability_options JSONB array, not as a single ID
    console.log('📝 Update 2: Clearing Availability Option IDs from base_service_id...')
    const update2Result = await sequelize.query(`
      UPDATE appointments
      SET base_service_id = NULL
      WHERE base_service_id IN (
        SELECT bi.id 
        FROM block_instances bi 
        JOIN block_shapes bs ON bi.block_shape_ref = bs.id 
        WHERE bs.name = 'Availabiltiy Option'
      )
    `, {
      type: Sequelize.QueryTypes.UPDATE
    })
    console.log(`   ✅ Updated ${update2Result[1]} appointment(s)\n`)

    // Update 3: Set default User Type for appointments with NULL user_type_id
    console.log('📝 Update 3: Setting default User Type for appointments with NULL user_type_id...')
    const update3Result = await sequelize.query(`
      UPDATE appointments
      SET user_type_id = :defaultUserType
      WHERE user_type_id IS NULL
    `, {
      replacements: { defaultUserType: DEFAULT_USER_TYPE_ID },
      type: Sequelize.QueryTypes.UPDATE
    })
    console.log(`   ✅ Updated ${update3Result[1]} appointment(s)\n`)

    console.log('✅ All updates completed successfully!')
  } catch (error) {
    console.error('❌ Error fixing appointment block instances:', error)
    process.exit(1)
  } finally {
    await sequelize.close()
  }
}

fixAppointmentBlockInstances()

