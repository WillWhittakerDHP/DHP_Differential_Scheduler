<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title>
            Part Shapes
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
                <v-list-item-title>{{ entity.name || `Part Shape ${entity.id}` }}</v-list-item-title>
                <v-list-item-subtitle>
                  ID: {{ entity.id }} | Order: {{ entity.orderIndex }}
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
              No part shapes found. Create one to get started.
            </v-alert>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useEntityCrud } from '@/composables/useEntity'
import type { GlobalEntityId } from '@/types/entities'

const router = useRouter()
const { entities, isLoading, error, remove } = useEntityCrud('partShape')

function goToCreate() {
  router.push({ name: 'part-type-create' })
}

function goToEdit(id: GlobalEntityId) {
  router.push({ name: 'part-type-edit', params: { id: String(id) } })
}

async function handleDelete(id: GlobalEntityId) {
  if (confirm('Are you sure you want to delete this part type?')) {
    try {
      await remove(id)
    } catch (_err) {
      alert('Failed to delete part type')
    }
  }
}
</script>

