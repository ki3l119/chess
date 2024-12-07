export type PieceColorChoice = "WHITE" | "BLACK" | "RANDOM";

export type CreateGameDto = {
  color: PieceColorChoice;
};

export type CreateGameSuccessDto = {
  gameId: string;
};

export type JoinGameDto = {
  gameId: string;
};

export type JoinGameSuccessDto = {
  gameId: string;
  you: string;
  opponent: string;
  color: PieceColorChoice;
};

export type NewPlayerDto = {
  player: string;
};
