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
 * WHY: Thin component; list logic in useBlockInstanceList (component-logic Tier1 extraction).
 */
import { useBlockInstanceList } from '@/composables/admin/useBlockInstanceList'

const { entities, isLoading, error, goToCreate, goToEdit, handleDelete } = useBlockInstanceList()
</script>

