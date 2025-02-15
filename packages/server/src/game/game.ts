import { EventEmitter } from "events";

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

export type Player = {
  id: string;
  name: string;
  color: PieceColor;
  userId?: string;
  /**
   * Time left for the player in seconds
   */
  remainingTime: number;
};

export type NewPlayer = Pick<Player, "id" | "name" | "userId">;

type ActiveGame = {
  chess: Chess;
  currentMoveStartTime: Date;
  playerTimerTimeout: NodeJS.Timeout | null;
};

type EventMap = {
  timeout: [game: Game, player: Player];
};

export class Game extends EventEmitter<EventMap> {
  // Inidates if the color has been randomly assigned to the players.
  readonly isRandomColorChoice: boolean;
  private readonly host: Player;
  private player: Player | null;

  private activeGame?: ActiveGame;

  /**
   *
   * @param colorChoice - The color choice of the host.
   * @param gameDuration - The timer duration for each player in seconds.
   */
  constructor(
    public readonly id: string,
    host: NewPlayer,
    colorChoice: PieceColorChoice,
    private readonly gameDuration: number = 600,
  ) {
    super();
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
      remainingTime: this.gameDuration,
    };
  }

  private static deepCopyPlayer(player: Player): Player {
    return {
      id: player.id,
      name: player.name,
      color: player.color,
      userId: player.userId,
      remainingTime: player.remainingTime,
    };
  }

  getHost(): Player {
    return Game.deepCopyPlayer(this.host);
  }

  getPlayer(): Player | null {
    return this.player ? Game.deepCopyPlayer(this.player) : null;
  }

  setPlayer(player: NewPlayer): Player;
  setPlayer(player: null): null;
  setPlayer(player: NewPlayer | null): Player | null {
    this.player = player && {
      ...player,
      color: Chess.getOpposingColor(this.host.color),
      remainingTime: this.gameDuration,
    };

    return this.player;
  }

  /**
   * @returns Info regarding the active chess game.
   * @throws {InvalidGameStateException} For games that have not yet started
   */
  private getActiveGame(): ActiveGame {
    if (!this.activeGame) {
      throw new InvalidGameStateException("Game has not yet started.");
    }
    return this.activeGame;
  }

  private startPlayerTimer(player: Player) {
    const activeGame = this.getActiveGame();
    activeGame.playerTimerTimeout = setTimeout(() => {
      player.remainingTime = 0;
      this.emit("timeout", this, Game.deepCopyPlayer(player));
    }, player.remainingTime * 1000);
  }

  /**
   *
   * @returns How many seconds elapsed since the timer has started.
   * @throws {InvalidGameStateException} - If game has not started or timer not
   * set.
   */
  private stopPlayerTimer(): number {
    const activeGame = this.getActiveGame();
    if (!activeGame.playerTimerTimeout) {
      throw new InvalidGameStateException("Timer not set.");
    }
    clearTimeout(activeGame.playerTimerTimeout);
    const date = new Date();
    return (date.getTime() - activeGame.currentMoveStartTime.getTime()) / 1000;
  }

  /**
   * Initializes the chess board and starts the game.
   *
   * @throws {InvalidStartException}
   */
  start() {
    if (this.activeGame) {
      throw new InvalidStartException("The game has already started.");
    }

    if (!this.player) {
      throw new InvalidStartException("Missing a second player.");
    }

    this.activeGame = {
      chess: new Chess(parseFEN(startingBoardFENString)),
      currentMoveStartTime: new Date(),
      playerTimerTimeout: null,
    };

    const player = this.activePlayer();
    this.startPlayerTimer(player);
  }

  /**
   * @returns The player who's current turn it is.
   * @throws {InvalidGameStateException} When game has not yet started.
   */
  private activePlayer() {
    if (!this.player) {
      throw new InvalidGameStateException("Missing player.");
    }
    const { chess } = this.getActiveGame();

    const activeColor = chess.getActiveColor();

    return activeColor === this.player.color ? this.player : this.host;
  }

  /**
   * @returns The player who's current turn it is.
   * @throws {InvalidGameStateException} When game has not yet started.
   */
  // For public use only since it returns a deep copy, use activePlayer() internally.
  getActivePlayer(): Player {
    return Game.deepCopyPlayer(this.activePlayer());
  }

  hasStarted(): boolean {
    return this.activeGame !== undefined;
  }

  /**
   * @returns The list of legal moves for current position.
   * @throws {InvalidGameStateException} When game has not yet started.
   */
  getLegalMoves(): Move[] {
    const { chess } = this.getActiveGame();
    return chess.getLegalMoves();
  }

  /**
   * @returns The current position of the game.
   * @throws {InvalidGameStateException} When game has not yet started.
   */
  getBoard(): Board {
    const { chess } = this.getActiveGame();
    return chess.getBoard();
  }

  /**
   * @returns Applies the following move to the game.
   * @throws {InvalidGameStateException} When game has not yet started.
   * @throws {InvalidMoveException} When provided with an illegal move.
   */
  move(move: Move): Board {
    // Perform move
    const player = this.activePlayer();
    const activeGame = this.getActiveGame();
    activeGame.chess.move(move);

    // Update player timers
    const elapsed = this.stopPlayerTimer();
    player.remainingTime = player.remainingTime - elapsed;
    if (activeGame.chess.isOngoing()) {
      activeGame.currentMoveStartTime = new Date();
      this.startPlayerTimer(this.activePlayer());
    }
    return activeGame.chess.getBoard();
  }

  /**
   * @returns The result of the game. If game is not finished, returns null.
   */
  getResult(): GameResult | null {
    const { chess } = this.getActiveGame();
    return chess.getResult();
  }

  /**
   * Cleans up timers used by games that have started.
   */
  stop() {
    if (this.hasStarted()) {
      this.stopPlayerTimer();
    }
  }
}
