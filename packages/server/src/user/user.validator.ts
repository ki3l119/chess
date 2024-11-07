import Joi from "joi";

import type { CreateUserDto } from "chess-shared-types";

export const createUserDtoSchema = Joi.object<CreateUserDto>({
  username: Joi.string().required().trim().max(50).min(1).token(),
  email: Joi.string().required().trim().max(350).email(),
  password: Joi.string().required().min(8).max(128),
});
