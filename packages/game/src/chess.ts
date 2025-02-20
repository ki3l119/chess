import {
  Board,
  BoardCoordinate,
  BoardCoordinateOffset,
  Direction,
  Move,
} from "./board";
import { InvalidMoveException } from "./exceptions";
import {
  PieceColor,
  Pawn,
  Knight,
  Queen,
  Rook,
  Bishop,
  King,
  Piece,
  PIECES,
  FENPieceName,
} from "./pieces";
import { GameState } from "./types";

export type PawnPromotionPieceName = "N" | "Q" | "R" | "B";

export type MoveOptions = {
  pawnPromotionPiece?: PawnPromotionPieceName;
};

export enum GameEndReason {
  CHECKMATE = "CHECKMATE",
  STALEMATE = "STALEMATE",
  FIFTY_MOVE_RULE = "FIFTY_MOVE_RULE",
}

export type GameResult = {
  /**
   * The piece color of the winner. If draw, winner is set to null.
   */
  winner: PieceColor | null;
  reason: GameEndReason;
};

export class Chess {
  private currentLegalMoves: Move[] | null;

  private result: GameResult | null;

  constructor(private readonly gameState: GameState) {
    this.currentLegalMoves = null;
    this.result = null;
  }

  /**
   * @returns The coordinate of the king with the specified color.
   * @throws {Error} When the king does not exist on the board.
   */
  private static findKing(board: Board, color: PieceColor): BoardCoordinate {
    for (const { piece, coordinate } of board.pieces({ color: color })) {
      if (piece instanceof King) {
        return coordinate;
      }
    }
    throw new Error("Invalid game state. King no longer exists.");
  }

  static getOpposingColor(color: PieceColor): PieceColor {
    return color === PieceColor.WHITE ? PieceColor.BLACK : PieceColor.WHITE;
  }

  private static isAttackedByPiece(
    board: Board,
    coordinate: BoardCoordinate,
    attackingColor: PieceColor,
    pieceTypes: (typeof Piece)[],
    offsets: BoardCoordinateOffset[],
  ): boolean {
    for (const pawnAttackerCoordinate of board.traverseOffsets(
      coordinate,
      offsets,
    )) {
      const piece = board.getPiece(pawnAttackerCoordinate);
      if (
        piece &&
        piece.color === attackingColor &&
        pieceTypes.find((PieceType) => piece instanceof PieceType) !== undefined
      ) {
        return true;
      }
    }
    return false;
  }

  private static isAttackedBySlidingPiece(
    board: Board,
    coordinate: BoardCoordinate,
    attackingColor: PieceColor,
    pieceTypes: (typeof Piece)[],
    directions: Direction[],
  ): boolean {
    for (const direction of directions) {
      for (const slidingAttackerCoordinate of board.traverseDirection(
        coordinate,
        direction,
      )) {
        const piece = board.getPiece(slidingAttackerCoordinate);
        if (piece) {
          if (
            piece.color === attackingColor &&
            pieceTypes.find((PieceType) => piece instanceof PieceType) !==
              undefined
          ) {
            return true;
          } else {
            break;
          }
        }
      }
    }
    return false;
  }

