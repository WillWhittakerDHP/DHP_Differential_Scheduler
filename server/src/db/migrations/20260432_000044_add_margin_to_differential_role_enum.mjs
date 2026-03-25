/**
 * Add margin to public.differential_role_enum and eventShape differentialRole admin select options.
 * Down reverts admin_metadata only; dropping ENUM labels requires a type rebuild (not done here).
 */

export default {
  async up(queryInterface) {
    const sequelize = queryInterface.sequelize

    await sequelize.query(`
    DO $migrate$
    BEGIN
      IF NOT EXISTS (
        SELECT 1
        FROM pg_catalog.pg_enum e
        JOIN pg_catalog.pg_type t ON e.enumtypid = t.oid
        WHERE t.typname = 'differential_role_enum'
          AND e.enumlabel = 'margin'
      ) THEN
        ALTER TYPE public.differential_role_enum ADD VALUE 'margin';
      END IF;
    END
    $migrate$;
  `)

    await sequelize.query(`
    UPDATE public.admin_metadata
    SET input_config = '{"options":[{"label":"None","value":null},{"label":"Major","value":"major"},{"label":"Minor","value":"minor"},{"label":"Moveable","value":"moveable"},{"label":"Margin","value":"margin"}]}',
        updated_at = NOW()
    WHERE id = '132b05ce-f486-4d3d-be5d-211b13a7ee9d';
  `)
  },

  async down(queryInterface) {
    const sequelize = queryInterface.sequelize

    await sequelize.query(`
    UPDATE public.admin_metadata
    SET input_config = '{"options":[{"label":"None","value":null},{"label":"Major","value":"major"},{"label":"Minor","value":"minor"},{"label":"Moveable","value":"moveable"}]}',
        updated_at = NOW()
    WHERE id = '132b05ce-f486-4d3d-be5d-211b13a7ee9d';
  `)
  },
}
