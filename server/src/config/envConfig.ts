import dotenv from "dotenv";
import Joi from "joi";
import { NODE_ENV, APP_STAGE } from "../constants/appConstants.js";
import { createLogger } from "../utils/logger.js";
import type { AuthStrategyName } from "../auth/strategies/strategyTypes.js";

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
  CORS_ORIGIN: string;
  /** Active auth strategy seam; `none` until magic-link/password implementations are wired. */
  AUTH_STRATEGY: AuthStrategyName;
  /** HttpOnly session cookie name (used when Session 7.2.2 sets cookies). */
  AUTH_SESSION_COOKIE_NAME: string;
  /** Max-Age for session cookie in seconds. */
  AUTH_SESSION_MAX_AGE_SEC: number;
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
  CORS_ORIGIN: Joi.string().default("http://localhost:3002"),
  AUTH_STRATEGY: Joi.string()
    .valid("none", "magic_link", "password")
    .default("none"),
  AUTH_SESSION_COOKIE_NAME: Joi.string().min(1).default("dhp_sid"),
  AUTH_SESSION_MAX_AGE_SEC: Joi.number().integer().min(60).default(604800),
}).unknown(true);

const { error, value } = schema.validate(process.env);

if (error) {
  logger.error("❌ Missing property in config:", error.message);
  logger.error("🟠 Current env variables:", process.env);
  process.exit(1);
}

export const envConfig: EnvConfig = value as EnvConfig;

/**
 * Resolves CORS_ORIGIN for cors() middleware.
 * Returns string if single origin, string[] if comma-separated.
 */
export function getCorsOrigin(): string | string[] {
  const raw = envConfig.CORS_ORIGIN;
  if (raw.includes(",")) {
    return raw.split(",").map((s) => s.trim()).filter(Boolean);
  }
  return raw;
}
