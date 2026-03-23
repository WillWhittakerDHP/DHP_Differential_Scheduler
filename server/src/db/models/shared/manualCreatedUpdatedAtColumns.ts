/**
 * Shared created_at / updated_at attribute defs when `timestamps: false` on the model.
 */
import { DataTypes, Sequelize } from 'sequelize'

export const manualCreatedUpdatedAtColumns = {
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
} as const
