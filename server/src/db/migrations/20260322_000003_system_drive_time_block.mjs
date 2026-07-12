/**
 * Phase 6.11.5: System "Drive time" block instance for appointment_fee_entries.block_instance_id.
 * Add-on (ternary true) + Option shape; one zero-fee part so global→booking transform is valid.
 * Client constants must match UUIDs below.
 */

const BLOCK_ID = '7e9e1f0a-2c8d-4b1e-9f6a-3d2c1b0a9e8f'
const PART_ID = '8f0e2e1b-3d9e-5c2f-0a7b-4e3d2c1b0a9e'
const ASSIGNMENT_ID = '9a1f3e2c-4e0f-6d3a-1b8c-5f4e3d2c1b0a'
/** Option shape from baseline_data.sql */
const OPTION_SHAPE_ID = 'c3e2fbe7-5201-4151-8355-14ebe8741b48'
/** Reuse a generic fee part shape from baseline (Data Collection–style) */
const PART_SHAPE_ID = '70f68a49-8339-4590-8716-cd4bcccabee5'

export default {
  async up(queryInterface) {
    const sequelize = queryInterface.sequelize
    await sequelize.query(
      `
      INSERT INTO public.block_instances (
        id, name, order_index, block_shape_ref, created_at, updated_at, icon, base_sq_ft, composite,
        differential, allow_multiple, requires_unit_number, booking_mode, is_multi_family, requires_agent,
        pre_closing, agent_permissions
      )
      SELECT :blockId, 'Drive time', 999, :shapeId, NOW(), NOW(), '', 0, false,
        'false', false, false, 'true', false, false, false, 'false'
      WHERE NOT EXISTS (SELECT 1 FROM public.block_instances WHERE id = :blockId)
      `,
      { replacements: { blockId: BLOCK_ID, shapeId: OPTION_SHAPE_ID } }
    )

    await sequelize.query(
      `
      INSERT INTO public.part_instances (
        id, name, order_index, part_shape_ref, created_at, updated_at,
        base_fee, fee_per_unit, base_time, time_per_unit, active, zero_out_part
      )
      SELECT :partId, 'Drive time', 0, :partShapeId, NOW(), NOW(), 0, 0, 0, 0, true, false
      WHERE NOT EXISTS (SELECT 1 FROM public.part_instances WHERE id = :partId)
      `,
      { replacements: { partId: PART_ID, partShapeId: PART_SHAPE_ID } }
    )

    await sequelize.query(
      `
      INSERT INTO public.part_assignments (
        id, parent_id, child_id, disabled, created_at, updated_at
      )
      SELECT :assignmentId, :blockId, :partId, false, NOW(), NOW()
      WHERE NOT EXISTS (
        SELECT 1 FROM public.part_assignments WHERE parent_id = :blockId AND child_id = :partId
      )
      `,
      { replacements: { assignmentId: ASSIGNMENT_ID, blockId: BLOCK_ID, partId: PART_ID } }
    )
  },

  async down(queryInterface) {
    const sequelize = queryInterface.sequelize
    await sequelize.query(`DELETE FROM public.part_assignments WHERE id = :id`, {
      replacements: { id: ASSIGNMENT_ID },
    })
    await sequelize.query(`DELETE FROM public.part_instances WHERE id = :id`, {
      replacements: { id: PART_ID },
    })
    await sequelize.query(`DELETE FROM public.block_instances WHERE id = :id`, {
      replacements: { id: BLOCK_ID },
    })
  },
}
