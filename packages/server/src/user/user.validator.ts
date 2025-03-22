import Joi from "joi";

import {
  type LoginDto,
  type CreateUserDto,
  ChangePasswordDto,
} from "chess-shared-types";

const emailSchema = Joi.string().trim().max(350).email();
const passwordSchema = Joi.string().min(8).max(128);

export const createUserDtoSchema = Joi.object<CreateUserDto>({
  username: Joi.string().trim().max(50).min(1).token().required(),
  email: emailSchema.required(),
  password: passwordSchema.required(),
});

export const loginDtoSchema = Joi.object<LoginDto>({
  email: emailSchema.required(),
  password: passwordSchema.required(),
});

export const changePasswordDtoSchema = Joi.object<ChangePasswordDto>({
  oldPassword: passwordSchema.required(),
  newPassword: passwordSchema.required(),
});
