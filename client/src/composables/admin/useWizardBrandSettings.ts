/**
 * Brand anchors + logo upload orchestration for admin wizard settings (session 6.15.2.1).
 */
import { computed, type ComputedRef, type Ref, ref } from 'vue'
import { uploadWizardLogo, type WizardSettingsData } from '@/configs/wizardSettings'
import { createLogger } from '@/utils/logger'
import { extractAnchorsFromImageFile } from '@/utils/wizardBrand/extractAnchorsFromImageFile'
import { normalizeBrandHex } from '@/utils/wizardBrand/normalizeBrandHex'
import {
  type BrandPreviewPalettes,
  buildBrandPreviewPalettes,
} from '@/utils/wizardBrand/wizardBrandPreview'

const logger = createLogger('useWizardBrandSettings')

export interface UseWizardBrandSettingsReturn {
  uploading: Ref<boolean>
  uploadLogo: (file: File) => Promise<void>
  extractAnchorsFromFile: (file: File) => Promise<void>
  previewPalettes: ComputedRef<BrandPreviewPalettes>
}

export function useWizardBrandSettings(
  formData: Ref<WizardSettingsData | null>
): UseWizardBrandSettingsReturn {
  const uploading = ref(false)

  const uploadLogo = async (file: File): Promise<void> => {
    uploading.value = true
    try {
      const saved = await uploadWizardLogo(file)
      formData.value = { ...(formData.value ?? {}), ...saved }
    } catch (err: unknown) {
      logger.error('Wizard logo upload failed', { err })
      throw err
    } finally {
      uploading.value = false
    }
  }

  const extractAnchorsFromFile = async (file: File): Promise<void> => {
    try {
      const result = await extractAnchorsFromImageFile(file)
      if (!result || !formData.value) {
        return
      }
      formData.value = {
        ...formData.value,
        brandPrimaryHex: normalizeBrandHex(result.primary),
        brandSecondaryHex: normalizeBrandHex(result.secondary),
      }
    } catch (err: unknown) {
      logger.error('Extract brand anchors from image failed', { err })
      throw err
    }
  }

  const previewPalettes = computed(() =>
    buildBrandPreviewPalettes(
      formData.value?.brandPrimaryHex,
      formData.value?.brandSecondaryHex,
      formData.value ?? undefined
    )
  )

  return {
    uploading,
    uploadLogo,
    extractAnchorsFromFile,
    previewPalettes,
  }
}
