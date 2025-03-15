import { Insertable, Selectable, Updateable } from "kysely";

export type GamePieceColor = "WHITE" | "BLACK";

export type GameEndReason =
  | "CHECKMATE"
  | "STALEMATE"
  | "FIFTY_MOVE_RULE"
  | "ABANDONED"
  | "TIMEOUT"
  | "RESIGNED";

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
