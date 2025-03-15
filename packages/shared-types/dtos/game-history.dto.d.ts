import { GameEndReason, PieceColor } from "./common.dto";

type Player = {
  id: string;
  name: string;
};

export type GameHistoryEntryDto = {
  id: string;
  whitePlayer: Player | null;
  blackPlayer: Player | null;
  startTime: Date;
  endTime: Date;
  winner: PieceColor | null;
  reason: GameEndReason;
};
