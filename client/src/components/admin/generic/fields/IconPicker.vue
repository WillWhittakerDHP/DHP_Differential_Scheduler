<template>
  <VDialog
    :model-value="modelValue"
    max-width="800"
    scrollable
    @update:model-value="handleDialogUpdate"
  >
    <VCard>
      <VCardTitle class="d-flex align-center justify-space-between">
        <span>Select Icon</span>
        <VBtn
          icon
          variant="text"
          size="small"
          @click="handleClose"
        >
          <Icon icon="tabler-x" width="20" height="20" />
        </VBtn>
      </VCardTitle>
      
      <VCardText>
        <!-- Search Field -->
        <VTextField
          v-model="searchTerm"
          placeholder="Search icons..."
          prepend-inner-icon="tabler-search"
          clearable
          class="mb-4"
        />
        
        <!-- Icons Grid -->
        <div class="icons-grid">
          <VCard
            v-for="icon in filteredIcons"
            :key="icon"
            class="icon-card"
            :class="{ 'icon-card-selected': icon === selectedIcon }"
            @click="handleIconSelect(icon)"
          >
            <VCardText class="d-flex flex-column align-center justify-center py-4">
              <Icon
                :icon="icon"
                width="32"
                height="32"
                class="mb-2"
              />
              <span class="icon-name">{{ icon.replace('tabler-', '') }}</span>
            </VCardText>
            
            <!-- Tooltip -->
            <VTooltip
              location="top"
              activator="parent"
            >
              {{ icon }}
            </VTooltip>
          </VCard>
        </div>
        
        <!-- Empty State -->
        <VAlert
          v-if="filteredIcons.length === 0"
          type="info"
          variant="tonal"
          class="mt-4"
        >
          No icons found matching "{{ searchTerm }}"
        </VAlert>
      </VCardText>
      
      <VCardActions>
        <VSpacer />
        <VBtn
          variant="text"
          @click="handleClose"
        >
          Cancel
        </VBtn>
        <VBtn
          v-if="selectedIcon"
          color="primary"
          @click="handleConfirm"
        >
          Select
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<script setup lang="ts">
/**
 * LEARNING: IconPicker component provides visual icon selection dialog
 * 
 * WHY: Users need to see icons visually to select them, not just type names
 * 
 * PATTERN: Dialog component with searchable grid of icons
 * 
 * COMPARISON: Based on vuexy's icons page pattern with dialog wrapper
 */

import { computed } from 'vue'
import { Icon } from '@iconify/vue'
import { useIconPickerState } from '@/composables/admin/useIconPickerState'
import { tablerIcons } from '../../../../utils/tablerIcons'

interface Props {
  modelValue: boolean
  currentIcon?: string | null
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'select', icon: string): void
}

const props = withDefaults(defineProps<Props>(), {
  currentIcon: null
})

const emit = defineEmits<Emits>()

// LEARNING: Use icon picker state composable for state management
// PATTERN: Composable handles icon selection state and prop syncing
const iconPickerState = useIconPickerState({
  dialogOpen: computed(() => props.modelValue),
  currentIcon: props.currentIcon
})

const {
  selectedIcon,
  searchTerm,
  resetState
} = iconPickerState

const filteredIcons = computed(() => {
  const icons = !searchTerm.value 
    ? tablerIcons 
    : (() => {
        const term = searchTerm.value.toLowerCase()
        return tablerIcons.filter(icon => 
          icon.toLowerCase().includes(term) ||
          icon.replace('tabler-', '').toLowerCase().includes(term)
        )
      })()
  
  // PATTERN: Use Set to remove duplicates while preserving order
  return Array.from(new Set(icons))
})

// PATTERN: Reset state on close via composable
const handleDialogUpdate = (value: boolean) => {
  emit('update:modelValue', value)
  if (!value) {
    resetState()
  }
}

const handleIconSelect = (icon: string) => {
  selectedIcon.value = icon
  emit('select', icon)
  emit('update:modelValue', false)
}

const handleConfirm = () => {
  if (selectedIcon.value) {
    emit('select', selectedIcon.value)
    emit('update:modelValue', false)
  }
}

const handleClose = () => {
  emit('update:modelValue', false)
}
</script>

<style scoped>
.icons-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 12px;
  max-height: 500px;
  overflow-y: auto;
  padding: 8px 0;
}

.icon-card {
  cursor: pointer;
  transition: all 0.2s ease;
  border: 2px solid transparent;
}

.icon-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.icon-card-selected {
  border-color: rgb(var(--v-theme-primary));
  background-color: rgba(var(--v-theme-primary), 0.1);
}

.icon-name {
  font-size: 11px;
  text-align: center;
  word-break: break-word;
  color: rgba(var(--v-theme-on-surface), 0.7);
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>

