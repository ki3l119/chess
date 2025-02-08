import {
  Chess,
  parseFEN,
  PieceColor,
  startingBoardFENString,
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
}>;

export class Game {
  // Inidates if the color has been randomly assigned to the players.
  readonly isRandomColorChoice: boolean;
  private readonly host: Player;
  private player?: Player;

  private chess?: Chess;

  constructor(
    public readonly id: string,
    host: {
      id: string;
      color: PieceColorChoice;
      name: string;
    },
  ) {
    this.isRandomColorChoice = host.color === "RANDOM";

    let color = host.color === "WHITE" ? PieceColor.WHITE : PieceColor.BLACK;
    if (host.color === "RANDOM") {
      color = [PieceColor.WHITE, PieceColor.BLACK][
        Math.floor(Math.random() * 2)
      ];
    }

    this.host = {
      id: host.id,
      name: host.name,
      color,
    };
  }

  getHost(): Player {
    return this.host;
  }

  getPlayer(): Player | undefined {
    return this.player;
  }

  setPlayer(player: { id: string; name: string }): Player {
    this.player = {
      id: player.id,
      name: player.name,
      color: Chess.getOpposingColor(this.host.color),
    };

    return this.player;
  }

  /**
   * @returns The chess object that manages the state of the chess game.
   */
  getChessObject(): Chess {
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

  getActivePlayer(): Player {
    if (!this.player) {
      throw new InvalidGameStateException("Missing player.");
    }
    const chess = this.getChessObject();

    const activeColor = chess.getActiveColor();

    return activeColor === this.player.color ? this.player : this.host;
  }
}
