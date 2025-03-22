import Joi from "joi";

import type { LoginDto, CreateUserDto } from "chess-shared-types";

const emailSchema = Joi.string().required().trim().max(350).email();

export const createUserDtoSchema = Joi.object<CreateUserDto>({
  username: Joi.string().required().trim().max(50).min(1).token(),
  email: emailSchema,
  password: Joi.string().required().min(8).max(128),
});

export const loginDtoSchema = Joi.object<LoginDto>({
  email: emailSchema,
  password: Joi.string().required().max(128),
});
