export type PieceColor = "WHITE" | "BLACK";

export type GameEndReason =
  | "CHECKMATE"
  | "STALEMATE"
  | "FIFTY_MOVE_RULE"
  | "ABANDONED"
  | "TIMEOUT"
  | "RESIGNED";

export type PageBasedPagination = {
  page: number;
  pageSize: number;
};
