/**
 * Script: Flatten input_config structures
 * Purpose: Flatten all wrapped relationshipSelect structures to direct format
 */

import 'dotenv/config'
import { Sequelize } from 'sequelize'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const sequelize = new Sequelize(
  process.env.DB_NAME || 'scheduler_db',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || 'jklJKL',
  {
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false,
  }
)

async function flattenInputConfig() {
  try {
    console.log('🔄 Flattening input_config structures...')

    const [result] = await sequelize.query(`
      UPDATE admin_metadata
      SET input_config = (
        jsonb_build_object(
          'targetMode', input_config->'relationshipSelect'->>'targetMode',
          'targetKey', input_config->'relationshipSelect'->>'targetKey',
          'globalField', input_config->'relationshipSelect'->>'globalField',
          'selectedParentKey', input_config->'relationshipSelect'->>'selectedParentKey',
          'selectedChildKey', input_config->'relationshipSelect'->>'selectedChildKey',
          'selectedChildPath', input_config->'relationshipSelect'->'selectedChildPath',
          'candidateParentKey', input_config->'relationshipSelect'->>'candidateParentKey',
          'candidateParentPath', input_config->'relationshipSelect'->'candidateParentPath',
          'candidateChildKey', input_config->'relationshipSelect'->>'candidateChildKey',
          'candidateChildPath', input_config->'relationshipSelect'->'candidateChildPath',
          'selectType', input_config->'relationshipSelect'->>'selectType',
          'selectMode', input_config->'relationshipSelect'->>'selectMode',
          'groupByKey', input_config->'relationshipSelect'->>'groupByKey',
          'placeholder', input_config->'relationshipSelect'->>'placeholder'
        )
        || (input_config - 'relationshipSelect')
      ),
          updated_at = CURRENT_TIMESTAMP
      WHERE metadata_type = 'relationship'
        AND input_config IS NOT NULL
        AND input_config->'relationshipSelect' IS NOT NULL
      RETURNING id, entity_type, field_key
    `)

    const updatedCount = Array.isArray(result) ? result.length : 0
    console.log(`✅ Flattened ${updatedCount} record(s)`)

    // Verify
    const [verify] = await sequelize.query(`
      SELECT COUNT(*) as wrapped_count
      FROM admin_metadata
      WHERE metadata_type = 'relationship'
        AND input_config IS NOT NULL
        AND input_config->'relationshipSelect' IS NOT NULL
    `)

    const wrappedCount = verify[0]?.wrapped_count || 0
    console.log(`📊 Remaining wrapped records: ${wrappedCount}`)

    if (wrappedCount === 0) {
      console.log('✅ All structures are now flattened!')
    }
  } catch (error) {
    console.error('❌ Error:', error.message)
    throw error
  } finally {
    await sequelize.close()
  }
}

flattenInputConfig()
  .then(() => {
    console.log('✅ Script completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Script failed:', error)
    process.exit(1)
  })
