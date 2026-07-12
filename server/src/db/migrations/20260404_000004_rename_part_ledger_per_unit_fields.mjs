export default {
  async up(queryInterface) {
    const sequelize = queryInterface.sequelize

    await sequelize.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_schema = 'public'
            AND table_name = 'part_instances'
            AND column_name = 'rate_over_base_fee'
        ) THEN
          ALTER TABLE public.part_instances
            RENAME COLUMN rate_over_base_fee TO fee_per_unit;
        END IF;

        IF EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_schema = 'public'
            AND table_name = 'part_instances'
            AND column_name = 'rate_over_base_time'
        ) THEN
          ALTER TABLE public.part_instances
            RENAME COLUMN rate_over_base_time TO time_per_unit;
        END IF;

        IF EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_schema = 'public'
            AND table_name = 'part_instance_versions'
            AND column_name = 'rate_over_base_fee'
        ) THEN
          ALTER TABLE public.part_instance_versions
            RENAME COLUMN rate_over_base_fee TO fee_per_unit;
        END IF;

        IF EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_schema = 'public'
            AND table_name = 'part_instance_versions'
            AND column_name = 'rate_over_base_time'
        ) THEN
          ALTER TABLE public.part_instance_versions
            RENAME COLUMN rate_over_base_time TO time_per_unit;
        END IF;
      END
      $$;
    `)

    await sequelize.query(`
      UPDATE public.admin_metadata
      SET
        field_key = CASE field_key
          WHEN 'rateOverBaseFee' THEN 'feePerUnit'
          WHEN 'rateOverBaseTime' THEN 'timePerUnit'
          ELSE field_key
        END,
        label = CASE field_key
          WHEN 'rateOverBaseFee' THEN 'Fee Per Unit'
          WHEN 'rateOverBaseTime' THEN 'Time Per Unit'
          ELSE label
        END
      WHERE entity_type = 'partInstance'
        AND field_key IN ('rateOverBaseFee', 'rateOverBaseTime');
    `)

    await sequelize.query(`
      UPDATE public.entity_layout_config
      SET field_key = CASE field_key
        WHEN 'rateOverBaseFee' THEN 'feePerUnit'
        WHEN 'rateOverBaseTime' THEN 'timePerUnit'
        ELSE field_key
      END
      WHERE entity_type = 'part'
        AND field_key IN ('rateOverBaseFee', 'rateOverBaseTime');
    `)
  },

  async down(queryInterface) {
    const sequelize = queryInterface.sequelize

    await sequelize.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_schema = 'public'
            AND table_name = 'part_instances'
            AND column_name = 'fee_per_unit'
        ) THEN
          ALTER TABLE public.part_instances
            RENAME COLUMN fee_per_unit TO rate_over_base_fee;
        END IF;

        IF EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_schema = 'public'
            AND table_name = 'part_instances'
            AND column_name = 'time_per_unit'
        ) THEN
          ALTER TABLE public.part_instances
            RENAME COLUMN time_per_unit TO rate_over_base_time;
        END IF;

        IF EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_schema = 'public'
            AND table_name = 'part_instance_versions'
            AND column_name = 'fee_per_unit'
        ) THEN
          ALTER TABLE public.part_instance_versions
            RENAME COLUMN fee_per_unit TO rate_over_base_fee;
        END IF;

        IF EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_schema = 'public'
            AND table_name = 'part_instance_versions'
            AND column_name = 'time_per_unit'
        ) THEN
          ALTER TABLE public.part_instance_versions
            RENAME COLUMN time_per_unit TO rate_over_base_time;
        END IF;
      END
      $$;
    `)

    await sequelize.query(`
      UPDATE public.admin_metadata
      SET
        field_key = CASE field_key
          WHEN 'feePerUnit' THEN 'rateOverBaseFee'
          WHEN 'timePerUnit' THEN 'rateOverBaseTime'
          ELSE field_key
        END,
        label = CASE field_key
          WHEN 'feePerUnit' THEN 'Rate Over Base Fee'
          WHEN 'timePerUnit' THEN 'Rate Over Base Time'
          ELSE label
        END
      WHERE entity_type = 'partInstance'
        AND field_key IN ('feePerUnit', 'timePerUnit');
    `)

    await sequelize.query(`
      UPDATE public.entity_layout_config
      SET field_key = CASE field_key
        WHEN 'feePerUnit' THEN 'rateOverBaseFee'
        WHEN 'timePerUnit' THEN 'rateOverBaseTime'
        ELSE field_key
      END
      WHERE entity_type = 'part'
        AND field_key IN ('feePerUnit', 'timePerUnit');
    `)
  },
}
