import { Model, DataTypes, 
  // Optional,
  type InferAttributes,
  type InferCreationAttributes,
  type CreationOptional,
  // type ForeignKey,
  // type BelongsToManyAddAssociationMixin,
  type Sequelize } from 'sequelize';
  

export class UIDescription extends Model<
  InferAttributes<UIDescription>,
  InferCreationAttributes<UIDescription>
> {
  declare ui_description_set_id: CreationOptional<number>;
  declare buyer_description: string;
  declare agent_description: string;
  declare owner_description: string;

  // TODO What's this?
  // //  Since TS cannot determine model associations at compile time, we need to declare the association methods here. These will not exist until `Model.init` was called.
  //   declare addReaders: BelongsToManyAddAssociationMixin<
  //   Reader[],
  //   Reader['id'][]
  // >;
  // declare addReader: BelongsToManyAddAssociationMixin<Reader, Reader['id']>;
}

export function UIDescriptionFactory(sequelize: Sequelize): typeof UIDescription {
  UIDescription.init(
    {
      ui_description_set_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      buyer_description: {
        type: DataTypes.STRING,
      },
      agent_description: {
        type: DataTypes.STRING,
      },
      owner_description: {
        type: DataTypes.STRING,
      },
    },
    {
      sequelize,
      // Manually define the table name
      modelName: 'ui_description_sets',
      // Set to false to remove the `created_at` and `updated_at` columns
      timestamps: false,
      underscored: true,
      freezeTableName: true,
    }
  );

  return UIDescription;
}