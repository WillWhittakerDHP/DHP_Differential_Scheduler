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
exports.ValidCascade = void 0;
exports.ValidCascadeFactory = ValidCascadeFactory;
var sequelize_1 = require("sequelize");
/**
 * ValidCascade Model
 *
 * Represents valid cascade relationships between block shapes.
 * Cascade relationships are vertical hierarchy relationships (different shapes, e.g., user_shape → service).
 *
 * LEARNING: Cascade relationships enable hierarchical filtering
 * WHY: Block shapes need to define which other block shapes can cascade from them
 * PATTERN: Through table for many-to-many cascade relationships between block shapes
 */
var ValidCascade = /** @class */ (function (_super) {
    __extends(ValidCascade, _super);
    function ValidCascade() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return ValidCascade;
}(sequelize_1.Model));
exports.ValidCascade = ValidCascade;
function ValidCascadeFactory(sequelize) {
    ValidCascade.init({
        id: {
            type: sequelize_1.DataTypes.UUID,
            defaultValue: sequelize_1.DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false,
        },
        kind: {
            type: sequelize_1.DataTypes.VIRTUAL,
            get: function () {
                return "validCascades";
            }
        },
        parent_kind: {
            type: sequelize_1.DataTypes.VIRTUAL,
            get: function () {
                return "blockShape";
            }
        },
        child_kind: {
            type: sequelize_1.DataTypes.VIRTUAL,
            get: function () {
                return "blockShape";
            }
        },
        parent_id: {
            type: sequelize_1.DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'block_shapes',
                key: 'id',
            },
        },
        child_id: {
            type: sequelize_1.DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'block_shapes',
                key: 'id',
            },
        },
        disabled: {
            type: sequelize_1.DataTypes.BOOLEAN,
            defaultValue: false,
        },
        createdAt: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize_1.Sequelize.literal('CURRENT_TIMESTAMP'),
        },
        updatedAt: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize_1.Sequelize.literal('CURRENT_TIMESTAMP'),
        },
    }, {
        sequelize: sequelize,
        timestamps: false,
        underscored: true,
        schema: 'public',
        modelName: 'valid_cascade',
        tableName: 'valid_cascades',
        indexes: [
            {
                unique: true,
                fields: ["parent_id", "child_id"]
            }
        ],
        freezeTableName: true,
    });
    return ValidCascade;
}
