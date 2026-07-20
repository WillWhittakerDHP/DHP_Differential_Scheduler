/**
 * WHY: Property Details (time) orchestrators — Single Family Home, Townhouse, etc. —
 * must be composite packages so they can own atomic same-shape children via
 * instance_components, matching service packages like Buyer's Inspection.
 *
 * Scope: time-shape instances that are already orchestrators (property-type roots).
 * Does not change atomic characteristic blocks (Roof, Exterior, …).
 */
export default {
  async up(queryInterface) {
    const { sequelize } = queryInterface
    await sequelize.query(`
      UPDATE block_instances AS bi
      SET composite = true,
          updated_at = NOW()
      FROM block_shapes AS bs
      WHERE bi.block_shape_ref = bs.id
        AND bs.semantic_type = 'time'
        AND bi.orchestrator = true
        AND bi.composite = false;
    `)

    await sequelize.query(`
      UPDATE block_instance_versions AS biv
      SET composite = true
      FROM block_instances AS bi
      JOIN block_shapes AS bs ON bs.id = bi.block_shape_ref
      WHERE biv.block_instance_id = bi.id
        AND bs.semantic_type = 'time'
        AND bi.orchestrator = true
        AND biv.composite = false;
    `)
  },

  async down(queryInterface) {
    const { sequelize } = queryInterface
    await sequelize.query(`
      UPDATE block_instances AS bi
      SET composite = false,
          updated_at = NOW()
      FROM block_shapes AS bs
      WHERE bi.block_shape_ref = bs.id
        AND bs.semantic_type = 'time'
        AND bi.orchestrator = true
        AND bi.composite = true
        AND NOT EXISTS (
          SELECT 1
          FROM instance_components AS ic
          WHERE ic.parent_id = bi.id
            AND ic.disabled = false
        );
    `)

    await sequelize.query(`
      UPDATE block_instance_versions AS biv
      SET composite = false
      FROM block_instances AS bi
      JOIN block_shapes AS bs ON bs.id = bi.block_shape_ref
      WHERE biv.block_instance_id = bi.id
        AND bs.semantic_type = 'time'
        AND bi.orchestrator = true
        AND biv.composite = true
        AND NOT EXISTS (
          SELECT 1
          FROM instance_components AS ic
          WHERE ic.parent_id = bi.id
            AND ic.disabled = false
        );
    `)
  },
}
