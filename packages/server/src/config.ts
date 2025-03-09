import fs from "fs";
import Joi from "joi";

type DatabaseEnvironmentVariables = {
  DB_HOST: string;
  DB_PORT: number;
  DB_USER: string;
  DB_PASSWORD?: string;
  DB_PASSWORD_FILE?: string;
  DB_DATABASE: string;
};

type EnvironmentVariables = {
  PORT: number;
  NODE_ENV: "production" | "development";
  CORS_ORIGIN: string;
};

export type DbConfig = {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
};

export type Config = {
  port: number;
  db: DbConfig;
  nodeEnv: "production" | "development";
  corsOrigin: string;
};

const dbEnvSchema = Joi.object<DatabaseEnvironmentVariables>({
  DB_HOST: Joi.string().trim().min(1).required(),
  DB_PORT: Joi.number().port().required(),
  DB_USER: Joi.string().trim().min(1).required(),
  DB_PASSWORD: Joi.string().min(1),
  DB_PASSWORD_FILE: Joi.string().min(1),
  DB_DATABASE: Joi.string().min(1).required(),
});

const envSchema = Joi.object<EnvironmentVariables>({
  PORT: Joi.number().port().default(3000),
  NODE_ENV: Joi.string()
    .valid("production", "development")
    .default("production"),
  CORS_ORIGIN: Joi.string().uri().required(),
});

export const loadDatabaseConfig: () => DbConfig = () => {
  const dbEnvValidation = dbEnvSchema
    .required()
    .validate(process.env, { allowUnknown: true, stripUnknown: true });
  if (dbEnvValidation.error) {
    throw new Error(dbEnvValidation.error.message);
  }

  const dbEnv = dbEnvValidation.value as DatabaseEnvironmentVariables;
  let dbPassword: string;
  if (dbEnv.DB_PASSWORD != undefined) {
    dbPassword = dbEnv.DB_PASSWORD;
  } else if (dbEnv.DB_PASSWORD_FILE != undefined) {
    dbPassword = fs.readFileSync(dbEnv.DB_PASSWORD_FILE).toString();
  } else {
    throw new Error("Either DB_PASSWORD or DB_PASSWORD_FILE must be defined.");
  }

  return {
    host: dbEnv.DB_HOST,
    port: dbEnv.DB_PORT,
    user: dbEnv.DB_USER,
    password: dbPassword,
    database: dbEnv.DB_DATABASE,
  };
};

export const loadConfig: () => Config = () => {
  const envValidation = envSchema
    .required()
    .validate(process.env, { allowUnknown: true, stripUnknown: true });
  if (envValidation.error) {
    throw new Error(envValidation.error.message);
  }

  const env = envValidation.value as EnvironmentVariables;

  return {
    port: env.PORT,
    db: loadDatabaseConfig(),
    nodeEnv: env.NODE_ENV,
    corsOrigin: env.CORS_ORIGIN,
  };
};
