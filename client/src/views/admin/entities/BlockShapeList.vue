<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title>
            Block Shapes
            <v-spacer></v-spacer>
            <v-btn
              color="primary"
              @click="goToCreate"
            >
              Create New
            </v-btn>
          </v-card-title>
          
          <v-card-text>
            <v-alert
              v-if="isLoading"
              type="info"
              class="mb-4"
            >
              Loading...
            </v-alert>
            
            <v-alert
              v-if="error"
              type="error"
              class="mb-4"
            >
              Error: {{ error }}
            </v-alert>
            
            <v-list v-if="!isLoading && entities.length > 0">
              <v-list-item
                v-for="entity in entities"
                :key="entity.id"
                @click="goToEdit(entity.id)"
              >
                <v-list-item-title>{{ entity.name || `Block Shape ${entity.id}` }}</v-list-item-title>
                <v-list-item-subtitle>
                  ID: {{ entity.id }} | Order: {{ entity.orderIndex }} | 
                  Active: {{ entity.active ? 'Yes' : 'No' }}
                </v-list-item-subtitle>
                <template v-slot:append>
                  <v-btn
                    icon="mdi-delete"
                    variant="text"
                    @click.stop="handleDelete(entity.id)"
                  ></v-btn>
                </template>
              </v-list-item>
            </v-list>
            
            <v-alert
              v-else-if="!isLoading && entities.length === 0"
              type="info"
            >
              No block shapes found. Create one to get started.
            </v-alert>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">

import { useRouter } from 'vue-router'
import { useEntityCrud } from '@/composables/entityCrud/useEntityCrud'
import { useNotification } from '@/composables/useNotification'
import { createLogger } from '@/utils/logger'
import type { GlobalEntityId } from '@shared/types/primitiveBrands'

const logger = createLogger('BlockShapeList')
const router = useRouter()
const { error: notifyError } = useNotification()
const { entities, isLoading, error, remove } = useEntityCrud('blockShape')

function goToCreate() {
  router.push({ name: 'block-type-create' })
}

function goToEdit(id: GlobalEntityId) {
  router.push({ name: 'block-type-edit', params: { id: String(id) } })
}

async function handleDelete(id: GlobalEntityId) {
  if (confirm('Are you sure you want to delete this block type?')) {
    try {
      await remove(id)
    } catch (error) {
      logger.error('Failed to delete block type', { error })
      notifyError('Failed to delete block type')
    }
  }
}
</script>

