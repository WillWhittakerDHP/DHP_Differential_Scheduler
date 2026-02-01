"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeDatabase = exports.BusinessSettings = exports.Appointment = exports.User = exports.Property = exports.PropertyVersionType = exports.PropertyDetails = exports.PropertyVersion = exports.Address = exports.ActiveAnnotation = exports.AnnotationInstance = exports.AnnotationShape = exports.InstanceComponent = exports.ActiveConstituent = exports.BookingCascade = exports.DependentInstanceOption = exports.ValidConstituent = exports.ValidCascade = exports.BlockInstance = exports.BlockShape = exports.PartInstance = exports.PartShape = exports.sequelize = void 0;
var dotenv_1 = require("dotenv");
var joi_1 = require("joi");
var sequelize_1 = require("sequelize");
var index_js_1 = require("../db/models/index.js");
dotenv_1.default.config({
    path: "./.env.".concat(process.env.NODE_ENV || "development"),
});
// ✅ Validate required environment variables
var schema = joi_1.default.object({
    NODE_ENV: joi_1.default.string().valid("development", "test", "production").default("development"),
    PORT: joi_1.default.number().default(3000),
    DB_HOST: joi_1.default.string().required(),
    DB_NAME: joi_1.default.string().required(),
    DB_USER: joi_1.default.string().required(),
    DB_PASSWORD: joi_1.default.string().required(),
    DB_PORT: joi_1.default.number().default(5432),
}).unknown(true);
var _b = schema.validate(process.env), error = _b.error, config = _b.value;
if (error) {
    console.error("❌ Missing property in config:", error.message);
    console.error("🟠 Current env variables:", process.env);
    process.exit(1);
}
exports.sequelize = new sequelize_1.Sequelize(config.DB_NAME, config.DB_USER, config.DB_PASSWORD, {
    host: config.DB_HOST,
    port: config.DB_PORT,
    dialect: "postgres",
});
exports.PartShape = (_a = (0, index_js_1.initializeModels)(exports.sequelize), _a.PartShape), exports.PartInstance = _a.PartInstance, exports.BlockShape = _a.BlockShape, exports.BlockInstance = _a.BlockInstance, exports.ValidCascade = _a.ValidCascade, exports.ValidConstituent = _a.ValidConstituent, exports.DependentInstanceOption = _a.DependentInstanceOption, exports.BookingCascade = _a.BookingCascade, exports.ActiveConstituent = _a.ActiveConstituent, exports.InstanceComponent = _a.InstanceComponent, exports.AnnotationShape = _a.AnnotationShape, exports.AnnotationInstance = _a.AnnotationInstance, exports.ActiveAnnotation = _a.ActiveAnnotation, exports.Address = _a.Address, exports.PropertyVersion = _a.PropertyVersion, exports.PropertyDetails = _a.PropertyDetails, exports.PropertyVersionType = _a.PropertyVersionType, exports.Property = _a.Property, exports.User = _a.User, exports.Appointment = _a.Appointment, exports.BusinessSettings = _a.BusinessSettings;
// ✅ Database Connection - Migrations handle schema
var initializeDatabase = function () { return __awaiter(void 0, void 0, void 0, function () {
    var err_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                console.log("📦 Connecting to Database...");
                return [4 /*yield*/, exports.sequelize.authenticate()];
            case 1:
                _a.sent();
                console.log("✅ Database connection established.");
                console.log("ℹ️  Run 'npm run migrate' to apply database migrations.");
                return [3 /*break*/, 3];
            case 2:
                err_1 = _a.sent();
                console.error("❌ Database Connection Error:", err_1);
                if (err_1 instanceof sequelize_1.ValidationError) {
                    console.error("Validation errors:", err_1.errors);
                }
                process.exit(1);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.initializeDatabase = initializeDatabase;
// ✅ Export the validated config
exports.default = __assign(__assign({}, config), { PartShape: exports.PartShape, PartInstance: exports.PartInstance, BlockShape: exports.BlockShape, BlockInstance: exports.BlockInstance, ValidCascade: exports.ValidCascade, ValidConstituent: exports.ValidConstituent, DependentInstanceOption: exports.DependentInstanceOption, BookingCascade: exports.BookingCascade, ActiveConstituent: exports.ActiveConstituent, InstanceComponent: exports.InstanceComponent, AnnotationShape: exports.AnnotationShape, AnnotationInstance: exports.AnnotationInstance, ActiveAnnotation: exports.ActiveAnnotation, Address: exports.Address, PropertyVersion: exports.PropertyVersion, PropertyDetails: exports.PropertyDetails, PropertyVersionType: exports.PropertyVersionType, Property: exports.Property, User: exports.User, Appointment: exports.Appointment, BusinessSettings: exports.BusinessSettings });
