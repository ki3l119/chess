import Joi from "joi";

import { CreateGameDto } from "chess-shared-types";

export const createGameDtoSchema = Joi.object<CreateGameDto>({
  color: Joi.string().required().uppercase().valid("BLACK", "WHITE", "RANDOM"),
});
