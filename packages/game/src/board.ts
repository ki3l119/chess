import type { Piece, PieceColor } from "./pieces";

export type Move = {
  from: BoardCoordinate;
  to: BoardCoordinate;
};

export type BoardElement = Piece | null;

export type BoardCoordinateOffset = {
  rank: number;
  file: number;
};

/**
 * Represents a square in the board.
 *
 * The object is immutable and all operations on the object returns a new
 * instance.
 */
export class BoardCoordinate {
  /**
   * @param rank - The 0-based index of the rank.
   * @param file - Numerical representation of file where a = 0, b = 1, ..., h=7
   */
  constructor(
    readonly rank: number,
    readonly file: number,
  ) {}

  /**
   * Wether the coordinate points to the same rank and file as the other.
   */
  isEqual(other: BoardCoordinate) {
    return this.rank === other.rank && this.file === other.file;
  }

  addOffset(offset: BoardCoordinateOffset): BoardCoordinate {
    return new BoardCoordinate(
      this.rank + offset.rank,
      this.file + offset.file,
    );
  }
}

export enum Direction {
  NORTH,
  SOUTH,
  EAST,
  WEST,
  NORTH_EAST,
  NORTH_WEST,
  SOUTH_EAST,
  SOUTH_WEST,
}

export type TranverseDirectionOptions = {
  /**
   * The maximum number of steps to take from the origin.
   */
  maxSteps?: number;
};

export type PiecesIteratorOptions = {
  /**
   * Only consider pieces with the specified color
   */
  color?: PieceColor;
};

export class Board {
  private static directionSteps: {
    [key in Direction]: BoardCoordinateOffset;
  } = {
    [Direction.NORTH]: {
      rank: 1,
      file: 0,
    },
    [Direction.SOUTH]: {
      rank: -1,
      file: 0,
    },
    [Direction.EAST]: {
      rank: 0,
      file: 1,
    },
    [Direction.WEST]: {
      rank: 0,
      file: -1,
    },
    [Direction.NORTH_EAST]: {
      rank: 1,
      file: 1,
    },
    [Direction.NORTH_WEST]: {
      rank: 1,
      file: -1,
    },
    [Direction.SOUTH_EAST]: {
      rank: -1,
      file: 1,
    },
    [Direction.SOUTH_WEST]: {
      rank: -1,
      file: -1,
    },
  };

  private elements: BoardElement[][];

  /**
   * Creates a board with the following intial state.
   *
   * @param elements - 8x8 array where each row represents a rank from the chess board. The ranks
   * are ordered from 1 to 8, and the elements in each rank are ordered from
   * file A to H.
   */
  constructor(elements: BoardElement[][]) {
    this.elements = Board.copyBoardState(elements);
  }

  /**
   * @returns A deep copy of the board's elements
   */
  private static copyBoardState(
    boardState: BoardElement[][],
  ): BoardElement[][] {
    const boardCopy: BoardElement[][] = [];
    boardState.forEach((rank) => {
      boardCopy.push(new Array(...rank));
    });
    return boardCopy;
  }

  private isWithinBoard(coordinate: BoardCoordinate) {
    return (
      coordinate.rank >= 0 &&
      coordinate.rank < this.elements.length &&
      coordinate.file >= 0 &&
      coordinate.file < this.elements[coordinate.rank].length
    );
  }

  getPiece(square: BoardCoordinate): BoardElement {
    return this.elements[square.rank][square.file];
  }

  /**
   * @returns The 2d array representing the board
   */
  getBoardElements() {
    return Board.copyBoardState(this.elements);
  }

  /**
   * Traverses to the given direction from the origin until it reaches the
   * end of the board; unless otherwise specified.
   */
  *traverseDirection(
    origin: BoardCoordinate,
    direction: Direction,
    options: TranverseDirectionOptions = {},
  ): Generator<BoardCoordinate> {
    const directionOffset = Board.directionSteps[direction];
    let coordinate = origin.addOffset(directionOffset);
    let stepCount = 1;
    while (this.isWithinBoard(coordinate)) {
      yield coordinate;
      if (stepCount === options.maxSteps) {
        break;
      }
      coordinate = coordinate.addOffset(directionOffset);
      stepCount += 1;
    }
  }

  /**
   * Traverses all coordinates that are within offsets from the origin.
   */
  *traverseOffsets(
    origin: BoardCoordinate,
    offsets: BoardCoordinateOffset[],
  ): Generator<BoardCoordinate> {
    for (const offset of offsets) {
      const coordinate = origin.addOffset(offset);
      if (this.isWithinBoard(coordinate)) {
        yield coordinate;
      }
    }
  }

  /**
   * Iterates over all pieces present within the board, alongside their
   * coordinates
   */
  *pieces(
    options: PiecesIteratorOptions = {},
  ): Generator<{ piece: Piece; coordinate: BoardCoordinate }> {
    for (let i = 0; i < this.elements.length; i++) {
      for (let j = 0; j < this.elements[i].length; j++) {
        const piece = this.elements[i][j];
        if (piece !== null) {
          if (options.color !== undefined && piece.color !== options.color) {
            continue;
          }

          yield {
            piece,
            coordinate: new BoardCoordinate(i, j),
          };
        }
      }
    }
  }

  /**
   * Updates the element in specified coordinate.
   */
  set(coordinate: BoardCoordinate, element: BoardElement) {
    this.elements[coordinate.rank][coordinate.file] = element;
  }

  /**
   * Updates the board with the piece movement.
   *
   * If the there is no piece placed in the origin of the movement, the board
   * is not updated.
   */
  movePiece(move: Move) {
    const piece = this.getPiece(move.from);
    if (piece) {
      this.set(move.from, null);
      this.set(move.to, piece);
    }
  }
}
