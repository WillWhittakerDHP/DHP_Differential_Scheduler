<!--
  WHY: Operators map canonical user_role to user-type state-control block instances (Feature 6.18.2.2).
  PATTERN: Thin template; mutates alignments object owned by useAdminUserRoleBlockAlignment.
-->
<script setup lang="ts">
/* eslint-disable vue/no-mutating-props -- Deep form: alignments ref target is composable-owned (same pattern as Organization defaults). */
import { USER_ROLE_VALUES, type UserRoleValue } from '@shared/constants/roleConstants'
import { BUSINESS_CONTROLS_TAB_STRINGS } from '@/configs/businessControlsTabStrings'

defineProps<{
  alignments: Record<UserRoleValue, string | null>
  instanceItems: { title: string; value: string }[]
}>()

function formatUserRoleLabel(role: UserRoleValue): string {
  return role
    .split('_')
    .map((w) => (w.length > 0 ? w.charAt(0).toUpperCase() + w.slice(1) : w))
    .join(' ')
}
</script>

<template>
  <div class="role-alignment-section">
    <VCard class="mb-4" variant="outlined">
      <VCardTitle class="text-subtitle-1">{{ BUSINESS_CONTROLS_TAB_STRINGS.roleAlignment.cardTitle }}</VCardTitle>
      <VCardText>
        <p class="text-body-2 text-medium-emphasis mb-4">
          {{ BUSINESS_CONTROLS_TAB_STRINGS.roleAlignment.helpIntro }}
        </p>
        <VRow v-for="role in USER_ROLE_VALUES" :key="role" class="align-center mb-2">
          <VCol cols="12" md="4">
            <span class="text-body-1">{{ formatUserRoleLabel(role) }}</span>
            <div class="text-caption text-medium-emphasis">{{ role }}</div>
          </VCol>
          <VCol cols="12" md="8">
            <VSelect
              v-model="alignments[role]"
              :items="instanceItems"
              item-title="title"
              item-value="value"
              :label="BUSINESS_CONTROLS_TAB_STRINGS.roleAlignment.instanceLabel"
              density="comfortable"
              hide-details="auto"
              clearable
            />
          </VCol>
        </VRow>
      </VCardText>
    </VCard>
  </div>
</template>
