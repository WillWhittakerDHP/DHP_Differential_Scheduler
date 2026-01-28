/**
 * Script to copy fieldVisibilityConfig from Service block shape to Option block shape
 * This ensures both have identical configurations for field visibility
 */

import { Sequelize } from 'sequelize'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') })

const sequelize = new Sequelize(
  process.env.DB_NAME || 'scheduler',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    dialect: 'postgres',
    logging: false,
  }
)

async function copyServiceConfigToOption() {
  try {
    await sequelize.authenticate()
    console.log('✅ Connected to database')

    // Get Service block shape configuration
    const [serviceRows] = await sequelize.query(`
      SELECT field_visibility_config 
      FROM block_shapes 
      WHERE type = 'service' 
      LIMIT 1
    `)

    if (!serviceRows || serviceRows.length === 0) {
      console.error('❌ Service block shape not found')
      process.exit(1)
    }

    const serviceConfig = serviceRows[0].field_visibility_config
    console.log('📋 Service config:', JSON.stringify(serviceConfig, null, 2))

    // Update Option block shape with Service config
    const [updateResult] = await sequelize.query(`
      UPDATE block_shapes 
      SET field_visibility_config = :config::jsonb
      WHERE type = 'option'
      RETURNING id, name, type
    `, {
      replacements: {
        config: JSON.stringify(serviceConfig)
      }
    })

    if (updateResult && updateResult.length > 0) {
      console.log('✅ Successfully updated Option block shape:')
      console.log('   ID:', updateResult[0].id)
      console.log('   Name:', updateResult[0].name)
      console.log('   Type:', updateResult[0].type)
    } else {
      console.error('❌ Option block shape not found or update failed')
      process.exit(1)
    }

    // Verify the update
    const [verifyRows] = await sequelize.query(`
      SELECT field_visibility_config 
      FROM block_shapes 
      WHERE type = 'option' 
      LIMIT 1
    `)

    const optionConfig = verifyRows[0].field_visibility_config
    console.log('\n📋 Option config after update:', JSON.stringify(optionConfig, null, 2))

    // Compare activeParts specifically
    const serviceActiveParts = serviceConfig?.fieldMetadata?.activeParts
    const optionActiveParts = optionConfig?.fieldMetadata?.activeParts

    console.log('\n🔍 Comparing activeParts:')
    console.log('   Service:', JSON.stringify(serviceActiveParts, null, 2))
    console.log('   Option: ', JSON.stringify(optionActiveParts, null, 2))

    if (JSON.stringify(serviceActiveParts) === JSON.stringify(optionActiveParts)) {
      console.log('✅ activeParts configurations match!')
    } else {
      console.log('⚠️  activeParts configurations do not match')
    }

    await sequelize.close()
    console.log('\n✅ Script completed successfully')
  } catch (error) {
    console.error('❌ Error:', error)
    await sequelize.close()
    process.exit(1)
  }
}

copyServiceConfigToOption()
