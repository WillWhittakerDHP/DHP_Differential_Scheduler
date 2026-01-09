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
exports.ActiveConstituent = void 0;
exports.ActiveConstituentFactory = ActiveConstituentFactory;
var sequelize_1 = require("sequelize");
/**
 * ActiveConstituent Model
 *
 * Represents active constituent relationships between block instances and part instances.
 * Constituent relationships are Block → Part relationships (math dimension).
 *
 * LEARNING: Active constituent relationships enable runtime block-part composition
 * WHY: Block instances need to define which part instances are constituents of them at runtime
 * PATTERN: Through table for many-to-many constituent relationships between block instances and part instances
 */
var ActiveConstituent = /** @class */ (function (_super) {
    __extends(ActiveConstituent, _super);
    function ActiveConstituent() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return ActiveConstituent;
}(sequelize_1.Model));
exports.ActiveConstituent = ActiveConstituent;
function ActiveConstituentFactory(sequelize) {
    ActiveConstituent.init({
        id: {
            type: sequelize_1.DataTypes.UUID,
            defaultValue: sequelize_1.DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false,
        },
        kind: {
            type: sequelize_1.DataTypes.VIRTUAL,
            get: function () {
                return "activeConstituents";
            }
        },
        parent_kind: {
            type: sequelize_1.DataTypes.VIRTUAL,
            get: function () {
                return "blockInstance";
            }
        },
        child_kind: {
            type: sequelize_1.DataTypes.VIRTUAL,
            get: function () {
                return "partInstance";
            }
        },
        parent_id: {
            type: sequelize_1.DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'block_instances',
                key: 'id',
            },
        },
        child_id: {
            type: sequelize_1.DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'part_instances',
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
        modelName: 'active_constituent',
        tableName: 'active_constituents',
        indexes: [
            {
                unique: true,
                fields: ["parent_id", "child_id"]
            }
        ],
        freezeTableName: true,
    });
    return ActiveConstituent;
}
