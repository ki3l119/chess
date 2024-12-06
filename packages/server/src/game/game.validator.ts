import Joi from "joi";

import { CreateGameDto, JoinGameDto } from "chess-shared-types";

export const createGameDtoSchema = Joi.object<CreateGameDto>({
  color: Joi.string().required().uppercase().valid("BLACK", "WHITE", "RANDOM"),
});

export const joinGameDtoSchema = Joi.object<JoinGameDto>({
  gameId: Joi.string().required().trim().uuid(),
});
