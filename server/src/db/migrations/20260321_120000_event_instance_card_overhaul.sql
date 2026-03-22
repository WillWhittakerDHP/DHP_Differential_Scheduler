-- Event Instance EntityCard UX: template ordering, Calendar-aligned labels,
-- multiline + hint input_config for templates, hide virtual/unusable fields.

UPDATE public.admin_metadata
SET
  display_order = 1,
  label = 'Calendar Title',
  input_config = '{"multiline": true, "hint": "e.g. {service} at {streetAddress}"}'::jsonb,
  updated_at = CURRENT_TIMESTAMP
WHERE entity_type = 'eventInstance'
  AND entity_id = '00000000-0000-0000-0000-000000000012'
  AND field_key = 'titleTemplate';

UPDATE public.admin_metadata
SET
  label = 'Calendar Description',
  input_config = '{"multiline": true, "hint": "e.g. {service} on {appointmentDate} at {appointmentTime}"}'::jsonb,
  updated_at = CURRENT_TIMESTAMP
WHERE entity_type = 'eventInstance'
  AND entity_id = '00000000-0000-0000-0000-000000000012'
  AND field_key = 'descriptionTemplate';

UPDATE public.admin_metadata
SET
  display_order = 3,
  label = 'Calendar Location',
  input_config = '{"multiline": true, "hint": "e.g. {fullAddress}"}'::jsonb,
  updated_at = CURRENT_TIMESTAMP
WHERE entity_type = 'eventInstance'
  AND entity_id = '00000000-0000-0000-0000-000000000012'
  AND field_key = 'locationTemplate';

UPDATE public.admin_metadata
SET label = 'Calendar Visibility', updated_at = CURRENT_TIMESTAMP
WHERE entity_type = 'eventInstance'
  AND entity_id = '00000000-0000-0000-0000-000000000012'
  AND field_key = 'visibility';

UPDATE public.admin_metadata
SET label = 'Show As (Busy/Free)', updated_at = CURRENT_TIMESTAMP
WHERE entity_type = 'eventInstance'
  AND entity_id = '00000000-0000-0000-0000-000000000012'
  AND field_key = 'transparency';

UPDATE public.admin_metadata
SET label = 'Calendar Color', updated_at = CURRENT_TIMESTAMP
WHERE entity_type = 'eventInstance'
  AND entity_id = '00000000-0000-0000-0000-000000000012'
  AND field_key = 'colorId';

UPDATE public.admin_metadata
SET label = 'Calendar Status', updated_at = CURRENT_TIMESTAMP
WHERE entity_type = 'eventInstance'
  AND entity_id = '00000000-0000-0000-0000-000000000012'
  AND field_key = 'status';

UPDATE public.admin_metadata
SET label = 'Email Notifications', updated_at = CURRENT_TIMESTAMP
WHERE entity_type = 'eventInstance'
  AND entity_id = '00000000-0000-0000-0000-000000000012'
  AND field_key = 'sendUpdates';

UPDATE public.admin_metadata
SET label = 'Google Meet Link', updated_at = CURRENT_TIMESTAMP
WHERE entity_type = 'eventInstance'
  AND entity_id = '00000000-0000-0000-0000-000000000012'
  AND field_key = 'addConferenceLink';

UPDATE public.admin_metadata
SET visibility = 'hidden', updated_at = CURRENT_TIMESTAMP
WHERE entity_type = 'eventInstance'
  AND entity_id = '00000000-0000-0000-0000-000000000012'
  AND field_key = 'scheduledBy';

UPDATE public.admin_metadata
SET visibility = 'hidden', updated_at = CURRENT_TIMESTAMP
WHERE entity_type = 'eventInstance'
  AND entity_id = '00000000-0000-0000-0000-000000000012'
  AND field_key = 'reminderOverrides';
