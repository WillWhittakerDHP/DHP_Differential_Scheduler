/**
 * Relational wizard settings (column per field).
 */
import type { Transaction } from 'sequelize'
import type { WizardSettingsData } from '../../../shared/types/wizardSettingsTypes.js'
import { WizardSettings } from '../config/app.js'
import { sequelize } from '../config/database.js'

const DEFAULT: WizardSettingsData = {
  showApplyCoupon: false,
  useBrandColors: false,
}

export async function getWizardSettingsData(): Promise<WizardSettingsData> {
  const row = await WizardSettings.findOne()
  if (!row) {
    return { ...DEFAULT }
  }
  return {
    ...DEFAULT,
    showApplyCoupon: row.showApplyCoupon,
    useBrandColors: row.useBrandColors,
    ...(row.majorLabel != null ? { majorLabel: row.majorLabel } : {}),
    ...(row.minorLabel != null ? { minorLabel: row.minorLabel } : {}),
    ...(row.moveableFallbackLabel != null ? { moveableFallbackLabel: row.moveableFallbackLabel } : {}),
    ...(row.differentialGraphDefaultLabel != null
      ? { differentialGraphDefaultLabel: row.differentialGraphDefaultLabel }
      : {}),
    ...(row.majorStateLabel != null ? { majorStateLabel: row.majorStateLabel } : {}),
    ...(row.minorStateLabel != null ? { minorStateLabel: row.minorStateLabel } : {}),
    ...(row.selectTimeSlotLabel != null ? { selectTimeSlotLabel: row.selectTimeSlotLabel } : {}),
    ...(row.subStepLabelPickDay != null ? { subStepLabelPickDay: row.subStepLabelPickDay } : {}),
    ...(row.subStepLabelOptions != null ? { subStepLabelOptions: row.subStepLabelOptions } : {}),
    ...(row.subStepLabelPickTime != null ? { subStepLabelPickTime: row.subStepLabelPickTime } : {}),
    ...(row.subStepLabelConfirmMoveable != null
      ? { subStepLabelConfirmMoveable: row.subStepLabelConfirmMoveable }
      : {}),
  }
}

async function persistWizard(data: WizardSettingsData, t: Transaction): Promise<WizardSettingsData> {
  const merged = { ...DEFAULT, ...data }
  let row = await WizardSettings.findOne({ transaction: t })
  if (!row) {
    row = await WizardSettings.create(
      {
        showApplyCoupon: merged.showApplyCoupon ?? false,
        useBrandColors: merged.useBrandColors ?? false,
        majorLabel: merged.majorLabel ?? null,
        minorLabel: merged.minorLabel ?? null,
        moveableFallbackLabel: merged.moveableFallbackLabel ?? null,
        differentialGraphDefaultLabel: merged.differentialGraphDefaultLabel ?? null,
        majorStateLabel: merged.majorStateLabel ?? null,
        minorStateLabel: merged.minorStateLabel ?? null,
        selectTimeSlotLabel: merged.selectTimeSlotLabel ?? null,
        subStepLabelPickDay: merged.subStepLabelPickDay ?? null,
        subStepLabelOptions: merged.subStepLabelOptions ?? null,
        subStepLabelPickTime: merged.subStepLabelPickTime ?? null,
        subStepLabelConfirmMoveable: merged.subStepLabelConfirmMoveable ?? null,
      },
      { transaction: t }
    )
  } else {
    await row.update(
      {
        showApplyCoupon: merged.showApplyCoupon ?? false,
        useBrandColors: merged.useBrandColors ?? false,
        majorLabel: merged.majorLabel ?? null,
        minorLabel: merged.minorLabel ?? null,
        moveableFallbackLabel: merged.moveableFallbackLabel ?? null,
        differentialGraphDefaultLabel: merged.differentialGraphDefaultLabel ?? null,
        majorStateLabel: merged.majorStateLabel ?? null,
        minorStateLabel: merged.minorStateLabel ?? null,
        selectTimeSlotLabel: merged.selectTimeSlotLabel ?? null,
        subStepLabelPickDay: merged.subStepLabelPickDay ?? null,
        subStepLabelOptions: merged.subStepLabelOptions ?? null,
        subStepLabelPickTime: merged.subStepLabelPickTime ?? null,
        subStepLabelConfirmMoveable: merged.subStepLabelConfirmMoveable ?? null,
        updatedAt: new Date(),
      },
      { transaction: t }
    )
  }
  return merged
}

export async function saveWizardSettingsData(
  data: WizardSettingsData,
  options?: { transaction?: Transaction }
): Promise<WizardSettingsData> {
  if (options?.transaction) {
    return persistWizard(data, options.transaction)
  }
  return sequelize.transaction(async (t) => persistWizard(data, t))
}
