/**
 * Beta Feedback Tag Model
 *
 * LEARNING: Tags for beta feedback entries (e.g., booking-wizard, mobile)
 * WHY: Flexible grouping and filtering for feedback analysis
 * PATTERN: Many-to-one with BetaFeedback, CASCADE delete
 */

import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  ForeignKey,
  Sequelize,
} from 'sequelize';

export class BetaFeedbackTag extends Model<
  InferAttributes<BetaFeedbackTag>,
  InferCreationAttributes<BetaFeedbackTag>
> {
  declare id: CreationOptional<number>;
  declare feedbackId: ForeignKey<string>;
  declare tag: string;
}

export function BetaFeedbackTagFactory(sequelize: Sequelize) {
  BetaFeedbackTag.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      feedbackId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'feedback_id',
        references: {
          model: 'beta_feedback',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      tag: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: 'tag',
      },
    },
    {
      sequelize,
      timestamps: false,
      underscored: false,
      schema: 'public',
      modelName: 'beta_feedback_tag',
      tableName: 'beta_feedback_tags',
      freezeTableName: true,
    }
  );

  return BetaFeedbackTag;
}
