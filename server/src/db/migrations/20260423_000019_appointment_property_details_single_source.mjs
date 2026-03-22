/**
 * Policy A: merge legacy appointments.property_details JSONB into property_details rows
 * (fill nulls from JSON where possible), then drop appointments.property_details.
 */

export default {
  async up(queryInterface) {
    const sequelize = queryInterface.sequelize

    await sequelize.query(`
      INSERT INTO public.property_details (
        id, property_version_id, source, mls_number, square_footage, bedrooms, bathrooms,
        foundation_access, additional_units, created_at, updated_at
      )
      SELECT
        gen_random_uuid(),
        ap.property_version_id,
        'client'::public.enum_property_details_source,
        NULLIF(TRIM(ap.property_details->>'mlsNumber'), ''),
        COALESCE(
          CASE WHEN (ap.property_details->>'squareFootage') ~ '^[0-9]+$'
            THEN (ap.property_details->>'squareFootage')::integer END,
          CASE WHEN (ap.property_details->>'propertySize') ~ '^[0-9]+$'
            THEN (ap.property_details->>'propertySize')::integer END
        ),
        CASE WHEN (ap.property_details->>'bedrooms') ~ '^[0-9]+$'
          THEN (ap.property_details->>'bedrooms')::integer END,
        CASE WHEN (ap.property_details->>'bathrooms') ~ '^-?[0-9]+(\\.[0-9]+)?$'
          THEN (ap.property_details->>'bathrooms')::numeric(5,2) END,
        CASE ap.property_details->>'foundationAccess'
          WHEN 'basement' THEN 'basement'::public.enum_property_details_foundation_access
          WHEN 'crawlspace' THEN 'crawlspace'::public.enum_property_details_foundation_access
          WHEN 'slab' THEN 'slab'::public.enum_property_details_foundation_access
          ELSE NULL
        END,
        COALESCE(
          CASE WHEN (ap.property_details->>'additionalUnits') ~ '^[0-9]+$'
            THEN (ap.property_details->>'additionalUnits')::integer END,
          CASE WHEN (ap.property_details->>'numberOfUnits') ~ '^[0-9]+$'
            THEN (ap.property_details->>'numberOfUnits')::integer END
        ),
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
      FROM public.appointments ap
      WHERE ap.property_details IS NOT NULL
        AND jsonb_typeof(ap.property_details) = 'object'
        AND NOT EXISTS (
          SELECT 1 FROM public.property_details pd
          WHERE pd.property_version_id = ap.property_version_id
        );
    `)

    await sequelize.query(`
      UPDATE public.property_details pd
      SET
        mls_number = COALESCE(pd.mls_number, NULLIF(TRIM(ap.property_details->>'mlsNumber'), '')),
        square_footage = COALESCE(
          pd.square_footage,
          CASE WHEN (ap.property_details->>'squareFootage') ~ '^[0-9]+$'
            THEN (ap.property_details->>'squareFootage')::integer END,
          CASE WHEN (ap.property_details->>'propertySize') ~ '^[0-9]+$'
            THEN (ap.property_details->>'propertySize')::integer END
        ),
        bedrooms = COALESCE(
          pd.bedrooms,
          CASE WHEN (ap.property_details->>'bedrooms') ~ '^[0-9]+$'
            THEN (ap.property_details->>'bedrooms')::integer END
        ),
        bathrooms = COALESCE(
          pd.bathrooms,
          CASE WHEN (ap.property_details->>'bathrooms') ~ '^-?[0-9]+(\\.[0-9]+)?$'
            THEN (ap.property_details->>'bathrooms')::numeric(5,2) END
        ),
        foundation_access = COALESCE(
          pd.foundation_access,
          CASE ap.property_details->>'foundationAccess'
            WHEN 'basement' THEN 'basement'::public.enum_property_details_foundation_access
            WHEN 'crawlspace' THEN 'crawlspace'::public.enum_property_details_foundation_access
            WHEN 'slab' THEN 'slab'::public.enum_property_details_foundation_access
            ELSE NULL
          END
        ),
        additional_units = COALESCE(
          pd.additional_units,
          CASE WHEN (ap.property_details->>'additionalUnits') ~ '^[0-9]+$'
            THEN (ap.property_details->>'additionalUnits')::integer END,
          CASE WHEN (ap.property_details->>'numberOfUnits') ~ '^[0-9]+$'
            THEN (ap.property_details->>'numberOfUnits')::integer END
        )
      FROM public.appointments ap
      WHERE ap.property_version_id = pd.property_version_id
        AND ap.property_details IS NOT NULL
        AND jsonb_typeof(ap.property_details) = 'object';
    `)

    await sequelize.query(`
      ALTER TABLE public.appointments DROP COLUMN IF EXISTS property_details;
    `)
  },

  async down(queryInterface) {
    const sequelize = queryInterface.sequelize
    await sequelize.query(`
      ALTER TABLE public.appointments
        ADD COLUMN IF NOT EXISTS property_details jsonb;
    `)
  },
}
