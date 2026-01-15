import dotenv from "dotenv";
import Joi from "joi";
import { Sequelize, ValidationError } from "sequelize";
import { initializeModels } from "../db/models/index.js";


// console.log(`🟡 NODE_ENV: ${process.env.NODE_ENV}`);
// console.log(`🟡 Loading .env from: ./env.${process.env.NODE_ENV || "development"}`);

// Load environment variables based on NODE_ENV
// WHY: Try to load environment-specific file, fallback to development if not found
// PATTERN: dotenv.config() doesn't throw if file is missing, but we want to ensure env vars are loaded
const envFile = `./.env.${process.env.NODE_ENV || "development"}`;
const result = dotenv.config({ path: envFile });

// If the environment-specific file doesn't exist and we're not in development, try development as fallback
if (result.error && process.env.NODE_ENV !== "development") {
  console.warn(`⚠️  ${envFile} not found, falling back to .env.development`);
  dotenv.config({ path: "./.env.development" });
}

// console.log("🟢 DB_HOST from process.env:", process.env.DB_HOST);

// ✅ Validate required environment variables
const schema = Joi.object({
  NODE_ENV: Joi.string().valid("development", "test", "production").default("development"),
  PORT: Joi.number().default(3000),
  DB_HOST: Joi.string().required(),
  DB_NAME: Joi.string().required(),
  DB_USER: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  DB_PORT: Joi.number().default(5432),
}).unknown(true);

const { error, value: config } = schema.validate(process.env);

if (error) {
  console.error("❌ Missing property in config:", error.message);
  console.error("🟠 Current env variables:", process.env);
  process.exit(1);
}

// ✅ Initialize Sequelize
export const sequelize = new Sequelize(config.DB_NAME, config.DB_USER, config.DB_PASSWORD, {
  host: config.DB_HOST,
  port: config.DB_PORT,
  dialect: "postgres",
  logging: false, // Disable SQL logging - set to console.log when debugging
});

// ✅ Ensure Models Are Loaded
// NOTE: Renamed for clearer domain terminology:
// - ValidIndependentComponent → AdditionalServiceOption → DependentInstanceOption (2026-01-09)
// - ActiveCascade → BookingCascade (2026-01-08)
// - ActiveComponent → ServiceComponent → InstanceComponent (2026-01-07)
export const { 
  PartShape, PartInstance, BlockShape, BlockInstance, 
  BlockInstanceVersion, PartInstanceVersion,
  ValidCascade, ValidConstituent, DependentInstanceOption,
  BookingCascade, ActiveConstituent, InstanceComponent,
  AnnotationShape, AnnotationInstance, ActiveAnnotation,
  Address, PropertyVersion, PropertyDetails, PropertyVersionType, Property, User, Appointment,
  BusinessSettings,
  AdminInputMetadata
} = initializeModels(sequelize);

// ✅ Database Connection - Migrations handle schema
export const initializeDatabase = async () => {
  try {
    console.log("📦 Connecting to Database...");
    await sequelize.authenticate();
    console.log("✅ Database connection established.");
    console.log("ℹ️  Run 'npm run migrate' to apply database migrations.");
    
  } catch (err) {
    console.error("❌ Database Connection Error:", err);

    if (err instanceof ValidationError) {
      console.error("Validation errors:", err.errors);
    }

    process.exit(1);
  }
};

// ✅ Export the validated config
export default {
  ...config,
  PartShape,
  PartInstance,
  BlockShape,
  BlockInstance,
  BlockInstanceVersion,
  PartInstanceVersion,
  ValidCascade,
  ValidConstituent,
  DependentInstanceOption,
  BookingCascade,
  ActiveConstituent,
  InstanceComponent,
  AnnotationShape,
  AnnotationInstance,
  ActiveAnnotation,
  Address,
  PropertyVersion,
  PropertyDetails,
  PropertyVersionType,
  Property,
  User,
  Appointment,
  BusinessSettings,
  AdminInputMetadata,
};
