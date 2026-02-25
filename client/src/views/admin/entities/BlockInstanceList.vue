<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title>
            Block Instances
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
                <v-list-item-title>{{ entity.name || `Block Instance ${entity.id}` }}</v-list-item-title>
                <v-list-item-subtitle>
                  ID: {{ entity.id }} | Order: {{ entity.orderIndex }} | 
                  Block Shape: {{ entity.blockShapeRef || 'N/A' }}
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
              No block instances found. Create one to get started.
            </v-alert>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
/**
 * WHY: Use entity list composable
WHY: Extracts list management logic from comp...
 */
import { useRouter } from 'vue-router'
import { useEntityCrud } from '@/composables/entityCrud/useEntityCrud'
import { useNotification } from '@/composables/useNotification'
import { entityList } from '@/utils/admin/entityList'

const { entities, isLoading, error, remove } = useEntityCrud('blockInstance')
const router = useRouter()
const { error: notifyError } = useNotification()

const {
  goToCreate,
  goToEdit,
  handleDelete
} = entityList({
  entityKey: 'blockInstance',
  router,
  remove,
  notifyError,
  routes: {
    create: 'block-instance-create',
    edit: 'block-instance-edit'
  },
  deleteConfirmation: 'Are you sure you want to delete this block instance?',
  deleteErrorMessage: 'Failed to delete block instance'
})
</script>

