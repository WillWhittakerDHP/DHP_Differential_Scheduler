/**
 * Migration: Create appointment_fee_summaries and appointment_fee_entries tables
 * Date: 2026-02-18
 * Purpose: Normalized fee storage at booking time for income constraints and analytics.
 *          Summary is 1:1 with appointment; entries are per-block breakdown (many:1 with summary).
 */

export default {
  async up(queryInterface, _Sequelize) {
    await queryInterface.sequelize.query(`
      CREATE TABLE public.appointment_fee_summaries (
        id uuid DEFAULT gen_random_uuid() NOT NULL,
        appointment_id uuid NOT NULL,
        base_fee_total numeric NOT NULL DEFAULT 0,
        overage_fee_total numeric NOT NULL DEFAULT 0,
        total_fee numeric NOT NULL DEFAULT 0,
        square_footage numeric NOT NULL DEFAULT 0,
        adu_count integer NOT NULL DEFAULT 1,
        currency varchar(3) NOT NULL DEFAULT 'USD',
        calculated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
        created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await queryInterface.sequelize.query(`
      ALTER TABLE ONLY public.appointment_fee_summaries
        ADD CONSTRAINT appointment_fee_summaries_pkey PRIMARY KEY (id);
    `);
    await queryInterface.sequelize.query(`
      ALTER TABLE ONLY public.appointment_fee_summaries
        ADD CONSTRAINT appointment_fee_summaries_appointment_id_key UNIQUE (appointment_id);
    `);
    await queryInterface.sequelize.query(`
      ALTER TABLE ONLY public.appointment_fee_summaries
        ADD CONSTRAINT appointment_fee_summaries_appointment_id_fkey
        FOREIGN KEY (appointment_id) REFERENCES public.appointments(id) ON UPDATE CASCADE ON DELETE CASCADE;
    `);
    await queryInterface.sequelize.query(`
      CREATE INDEX idx_fee_summaries_appointment ON public.appointment_fee_summaries(appointment_id);
    `);
    await queryInterface.sequelize.query(`
      CREATE INDEX idx_fee_summaries_total_fee ON public.appointment_fee_summaries(total_fee);
    `);

    await queryInterface.sequelize.query(`
      CREATE TABLE public.appointment_fee_entries (
        id uuid DEFAULT gen_random_uuid() NOT NULL,
        fee_summary_id uuid NOT NULL,
        block_instance_id uuid NOT NULL,
        block_name text NOT NULL,
        block_shape_ref uuid NOT NULL,
        base_fee numeric NOT NULL DEFAULT 0,
        overage_fee numeric NOT NULL DEFAULT 0,
        total_fee numeric NOT NULL DEFAULT 0,
        quantity integer NOT NULL DEFAULT 1,
        created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await queryInterface.sequelize.query(`
      ALTER TABLE ONLY public.appointment_fee_entries
        ADD CONSTRAINT appointment_fee_entries_pkey PRIMARY KEY (id);
    `);
    await queryInterface.sequelize.query(`
      ALTER TABLE ONLY public.appointment_fee_entries
        ADD CONSTRAINT appointment_fee_entries_fee_summary_id_fkey
        FOREIGN KEY (fee_summary_id) REFERENCES public.appointment_fee_summaries(id) ON UPDATE CASCADE ON DELETE CASCADE;
    `);
    await queryInterface.sequelize.query(`
      CREATE INDEX idx_fee_entries_summary ON public.appointment_fee_entries(fee_summary_id);
    `);
    await queryInterface.sequelize.query(`
      CREATE INDEX idx_fee_entries_block_instance ON public.appointment_fee_entries(block_instance_id);
    `);
    await queryInterface.sequelize.query(`
      CREATE INDEX idx_fee_entries_block_shape_ref ON public.appointment_fee_entries(block_shape_ref);
    `);
    await queryInterface.sequelize.query(`
      COMMENT ON COLUMN public.appointment_fee_entries.block_instance_id IS 'References block_instances(id) but no FK constraint to allow instance deletion while preserving fee history';
    `);
    await queryInterface.sequelize.query(`
      COMMENT ON COLUMN public.appointment_fee_entries.block_shape_ref IS 'References block_shapes(id) for grouping entries by block type (service, property, option, lineItem)';
    `);

    console.log('[add_fee_tables] Created appointment_fee_summaries and appointment_fee_entries tables');
  },

  async down(queryInterface, _Sequelize) {
    await queryInterface.sequelize.query(`DROP TABLE IF EXISTS public.appointment_fee_entries;`);
    await queryInterface.sequelize.query(`DROP TABLE IF EXISTS public.appointment_fee_summaries;`);
    console.log('[add_fee_tables] Dropped appointment_fee_entries and appointment_fee_summaries tables');
  },
};
