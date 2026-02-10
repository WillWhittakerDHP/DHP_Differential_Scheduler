import { Sequelize, ValidationError } from "sequelize";
import { envConfig } from "./envConfig.js";
import { createLogger } from "../utils/logger.js";

const logger = createLogger("Database");

export const sequelize = new Sequelize(
  envConfig.DB_NAME,
  envConfig.DB_USER,
  envConfig.DB_PASSWORD,
  {
    host: envConfig.DB_HOST,
    port: envConfig.DB_PORT,
    dialect: "postgres",
    logging: false,
  }
);

export async function initializeDatabase(): Promise<void> {
  try {
    logger.info("📦 Connecting to Database...");
    await sequelize.authenticate();
    logger.info("✅ Database connection established.");
    logger.info("ℹ️  Run 'npm run migrate' to apply database migrations.");
  } catch (err) {
    logger.error("❌ Database Connection Error:", err);

    if (err instanceof ValidationError) {
      logger.error("Validation errors:", err.errors);
    }

    process.exit(1);
  }
}
