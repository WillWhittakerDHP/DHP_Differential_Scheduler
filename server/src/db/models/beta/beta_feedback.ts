/**
PATTERN: Factory pattern, snake_case DB columns, UUI...
 */
import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  Sequelize,
} from 'sequelize';

export type FeedbackCategory =
  | 'bug'
  | 'feature_request'
  | 'usability'
  | 'performance'
  | 'general';
export type FeedbackSeverity = 'low' | 'medium' | 'high' | 'critical';
export type FeedbackStatus =
  | 'new'
  | 'triaged'
  | 'in_progress'
  | 'resolved'
  | 'wont_fix';

export class BetaFeedback extends Model<
  InferAttributes<BetaFeedback>,
  InferCreationAttributes<BetaFeedback>
> {
  declare id: CreationOptional<string>;
  declare reporterName: string;
  declare reporterEmail: CreationOptional<string | null>;
  declare category: FeedbackCategory;
  declare severity: FeedbackSeverity;
  declare title: string;
  declare description: string;
  declare pageUrl: CreationOptional<string | null>;
  declare browserInfo: CreationOptional<string | null>;
  declare screenSize: CreationOptional<string | null>;
  declare stepsToReproduce: CreationOptional<string | null>;
  declare expectedBehavior: CreationOptional<string | null>;
  declare actualBehavior: CreationOptional<string | null>;
  declare status: FeedbackStatus;
  declare resolutionNotes: CreationOptional<string | null>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

export function BetaFeedbackFactory(sequelize: Sequelize) {
  BetaFeedback.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      reporterName: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: 'reporter_name',
      },
      reporterEmail: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'reporter_email',
      },
      category: {
        type: DataTypes.STRING(50),
        allowNull: false,
        field: 'category',
      },
      severity: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'medium',
        field: 'severity',
      },
      title: {
        type: DataTypes.STRING(255),
        allowNull: false,
        field: 'title',
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
        field: 'description',
      },
      pageUrl: {
        type: DataTypes.STRING(500),
        allowNull: true,
        field: 'page_url',
      },
      browserInfo: {
        type: DataTypes.STRING(500),
        allowNull: true,
        field: 'browser_info',
      },
      screenSize: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: 'screen_size',
      },
      stepsToReproduce: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'steps_to_reproduce',
      },
      expectedBehavior: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'expected_behavior',
      },
      actualBehavior: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'actual_behavior',
      },
      status: {
        type: DataTypes.STRING(30),
        allowNull: false,
        defaultValue: 'new',
        field: 'status',
      },
      resolutionNotes: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'resolution_notes',
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
      modelName: 'beta_feedback',
      tableName: 'beta_feedback',
      freezeTableName: true,
    }
  );

  return BetaFeedback;
}
