<!-- Extracted from UsersTable for component-health (allowlist repair). -->
<template>
  <VCard class="mb-4">
    <VCardTitle>Create New User</VCardTitle>
    <VCardText>
      <VRow>
        <VCol cols="12" md="6">
          <VTextField
            :model-value="firstName"
            label="First Name *"
            required
            @update:model-value="setFirstName"
          />
        </VCol>
        <VCol cols="12" md="6">
          <VTextField
            :model-value="lastName"
            label="Last Name *"
            required
            @update:model-value="setLastName"
          />
        </VCol>
        <VCol cols="12" md="6">
          <VTextField
            :model-value="email"
            type="email"
            label="Email *"
            required
            @update:model-value="setEmail"
          />
        </VCol>
        <VCol cols="12" md="6">
          <VTextField
            :model-value="phone"
            type="tel"
            label="Phone"
            @update:model-value="setPhone"
          />
        </VCol>
        <VCol cols="12" md="6">
          <VSelect
            :model-value="userRole"
            :items="['client', 'agent', 'transaction_manager', 'seller', 'inspector']"
            label="Role"
            @update:model-value="setUserRole"
          />
        </VCol>
        <VCol cols="12" md="6">
          <VTextField
            :model-value="loginId"
            type="number"
            label="Login ID"
            @update:model-value="setLoginId"
          />
        </VCol>
      </VRow>
    </VCardText>
    <VCardActions>
      <VSpacer />
      <VBtn variant="text" @click="$emit('cancel')">Cancel</VBtn>
      <VBtn color="primary" @click="$emit('save')">Save</VBtn>
    </VCardActions>
  </VCard>
</template>

<script setup lang="ts">
/* eslint-disable vue/no-mutating-props */
import { computed } from 'vue'
import type { Ref } from 'vue'
import type { UserRequest } from '@/types/user'
import { asEmptyString } from '@/utils/safeDefaults'

const props = defineProps<{
  newUser: Ref<Partial<UserRequest>>
}>()

defineEmits<{ (e: 'cancel'): void; (e: 'save'): void }>()

const firstName = computed(() => asEmptyString(props.newUser?.value?.firstName))
const lastName = computed(() => asEmptyString(props.newUser?.value?.lastName))
const email = computed(() => asEmptyString(props.newUser?.value?.email))
const phone = computed(() => asEmptyString(props.newUser?.value?.phone))
const userRole = computed(() => props.newUser?.value?.userRole != null ? props.newUser.value.userRole : 'client')
const loginId = computed(() => props.newUser?.value?.loginId ?? null)

function setFirstName(v: string): void {
  if (props.newUser?.value) props.newUser.value.firstName = v
}
function setLastName(v: string): void {
  if (props.newUser?.value) props.newUser.value.lastName = v
}
function setEmail(v: string): void {
  if (props.newUser?.value) props.newUser.value.email = v
}
function setPhone(v: string | null): void {
  if (props.newUser?.value) props.newUser.value.phone = v ?? undefined
}
function setUserRole(v: string): void {
  if (props.newUser?.value) props.newUser.value.userRole = v as UserRequest['userRole']
}
function setLoginId(v: number | string | null): void {
  if (props.newUser?.value) props.newUser.value.loginId = v != null ? Number(v) : undefined
}
</script>
