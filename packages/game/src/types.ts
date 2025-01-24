import type { Board, BoardCoordinate } from "./board";
import type { PieceColor } from "./pieces";

export type CastlingRights = {
  kingside: boolean;
  queenside: boolean;
};

export type GameState = {
  board: Board;
  activeColor: PieceColor;
  castlingRights: {
    [key in PieceColor]: CastlingRights;
  };
  enPassantTarget: BoardCoordinate | null;
  halfmoveClock: number;
  fullmoveCount: number;
};
