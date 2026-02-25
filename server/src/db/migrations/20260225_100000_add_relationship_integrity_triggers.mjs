/**
 * Migration: Add database triggers for relationship integrity enforcement
 * Date: 2026-02-25
 *
 * When an admin removes a valid_cascade rule (e.g. "Service shapes can no
 * longer cascade to Option shapes"), any existing booking_cascades between
 * instances of those shapes become invalid.  Previously this cleanup ran
 * client-side; moving it to a trigger makes it transactional, race-free,
 * and independent of which client (UI, API, migration) modifies the rules.
 *
 * Creates two trigger functions:
 *   1. trg_cleanup_booking_cascades  — fires AFTER DELETE on valid_cascades
 *      Deletes booking_cascade rows whose parent/child block_instances
 *      reference the shape pair that was just removed.
 *
 *   2. trg_cleanup_part_assignments  — fires AFTER DELETE on valid_parts
 *      Deletes part_assignment rows whose parent block_instance references
 *      the removed parent shape and whose child part_instance references
 *      the removed child shape.
 */

export default {
  async up(queryInterface, _Sequelize) {
    await queryInterface.sequelize.query(`
      CREATE OR REPLACE FUNCTION cleanup_booking_cascades_on_valid_cascade_delete()
      RETURNS TRIGGER AS $$
      BEGIN
        DELETE FROM booking_cascades bc
        USING block_instances parent_inst,
              block_instances child_inst
        WHERE bc.parent_id = parent_inst.id
          AND bc.child_id  = child_inst.id
          AND parent_inst.block_shape_ref = OLD.parent_id
          AND child_inst.block_shape_ref  = OLD.child_id;
        RETURN OLD;
      END;
      $$ LANGUAGE plpgsql;
    `);

    await queryInterface.sequelize.query(`
      CREATE TRIGGER trg_cleanup_booking_cascades
      AFTER DELETE ON valid_cascades
      FOR EACH ROW
      EXECUTE FUNCTION cleanup_booking_cascades_on_valid_cascade_delete();
    `);

    await queryInterface.sequelize.query(`
      CREATE OR REPLACE FUNCTION cleanup_part_assignments_on_valid_part_delete()
      RETURNS TRIGGER AS $$
      BEGIN
        DELETE FROM part_assignments pa
        USING block_instances parent_inst,
              part_instances  child_inst
        WHERE pa.parent_id = parent_inst.id
          AND pa.child_id  = child_inst.id
          AND parent_inst.block_shape_ref = OLD.parent_id
          AND child_inst.part_shape_ref   = OLD.child_id;
        RETURN OLD;
      END;
      $$ LANGUAGE plpgsql;
    `);

    await queryInterface.sequelize.query(`
      CREATE TRIGGER trg_cleanup_part_assignments
      AFTER DELETE ON valid_parts
      FOR EACH ROW
      EXECUTE FUNCTION cleanup_part_assignments_on_valid_part_delete();
    `);

    console.log('[relationship_integrity_triggers] Created triggers: trg_cleanup_booking_cascades, trg_cleanup_part_assignments');
  },

  async down(queryInterface, _Sequelize) {
    await queryInterface.sequelize.query(`
      DROP TRIGGER IF EXISTS trg_cleanup_booking_cascades ON valid_cascades;
    `);
    await queryInterface.sequelize.query(`
      DROP FUNCTION IF EXISTS cleanup_booking_cascades_on_valid_cascade_delete();
    `);

    await queryInterface.sequelize.query(`
      DROP TRIGGER IF EXISTS trg_cleanup_part_assignments ON valid_parts;
    `);
    await queryInterface.sequelize.query(`
      DROP FUNCTION IF EXISTS cleanup_part_assignments_on_valid_part_delete();
    `);

    console.log('[relationship_integrity_triggers] Dropped triggers and functions');
  },
};
