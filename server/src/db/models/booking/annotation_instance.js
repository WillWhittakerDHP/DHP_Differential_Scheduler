"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnnotationInstance = void 0;
exports.AnnotationInstanceFactory = AnnotationInstanceFactory;
var sequelize_1 = require("sequelize");
/**
 * AnnotationInstance Model
 *
 * Represents reusable, shared annotation instances (instance-level: concrete annotation entities)
 * that can be associated with block instances. Annotation instances can be user-type-specific
 * (matching state control block instances) or generic (null userType).
 *
 * LEARNING: Separating annotation instances into their own entity enables:
 * - Shared annotation instances across multiple block instances
 * - User-type-specific annotation instances (different text for same block based on user type)
 * - Centralized annotation instance management (update once, affects all block instances using it)
 *
 * WHY: Instead of storing annotation instances directly on block instances, we use a many-to-many
 * relationship through ActiveAnnotation. This allows:
 * - Reusability: Same annotation instance can be used by multiple blocks
 * - Flexibility: Blocks can have multiple annotation instances (ordered, with user-type filtering)
 * - Maintainability: Update annotation instance text once, all blocks using it get the update
 *
 * PATTERN: Instance-level entity model matching block_instances/part_instances pattern
 * COMPARISON: AnnotationShape is shape-level (definitions), AnnotationInstance is instance-level (concrete entities)
 *
 * NOTE: The userType field on this model is kept for backward compatibility but is being
 * phased out in favor of user_type_block_instance_id in the active_annotations table.
 */
var AnnotationInstance = /** @class */ (function (_super) {
    __extends(AnnotationInstance, _super);
    function AnnotationInstance() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return AnnotationInstance;
}(sequelize_1.Model));
exports.AnnotationInstance = AnnotationInstance;
function AnnotationInstanceFactory(sequelize) {
    AnnotationInstance.init({
        id: {
            type: sequelize_1.DataTypes.UUID,
            defaultValue: sequelize_1.DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false,
        },
        text: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: false,
        },
        type: {
            type: sequelize_1.DataTypes.UUID,
            allowNull: false,
            field: 'type',
            references: {
                model: 'annotation_shapes',
                key: 'id',
            },
            comment: 'Foreign key to annotation_shapes table (e.g., description, tooltip)',
        },
        userType: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: true,
            field: 'user_type',
            comment: 'User type filter: state control block instance ID or null for generic annotations. DEPRECATED: use active_annotations.user_type_block_instance_id',
        },
        createdAt: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize_1.Sequelize.literal('CURRENT_TIMESTAMP'),
            field: 'created_at',
        },
        updatedAt: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize_1.Sequelize.literal('CURRENT_TIMESTAMP'),
            field: 'updated_at',
        },
    }, {
        sequelize: sequelize,
        timestamps: false,
        underscored: true,
        schema: 'public',
        modelName: 'annotation_instance',
        tableName: 'annotation_instances',
        freezeTableName: true,
        indexes: [
            {
                fields: ['user_type'],
                name: 'idx_annotation_instances_user_type',
            },
            {
                fields: ['type'],
                name: 'idx_annotation_instances_type',
            },
        ],
    });
    return AnnotationInstance;
}
