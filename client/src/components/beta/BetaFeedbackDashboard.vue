<!--
  LEARNING: Admin dashboard for beta feedback: stats, filters, table, detail modal
  WHY: Single place to review and triage wizard feedback
  PATTERN: Stats cards + filter bar + VDataTable + BetaFeedbackDetailModal
-->
<template>
  <div class="beta-feedback-dashboard">
    <h2 class="text-h4 mb-4">Beta Feedback</h2>

    <VRow class="mb-4">
      <VCol cols="12" sm="6" md="3">
        <VCard variant="tonal">
          <VCardText>
            <div class="text-caption text-medium-emphasis">Total</div>
            <div class="text-h5">{{ stats?.total ?? 0 }}</div>
          </VCardText>
        </VCard>
      </VCol>
      <VCol cols="12" sm="6" md="3">
        <VCard variant="tonal">
          <VCardText>
            <div class="text-caption text-medium-emphasis">Open bugs</div>
            <div class="text-h5">{{ openBugsCount }}</div>
          </VCardText>
        </VCard>
      </VCol>
      <VCol cols="12" sm="6" md="3">
        <VCard variant="tonal">
          <VCardText>
            <div class="text-caption text-medium-emphasis">Feature requests</div>
            <div class="text-h5">{{ featureRequestsCount }}</div>
          </VCardText>
        </VCard>
      </VCol>
      <VCol cols="12" sm="6" md="3">
        <VCard variant="tonal">
          <VCardText>
            <div class="text-caption text-medium-emphasis">Critical</div>
            <div class="text-h5">{{ criticalCount }}</div>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <VRow class="mb-4">
      <VCol cols="12" sm="4" md="2">
        <VSelect
          v-model="filters.status"
          label="Status"
          :items="statusFilterItems"
          clearable
          hide-details
          density="compact"
        />
      </VCol>
      <VCol cols="12" sm="4" md="2">
        <VSelect
          v-model="filters.category"
          label="Category"
          :items="categoryFilterItems"
          clearable
          hide-details
          density="compact"
        />
      </VCol>
      <VCol cols="12" sm="4" md="2">
        <VSelect
          v-model="filters.severity"
          label="Severity"
          :items="severityFilterItems"
          clearable
          hide-details
          density="compact"
        />
      </VCol>
      <VCol cols="12" sm="4" md="2">
        <VBtn color="primary" :loading="loading" @click="load">
          Refresh
        </VBtn>
      </VCol>
    </VRow>

    <VCard>
      <VDataTable
        :headers="headers"
        :items="items"
        :loading="loading"
        item-value="id"
        class="cursor-pointer"
        @click:row="onRowClick"
      >
        <template #item.status="{ item }">
          <VChip :color="statusColor(item.status)" size="small" variant="tonal">
            {{ item.status }}
          </VChip>
        </template>
        <template #item.category="{ item }">
          {{ item.category }}
        </template>
        <template #item.severity="{ item }">
          <VChip :color="severityColor(item.severity)" size="small" variant="tonal">
            {{ item.severity }}
          </VChip>
        </template>
        <template #item.createdAt="{ item }">
          {{ formatDate(item.createdAt) }}
        </template>
      </VDataTable>
    </VCard>

    <BetaFeedbackDetailModal
      v-model="detailOpen"
      :feedback="selectedFeedback"
      @saved="load"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import BetaFeedbackDetailModal from './BetaFeedbackDetailModal.vue';
import { useBetaFeedback } from '@/composables/beta/useBetaFeedback';
import type { BetaFeedback, BetaFeedbackFilters, FeedbackStatus } from '@/types/betaFeedback';

const { fetchAllFeedback, fetchFeedbackStats } = useBetaFeedback();
const loading = ref(false);
const items = ref<BetaFeedback[]>([]);
const stats = ref<Awaited<ReturnType<typeof fetchFeedbackStats>> | null>(null);
const detailOpen = ref(false);
const selectedFeedback = ref<BetaFeedback | null>(null);

const filters = reactive<BetaFeedbackFilters>({});

const statusFilterItems: { title: string; value: FeedbackStatus }[] = [
  { title: 'New', value: 'new' },
  { title: 'Triaged', value: 'triaged' },
  { title: 'In progress', value: 'in_progress' },
  { title: 'Resolved', value: 'resolved' },
  { title: "Won't fix", value: 'wont_fix' },
];

const categoryFilterItems = [
  { title: 'Bug', value: 'bug' },
  { title: 'Feature request', value: 'feature_request' },
  { title: 'Usability', value: 'usability' },
  { title: 'Performance', value: 'performance' },
  { title: 'General', value: 'general' },
];

const severityFilterItems = [
  { title: 'Low', value: 'low' },
  { title: 'Medium', value: 'medium' },
  { title: 'High', value: 'high' },
  { title: 'Critical', value: 'critical' },
];

const headers = [
  { title: 'Status', key: 'status', sortable: false, width: '100px' },
  { title: 'Category', key: 'category', sortable: false, width: '120px' },
  { title: 'Severity', key: 'severity', sortable: false, width: '90px' },
  { title: 'Title', key: 'title', sortable: false },
  { title: 'Reporter', key: 'reporterName', sortable: false, width: '140px' },
  { title: 'Date', key: 'createdAt', sortable: false, width: '110px' },
];

const openBugsCount = computed(() => {
  return items.value.filter(
    (i) => i.category === 'bug' && i.status !== 'resolved' && i.status !== 'wont_fix'
  ).length;
});

const featureRequestsCount = computed(() => {
  return stats.value?.byCategory?.feature_request ?? 0;
});

const criticalCount = computed(() => {
  return stats.value?.bySeverity?.critical ?? 0;
});

function statusColor(s: string): string {
  const m: Record<string, string> = {
    new: 'info',
    triaged: 'primary',
    in_progress: 'warning',
    resolved: 'success',
    wont_fix: 'secondary',
  };
  return m[s] ?? 'default';
}

function severityColor(s: string): string {
  const m: Record<string, string> = {
    low: 'success',
    medium: 'info',
    high: 'warning',
    critical: 'error',
  };
  return m[s] ?? 'default';
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

function onRowClick(_event: Event, payload: { item: BetaFeedback }): void {
  openDetail(payload.item);
}

function openDetail(item: BetaFeedback): void {
  selectedFeedback.value = item;
  detailOpen.value = true;
}

async function load(): Promise<void> {
  loading.value = true;
  try {
    const [list, statsData] = await Promise.all([
      fetchAllFeedback(filters),
      fetchFeedbackStats(),
    ]);
    items.value = list;
    stats.value = statsData;
  } finally {
    loading.value = false;
  }
}

onMounted(() => load());
</script>

<style scoped>
.cursor-pointer :deep(tbody tr) {
  cursor: pointer;
}
</style>
