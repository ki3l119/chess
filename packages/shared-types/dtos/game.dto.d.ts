export type CreateGameDto = {
  color: "WHITE" | "BLACK" | "RANDOM";
};

export type CreateGameSuccessDto = {
  gameId: string;
};

export type JoinGameDto = {
  gameId: string;
};
