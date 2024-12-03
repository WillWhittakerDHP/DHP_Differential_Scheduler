import { Model, DataTypes, 
  // Optional,
  type InferAttributes,
  type InferCreationAttributes,
  type CreationOptional,
  type ForeignKey,
  // type BelongsToManyAddAssociationMixin,
  type Sequelize } from 'sequelize';

  
import type { TimeBlockSet } from '../adminModels/TimeBlockSets.js'
import { UIDescription } from '../adminModels/UIDescriptions.js';


export class Service extends Model<
  InferAttributes<Service>,
  InferCreationAttributes<Service>
> {
  declare service_id: CreationOptional<number>;
  declare title: string;
  declare can_be_scheduled: boolean;
  declare differential_scheduling: boolean;
  declare ui_description_set_id: ForeignKey<UIDescription['ui_description_set_id']>;
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

export function ServiceFactory(sequelize: Sequelize): typeof Service {
  Service.init(
    {
      service_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      title: {
        type: DataTypes.STRING,
      },
      can_be_scheduled: {
        type: DataTypes.BOOLEAN,
      },
      differential_scheduling: {
        type: DataTypes.BOOLEAN,
      },
      // ui_description_set_id: {
      //   type: DataTypes.INTEGER,
      // },
      // appointment_part_1: {
      //   type: DataTypes.INTEGER,
      // },
      // appointment_part_2: {
      //   type: DataTypes.INTEGER,
      // },
      // appointment_part_3: {
      //   type: DataTypes.INTEGER,
      // },
      // appointment_part_4: {
      //   type: DataTypes.INTEGER,
      // },
    },
    {
      sequelize,
      // Manually define the table name
      tableName: 'services',
      // Set to false to remove the `created_at` and `updated_at` columns
      timestamps: false,
      underscored: true,
      freezeTableName: true,
    }
  );

  return Service;
}