import fs from "fs";
import Joi from "joi";

type EnvironmentVariables = {
  PORT: number;
  DB_HOST: string;
  DB_PORT: number;
  DB_USER: string;
  DB_PASSWORD?: string;
  DB_PASSWORD_FILE?: string;
  DB_DATABASE: string;
  NODE_ENV: "production" | "development";
  CLIENT_DOMAIN: string;
};

export type Config = {
  port: number;
  db: {
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
  };
  nodeEnv: "production" | "development";
  clientDomain: string;
};

const environmentVariablesValidationSchema = Joi.object<EnvironmentVariables>({
  PORT: Joi.number().port().default(3000),
  DB_HOST: Joi.string().trim().min(1).required(),
  DB_PORT: Joi.number().port().required(),
  DB_USER: Joi.string().trim().min(1).required(),
  DB_PASSWORD: Joi.string().min(1),
  DB_PASSWORD_FILE: Joi.string().min(1),
  DB_DATABASE: Joi.string().min(1).required(),
  NODE_ENV: Joi.string()
    .valid("production", "development")
    .default("production"),
  CLIENT_DOMAIN: Joi.string().uri().required(),
});

export const loadConfig: () => Promise<Config> = async () => {
  const result = environmentVariablesValidationSchema
    .required()
    .validate(process.env, { allowUnknown: true, stripUnknown: true });
  if (result.error) {
    throw new Error(result.error.message);
  }

  const environmentVariables = result.value as EnvironmentVariables;
  let dbPassword: string;
  if (environmentVariables.DB_PASSWORD != undefined) {
    dbPassword = environmentVariables.DB_PASSWORD;
  } else if (process.env.DB_PASSWORD_FILE != undefined) {
    dbPassword = fs.readFileSync(process.env.DB_PASSWORD_FILE).toString();
  } else {
    throw new Error("Either DB_PASSWORD or DB_PASSWORD_FILE must be defined.");
  }
  return {
    port: environmentVariables.PORT,
    db: {
      host: environmentVariables.DB_HOST,
      port: environmentVariables.DB_PORT,
      user: environmentVariables.DB_USER,
      password: dbPassword,
      database: environmentVariables.DB_DATABASE,
    },
    nodeEnv: environmentVariables.NODE_ENV,
    clientDomain: environmentVariables.CLIENT_DOMAIN,
  };
};
