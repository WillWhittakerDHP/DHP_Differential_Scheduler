/**
 * Script: Fix validEvents render_as to multiselect
 * Purpose: Directly update the database to fix validEvents render_as
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
    logging: false
  }
)

async function fixValidEventsRenderAs() {
  try {
    await sequelize.authenticate()
    console.log('✅ Database connection established')

    // Update validEvents metadata to use multiselect
    const [results] = await sequelize.query(`
      UPDATE admin_metadata
      SET render_as = 'multiselect',
          updated_at = CURRENT_TIMESTAMP
      WHERE entity_type = 'partShape'
        AND field_key = 'validEvents'
        AND metadata_type = 'relationship'
      RETURNING id, entity_type, entity_id, field_key, render_as
    `)

    const updatedCount = Array.isArray(results) ? results.length : 0
    console.log(`✅ Updated ${updatedCount} metadata record(s) with field_key='validEvents' to render_as='multiselect'`)

    if (updatedCount > 0) {
      console.log('📋 Updated records:')
      results.forEach((record) => {
        console.log(`   - ${record.entity_type}.${record.field_key}: ${record.render_as}`)
      })
    } else {
      console.log('ℹ️  No records found to update')
      // Check if record exists with different criteria
      const [check] = await sequelize.query(`
        SELECT id, entity_type, entity_id, field_key, render_as, metadata_type
        FROM admin_metadata
        WHERE field_key = 'validEvents'
      `)
      if (check && check.length > 0) {
        console.log('📋 Found validEvents records with different criteria:')
        check.forEach((record) => {
          console.log(`   - ${record.entity_type} (${record.entity_id}): ${record.field_key} = ${record.render_as} (${record.metadata_type})`)
        })
      }
    }

    await sequelize.close()
  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

fixValidEventsRenderAs()
