import { Model, DataTypes, 
  // Optional,
  type InferAttributes,
  type InferCreationAttributes,
  type CreationOptional,
  type ForeignKey,
  // type BelongsToManyAddAssociationMixin,
  type Sequelize } from 'sequelize';
  

  import type { TimeBlockSet } from '../adminChoices/TimeBlockSets.js'


export class DwellingAdjustment extends Model<
  InferAttributes<DwellingAdjustment>,
  InferCreationAttributes<DwellingAdjustment>
> {
  declare dwelling_adjustment_id: CreationOptional<number>;
  declare title: string;
  declare appointment_part_1: ForeignKey<TimeBlockSet['time_block_set_id']>;
  declare appointment_part_2: ForeignKey<TimeBlockSet['time_block_set_id']>;
  declare appointment_part_3: ForeignKey<TimeBlockSet['time_block_set_id']>;
  declare appointment_part_4: ForeignKey<TimeBlockSet['time_block_set_id']>;

  // TODO What's this?
  // //  Since TS cannot determine model associations at compile time, we need to declare the association methods here. These will not exist until `Model.init` was called.
  //   declare addReaders: BelongsToManyAddAssociationMixin<
  //   Reader[],
  //   Reader['id'][]
  // >;
  // declare addReader: BelongsToManyAddAssociationMixin<Reader, Reader['id']>;
}

export function DwellingAdjustmentFactory(sequelize: Sequelize): typeof DwellingAdjustment {
  DwellingAdjustment.init(
    {
      dwelling_adjustment_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      title: {
        type: DataTypes.STRING,
      },
      appointment_part_1: {
        type: DataTypes.INTEGER,
      },
      appointment_part_2: {
        type: DataTypes.INTEGER,
      },
      appointment_part_3: {
        type: DataTypes.INTEGER,
      },
      appointment_part_4: {
        type: DataTypes.INTEGER,
      },
    },
    {
      sequelize,
      // Manually define the table name
      tableName: 'dwelling_adjustments',
      // Set to false to remove the `created_at` and `updated_at` columns
      timestamps: false,
      underscored: true,
      freezeTableName: true,
    }
  );

  return DwellingAdjustment;
}
