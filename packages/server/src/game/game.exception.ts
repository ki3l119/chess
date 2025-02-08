import { MoveDto, ProblemDetails } from "chess-shared-types";

export class GameException extends Error {
  constructor(public readonly problemDetails: ProblemDetails) {
    super(problemDetails.details);
  }
}

export class GameNotFoundException extends GameException {
  constructor(public readonly gameId: string) {
    super({
      title: "Game not found.",
      details: `The game with id ${gameId} does not exist.`,
    });
  }
}

export class InvalidGameCreationException extends GameException {
  constructor(details: string) {
    super({
      title: "Cannot create game.",
      details,
    });
  }
}

export class InvalidGameJoinException extends GameException {
  constructor(details: string) {
    super({
      title: "Cannot join game.",
      details,
    });
  }
}

export class InvalidStartException extends GameException {
  constructor(details: string) {
    super({
      title: "Cannot start game.",
      details,
    });
  }
}

export class InvalidGameStateException extends GameException {
  constructor(details: string) {
    super({
      title: "Invalid game state.",
      details,
    });
  }
}

export class InvalidGameMoveException extends GameException {
  constructor(readonly moveDto: MoveDto) {
    super({
      title: "Invalid move.",
      details: `Movement from (${moveDto.from.rank}, ${moveDto.from.file}) to (${moveDto.to.rank}, ${moveDto.to.file}) is illegal.`,
    });
  }
}
