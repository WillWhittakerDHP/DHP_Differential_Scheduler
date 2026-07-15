<!-- PATTERN: Template-first authoring; labels match Google Calendar field names. -->
<script setup lang="ts">
import type { NewEventInstanceData } from '@/types/admin/instancesTabEventInstance'
import type { EventInstanceTemplateFieldKey } from '@/composables/admin/useEventInstanceBuilder'

const draft = defineModel<NewEventInstanceData>({ required: true })

defineProps<{
  titleErrorMessages: string[]
  descriptionErrorMessages: string[]
  locationErrorMessages: string[]
  setActiveTemplateField: (k: EventInstanceTemplateFieldKey) => void
}>()
</script>

<template>
  <VAlert type="info" variant="tonal" density="compact" class="mb-4 text-body-small">
    <strong>What this creates in Google Calendar:</strong>
    Calendar Title → <em>summary</em> · Calendar Description → <em>description</em>. Location normally comes
    from the scheduled appointment; only set an override for Zoom/custom virtual links.
  </VAlert>

  <VTextarea
    v-model="draft.titleTemplate"
    data-event-template-field="titleTemplate"
    label="Calendar Title"
    variant="outlined"
    density="compact"
    rows="3"
    hint="Shown as the event title (Google Calendar summary)."
    persistent-hint
    :error-messages="titleErrorMessages"
    class="mb-3"
    @focus="setActiveTemplateField('titleTemplate')"
  />
  <VTextarea
    v-model="draft.descriptionTemplate"
    data-event-template-field="descriptionTemplate"
    label="Calendar Description"
    variant="outlined"
    density="compact"
    rows="4"
    hint="Shown in the event details body."
    persistent-hint
    :error-messages="descriptionErrorMessages"
    class="mb-3"
    @focus="setActiveTemplateField('descriptionTemplate')"
  />
  <VTextarea
    v-model="draft.locationTemplate"
    data-event-template-field="locationTemplate"
    label="Location override (Zoom/custom link)"
    variant="outlined"
    density="compact"
    rows="3"
    hint="Leave blank to use the appointment address. Use only for Zoom/custom virtual links; use the Google Meet switch below for Meet."
    persistent-hint
    :error-messages="locationErrorMessages"
    class="mb-2"
    @focus="setActiveTemplateField('locationTemplate')"
  />
</template>
