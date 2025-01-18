import { Piece, PieceColor, PieceType } from "./piece";

export type BoardElement = Piece | null;

export type BoardCoordinate = {
  // 0-based index of the rank
  rank: number;

  /**
   * a = 0, b = 1, ..., h=7
   */
  file: number;
};

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
