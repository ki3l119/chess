import { Move } from "./board";

export class ChessException extends Error {}

export class InvalidMoveException extends ChessException {
  constructor(
    readonly move: Readonly<Move>,
    message: string = "An illegal move was made.",
  ) {
    super(message);
  }
}
