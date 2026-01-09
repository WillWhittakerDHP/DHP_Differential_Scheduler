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
exports.Address = void 0;
exports.AddressFactory = AddressFactory;
var sequelize_1 = require("sequelize");
/**
 * Address Model
 *
 * LEARNING: Address model stores stable address information from client input
 * WHY: Addresses are normalized separately from property details for reuse and stability
 * PATTERN: Minimal structure with address components, no property-specific details
 */
var Address = /** @class */ (function (_super) {
    __extends(Address, _super);
    function Address() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return Address;
}(sequelize_1.Model));
exports.Address = Address;
function AddressFactory(sequelize) {
    Address.init({
        id: {
            type: sequelize_1.DataTypes.UUID,
            defaultValue: sequelize_1.DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false,
        },
        address: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
        },
        unit: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: true,
        },
        city: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
        },
        state: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
        },
        zipCode: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
            field: 'zip_code',
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
        underscored: false,
        schema: 'public',
        modelName: 'address',
        tableName: 'addresses',
        freezeTableName: true,
    });
    return Address;
}
