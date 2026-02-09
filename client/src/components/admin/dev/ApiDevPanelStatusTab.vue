<script setup lang="ts">
/**
 * API Dev Panel Status Tab Component
 * 
 * LEARNING: Extracted Status tab content from ApiDevPanel
 * WHY: Reduces main component complexity and file size
 * PATTERN: Sub-component with props for data and handlers
 */

import { formatTimestamp, getApiStatusColor, getApiStatusLabel } from '@/utils/dev/formatDevPanelData'
import type { ApiStatusValue } from '@/constants/apiStatus'

interface Props {
  oauthStatus: any
  rateLimitStats: {
    calendar: any | null
    maps: any | null
  }
  apiStatus: {
    events: ApiStatusValue
    routes: ApiStatusValue
    places: ApiStatusValue
  }
  loading: {
    oauth: boolean
    ratelimit: boolean
  }
  errors: {
    oauth: string | null
    ratelimit: string | null
  }
  onRefresh: () => void
}

defineProps<Props>()
</script>

<template>
  <div class="pa-3">
    <!-- OAuth Status -->
    <div class="mb-4">
      <div class="d-flex justify-space-between align-center mb-3">
        <h3 class="text-subtitle-1 font-weight-bold">OAuth Status</h3>
        <VBtn
          size="small"
          :loading="loading.oauth"
          @click="onRefresh"
        >
          Refresh
        </VBtn>
      </div>
      
      <VAlert
        v-if="errors.oauth"
        type="error"
        class="mb-3"
        density="compact"
      >
        {{ errors.oauth }}
      </VAlert>

      <VCard v-if="oauthStatus" variant="outlined" density="compact">
        <VCardText>
          <div class="mb-2">
            <strong>Authenticated:</strong> 
            <VChip
              :color="oauthStatus.authenticated ? 'success' : 'error'"
              size="small"
              class="ml-2"
            >
              {{ oauthStatus.authenticated ? 'Yes' : 'No' }}
            </VChip>
          </div>
          <div v-if="oauthStatus.authenticated" class="mb-2">
            <strong>Has Refresh Token:</strong> {{ oauthStatus.hasRefreshToken ? 'Yes' : 'No' }}
          </div>
          <div v-if="oauthStatus.expiryDate" class="mb-2">
            <strong>Expires:</strong> {{ formatTimestamp(oauthStatus.expiryDate) }}
          </div>
          <div v-if="!oauthStatus.authenticated && oauthStatus.authUrl" class="mt-3">
            <VBtn
              :href="oauthStatus.authUrl"
              target="_blank"
              color="primary"
              size="small"
            >
              Authenticate
            </VBtn>
          </div>
        </VCardText>
      </VCard>
    </div>

    <VDivider class="my-4" />

    <!-- Rate Limits -->
    <div class="mb-4">
      <div class="d-flex justify-space-between align-center mb-3">
        <h3 class="text-subtitle-1 font-weight-bold">Rate Limits</h3>
        <VBtn
          size="small"
          :loading="loading.ratelimit"
          @click="onRefresh"
        >
          Refresh
        </VBtn>
      </div>

      <VAlert
        v-if="errors.ratelimit"
        type="error"
        class="mb-3"
        density="compact"
      >
        {{ errors.ratelimit }}
      </VAlert>

      <!-- Calendar API Rate Limits -->
      <VCard v-if="rateLimitStats.calendar" variant="outlined" density="compact" class="mb-3">
        <VCardTitle class="text-subtitle-2 pa-2">Google Calendar API</VCardTitle>
        <VCardText>
          <div class="mb-2">
            <strong>Limit:</strong> {{ rateLimitStats.calendar.requestsPerMinute }} requests/minute
          </div>
          <div class="mb-2">
            <strong>Current Requests:</strong> {{ rateLimitStats.calendar.currentRequests }}
          </div>
          <div class="mb-2">
            <strong>Remaining:</strong> {{ rateLimitStats.calendar.remainingRequests }}
          </div>
          <div class="mb-2">
            <strong>Utilization:</strong> 
            <VProgressLinear
              :model-value="rateLimitStats.calendar.utilizationPercent"
              :color="rateLimitStats.calendar.utilizationPercent > 80 ? 'error' : rateLimitStats.calendar.utilizationPercent > 60 ? 'warning' : 'success'"
              height="20"
              class="mt-1"
            >
              {{ Math.round(rateLimitStats.calendar.utilizationPercent) }}%
            </VProgressLinear>
          </div>
        </VCardText>
      </VCard>

      <!-- Maps API Rate Limits -->
      <VCard v-if="rateLimitStats.maps" variant="outlined" density="compact">
        <VCardTitle class="text-subtitle-2 pa-2">Google Maps API</VCardTitle>
        <VCardText>
          <div class="mb-2">
            <strong>Limit:</strong> {{ rateLimitStats.maps.requestsPerMinute }} requests/minute
          </div>
          <div class="mb-2">
            <strong>Current Requests:</strong> {{ rateLimitStats.maps.currentRequests }}
          </div>
          <div class="mb-2">
            <strong>Remaining:</strong> {{ rateLimitStats.maps.remainingRequests }}
          </div>
          <div class="mb-2">
            <strong>Utilization:</strong> 
            <VProgressLinear
              :model-value="rateLimitStats.maps.utilizationPercent"
              :color="rateLimitStats.maps.utilizationPercent > 80 ? 'error' : rateLimitStats.maps.utilizationPercent > 60 ? 'warning' : 'success'"
              height="20"
              class="mt-1"
            >
              {{ Math.round(rateLimitStats.maps.utilizationPercent) }}%
            </VProgressLinear>
          </div>
        </VCardText>
      </VCard>

      <VAlert
        v-if="!rateLimitStats.calendar && !rateLimitStats.maps && !loading.ratelimit"
        type="info"
        density="compact"
        class="mt-3"
      >
        No rate limit data available. Click Refresh to load.
      </VAlert>
    </div>

    <VDivider class="my-4" />

    <!-- API Status Flags -->
    <div class="mb-4">
      <h3 class="text-subtitle-1 font-weight-bold mb-3">API Call Status</h3>
      <VList density="compact">
        <VListItem>
          <VListItemTitle class="text-body-2">Events</VListItemTitle>
          <template #append>
            <VChip
              :color="getApiStatusColor(apiStatus.events)"
              size="small"
            >
              {{ getApiStatusLabel(apiStatus.events) }}
            </VChip>
          </template>
        </VListItem>
        <VListItem>
          <VListItemTitle class="text-body-2">Routes</VListItemTitle>
          <template #append>
            <VChip
              :color="getApiStatusColor(apiStatus.routes)"
              size="small"
            >
              {{ getApiStatusLabel(apiStatus.routes) }}
            </VChip>
          </template>
        </VListItem>
        <VListItem>
          <VListItemTitle class="text-body-2">Places</VListItemTitle>
          <template #append>
            <VChip
              :color="getApiStatusColor(apiStatus.places)"
              size="small"
            >
              {{ getApiStatusLabel(apiStatus.places) }}
            </VChip>
          </template>
        </VListItem>
      </VList>
    </div>
  </div>
</template>
