import { ProblemDetails } from "chess-shared-types";

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
  constructor(public readonly details: string) {
    super({
      title: "Cannot create game.",
      details: details,
    });
  }
}

export class InvalidGameJoinException extends GameException {
  constructor(public readonly details: string) {
    super({
      title: "Cannot join game.",
      details: details,
    });
  }
}
