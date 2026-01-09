<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title>
            {{ isEdit ? 'Edit Part Instance' : 'Create Part Instance' }}
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
              
              <v-select
                v-model="formData.partShapeRef"
                :items="partTypeOptions"
                item-title="name"
                item-value="id"
                label="Part Type"
                required
                class="mb-4"
              ></v-select>
              
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
 * LEARNING: Use part instance form composable
 * WHY: Extracts form management logic from component to composable
 * PATTERN: Composable provides form state, entity loading, and submission logic
 */
import { usePartInstanceForm } from '@/composables/admin/usePartInstanceForm'

const {
  isEdit,
  partTypeOptions,
  formData,
  isSubmitting,
  error,
  handleSubmit,
  goBack
} = usePartInstanceForm()
</script>

