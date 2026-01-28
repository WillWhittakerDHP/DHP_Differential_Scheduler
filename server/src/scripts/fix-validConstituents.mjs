/**
 * Script: Fix validConstituents in admin_relationship_metadata
 * Purpose: Update any remaining validConstituents to validParts
 * 
 * LEARNING: Direct SQL update for data cleanup
 * WHY: Migration may have run but new records may have been created with old name
 * PATTERN: Check first, then update with logging
 */

import 'dotenv/config'
import { Sequelize } from 'sequelize'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Use same config as migrations
const sequelize = new Sequelize(
  process.env.DB_NAME || 'scheduler_db',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || 'jklJKL',
  {
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '5432'),
    dialect: 'postgres',
    logging: false,
  }
)

async function fixValidConstituents() {
  try {
    await sequelize.authenticate()
    console.log('✅ Database connection established\n')

    // Check for records with validConstituents
    const [checkResult] = await sequelize.query(`
      SELECT id, entity_type, entity_id, relationship_key, label
      FROM admin_relationship_metadata
      WHERE relationship_key = 'validConstituents'
      ORDER BY entity_type, entity_id
    `, {
      type: Sequelize.QueryTypes.SELECT,
    })

    const records = Array.isArray(checkResult) ? checkResult : []

    if (records.length > 0) {
      console.log(`📋 Found ${records.length} records with validConstituents:`)
      records.forEach(r => {
        console.log(`   - ${r.entity_type}/${r.entity_id}: ${r.relationship_key} (label: "${r.label}")`)
      })
      console.log()

      // Fix them
      const [updateResult] = await sequelize.query(`
        UPDATE admin_relationship_metadata
        SET relationship_key = 'validParts',
            updated_at = CURRENT_TIMESTAMP
        WHERE relationship_key = 'validConstituents'
        RETURNING id, entity_type, entity_id, relationship_key
      `, {
        type: Sequelize.QueryTypes.UPDATE,
      })

      const updated = Array.isArray(updateResult) ? updateResult : []
      console.log(`✅ Updated ${updated.length} records: validConstituents → validParts`)
    } else {
      console.log('✅ No records found with validConstituents')
    }

    // Also check for activeConstituents
    const [checkActive] = await sequelize.query(`
      SELECT id, entity_type, entity_id, relationship_key, label
      FROM admin_relationship_metadata
      WHERE relationship_key = 'activeConstituents'
      ORDER BY entity_type, entity_id
    `, {
      type: Sequelize.QueryTypes.SELECT,
    })

    const activeRecords = Array.isArray(checkActive) ? checkActive : []

    if (activeRecords.length > 0) {
      console.log(`\n📋 Found ${activeRecords.length} records with activeConstituents:`)
      activeRecords.forEach(r => {
        console.log(`   - ${r.entity_type}/${r.entity_id}: ${r.relationship_key} (label: "${r.label}")`)
      })
      console.log()

      const [updateActive] = await sequelize.query(`
        UPDATE admin_relationship_metadata
        SET relationship_key = 'activeParts',
            updated_at = CURRENT_TIMESTAMP
        WHERE relationship_key = 'activeConstituents'
        RETURNING id, entity_type, entity_id, relationship_key
      `, {
        type: Sequelize.QueryTypes.UPDATE,
      })

      const updatedActive = Array.isArray(updateActive) ? updateActive : []
      console.log(`✅ Updated ${updatedActive.length} records: activeConstituents → activeParts`)
    } else {
      console.log('\n✅ No records found with activeConstituents')
    }

    console.log('\n✅ Data fix complete!')
  } catch (error) {
    console.error('❌ Error:', error.message)
    console.error(error.stack)
    process.exit(1)
  } finally {
    await sequelize.close()
  }
}

fixValidConstituents()
