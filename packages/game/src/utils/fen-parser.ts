import { GameState, CastlingRights } from "../types";
import { Board, BoardElement, BoardCoordinate } from "../board";
import { PieceColor, PIECES } from "../models/piece";
import { parseSquare } from "./algebraic-notation";

export class ParseFENException extends Error {}

export const startingBoardFENString =
  "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

/**
 * Creates a board representation from a FEN string.
 *
 * @param piecePlacement - The piece placement field from a FEN string.
 * @throws {ParseFENException} Throws on invalid board input.
 */
function parsePiecePlacement(piecePlacement: string): Board {
  const ranks = piecePlacement.split("/");
  if (ranks.length !== 8) {
    throw new ParseFENException("Must provide 8 ranks.");
  }

  const boardState: BoardElement[][] = [];

  for (const rank of ranks.reverse()) {
    const pieces: BoardElement[] = [];
    for (const pieceString of rank) {
      if (pieces.length > 8) {
        throw new ParseFENException(
          "A rank cannot contain more than 8 elements.",
        );
      }
      const intValue = parseInt(pieceString);

      if (!isNaN(intValue)) {
        if (intValue > 8 || intValue < 1) {
          throw new ParseFENException("All number values must be from 1 to 8.");
        }
        pieces.push(...new Array<null>(intValue).fill(null));
      } else {
        const piece = (PIECES as { [key: string]: BoardElement | undefined })[
          pieceString
        ];
        if (piece === undefined) {
          throw new ParseFENException(
            `${pieceString} is not a valid piece name.`,
          );
        }
        pieces.push(piece);
      }
    }

    if (pieces.length < 8) {
      throw new ParseFENException("A rank must contain 8 elements");
    }

    boardState.push(pieces);
  }
  return new Board(boardState);
}

/**
 * Parses FEN string for easy access to various fields of the game's state.
 *
 * @throws {ParseFENException} Throws on invalid FEN input.
 */
export function parseFEN(fenString: string): GameState {
  const fields = fenString.split(" ");

  if (fields.length !== 6) {
    throw new ParseFENException("Must have 6 fields.");
  }

  // Active color
  const activeColor =
    fields[1] === "w"
      ? PieceColor.WHITE
      : fields[1] === "b"
        ? PieceColor.BLACK
        : null;
  if (activeColor === null) {
    throw new ParseFENException("Active color must be 'w' or 'b'");
  }

  // Castling rights
  const whiteCastlingRights: CastlingRights = {
    kingside: false,
    queenside: false,
  };

  const blackCastlingRights: CastlingRights = {
    kingside: false,
    queenside: false,
  };

  if (fields[2].length > 4) {
    throw new ParseFENException(
      "Castling rights cannot contain more than 4 characters.",
    );
  } else if (fields[2] !== "-") {
    for (const castlingRightString of fields[2]) {
      switch (castlingRightString) {
        case "k":
          blackCastlingRights.kingside = true;
          break;
        case "K":
          whiteCastlingRights.kingside = true;
          break;
        case "q":
          blackCastlingRights.queenside = true;
          break;
        case "Q":
          whiteCastlingRights.queenside = true;
          break;
        default:
          throw new ParseFENException(
            `Castling rights contains invalid character ${castlingRightString}.`,
          );
      }
    }
  }

  // En Passant
  let enPassantTarget: BoardCoordinate | null = null;
  if (fields[3] !== "-") {
    enPassantTarget = parseSquare(fields[3]);
    if (enPassantTarget === null) {
      throw new ParseFENException(
        `En passant target is not in valid algebraic notation`,
      );
    }
  }

  // Move counts
  const halfmoveClock = parseInt(fields[4]);
  if (isNaN(halfmoveClock) || halfmoveClock < 0) {
    throw new ParseFENException(
      "Halfmove clock should be a non-negative number.",
    );
  }

  const fullmoveCount = parseInt(fields[5]);
  if (isNaN(fullmoveCount) || fullmoveCount < 1) {
    throw new ParseFENException("Fullmove number should be a positive number.");
  }

  const board = parsePiecePlacement(fields[0]);

  return {
    board,
    activeColor,
    castlingRights: {
      [PieceColor.WHITE]: whiteCastlingRights,
      [PieceColor.BLACK]: blackCastlingRights,
    },
    enPassantTarget,
    halfmoveClock,
    fullmoveCount,
  };
}
