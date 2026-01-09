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
exports.Appointment = void 0;
exports.AppointmentFactory = AppointmentFactory;
var sequelize_1 = require("sequelize");
var Appointment = /** @class */ (function (_super) {
    __extends(Appointment, _super);
    function Appointment() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return Appointment;
}(sequelize_1.Model));
exports.Appointment = Appointment;
function AppointmentFactory(sequelize) {
    Appointment.init({
        id: {
            type: sequelize_1.DataTypes.UUID,
            defaultValue: sequelize_1.DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false,
        },
        propertyVersionId: {
            type: sequelize_1.DataTypes.UUID,
            allowNull: false, // Required - references normalized property_versions table
            field: 'property_version_id',
            references: {
                model: 'property_versions',
                key: 'id',
            },
        },
        userTypeId: {
            type: sequelize_1.DataTypes.UUID,
            allowNull: true,
            field: 'user_type_id',
            references: {
                model: 'block_instances',
                key: 'id',
            },
        },
        selectedServiceIds: {
            type: sequelize_1.DataTypes.JSONB,
            allowNull: true,
            field: 'selected_service_ids',
            comment: 'Array of block instance IDs for selected services (replaces base_service_id)',
        },
        serviceQuantities: {
            type: sequelize_1.DataTypes.JSONB,
            allowNull: true,
            field: 'service_quantities',
            comment: 'Quantity multipliers for selected services (item_id -> quantity mapping)',
        },
        selectedDwellingAdjustmentIds: {
            type: sequelize_1.DataTypes.JSONB,
            allowNull: true,
            field: 'selected_dwelling_adjustment_ids',
            comment: 'Array of block instance IDs for selected dwelling adjustments (replaces dwelling_adjustment_id)',
        },
        dwellingQuantities: {
            type: sequelize_1.DataTypes.JSONB,
            allowNull: true,
            field: 'dwelling_quantities',
            comment: 'Quantity multipliers for selected dwelling adjustments (item_id -> quantity mapping)',
        },
        selectedAvailabilityOptions: {
            type: sequelize_1.DataTypes.JSONB,
            allowNull: true,
            field: 'selected_availability_options',
        },
        availabilityOptionQuantities: {
            type: sequelize_1.DataTypes.JSONB,
            allowNull: true,
            field: 'availability_option_quantities',
            comment: 'Quantity multipliers for selected availability options (item_id -> quantity mapping)',
        },
        serviceSnapshots: {
            type: sequelize_1.DataTypes.JSONB,
            allowNull: true,
            field: 'service_snapshots',
            comment: 'Snapshots of selected services at booking time (preserves pricing/names)',
        },
        dwellingSnapshots: {
            type: sequelize_1.DataTypes.JSONB,
            allowNull: true,
            field: 'dwelling_snapshots',
            comment: 'Snapshots of selected dwelling adjustments at booking time (preserves pricing/names)',
        },
        availabilityOptionSnapshots: {
            type: sequelize_1.DataTypes.JSONB,
            allowNull: true,
            field: 'availability_option_snapshots',
            comment: 'Snapshots of selected availability options at booking time (preserves pricing/names)',
        },
        selectedDate: {
            type: sequelize_1.DataTypes.DATEONLY,
            allowNull: true,
            field: 'selected_date',
        },
        selectedDateRangeEnd: {
            type: sequelize_1.DataTypes.DATEONLY,
            allowNull: true,
            field: 'selected_date_range_end',
        },
        selectedTimeSlots: {
            type: sequelize_1.DataTypes.JSONB,
            allowNull: true,
            field: 'selected_time_slots',
        },
        isQuoteMode: {
            type: sequelize_1.DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            field: 'is_quote_mode',
        },
        quotePdfUrl: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: true,
            field: 'quote_pdf_url',
        },
        /**
         * Appointment status workflow:
         * - started: Non-quote mode appointment creation in progress
         * - held: Time slots held for clients who paid booking fee (TODO: implement booking fee logic)
         * - rescheduling: Non-quote mode rescheduling in progress
         * - quoted: Quote mode appointment creation in progress
         * - submitted: Submitted through app, awaiting confirmation (TODO: implement confirmation routine)
         * - confirmed: Submitted and confirmed
         * - cancelled: Soft-delete, still reschedulable
         * - deleted: Hard-delete
         */
        status: {
            type: sequelize_1.DataTypes.ENUM('started', 'held', 'rescheduling', 'quoted', 'submitted', 'confirmed', 'cancelled', 'deleted'),
            allowNull: false,
            defaultValue: 'started',
        },
        clientId: {
            type: sequelize_1.DataTypes.UUID,
            allowNull: true,
            field: 'client_id',
            references: {
                model: 'users',
                key: 'id',
            },
        },
        agentId: {
            type: sequelize_1.DataTypes.UUID,
            allowNull: true,
            field: 'agent_id',
            references: {
                model: 'users',
                key: 'id',
            },
        },
        /** Tracks which user engaged/interacted with the scheduler to create this appointment */
        scheduledById: {
            type: sequelize_1.DataTypes.UUID,
            allowNull: true,
            field: 'scheduled_by_id',
            references: {
                model: 'users',
                key: 'id',
            },
        },
        additionalContacts: {
            type: sequelize_1.DataTypes.JSONB,
            allowNull: true,
            field: 'additional_contacts',
        },
        propertyDetails: {
            type: sequelize_1.DataTypes.JSONB,
            allowNull: true,
            field: 'property_details',
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
        modelName: 'appointment',
        tableName: 'appointments',
        freezeTableName: true,
    });
    return Appointment;
}
