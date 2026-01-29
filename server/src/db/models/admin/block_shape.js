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
exports.BlockShape = void 0;
exports.BlockShapeFactory = BlockShapeFactory;
var sequelize_1 = require("sequelize");
var BlockShape = /** @class */ (function (_super) {
    __extends(BlockShape, _super);
    function BlockShape() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return BlockShape;
}(sequelize_1.Model));
exports.BlockShape = BlockShape;
function BlockShapeFactory(sequelize) {
    BlockShape.init({
        id: {
            type: sequelize_1.DataTypes.UUID,
            defaultValue: sequelize_1.DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false,
        },
        name: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: true,
            unique: true,
        },
        order_index: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
        },
        composable: {
            type: sequelize_1.DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        canHaveParts: {
            type: sequelize_1.DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            field: 'can_have_parts',
        },
        active: {
            type: sequelize_1.DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
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
        indexes: [
            {
                fields: ['order_index'],
            },
        ],
        timestamps: false,
        underscored: true,
        schema: 'public',
        modelName: 'block_shape',
        tableName: 'block_shapes',
        freezeTableName: true,
    });
    return BlockShape;
}
