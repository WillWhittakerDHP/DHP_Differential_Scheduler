<script setup lang="ts">
import { APPOINTMENTS_TABLE_UI } from '@/constants/appointmentsTableConstants'
import type { UserResponse } from '@/types/user'

defineProps<{
  user: UserResponse | null | undefined
}>()
</script>

<template>
  <div class="tooltip-content">
    <template v-if="user">
      <div class="tooltip-name">
        {{ user.firstName }} {{ user.lastName }}
      </div>
      <div class="tooltip-role">{{ user.userRole }}</div>
      <div class="tooltip-details">
        <div><strong>{{ APPOINTMENTS_TABLE_UI.EMAIL }}:</strong> {{ user.email }}</div>
        <div v-if="user.phone">
          <strong>{{ APPOINTMENTS_TABLE_UI.PHONE }}:</strong> {{ user.phone }}
        </div>
      </div>
      <div class="tooltip-hint">{{ APPOINTMENTS_TABLE_UI.CLICK_USERS_TAB }}</div>
    </template>
    <template v-else>
      <div>{{ APPOINTMENTS_TABLE_UI.NOT_SPECIFIED }}</div>
    </template>
  </div>
</template>