  /**
   * Determines if the square with the specified coordinate
   * can be reached by any of the opposing pieces.
   */
  private static isSquareAttacked(
    board: Board,
    coordinate: BoardCoordinate,
    attackingColor: PieceColor,
  ): boolean {
    // Check for pawn, knight, and king attackers
    const pawnOffsetRank = attackingColor === PieceColor.WHITE ? -1 : 1;
    const nonSlidingPieces: {
      PieceType: typeof Piece;
      offsets: BoardCoordinateOffset[];
    }[] = [
      {
        PieceType: Pawn,
        offsets: [
          {
            rank: pawnOffsetRank,
            file: 1,
          },
          {
            rank: pawnOffsetRank,
            file: -1,
          },
        ],
      },
      {
        PieceType: King,
        offsets: [...King.offsets],
      },
      {
        PieceType: Knight,
        offsets: [...Knight.offsets],
      },
    ];

    for (const { PieceType, offsets } of nonSlidingPieces) {
      const isAttacked = Chess.isAttackedByPiece(
        board,
        coordinate,
        attackingColor,
        [PieceType],
        offsets,
      );
      if (isAttacked) {
        return true;
      }
    }

    // Check for sliding pieces attackers
    const slidingPieces: {
      pieceTypes: (typeof Piece)[];
      directions: Direction[];
    }[] = [
      {
        pieceTypes: [Queen, Rook],
        directions: [
          Direction.NORTH,
          Direction.SOUTH,
          Direction.EAST,
          Direction.WEST,
        ],
      },
      {
        pieceTypes: [Queen, Bishop],
        directions: [
          Direction.NORTH_EAST,
          Direction.NORTH_WEST,
          Direction.SOUTH_EAST,
          Direction.SOUTH_WEST,
        ],
      },
    ];

    for (const { pieceTypes, directions } of slidingPieces) {
      const isAttacked = Chess.isAttackedBySlidingPiece(
        board,
        coordinate,
        attackingColor,
        pieceTypes,
        directions,
      );

      if (isAttacked) {
        return true;
      }
    }

    return false;
  }

  private deepCopyGameState(): GameState {
    return {
      board: new Board(this.gameState.board.getBoardElements()),
      activeColor: this.gameState.activeColor,
      castlingRights: {
        [PieceColor.BLACK]: {
          kingside: this.gameState.castlingRights[PieceColor.BLACK].kingside,
          queenside: this.gameState.castlingRights[PieceColor.BLACK].queenside,
        },
        [PieceColor.WHITE]: {
          kingside: this.gameState.castlingRights[PieceColor.WHITE].kingside,
          queenside: this.gameState.castlingRights[PieceColor.WHITE].queenside,
        },
      },
      enPassantTarget: this.gameState.enPassantTarget,
      halfmoveClock: this.gameState.halfmoveClock,
      fullmoveCount: this.gameState.fullmoveCount,
    };
  }

  /**
   * Determines if the castling path is free from any attackers.
   */
  private checkCastlingPath(side: "kingside" | "queenside"): boolean {
    const kingCoordinate =
      this.gameState.activeColor === PieceColor.WHITE
        ? new BoardCoordinate(0, 4)
        : new BoardCoordinate(7, 4);
    const attackingColor = Chess.getOpposingColor(this.gameState.activeColor);
    if (
      Chess.isSquareAttacked(
        this.gameState.board,
        kingCoordinate,
        attackingColor,
      )
    ) {
      return false;
    }

    const direction = side === "kingside" ? Direction.EAST : Direction.WEST;

    for (const coordinate of this.gameState.board.traverseDirection(
      kingCoordinate,
      direction,
    )) {
      const piece = this.gameState.board.getPiece(coordinate);
      const isEdge = coordinate.file === 0 || coordinate.file === 7;

      if (
        (piece && !isEdge) ||
        Chess.isSquareAttacked(this.gameState.board, coordinate, attackingColor)
      ) {
        return false;
      }
    }

    return true;
  }

