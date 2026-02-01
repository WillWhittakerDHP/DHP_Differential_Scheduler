/**
 * Migration: Seed default business rules
 * Date: 2026-01-31
 * Purpose: Create validation message annotation instances and default business rules
 * 
 * LEARNING: Seeds business rules with validation messages for common validation scenarios
 * WHY: Replaces hardcoded validation logic with database-driven rules
 * PATTERN: Create annotation shape → annotation instances → business rules
 * 
 * Default Rules Created:
 * 1. Multi-family property required fields (numberOfUnits)
 * 2. Property type selection validation message
 * 3. Requires agent rules (to be determined based on services)
 */

import { randomUUID } from 'crypto';

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    console.log('🔄 Seeding default business rules...');
    
    const now = new Date();
    
    // Step 1: Find or create "validation_message" annotation shape
    let validationMessageShapeId;
    const existingShape = await queryInterface.sequelize.query(
      `SELECT id FROM annotation_shapes WHERE name = 'validation_message' LIMIT 1`,
      { type: Sequelize.QueryTypes.SELECT }
    );
    
    if (existingShape.length > 0) {
      validationMessageShapeId = existingShape[0].id;
      console.log('✅ Found existing validation_message annotation shape');
    } else {
      validationMessageShapeId = randomUUID();
      await queryInterface.bulkInsert('annotation_shapes', [{
        id: validationMessageShapeId,
        name: 'validation_message',
        order_index: 100,
        active: true,
        created_at: now,
        updated_at: now,
      }]);
      console.log('✅ Created validation_message annotation shape');
    }
    
    // Step 2: Create annotation instances for validation messages
    const annotationInstances = [
      {
        id: randomUUID(),
        text: 'Number of units is required for multi-family properties',
        type: validationMessageShapeId,
        user_type: null, // Generic (not user-type-specific)
        order_index: 0,
        active: true,
        created_at: now,
        updated_at: now,
      },
      {
        id: randomUUID(),
        text: 'Please select at least one property type',
        type: validationMessageShapeId,
        user_type: null,
        order_index: 1,
        active: true,
        created_at: now,
        updated_at: now,
      },
      {
        id: randomUUID(),
        text: 'This service requires agent and client contact information',
        type: validationMessageShapeId,
        user_type: null,
        order_index: 2,
        active: true,
        created_at: now,
        updated_at: now,
      },
    ];
    
    await queryInterface.bulkInsert('annotation_instances', annotationInstances);
    console.log('✅ Created validation message annotation instances');
    
    // Store annotation IDs for business rules
    const multiFamilyMessageId = annotationInstances[0].id;
    const propertyTypeMessageId = annotationInstances[1].id;
    const requiresAgentMessageId = annotationInstances[2].id;
    
    // Step 3: Find multi-family property type blocks (name contains "multi" or "duplex")
    const multiFamilyBlocks = await queryInterface.sequelize.query(
      `SELECT id FROM block_instances 
       WHERE LOWER(name) LIKE '%multi%' OR LOWER(name) LIKE '%duplex%'`,
      { type: Sequelize.QueryTypes.SELECT }
    );
    
    // Step 4: Create business rules for multi-family required fields
    const businessRules = [];
    
    for (const block of multiFamilyBlocks) {
      businessRules.push({
        id: randomUUID(),
        block_instance_id: block.id,
        rule_type: 'required_fields',
        rule_config: JSON.stringify({
          fields: ['numberOfUnits'],
          condition: 'isMultiFamily',
        }),
        validation_message_annotation_id: multiFamilyMessageId,
        active: true,
        created_at: now,
        updated_at: now,
      });
    }
    
    if (businessRules.length > 0) {
      await queryInterface.bulkInsert('business_rules', businessRules);
      console.log(`✅ Created ${businessRules.length} multi-family required fields business rules`);
    } else {
      console.log('ℹ️  No multi-family property blocks found, skipping required fields rules');
    }
    
    // Step 5: Create validation message business rule for property type selection
    // Note: This is a general rule - not tied to specific block instance
    // For now, we'll skip creating this rule since it's a wizard-level validation
    // TODO: Consider if we need block_instance_id to be nullable for wizard-level rules
    
    // Step 6: Find service blocks that require agent
    // Note: For now, we'll skip auto-creating requires_agent rules
    // Admin will configure these via admin panel in Session 1.5.2
    console.log('ℹ️  requires_agent rules will be configured via admin panel');
    
    console.log('✅ Completed seeding default business rules');
  },

  async down(queryInterface, Sequelize) {
    console.log('🔄 Removing seeded business rules...');
    
    // Find validation message annotation instances
    const validationMessages = await queryInterface.sequelize.query(
      `SELECT ai.id FROM annotation_instances ai
       JOIN annotation_shapes ash ON ai.type = ash.id
       WHERE ash.name = 'validation_message'`,
      { type: Sequelize.QueryTypes.SELECT }
    );
    
    if (validationMessages.length > 0) {
      const messageIds = validationMessages.map(m => m.id);
      
      // Delete business rules linked to these messages
      await queryInterface.sequelize.query(
        `DELETE FROM business_rules 
         WHERE validation_message_annotation_id IN (:messageIds)`,
        {
          replacements: { messageIds },
          type: Sequelize.QueryTypes.DELETE,
        }
      );
      
      // Delete annotation instances
      await queryInterface.bulkDelete('annotation_instances', {
        id: messageIds,
      });
      
      console.log('✅ Removed seeded validation message annotations and business rules');
    }
    
    // Note: Not removing validation_message annotation shape - may be used for other annotations
  }
};
