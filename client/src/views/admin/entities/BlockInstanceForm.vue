<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title>
            {{ isEdit ? 'Edit Block Instance' : 'Create Block Instance' }}
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
                v-model="formData.blockShapeRef"
                :items="blockTypeOptions"
                item-title="name"
                item-value="id"
                label="Block Type"
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
import { useBlockInstanceForm } from '@/composables/admin/useBlockInstanceForm'

/**
 * LEARNING: Use block instance form composable for all form logic
 * WHY: Moves form management logic out of component into reusable composable
 * PATTERN: Composable handles form state, entity loading, and submission
 */
const {
  isEdit,
  blockTypeOptions,
  formData,
  isSubmitting,
  error,
  handleSubmit,
  goBack
} = useBlockInstanceForm()
</script>

