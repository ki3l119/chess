import Joi from "joi";

import {
  BoardCoordinateDto,
  CreateGameDto,
  JoinGameDto,
  MoveDto,
  NewMoveDto,
} from "chess-shared-types";

export const createGameDtoSchema = Joi.object<CreateGameDto>({
  color: Joi.string().required().uppercase().valid("BLACK", "WHITE", "RANDOM"),
  playerTimerDuration: Joi.number().integer().min(5).max(3600).default(600),
}).required();

export const joinGameDtoSchema = Joi.object<JoinGameDto>({
  gameId: Joi.string().required().trim().uuid(),
}).required();

const boardCoordinateSchema = Joi.object<BoardCoordinateDto>({
  rank: Joi.number().integer().min(0).max(7).required(),
  file: Joi.number().integer().min(0).max(7).required(),
});

export const moveDtoSchema = Joi.object<MoveDto>({
  from: boardCoordinateSchema.required(),
  to: boardCoordinateSchema.required(),
});

export const newMoveDtoSchema = Joi.object<NewMoveDto>({
  move: moveDtoSchema.required(),
  pawnPromotionPiece: Joi.string().valid("R", "N", "B", "Q"),
}).required();