  /**
   * Updates the game state with the specified move.
   *
   * This method modifies the game state object argument upon applying the move.
   *
   * @throws {InvalidMoveException}
   */
  private static performMove(
    gameState: GameState,
    move: Move,
    options: MoveOptions = {},
  ) {
    const piece = gameState.board.getPiece(move.from);
    if (!piece) {
      throw new InvalidMoveException(
        move,
        "The chosen origin square must have an occupying piece.",
      );
    }

    const targetPiece = gameState.board.getPiece(move.to);
    const opposingColor = Chess.getOpposingColor(gameState.activeColor);
    const colorBackRank = gameState.activeColor === PieceColor.WHITE ? 0 : 7;
    const opponentBackRank = gameState.activeColor === PieceColor.WHITE ? 7 : 0;

    gameState.board.movePiece(move);

    // Update castling rights
    if (piece instanceof Rook) {
      if (
        gameState.castlingRights[gameState.activeColor].kingside &&
        move.from.isEqual(new BoardCoordinate(colorBackRank, 7))
      ) {
        gameState.castlingRights[gameState.activeColor].kingside = false;
      }

      if (
        gameState.castlingRights[gameState.activeColor].queenside &&
        move.from.isEqual(new BoardCoordinate(colorBackRank, 0))
      ) {
        gameState.castlingRights[gameState.activeColor].queenside = false;
      }
    }

    if (piece instanceof King) {
      // Remove castling rights
      gameState.castlingRights[gameState.activeColor].kingside = false;
      gameState.castlingRights[gameState.activeColor].queenside = false;

      // Move rook for casling move
      const fileDifference = move.from.file - move.to.file;
      if (fileDifference === -2) {
        gameState.board.movePiece({
          from: new BoardCoordinate(colorBackRank, 7),
          to: new BoardCoordinate(colorBackRank, 5),
        });
      } else if (fileDifference === 2) {
        gameState.board.movePiece({
          from: new BoardCoordinate(colorBackRank, 0),
          to: new BoardCoordinate(colorBackRank, 3),
        });
      }
    }

    if (piece instanceof Pawn) {
      // Handle en passant move
      if (
        gameState.enPassantTarget &&
        move.to.isEqual(gameState.enPassantTarget)
      ) {
        gameState.board.set(
          gameState.enPassantTarget.addOffset({
            rank: gameState.activeColor === PieceColor.WHITE ? -1 : 1,
            file: 0,
          }),
          null,
        );
        gameState.enPassantTarget = null;
      } else if (Math.abs(move.from.rank - move.to.rank) === 2) {
        gameState.enPassantTarget = move.to.addOffset({
          rank: gameState.activeColor === PieceColor.WHITE ? -1 : 1,
          file: 0,
        });
      } else {
        gameState.enPassantTarget = null;
      }

      // Handle pawn promotion
      if (move.to.rank === opponentBackRank && options.pawnPromotionPiece) {
        const pieceLetter = (
          gameState.activeColor === PieceColor.WHITE
            ? options.pawnPromotionPiece
            : options.pawnPromotionPiece.toLowerCase()
        ) as FENPieceName;

        gameState.board.set(move.to, PIECES[pieceLetter]);
      }
    } else {
      gameState.enPassantTarget = null;
    }

    // Update full move count
    if (gameState.activeColor === PieceColor.BLACK) {
      gameState.fullmoveCount += 1;
    }

    // Update halfmove clock
    if (
      piece instanceof Pawn ||
      (targetPiece && targetPiece.color === opposingColor)
    ) {
      gameState.halfmoveClock = 0;
    } else {
      gameState.halfmoveClock += 1;
    }

    gameState.activeColor = opposingColor;
  }

