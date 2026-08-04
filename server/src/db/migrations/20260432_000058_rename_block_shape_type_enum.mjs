/**
 * Phase 20.1.1 — Rename block_shapes.type enum labels: property→time, coupon→price, option→event.
 * Align appointment_selection_lines.line_kind CHECK + data (property→time, option→event).
 */

export default {
  async up(queryInterface) {
    const sequelize = queryInterface.sequelize
    await sequelize.query(`
DO $migrate$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_catalog.pg_enum e
    JOIN pg_catalog.pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'enum_block_shapes_type' AND e.enumlabel = 'property'
  ) THEN
    ALTER TYPE public.enum_block_shapes_type RENAME VALUE 'property' TO 'time';
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_catalog.pg_enum e
    JOIN pg_catalog.pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'enum_block_shapes_type' AND e.enumlabel = 'coupon'
  ) THEN
    ALTER TYPE public.enum_block_shapes_type RENAME VALUE 'coupon' TO 'price';
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_catalog.pg_enum e
    JOIN pg_catalog.pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'enum_block_shapes_type' AND e.enumlabel = 'option'
  ) THEN
    ALTER TYPE public.enum_block_shapes_type RENAME VALUE 'option' TO 'event';
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_catalog.pg_enum e
    JOIN pg_catalog.pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'block_shape_type' AND e.enumlabel = 'property'
  ) THEN
    ALTER TYPE public.block_shape_type RENAME VALUE 'property' TO 'time';
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_catalog.pg_enum e
    JOIN pg_catalog.pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'block_shape_type' AND e.enumlabel = 'coupon'
  ) THEN
    ALTER TYPE public.block_shape_type RENAME VALUE 'coupon' TO 'price';
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_catalog.pg_enum e
    JOIN pg_catalog.pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'block_shape_type' AND e.enumlabel = 'option'
  ) THEN
    ALTER TYPE public.block_shape_type RENAME VALUE 'option' TO 'event';
  END IF;
END
$migrate$;
`)

    await sequelize.query(`
      ALTER TABLE public.appointment_selection_lines
        DROP CONSTRAINT IF EXISTS appointment_selection_lines_line_kind_check;
    `)
    await sequelize.query(`
      UPDATE public.appointment_selection_lines SET line_kind = 'time' WHERE line_kind = 'property';
    `)
    await sequelize.query(`
      UPDATE public.appointment_selection_lines SET line_kind = 'event' WHERE line_kind = 'option';
    `)
    await sequelize.query(`
      ALTER TABLE public.appointment_selection_lines
        ADD CONSTRAINT appointment_selection_lines_line_kind_check
        CHECK (line_kind = ANY (ARRAY['service'::text, 'time'::text, 'event'::text]));
    `)
  },

  async down(queryInterface) {
    const sequelize = queryInterface.sequelize
    await sequelize.query(`
      ALTER TABLE public.appointment_selection_lines
        DROP CONSTRAINT IF EXISTS appointment_selection_lines_line_kind_check;
    `)
    await sequelize.query(`
      UPDATE public.appointment_selection_lines SET line_kind = 'property' WHERE line_kind = 'time';
    `)
    await sequelize.query(`
      UPDATE public.appointment_selection_lines SET line_kind = 'option' WHERE line_kind = 'event';
    `)
    await sequelize.query(`
      ALTER TABLE public.appointment_selection_lines
        ADD CONSTRAINT appointment_selection_lines_line_kind_check
        CHECK (line_kind = ANY (ARRAY['service'::text, 'property'::text, 'option'::text]));
    `)

    await sequelize.query(`
DO $migrate$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_catalog.pg_enum e
    JOIN pg_catalog.pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'enum_block_shapes_type' AND e.enumlabel = 'time'
  ) THEN
    ALTER TYPE public.enum_block_shapes_type RENAME VALUE 'time' TO 'property';
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_catalog.pg_enum e
    JOIN pg_catalog.pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'enum_block_shapes_type' AND e.enumlabel = 'price'
  ) THEN
    ALTER TYPE public.enum_block_shapes_type RENAME VALUE 'price' TO 'coupon';
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_catalog.pg_enum e
    JOIN pg_catalog.pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'enum_block_shapes_type' AND e.enumlabel = 'event'
  ) THEN
    ALTER TYPE public.enum_block_shapes_type RENAME VALUE 'event' TO 'option';
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_catalog.pg_enum e
    JOIN pg_catalog.pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'block_shape_type' AND e.enumlabel = 'time'
  ) THEN
    ALTER TYPE public.block_shape_type RENAME VALUE 'time' TO 'property';
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_catalog.pg_enum e
    JOIN pg_catalog.pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'block_shape_type' AND e.enumlabel = 'price'
  ) THEN
    ALTER TYPE public.block_shape_type RENAME VALUE 'price' TO 'coupon';
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_catalog.pg_enum e
    JOIN pg_catalog.pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'block_shape_type' AND e.enumlabel = 'event'
  ) THEN
    ALTER TYPE public.block_shape_type RENAME VALUE 'event' TO 'option';
  END IF;
END
$migrate$;
`)
  },
}
