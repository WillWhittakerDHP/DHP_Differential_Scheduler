<!--
  Session 6.8.6.3: Admin entry (step 0) — Start new | Edit quote | Reschedule; dropdown; navigate to wizard step 3.
-->
<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useListForAdminEntry, formatUserDisplayName } from '@/composables/booking/useListForAdminEntry'
import { useUser } from '@/composables/useUser'
import type { AdminEntryAppointmentItem } from '@shared/types/appointmentTypes'

const router = useRouter()
const selectedAction = ref<'new' | 'quote' | 'reschedule' | null>(null)
const selectedAppointmentId = ref<string | null>(null)

const { data: listItems, isLoading: isLoadingList } = useListForAdminEntry()
const { fetchAll: usersQuery } = useUser()

const users = computed(() => {
  const d = usersQuery.data.value
  return Array.isArray(d) ? d : []
})

const getUserById = (id: string | null | undefined): import('@/types/user').UserResponse | undefined => {
  if (!id) return undefined
  return users.value.find(u => u.id === id)
}

const dropdownItems = computed(() => {
  const raw = listItems.value
  const items = Array.isArray(raw) ? raw : []
  return items.map((item: AdminEntryAppointmentItem) => ({
    ...item,
    clientName: formatUserDisplayName(getUserById(item.clientUserId)),
    agentName: formatUserDisplayName(getUserById(item.agentUserId)),
  }))
})


function goStartNew(): void {
  router.push({ path: '/booking' })
}

function goToWizardWithAppointment(): void {
  const id = selectedAppointmentId.value
  const mode = selectedAction.value === 'quote' ? 'quote' : 'reschedule'
  if (!id || (mode !== 'quote' && mode !== 'reschedule')) return
  router.push({ path: '/booking', query: { loadAppointmentId: id, mode } })
}

const canGo = computed(() => {
  if (selectedAction.value === 'new') return true
  return selectedAppointmentId.value != null
})
</script>

<template>
  <div class="admin-booking-entry">
    <VBtn variant="text" size="small" class="mb-2" :to="{ name: 'admin-panel' }">
      ← Back to admin
    </VBtn>
    <VCard>
      <VCardTitle class="text-h6">Booking wizard</VCardTitle>
      <VCardText>
        <p class="text-body-2 mb-4">Choose how to enter the booking wizard.</p>
        <VRow density="compact">
          <VCol cols="12" sm="4">
            <VBtn
              block
              variant="outlined"
              :color="selectedAction === 'new' ? 'primary' : undefined"
              @click="selectedAction = 'new'"
            >
              Start new inspection
            </VBtn>
          </VCol>
          <VCol cols="12" sm="4">
            <VBtn
              block
              variant="outlined"
              :color="selectedAction === 'quote' ? 'primary' : undefined"
              @click="selectedAction = 'quote'"
            >
              Edit quote
            </VBtn>
          </VCol>
          <VCol cols="12" sm="4">
            <VBtn
              block
              variant="outlined"
              :color="selectedAction === 'reschedule' ? 'primary' : undefined"
              @click="selectedAction = 'reschedule'"
            >
              Reschedule
            </VBtn>
          </VCol>
        </VRow>

        <template v-if="selectedAction === 'quote' || selectedAction === 'reschedule'">
          <VRow class="mt-4" density="compact">
            <VCol cols="12">
              <div class="text-caption mb-2">Select an appointment (Address, Client, Agent)</div>
              <VSelect
                v-model="selectedAppointmentId"
                :items="dropdownItems"
                item-title="address"
                item-value="id"
                :loading="isLoadingList"
                placeholder="Select appointment..."
                clearable
                density="comfortable"
                variant="outlined"
              >
                <template #item="{ props: itemProps, item }">
                  <VListItem v-bind="itemProps">
                    <VListItemTitle>{{ item?.address ?? '—' }}</VListItemTitle>
                    <VListItemSubtitle>
                      Client: {{ item?.clientName ?? '—' }} · Agent: {{ item?.agentName ?? '—' }}
                    </VListItemSubtitle>
                  </VListItem>
                </template>
                <template #selection="{ item }">
                  <span>{{ item?.address ?? '—' }}</span>
                  <span v-if="item?.clientName || item?.agentName" class="text-caption text-medium-emphasis ml-2">
                    ({{ item?.clientName }} / {{ item?.agentName }})
                  </span>
                </template>
              </VSelect>
            </VCol>
          </VRow>
        </template>

        <VRow class="mt-4" density="compact">
          <VCol cols="12">
            <VBtn
              color="primary"
              :disabled="!canGo"
              @click="selectedAction === 'new' ? goStartNew() : goToWizardWithAppointment()"
            >
              {{ selectedAction === 'new' ? 'Continue to wizard' : 'Open wizard' }}
            </VBtn>
          </VCol>
        </VRow>
      </VCardText>
    </VCard>
  </div>
</template>

<style scoped>
.admin-booking-entry {
  padding: 1rem;
  max-width: 640px;
  margin: 0 auto;
}
</style>
