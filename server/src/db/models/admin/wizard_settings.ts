/**
 * WHY: Singleton table for wizard display config (coupon visibility, brand colors, labels).
 * PATTERN: One row; GET returns setting_value; PUT upserts.
 */
import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  Sequelize,
} from 'sequelize';

export type { WizardSettingsData } from '../../../../../shared/types/wizardSettingsTypes.js'

export class WizardSettings extends Model<
  InferAttributes<WizardSettings>,
  InferCreationAttributes<WizardSettings>
> {
  declare id: CreationOptional<string>;
  declare showApplyCoupon: boolean;
  declare useBrandColors: boolean;
  declare majorLabel: CreationOptional<string | null>;
  declare minorLabel: CreationOptional<string | null>;
  declare moveableFallbackLabel: CreationOptional<string | null>;
  declare differentialGraphDefaultLabel: CreationOptional<string | null>;
  declare majorStateLabel: CreationOptional<string | null>;
  declare minorStateLabel: CreationOptional<string | null>;
  declare selectTimeSlotLabel: CreationOptional<string | null>;
  declare subStepLabelPickDay: CreationOptional<string | null>;
  declare subStepLabelOptions: CreationOptional<string | null>;
  declare subStepLabelPickTime: CreationOptional<string | null>;
  declare subStepLabelConfirmMoveable: CreationOptional<string | null>;
  declare moveableNoFeasibleCompletionSlotsMessage: CreationOptional<string | null>;
  declare brandPrimaryHex: CreationOptional<string | null>;
  declare brandSecondaryHex: CreationOptional<string | null>;
  declare logoUrl: CreationOptional<string | null>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

export function WizardSettingsFactory(sequelize: Sequelize) {
  WizardSettings.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      showApplyCoupon: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'show_apply_coupon',
      },
      useBrandColors: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'use_brand_colors',
      },
      majorLabel: { type: DataTypes.STRING, allowNull: true, field: 'major_label' },
      minorLabel: { type: DataTypes.STRING, allowNull: true, field: 'minor_label' },
      moveableFallbackLabel: { type: DataTypes.STRING, allowNull: true, field: 'moveable_fallback_label' },
      differentialGraphDefaultLabel: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'differential_graph_default_label',
      },
      majorStateLabel: { type: DataTypes.STRING, allowNull: true, field: 'major_state_label' },
      minorStateLabel: { type: DataTypes.STRING, allowNull: true, field: 'minor_state_label' },
      selectTimeSlotLabel: { type: DataTypes.STRING, allowNull: true, field: 'select_time_slot_label' },
      subStepLabelPickDay: { type: DataTypes.STRING, allowNull: true, field: 'sub_step_label_pick_day' },
      subStepLabelOptions: { type: DataTypes.STRING, allowNull: true, field: 'sub_step_label_options' },
      subStepLabelPickTime: { type: DataTypes.STRING, allowNull: true, field: 'sub_step_label_pick_time' },
      subStepLabelConfirmMoveable: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'sub_step_label_confirm_moveable',
      },
      moveableNoFeasibleCompletionSlotsMessage: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'moveable_no_feasible_completion_slots_message',
      },
      brandPrimaryHex: {
        type: DataTypes.STRING(32),
        allowNull: true,
        field: 'brand_primary_hex',
      },
      brandSecondaryHex: {
        type: DataTypes.STRING(32),
        allowNull: true,
        field: 'brand_secondary_hex',
      },
      logoUrl: {
        type: DataTypes.STRING(2048),
        allowNull: true,
        field: 'logo_url',
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        field: 'created_at',
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        field: 'updated_at',
      },
    },
    {
      sequelize,
      timestamps: false,
      underscored: false,
      schema: 'public',
      modelName: 'wizard_settings',
      tableName: 'wizard_settings',
      freezeTableName: true,
    }
  );

  return WizardSettings;
}
