import { Insertable, Selectable, Updateable } from "kysely";

export enum GamePieceColor {
  WHITE = "WHITE",
  BLACK = "BLACK",
}

export enum GameEndReason {
  CHECKMATE = "CHECKMATE",
  STALEMATE = "STALEMATE",
  FIFTY_MOVE_RULE = "FIFTY_MOVE_RULE",
  ABANDONED = "ABANDONED",
  TIMEOUT = "TIMEOUT",
  RESIGNED = "RESIGNED",
}

export interface GamesTable {
  id: string;
  whitePlayerId: string | null;
  blackPlayerId: string | null;
  startTime: Date;
  endTime: Date;
  winner: GamePieceColor | null;
  reason: GameEndReason;
}

export type Game = Selectable<GamesTable>;
export type NewGame = Insertable<GamesTable>;
export type UpdateGame = Updateable<GamesTable>;
