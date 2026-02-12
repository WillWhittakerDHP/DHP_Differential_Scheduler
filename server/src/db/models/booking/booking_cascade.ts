import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  ForeignKey,
  Sequelize,
} from 'sequelize';

/**
 * BookingCascade Model
 * 
 * Represents booking cascade relationships between block instances.
 * Cascade relationships are vertical hierarchy relationships (different shapes, e.g., user_instance → service_instance).
 * 
 * LEARNING: Booking cascade relationships enable runtime hierarchical filtering
 * WHY: Block instances need to define which other block instances cascade from them at runtime
 * PATTERN: Through table for many-to-many cascade relationships between block instances
 * 
 * NOTE: Renamed from ActiveCascade to BookingCascade for clearer domain terminology (2026-01-08)
 */
export class BookingCascade extends Model<
  InferAttributes<BookingCascade>,
  InferCreationAttributes<BookingCascade>
> {
  declare id: CreationOptional<string>;
  declare kind: CreationOptional<string>;
  declare parentKind: CreationOptional<string>;
  declare childKind: CreationOptional<string>;
  declare parentId: ForeignKey<string>;
  declare childId: ForeignKey<string>;
  declare disabled: boolean;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

export function BookingCascadeFactory(sequelize: Sequelize) {
  BookingCascade.init(
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
          return "bookingCascades";
        }
      },
      parentKind: {
        type: DataTypes.VIRTUAL,
        get() {
          return 'blockInstance';
        },
      },
      childKind: {
        type: DataTypes.VIRTUAL,
        get() {
          return 'blockInstance';
        },
      },
      parentId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'block_instances',
          key: 'id',
        },
      },
      childId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'block_instances',
          key: 'id',
        },
      },
      disabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
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
      timestamps: false,
      underscored: true,
      schema: 'public',
      modelName: 'booking_cascade',
      tableName: 'booking_cascades',
      indexes: [
        {
          unique: true,
          fields: ['parentId', 'childId']
        }
      ],
      freezeTableName: true,
    }
  );

  return BookingCascade;
}

