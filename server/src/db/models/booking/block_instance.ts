import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  ForeignKey,
  Sequelize,
} from 'sequelize';

import { FIELD_NAMES } from '../../../routes/internal/entities/entityConstants.js';
import {
  DEFAULT_WIZARD_PLACEMENT,
  type WizardPlacement,
} from '@shared/constants/wizardPlacement.js';
import { PartAssignment } from './part_assignment';
import { BookingCascade } from './booking_cascade';

export class BlockInstance extends Model<
  InferAttributes<BlockInstance>,
  InferCreationAttributes<BlockInstance>
> {
  declare id: CreationOptional<string>;
  declare orderIndex: CreationOptional<number>;
  declare blockShapeRef: ForeignKey<string>;
  declare name: string;
  declare composite: boolean;
  declare orchestrator: boolean;
  /** Lateral inclusion gates — when true, accumulation_links apply (shared/constants/accumulator.ts). */
  declare accumulator: boolean;
  /** Four-state wizard placement (replaces the old wizardVisible boolean); see shared/constants/wizardPlacement.ts. */
  declare wizardPlacement: WizardPlacement;
  declare preClosing: boolean;
  declare icon: string | null;
  declare requiresUnitNumber: boolean;
  declare isMultiFamily: boolean;
  declare requiresAgent: boolean;
  /** Canonical user role when parent block shape is user-semantic; null otherwise. */
  declare semanticType: string | null;
  /** Default inspected-property fact used when this time block is added as an accumulator link. */
  declare propertyFactKey: string | null;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  declare partAssignments?: PartAssignment[];
  declare bookingCascades?: BookingCascade[];
}

export function BlockInstanceFactory(sequelize: Sequelize) {
  BlockInstance.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      orderIndex: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      blockShapeRef: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'block_shapes',
          key: 'id',
        },
      },
      name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      composite: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      orchestrator: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      accumulator: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      wizardPlacement: {
        type: DataTypes.TEXT,
        allowNull: false,
        defaultValue: DEFAULT_WIZARD_PLACEMENT,
        field: 'wizard_placement',
      },
      preClosing: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      icon: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      requiresUnitNumber: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      isMultiFamily: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      requiresAgent: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      semanticType: {
        type: DataTypes.STRING(64),
        allowNull: true,
        field: 'semantic_type',
      },
      propertyFactKey: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'property_fact_key',
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    },
    {
      sequelize,
      indexes: [
        {
          fields: [FIELD_NAMES.ORDER_INDEX],
        },
      ],
      timestamps: false,
      underscored: true,
      schema: 'public',
      modelName: 'block_instance',
      tableName: 'block_instances',
      freezeTableName: true,
    }
  );

  return BlockInstance;
}
