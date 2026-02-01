import dotenv from "dotenv";
import Joi from "joi";
import { Sequelize, ValidationError } from "sequelize";
import { initializeModels } from "../db/models/index.js";



const envFile = `./.env.${process.env.NODE_ENV || "development"}`;
const result = dotenv.config({ path: envFile });

if (result.error && process.env.NODE_ENV !== "development") {
  console.warn(`⚠️  ${envFile} not found, falling back to .env.development`);
  dotenv.config({ path: "./.env.development" });
}


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

export const sequelize = new Sequelize(config.DB_NAME, config.DB_USER, config.DB_PASSWORD, {
  host: config.DB_HOST,
  port: config.DB_PORT,
  dialect: "postgres",
  logging: false, // Disable SQL logging - set to console.log when debugging
});

export const { 
  PartShape, PartInstance, BlockShape, BlockInstance, 
  BlockInstanceVersion, PartInstanceVersion,
  ValidCascade, ValidPart, ValidAnnotation, ValidEvent, DependentInstance,
  BookingCascade, PartAssignment, InstanceComponent,
  AnnotationShape, AnnotationInstance, AnnotationAssignment,
  EventShape, EventInstance, EventAssignment, EventShapeAttendee,
  Address, PropertyVersion, PropertyDetails, PropertyVersionType, Property, User, Appointment,
  AppointmentAttendee,
  BusinessSettings, BusinessRule,
  AdminMetadata
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
  ValidPart,
  ValidAnnotation,
  ValidEvent,
  DependentInstance,
  BookingCascade,
  PartAssignment,
  InstanceComponent,
  AnnotationShape,
  AnnotationInstance,
  AnnotationAssignment,
  EventShape,
  EventInstance,
  EventAssignment,
  Address,
  PropertyVersion,
  PropertyDetails,
  PropertyVersionType,
  Property,
  User,
  Appointment,
  AppointmentAttendee,
  BusinessSettings,
  BusinessRule,
  AdminMetadata,
};
