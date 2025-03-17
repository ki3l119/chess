import Joi from "joi";

import {
  BoardCoordinateDto,
  CreateGameDto,
  JoinGameDto,
  MoveDto,
  NewMoveDto,
  GetGameHistoryQueryDto,
} from "chess-shared-types";

export const createGameDtoSchema = Joi.object<CreateGameDto>({
  color: Joi.string().uppercase().valid("BLACK", "WHITE", "RANDOM").required(),
  playerTimerDuration: Joi.number().integer().min(5).max(3600).default(600),
});

export const joinGameDtoSchema = Joi.object<JoinGameDto>({
  gameId: Joi.string().trim().uuid().required(),
});

const boardCoordinateSchema = Joi.object<BoardCoordinateDto>({
  rank: Joi.number().integer().min(0).max(7).required(),
  file: Joi.number().integer().min(0).max(7).required(),
});

const moveDtoSchema = Joi.object<MoveDto>({
  from: boardCoordinateSchema.required(),
  to: boardCoordinateSchema.required(),
});

export const newMoveDtoSchema = Joi.object<NewMoveDto>({
  move: moveDtoSchema.required(),
  pawnPromotionPiece: Joi.string().valid("R", "N", "B", "Q"),
});

export const getGameHistoryQuerySchema = Joi.object<GetGameHistoryQueryDto>({
  page: Joi.number().integer().min(1).default(1),
  pageSize: Joi.number().integer().min(1).max(100).default(50),
});
