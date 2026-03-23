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

/** Nullable string columns copied onto WizardSettingsData when present (keeps branch count low). */
const OPTIONAL_LABEL_FIELDS = [
  'majorLabel',
  'minorLabel',
  'moveableFallbackLabel',
  'differentialGraphDefaultLabel',
  'majorStateLabel',
  'minorStateLabel',
  'selectTimeSlotLabel',
  'subStepLabelPickDay',
  'subStepLabelOptions',
  'subStepLabelPickTime',
  'subStepLabelConfirmMoveable',
  'moveableNoFeasibleCompletionSlotsMessage',
  'brandPrimaryHex',
  'brandSecondaryHex',
  'logoUrl',
] as const satisfies readonly (keyof WizardSettingsData)[]

/** Read optional label columns from a Sequelize model instance (explicit keys; avoids fragile row casts). */
function optionalStringFieldsFromWizardRow(row: InstanceType<typeof WizardSettings>): Partial<WizardSettingsData> {
  const out: Partial<WizardSettingsData> = {}
  for (const key of OPTIONAL_LABEL_FIELDS) {
    const v = row[key]
    if (v != null) {
      out[key] = v
    }
  }
  return out
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
    ...optionalStringFieldsFromWizardRow(row),
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
        moveableNoFeasibleCompletionSlotsMessage: merged.moveableNoFeasibleCompletionSlotsMessage ?? null,
        brandPrimaryHex: merged.brandPrimaryHex ?? null,
        brandSecondaryHex: merged.brandSecondaryHex ?? null,
        logoUrl: merged.logoUrl ?? null,
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
        moveableNoFeasibleCompletionSlotsMessage: merged.moveableNoFeasibleCompletionSlotsMessage ?? null,
        brandPrimaryHex: merged.brandPrimaryHex ?? null,
        brandSecondaryHex: merged.brandSecondaryHex ?? null,
        logoUrl: merged.logoUrl ?? null,
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
