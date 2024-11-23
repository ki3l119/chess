import Joi from "joi";

export type Config = {
  PORT: number;
  DB_URI: string;
  NODE_ENV: "production" | "development";
};

export const configValidationSchema = Joi.object({
  PORT: Joi.number().port().default(3000),
  DB_URI: Joi.string().uri().required(),
  NODE_ENV: Joi.string().valid("production", "development").required(),
});
