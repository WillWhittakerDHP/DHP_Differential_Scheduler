import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  ForeignKey,
  Sequelize,
} from 'sequelize';

import type { EventInstance } from './event_instance.js';

/**
 * EventAssignment Model
 *
 * Through-table: parent block instance (baseline) or part instance (per-part override) → event instance (segment).
 */
export class EventAssignment extends Model<
  InferAttributes<EventAssignment>,
  InferCreationAttributes<EventAssignment>
> {
  declare id: CreationOptional<string>;
  declare kind: CreationOptional<string>;
  declare parentKind: 'blockInstance' | 'partInstance';
  declare childKind: CreationOptional<string>;
  declare parentId: ForeignKey<string>;
  declare childId: ForeignKey<string>;
  declare disabled: boolean;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  declare eventInstance?: EventInstance;
}

export function EventAssignmentFactory(sequelize: Sequelize) {
  EventAssignment.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      kind: {
        type: DataTypes.VIRTUAL,
        get() {
          return "eventAssignments";
        }
      },
      parentKind: {
        type: DataTypes.ENUM('partInstance', 'blockInstance'),
        allowNull: false,
        field: 'parent_kind',
        comment: 'blockInstance = baseline segment link; partInstance = per-part override',
      },
      childKind: {
        type: DataTypes.VIRTUAL,
        get() {
          return 'eventInstance';
        },
      },
      parentId: {
        type: DataTypes.UUID,
        allowNull: false,
        comment: 'Foreign key to block_instances.id or part_instances.id per parent_kind',
      },
      childId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'event_instances',
          key: 'id',
        },
        comment: 'Foreign key to event_instances table',
      },
      disabled: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
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
      underscored: true,
      schema: 'public',
      modelName: 'event_assignment',
      tableName: 'event_assignments',
      indexes: [
        {
          fields: ['parentId'],
          name: 'idx_event_assignments_parent_id',
        },
        {
          fields: ['childId'],
          name: 'idx_event_assignments_child_id',
        },
        {
          unique: true,
          fields: ['parentId', 'childId'],
          name: 'unique_event_assignments_parent_child',
        },
      ],
      freezeTableName: true,
    }
  );

  return EventAssignment;
}
