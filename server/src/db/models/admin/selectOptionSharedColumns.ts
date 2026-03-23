import { DataTypes, Sequelize, type ModelAttributes } from 'sequelize';

/** UUID primary key shared by admin *metadata* select-option tables. */
const adminSelectOptionIdAttribute = {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false,
  },
} satisfies ModelAttributes;

/**
 * Shared columns for admin_metadata / admin_primitive_metadata / admin_relationship_metadata
 * select-option rows (FK + display fields + timestamps).
 */
export function buildAdminMetadataSelectOptionAttributes(
  sequelize: Sequelize,
  foreignKey: { attribute: string; column: string }
): ModelAttributes {
  const fkCol = {
    type: DataTypes.UUID,
    allowNull: false,
    field: foreignKey.column,
  };
  return {
    ...adminSelectOptionIdAttribute,
    [foreignKey.attribute]: fkCol,
    displayOrder: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'display_order',
    },
    label: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    valuePayload: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'value_payload',
      comment: 'JSON text of option value (null/absent for null option value)',
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
  } as ModelAttributes;
}
