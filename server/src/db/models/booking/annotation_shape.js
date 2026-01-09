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
exports.AnnotationShape = void 0;
exports.AnnotationShapeFactory = AnnotationShapeFactory;
var sequelize_1 = require("sequelize");
/**
 * AnnotationShape Model
 *
 * Represents annotation shapes (shape-level: defines what annotation types can exist).
 * Shapes are fully dynamic and can be created/deleted by admins via CRUD interface.
 *
 * LEARNING: Separating annotation shapes into their own entity enables:
 * - Dynamic shape management (admins can create/edit/delete shapes)
 * - Shape validation (ensures annotation instances use valid shapes)
 * - Shape filtering and organization
 *
 * WHY: Instead of hardcoding annotation shapes, we use a dynamic entity:
 * - Flexibility: Admins can add new shapes without code changes
 * - Maintainability: Shapes are managed through admin UI
 * - Data integrity: Foreign key constraints ensure valid shapes
 *
 * PATTERN: Shape-level entity model matching block_shapes/part_shapes pattern
 * COMPARISON: AnnotationShape is shape-level (definitions), AnnotationInstance is instance-level (concrete entities)
 */
var AnnotationShape = /** @class */ (function (_super) {
    __extends(AnnotationShape, _super);
    function AnnotationShape() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return AnnotationShape;
}(sequelize_1.Model));
exports.AnnotationShape = AnnotationShape;
function AnnotationShapeFactory(sequelize) {
    AnnotationShape.init({
        id: {
            type: sequelize_1.DataTypes.UUID,
            defaultValue: sequelize_1.DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false,
        },
        name: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
            unique: true,
            comment: 'Annotation shape name (e.g., description, tooltip)',
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
        modelName: 'annotation_shape',
        tableName: 'annotation_shapes',
        freezeTableName: true,
        indexes: [
            {
                fields: ['name'],
                unique: true,
                name: 'idx_annotation_shapes_name_unique',
            },
        ],
    });
    return AnnotationShape;
}
