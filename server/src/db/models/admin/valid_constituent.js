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
exports.ValidConstituent = void 0;
exports.ValidConstituentFactory = ValidConstituentFactory;
var sequelize_1 = require("sequelize");
/**
 * ValidConstituent Model
 *
 * Represents valid constituent relationships between block shapes and part shapes.
 * Constituent relationships are Block → Part relationships (math dimension).
 *
 * LEARNING: Constituent relationships enable block-part composition
 * WHY: Block shapes need to define which part shapes can be constituents of them
 * PATTERN: Through table for many-to-many constituent relationships between block shapes and part shapes
 */
var ValidConstituent = /** @class */ (function (_super) {
    __extends(ValidConstituent, _super);
    function ValidConstituent() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return ValidConstituent;
}(sequelize_1.Model));
exports.ValidConstituent = ValidConstituent;
function ValidConstituentFactory(sequelize) {
    ValidConstituent.init({
        id: {
            type: sequelize_1.DataTypes.UUID,
            defaultValue: sequelize_1.DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false,
        },
        kind: {
            type: sequelize_1.DataTypes.VIRTUAL,
            get: function () {
                return "validConstituents";
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
                return "partShape";
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
                model: 'part_shapes',
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
        modelName: 'valid_constituent',
        tableName: 'valid_constituents',
        indexes: [
            {
                unique: true,
                fields: ["parent_id", "child_id"]
            }
        ],
        freezeTableName: true,
    });
    return ValidConstituent;
}