  /**
   * Computes for a list of legal moves based on the current game state.
   */
  private calculateLegalMoves(): Move[] {
    const pseudoLegalMoves: Move[] = [];
    for (const { piece, coordinate } of this.gameState.board.pieces({
      color: this.gameState.activeColor,
    })) {
      const destinationCoordinates = piece.generatePseudoLegalMoves(
        this.gameState,
        coordinate,
      );

      pseudoLegalMoves.push(
        ...destinationCoordinates.map((destinationCoordinate) => ({
          from: coordinate,
          to: destinationCoordinate,
        })),
      );
    }
    const attackingColor = Chess.getOpposingColor(this.gameState.activeColor);

    const legalMoves: Move[] = [];

    // Filter moves that put King in check
    for (const move of pseudoLegalMoves) {
      const gameStateCopy = this.deepCopyGameState();
      Chess.performMove(gameStateCopy, move);
      const kingCoordinate = Chess.findKing(
        gameStateCopy.board,
        this.gameState.activeColor,
      );
      if (
        !Chess.isSquareAttacked(
          gameStateCopy.board,
          kingCoordinate,
          attackingColor,
        )
      ) {
        legalMoves.push(move);
      }
    }

    const kingCoordinate = Chess.findKing(
      this.gameState.board,
      this.gameState.activeColor,
    );
    // Add castling moves
    if (
      this.gameState.castlingRights[this.gameState.activeColor].kingside &&
      this.checkCastlingPath("kingside")
    ) {
      legalMoves.push({
        from: kingCoordinate,
        to: kingCoordinate.addOffset({ rank: 0, file: 2 }),
      });
    }
    if (
      this.gameState.castlingRights[this.gameState.activeColor].queenside &&
      this.checkCastlingPath("queenside")
    ) {
      legalMoves.push({
        from: kingCoordinate,
        to: kingCoordinate.addOffset({ rank: 0, file: -2 }),
      });
    }

    return legalMoves;
  }

  /**
   * @returns A list of legal moves for the current game state.
   */
  getLegalMoves(): Move[] {
    if (this.currentLegalMoves === null) {
      // Store the computation of the legal moves for current state to avoid
      // recomputation
      this.currentLegalMoves = this.calculateLegalMoves();
    }
    return this.currentLegalMoves;
  }

  /**
   * Verifies and applies the move for the currently active player.
   *
   * @throws {InvalidMoveException}
   */
  move(move: Move, options: MoveOptions = {}) {
    if (
      !this.gameState.board.isWithinBoard(move.from) ||
      !this.gameState.board.isWithinBoard(move.to)
    ) {
      throw new InvalidMoveException(
        move,
        "Move references squares outside the board.",
      );
    }

    // Update game state with new move
    const legalMoves = this.getLegalMoves();
    const isLegalMove =
      legalMoves.find(
        (legalMove) =>
          move.from.isEqual(legalMove.from) && move.to.isEqual(legalMove.to),
      ) !== undefined;

    if (!isLegalMove) {
      throw new InvalidMoveException(move);
    }

    Chess.performMove(this.gameState, move, options);

    // Check for winning condition
    this.currentLegalMoves = this.calculateLegalMoves();

    if (this.currentLegalMoves.length === 0) {
      const kingCoordinate = Chess.findKing(
        this.gameState.board,
        this.gameState.activeColor,
      );
      if (
        Chess.isSquareAttacked(
          this.gameState.board,
          kingCoordinate,
          Chess.getOpposingColor(this.gameState.activeColor),
        )
      ) {
        this.result = {
          winner: Chess.getOpposingColor(this.gameState.activeColor),
          reason: GameEndReason.CHECKMATE,
        };
      } else {
        this.result = {
          winner: null,
          reason: GameEndReason.STALEMATE,
        };
      }
    } else if (this.gameState.halfmoveClock >= 100) {
      this.result = {
        winner: null,
        reason: GameEndReason.FIFTY_MOVE_RULE,
      };
    }
  }

  isOngoing(): boolean {
    return this.result === null;
  }

  getGameState(): GameState {
    return this.deepCopyGameState();
  }

  getActiveColor(): PieceColor {
    return this.gameState.activeColor;
  }

  getBoard(): Board {
    return new Board(this.gameState.board.getBoardElements());
  }

  getCastlingRights(
    color: PieceColor,
    side: "kingside" | "queenside",
  ): boolean {
    return this.gameState.castlingRights[color][side];
  }

  getEnPassantTarget(): BoardCoordinate | null {
    return this.gameState.enPassantTarget;
  }

  getHalfmoveClock(): number {
    return this.gameState.halfmoveClock;
  }

  getFullmoveCount(): number {
    return this.gameState.fullmoveCount;
  }

  /**
   * @returns The result of the game for finished games. For ongoing games,
   *          returns null.
   */
  getResult(): GameResult | null {
    return this.result;
  }
}
