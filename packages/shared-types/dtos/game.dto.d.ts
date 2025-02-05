export type PieceColorChoice = "WHITE" | "BLACK" | "RANDOM";

export type CreateGameDto = {
  color: PieceColorChoice;
};

export type JoinGameDto = {
  gameId: string;
};

export type PlayerDto = {
  id: string;
  name: string;
  color: "WHITE" | "BLACK";
};

export type GameInfoDto = {
  id: string;
  host: PlayerDto;
  player?: PlayerDto;
  isColorRandom: boolean;
};

export type BoardCoordinateDto = {
  /**
   * 0-based index of the rank.
   */
  rank: number;

  /**
   * 0-based index of the file where a=0, b=1, ..., h=7.
   */
  file: number;
};

export type PieceDto = {
  /**
   * FEN string representation of the piece.
   */
  piece: string;

  /**
   * Location of the piece within the board.
   */
  coordinate: BoardCoordinateDto;
};

export type StartGameDto = {
  pieces: PieceDto[];
};
