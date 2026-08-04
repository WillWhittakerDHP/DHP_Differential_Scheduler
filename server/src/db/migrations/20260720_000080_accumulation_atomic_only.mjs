/**
 * WHY: Accumulation is atomic ↔ atomic. Soft-disable links whose parent is a
 * composite package (e.g. Blue Tape) so runtime and admin stay aligned.
 */
export default {
  async up(queryInterface) {
    const { sequelize } = queryInterface
    await sequelize.query(`
      UPDATE accumulation_links AS al
      SET disabled = true
      FROM block_instances AS bi
      WHERE al.parent_id = bi.id
        AND bi.composite = true
        AND al.disabled = false;
    `)

    await sequelize.query(`
      UPDATE accumulation_links AS al
      SET disabled = true
      FROM block_instances AS bi
      WHERE al.child_id = bi.id
        AND bi.composite = true
        AND al.disabled = false;
    `)

    await sequelize.query(`
      UPDATE block_instances AS bi
      SET accumulator = false,
          updated_at = NOW()
      WHERE bi.composite = true
        AND bi.accumulator = true;
    `)
  },

  async down() {
    // Soft-disabled rows are not automatically re-enabled — intentional.
  },
}
