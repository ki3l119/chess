import { GameEndReason, PageBasedPagination, PieceColor } from "./common.dto";

type Player = {
  id: string;
  name: string;
};

export type GameHistoryEntryDto = {
  id: string;
  whitePlayer: Player | null;
  blackPlayer: Player | null;
  startTime: string;
  endTime: string;
  winner: PieceColor | null;
  reason: GameEndReason;
};

export type GameHistoryDto = {
  games: GameHistoryEntryDto[];
  pagination: {
    currentPage: number;
    totalPages: number;
    pageSize: number;
  };
};

export type GetGameHistoryQueryDto = PageBasedPagination;

export type GameHistoryStatsDto = {
  totalGames: number;
  wins: number;
  losses: number;
  draws: number;
};
