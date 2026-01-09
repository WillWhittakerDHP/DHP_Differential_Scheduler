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
exports.BusinessSettings = void 0;
exports.BusinessSettingsFactory = BusinessSettingsFactory;
var sequelize_1 = require("sequelize");
var BusinessSettings = /** @class */ (function (_super) {
    __extends(BusinessSettings, _super);
    function BusinessSettings() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return BusinessSettings;
}(sequelize_1.Model));
exports.BusinessSettings = BusinessSettings;
function BusinessSettingsFactory(sequelize) {
    BusinessSettings.init({
        id: {
            type: sequelize_1.DataTypes.UUID,
            defaultValue: sequelize_1.DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false,
        },
        settingKey: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
            unique: true,
            field: 'setting_key',
        },
        settingValue: {
            type: sequelize_1.DataTypes.JSONB,
            allowNull: false,
            field: 'setting_value',
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
        modelName: 'business_settings',
        tableName: 'business_settings',
        freezeTableName: true,
    });
    return BusinessSettings;
}
