export type CreateGameDto = {
  color: "WHITE" | "BLACK" | "RANDOM";
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
};

export type NewPlayerDto = {
  player: string;
};
