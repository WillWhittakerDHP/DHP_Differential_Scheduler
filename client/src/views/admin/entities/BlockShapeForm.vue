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
                v-model="blockFormActive"
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
import { computed } from 'vue'
import { useShapeForm, type BlockShapeFormData } from '@/composables/admin/useShapeForm'

const { isEdit, formData, isSubmitting, error, handleSubmit, goBack } =
  useShapeForm('blockShape')

const blockFormActive = computed({
  get: () => (formData as { value: BlockShapeFormData }).value?.active ?? false,
  set: (v: boolean) => {
    const ref = formData as { value: BlockShapeFormData }
    ref.value = { ...ref.value, active: v }
  },
})
</script>

