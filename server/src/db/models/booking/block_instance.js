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
exports.BlockInstance = void 0;
exports.BlockInstanceFactory = BlockInstanceFactory;
var sequelize_1 = require("sequelize");
var BlockInstance = /** @class */ (function (_super) {
    __extends(BlockInstance, _super);
    function BlockInstance() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return BlockInstance;
}(sequelize_1.Model));
exports.BlockInstance = BlockInstance;
function BlockInstanceFactory(sequelize) {
    BlockInstance.init({
        id: {
            type: sequelize_1.DataTypes.UUID,
            defaultValue: sequelize_1.DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false,
        },
        orderIndex: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            field: 'order_index',
        },
        blockShapeRef: {
            type: sequelize_1.DataTypes.UUID,
            allowNull: false,
            field: 'block_shape_ref',
            references: {
                model: 'block_shapes',
                key: 'id',
            },
        },
        name: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: true,
        },
        active: {
            type: sequelize_1.DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
            field: 'active',
        },
        composite: {
            type: sequelize_1.DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            field: 'composite',
        },
        differential: {
            type: sequelize_1.DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            field: 'differential',
        },
        icon: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: true,
        },
        baseSqFt: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            field: 'base_sq_ft',
        },
        allowMultiple: {
            type: sequelize_1.DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            field: 'allow_multiple',
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
        indexes: [
            {
                fields: ['order_index'],
            },
        ],
        timestamps: false,
        underscored: false,
        schema: 'public',
        modelName: 'block_instance',
        tableName: 'block_instances',
        freezeTableName: true,
    });
    return BlockInstance;
}
