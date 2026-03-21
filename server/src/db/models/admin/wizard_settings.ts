/**
 */
import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  Sequelize,
} from 'sequelize';

import type { WizardSettingsData } from '../../../../../shared/types/wizardSettingsTypes.js'
export type { WizardSettingsData } from '../../../../../shared/types/wizardSettingsTypes.js'

export class WizardSettings extends Model<
  InferAttributes<WizardSettings>,
  InferCreationAttributes<WizardSettings>
> {
  declare id: CreationOptional<string>;
  declare settingValue: WizardSettingsData;
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
      settingValue: {
        type: DataTypes.JSONB,
        allowNull: false,
        field: 'setting_value',
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
