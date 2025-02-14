import {
  Chess,
  parseFEN,
  PieceColor,
  startingBoardFENString,
  Move,
  Board,
  GameResult,
  InvalidMoveException,
} from "chess-game";
import { PieceColorChoice } from "chess-shared-types";

import {
  InvalidGameStateException,
  InvalidStartException,
} from "./game.exception";

export { PieceColor };

export type Player = Readonly<{
  id: string;
  name: string;
  color: PieceColor;
  userId?: string;
}>;

export type NewPlayer = Pick<Player, "id" | "name" | "userId">;

export class Game {
  // Inidates if the color has been randomly assigned to the players.
  readonly isRandomColorChoice: boolean;
  private readonly host: Player;
  private player: Player | null;

  private chess?: Chess;

  constructor(
    public readonly id: string,
    host: NewPlayer,
    colorChoice: PieceColorChoice,
  ) {
    this.isRandomColorChoice = colorChoice === "RANDOM";

    let color = colorChoice === "WHITE" ? PieceColor.WHITE : PieceColor.BLACK;
    if (colorChoice === "RANDOM") {
      color = [PieceColor.WHITE, PieceColor.BLACK][
        Math.floor(Math.random() * 2)
      ];
    }
    this.player = null;

    this.host = {
      id: host.id,
      name: host.name,
      color,
      userId: host.userId,
    };
  }

  getHost(): Player {
    return this.host;
  }

  getPlayer(): Player | null {
    return this.player;
  }

  setPlayer(player: NewPlayer): Player;
  setPlayer(player: null): null;
  setPlayer(player: NewPlayer | null): Player | null {
    this.player = player && {
      ...player,
      color: Chess.getOpposingColor(this.host.color),
    };

    return this.player;
  }

  /**
   * @returns The chess object that manages the state of the chess game.
   */
  private getChessObject(): Chess {
    if (!this.chess) {
      throw new InvalidGameStateException("Game has not yet started.");
    }
    return this.chess;
  }

  /**
   * Initializes the chess board and starts the game.
   *
   * @throws {InvalidStartException}
   */
  start() {
    if (this.chess) {
      throw new InvalidStartException("The game has already started.");
    }

    if (!this.player) {
      throw new InvalidStartException("Missing a second player.");
    }

    this.chess = new Chess(parseFEN(startingBoardFENString));
  }

  /**
   * @returns The player who's current turn it is.
   * @throws {InvalidGameStateException} When game has not yet started.
   */
  getActivePlayer(): Player {
    if (!this.player) {
      throw new InvalidGameStateException("Missing player.");
    }
    const chess = this.getChessObject();

    const activeColor = chess.getActiveColor();

    return activeColor === this.player.color ? this.player : this.host;
  }

  hasStarted(): boolean {
    return this.chess !== undefined;
  }

  /**
   * @returns The list of legal moves for current position.
   * @throws {InvalidGameStateException} When game has not yet started.
   */
  getLegalMoves(): Move[] {
    const chess = this.getChessObject();
    return chess.getLegalMoves();
  }

  /**
   * @returns The current position of the game.
   * @throws {InvalidGameStateException} When game has not yet started.
   */
  getBoard(): Board {
    const chess = this.getChessObject();
    return chess.getBoard();
  }

  /**
   * @returns Applies the following move to the game.
   * @throws {InvalidGameStateException} When game has not yet started.
   * @throws {InvalidMoveException} When provided with an illegal move.
   */
  move(move: Move): Board {
    const chess = this.getChessObject();
    chess.move(move);
    return chess.getBoard();
  }

  /**
   * @returns The result of the game. If game is not finished, returns null.
   */
  getResult(): GameResult | null {
    const chess = this.getChessObject();
    return chess.getResult();
  }
}
