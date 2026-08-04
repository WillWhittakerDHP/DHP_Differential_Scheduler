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
              
              <v-select
                v-model="formData.wizardPlacement"
                :items="wizardPlacementOptions"
                item-title="label"
                item-value="value"
                label="Wizard placement"
                class="mb-4"
              ></v-select>
              
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
import { WIZARD_PLACEMENT } from '@shared/constants/wizardPlacement'

/**
 * WHY: Use block instance form composable for all form logic
WHY: Moves form ma...
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

const wizardPlacementOptions = [
  { label: 'Hidden', value: WIZARD_PLACEMENT.HIDDEN },
  { label: 'Base', value: WIZARD_PLACEMENT.TOP_LINE },
  { label: 'Additional', value: WIZARD_PLACEMENT.ADDITIONAL },
  { label: 'Option only', value: WIZARD_PLACEMENT.SUB_OPTION },
  { label: 'Base or additional', value: WIZARD_PLACEMENT.BOTH },
]
</script>

