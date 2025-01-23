import { Piece, PieceColor, PieceType } from "./piece";

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

export class Board {
  /**
   *
   */
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

  getElement(square: BoardCoordinate): BoardElement {
    return this.elements[square.rank][square.file];
  }

  /**
   * @returns The 2d array representing the board
   */
  getBoardElements() {
    return Board.copyBoardState(this.elements);
  }
}
