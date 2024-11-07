import Joi from "joi";

export type Config = {
  PORT: number;
  DB_URI: string;
};

export const configValidationSchema = Joi.object({
  PORT: Joi.number().port().default(3000),
  DB_URI: Joi.string().uri().required(),
});
