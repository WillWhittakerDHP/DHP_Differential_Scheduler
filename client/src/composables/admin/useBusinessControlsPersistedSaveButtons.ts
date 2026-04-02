/**
 * Submit button props for Business Controls tabs that persist via dedicated composables (org defaults, role alignment).
 */
import { computed, type ComputedRef } from 'vue'
import type { UseAdminOrganizationDefaultsReturn } from '@/composables/admin/useAdminOrganizationDefaults'
import type { UseAdminUserRoleBlockAlignmentReturn } from '@/composables/admin/useAdminUserRoleBlockAlignment'
import type { BusinessControlsSaveButtonProps } from '@/types/admin/businessControlsState'

export interface BusinessControlsPersistedSaveButtons {
  organization: BusinessControlsSaveButtonProps
  roleAlignment: BusinessControlsSaveButtonProps
}

export function useBusinessControlsPersistedSaveButtons(
  organization: UseAdminOrganizationDefaultsReturn,
  userRoleBlockAlignment: UseAdminUserRoleBlockAlignmentReturn
): ComputedRef<BusinessControlsPersistedSaveButtons> {
  return computed(() => ({
    organization: {
      type: 'submit' as const,
      color: 'primary' as const,
      loading: organization.saving.value,
      disabled: organization.saving.value,
    },
    roleAlignment: {
      type: 'submit' as const,
      color: 'primary' as const,
      loading: userRoleBlockAlignment.saving.value,
      disabled:
        userRoleBlockAlignment.saving.value ||
        userRoleBlockAlignment.loading.value ||
        userRoleBlockAlignment.formData.value === null,
    },
  }))
}
