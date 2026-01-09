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
exports.ActiveAnnotation = void 0;
exports.ActiveAnnotationFactory = ActiveAnnotationFactory;
var sequelize_1 = require("sequelize");
/**
 * ActiveAnnotation Model
 *
 * Through-table for many-to-many relationship between BlockInstance and AnnotationInstance.
 * Enables block instances to have multiple annotation instances with ordering and user-type filtering.
 *
 * LEARNING: Active relationship pattern enables:
 * - Many-to-many relationships (one block can have many annotation instances, one annotation instance can be used by many blocks)
 * - Additional metadata on the relationship (orderIndex, userTypeBlockInstanceId override, isDefault)
 * - User-type-specific filtering at the relationship level via BlockInstance foreign key
 *
 * WHY: Using an active relationship table instead of storing annotation instances directly on blocks allows:
 * - Reusability: Same annotation instance text can be shared across multiple blocks
 * - Ordering: Multiple annotation instances per block can be ordered via orderIndex
 * - User-type filtering: Annotation instances can be filtered by user type via user_type_block_instance_id (BlockInstance FK)
 * - Default flag: Mark which annotation instance should be shown by default
 *
 * PATTERN: Active relationship model matching active_cascades/active_components/active_constituents pattern
 * COMPARISON: ActiveAnnotation is runtime (which annotations are assigned), AnnotationShape/Instance are definitions/entities
 */
var ActiveAnnotation = /** @class */ (function (_super) {
    __extends(ActiveAnnotation, _super);
    function ActiveAnnotation() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return ActiveAnnotation;
}(sequelize_1.Model));
exports.ActiveAnnotation = ActiveAnnotation;
function ActiveAnnotationFactory(sequelize) {
    ActiveAnnotation.init({
        id: {
            type: sequelize_1.DataTypes.UUID,
            defaultValue: sequelize_1.DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false,
        },
        blockInstanceId: {
            type: sequelize_1.DataTypes.UUID,
            allowNull: false,
            field: 'block_instance_id',
            references: {
                model: 'block_instances',
                key: 'id',
            },
        },
        annotationId: {
            type: sequelize_1.DataTypes.UUID,
            allowNull: false,
            field: 'annotation_id',
            references: {
                model: 'annotation_instances',
                key: 'id',
            },
        },
        userTypeBlockInstanceId: {
            type: sequelize_1.DataTypes.UUID,
            allowNull: true,
            field: 'user_type_block_instance_id',
            references: {
                model: 'block_instances',
                key: 'id',
            },
            comment: 'Optional user type override for this specific relationship (BlockInstance ID representing user type)',
        },
        orderIndex: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            field: 'order_index',
            comment: 'Order in which annotation instances should be displayed for this block',
        },
        isDefault: {
            type: sequelize_1.DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            field: 'is_default',
            comment: 'Whether this annotation instance should be shown by default for this block',
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
        modelName: 'active_annotation',
        tableName: 'active_annotations',
        indexes: [
            {
                unique: true,
                fields: ['block_instance_id', 'annotation_id', 'user_type_block_instance_id'],
                name: 'unique_block_instance_annotation_user_type',
            },
            {
                fields: ['block_instance_id'],
                name: 'idx_active_annotations_block_instance_id',
            },
            {
                fields: ['annotation_id'],
                name: 'idx_active_annotations_annotation_id',
            },
            {
                fields: ['user_type_block_instance_id'],
                name: 'idx_active_annotations_user_type_block_instance_id',
            },
            {
                fields: ['order_index'],
                name: 'idx_active_annotations_order_index',
            },
        ],
        freezeTableName: true,
    });
    return ActiveAnnotation;
}
