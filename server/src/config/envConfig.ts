import dotenv from "dotenv";
import Joi from "joi";
import { NODE_ENV, APP_STAGE } from "../constants/appConstants.js";
import { createLogger } from "../utils/logger.js";

const logger = createLogger("EnvConfig");

/** Validated environment configuration (explicit type per workspace rule) */
export interface EnvConfig {
  NODE_ENV: string;
  APP_STAGE: string;
  PORT: number;
  DB_HOST: string;
  DB_NAME: string;
  DB_USER: string;
  DB_PASSWORD: string;
  DB_PORT: number;
}

const envFile = `./.env.${process.env.NODE_ENV || NODE_ENV.DEVELOPMENT}`;
const result = dotenv.config({ path: envFile });

if (result.error && process.env.NODE_ENV !== NODE_ENV.DEVELOPMENT) {
  logger.warn(`⚠️  ${envFile} not found, falling back to .env.development`);
  dotenv.config({ path: `./.env.${NODE_ENV.DEVELOPMENT}` });
}

const schema = Joi.object({
  NODE_ENV: Joi.string().valid(NODE_ENV.DEVELOPMENT, NODE_ENV.TEST, NODE_ENV.PRODUCTION).default(NODE_ENV.DEVELOPMENT),
  APP_STAGE: Joi.string().valid(APP_STAGE.LOCAL, APP_STAGE.STAGING, APP_STAGE.ALPHA, APP_STAGE.BETA, APP_STAGE.PRODUCTION).default(APP_STAGE.LOCAL),
  PORT: Joi.number().default(3000),
  DB_HOST: Joi.string().required(),
  DB_NAME: Joi.string().required(),
  DB_USER: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  DB_PORT: Joi.number().default(5432),
}).unknown(true);

const { error, value } = schema.validate(process.env);

if (error) {
  logger.error("❌ Missing property in config:", error.message);
  logger.error("🟠 Current env variables:", process.env);
  process.exit(1);
}

export const envConfig: EnvConfig = value as EnvConfig;
