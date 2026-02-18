<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title>
            {{ isEdit ? 'Edit Block Type' : 'Create Block Type' }}
          </v-card-title>
          
          <v-card-text>
            <v-alert
              v-if="error"
              type="error"
              class="mb-4"
            >
              Error: {{ error }}
            </v-alert>
            
            <v-form @submit.prevent="handleSubmit">
              <v-text-field
                v-model="formData.name"
                label="Name"
                required
                class="mb-4"
              ></v-text-field>
              
              <v-text-field
                v-model.number="formData.orderIndex"
                label="Order Index"
                type="number"
                class="mb-4"
              ></v-text-field>
              
              <v-checkbox
                v-model="formData.active"
                label="Active"
                class="mb-4"
              ></v-checkbox>
              
              <v-btn
                type="submit"
                color="primary"
                :loading="isSubmitting"
                class="mr-2"
              >
                {{ isEdit ? 'Update' : 'Create' }}
              </v-btn>
              
              <v-btn
                @click="goBack"
                variant="outlined"
              >
                Cancel
              </v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
/**
 * Block Type Form Page
 * 
 * LEARNING: Placeholder form page for Block Shapes (no UI polish)
 * WHY: Session 3.3 focuses on data flow verification, not UI building
 * PATTERN: Simple form with basic fields
 */

import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useEntityCrud } from '@/composables/useEntity'
import { useGlobal } from '@/composables/useGlobal'
import { toGlobalEntityId, type GlobalEntity } from '@/types/entities'

const router = useRouter()
const route = useRoute()
const { create, update } = useEntityCrud('blockShape')
const { getGlobalEntityById } = useGlobal()

const isEdit = computed(() => !!route.params.id)
const entityId = computed(() => route.params.id as string | undefined)

const formData = ref({
  name: '',
  orderIndex: 0,
  active: true,
})

const isSubmitting = ref(false)
const error = ref<string | null>(null)

onMounted(async () => {
  if (isEdit.value && entityId.value) {
    const entity = getGlobalEntityById('blockShape', entityId.value)
    if (entity) {
      const rawName = entity.name
      formData.value = {
        name: rawName !== undefined && rawName !== null && rawName !== '' ? rawName : '',
        orderIndex: entity.orderIndex ?? 0,
        active: entity.active ?? true,
      }
    }
  }
})

async function handleSubmit() {
  isSubmitting.value = true
  error.value = null
  
  try {
    if (isEdit.value && entityId.value) {
      await update(formData.value as Partial<GlobalEntity<'blockShape'>>, toGlobalEntityId(entityId.value))
      } else {
      await create(formData.value as Partial<GlobalEntity<'blockShape'>>)
    }
    goBack()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to save block type'
  } finally {
    isSubmitting.value = false
  }
}

function goBack() {
  router.push({ name: 'block-types-list' })
}
</script>

