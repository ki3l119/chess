export enum PieceName {
  KING = "KING",
  QUEEN = "QUEEN",
  BISHOP = "BISHOP",
  KNIGHT = "KNIGHT",
  ROOK = "ROOK",
  PAWN = "PAWN",
}

export enum PieceColor {
  WHITE = "WHITE",
  BLACK = "BLACK",
}

export type PieceType = Readonly<{
  color: PieceColor;
  name: PieceName;
}>;

export type BoardCoordinate = {
  rank: number;
  file: number;
};

export type BoardPiece = {
  type: PieceType;
  coordinate: BoardCoordinate;
};

export type Player = {
  name: string;
  color: PieceColor;
};

export type GameInfo = {
  id: string;
  host: Player;
  player?: Player;
  isHost: boolean;
  playerTimerDuration: number;
};

export type Move = {
  from: BoardCoordinate;
  to: BoardCoordinate;
};

export type GameResult = {
  winner: PieceColor | null;
  reason:
    | "CHECKMATE"
    | "STALEMATE"
    | "FIFTY_MOVE_RULE"
    | "ABANDONED"
    | "TIMEOUT";
};

export const PIECES: { [key: string]: PieceType } = {
  P: {
    name: PieceName.PAWN,
    color: PieceColor.WHITE,
  },
  N: {
    name: PieceName.KNIGHT,
    color: PieceColor.WHITE,
  },
  B: {
    name: PieceName.BISHOP,
    color: PieceColor.WHITE,
  },
  R: {
    name: PieceName.ROOK,
    color: PieceColor.WHITE,
  },
  Q: {
    name: PieceName.QUEEN,
    color: PieceColor.WHITE,
  },
  K: {
    name: PieceName.KING,
    color: PieceColor.WHITE,
  },
  p: {
    name: PieceName.PAWN,
    color: PieceColor.BLACK,
  },
  n: {
    name: PieceName.KNIGHT,
    color: PieceColor.BLACK,
  },
  b: {
    name: PieceName.BISHOP,
    color: PieceColor.BLACK,
  },
  r: {
    name: PieceName.ROOK,
    color: PieceColor.BLACK,
  },
  q: {
    name: PieceName.QUEEN,
    color: PieceColor.BLACK,
  },
  k: {
    name: PieceName.KING,
    color: PieceColor.BLACK,
  },
};

function getBackRow(color: PieceColor): BoardPiece[] {
  const rank = color === PieceColor.WHITE ? 0 : 7;
  let order = ["R", "N", "B", "Q", "K", "B", "N", "R"];

  if (color === PieceColor.BLACK) {
    order = order.map((piece) => piece.toLowerCase());
  }

  return order.map((piece, index) => ({
    type: PIECES[piece],
    coordinate: {
      rank,
      file: index,
    },
  }));
}

/**
 * Converts the coordinate to an index for a 1-dimensional board representation.
 *
 * The 0-based goes from a1, a2, ..., h8.
 */
export function coordinateToIndex(coordinate: BoardCoordinate): number {
  return coordinate.rank * 8 + coordinate.file;
}

export function indexToCoordinate(index: number): BoardCoordinate {
  const rank = Math.floor(index / 8);
  const file = index % 8;
  return {
    rank,
    file,
  };
}

export function isCoordinateEqual(
  coordinate1: BoardCoordinate,
  coordinate2: BoardCoordinate,
): boolean {
  return (
    coordinate1.file === coordinate2.file &&
    coordinate1.rank === coordinate2.rank
  );
}

export function getOppositeColor(color: PieceColor) {
  return color === PieceColor.WHITE ? PieceColor.BLACK : PieceColor.WHITE;
}

export const startingBoard: BoardPiece[] = [
  ...getBackRow(PieceColor.WHITE),
  ...new Array(8).fill(0).map((_, index) => ({
    type: PIECES["P"],
    coordinate: { rank: 1, file: index },
  })),
  ...new Array(8).fill(0).map((_, index) => ({
    type: PIECES["p"],
    coordinate: { rank: 6, file: index },
  })),
  ...getBackRow(PieceColor.BLACK),
];
