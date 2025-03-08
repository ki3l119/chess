# Chess Game

The package contains the code that implements the chess rules. It exports a `Chess` class that can be used to manage the state of a chess game, being able to perform move validation and is able to check for the following end game conditions:

- Checkmate
- Stalemate
- Fifty-move rule

The code can be used in either a NodeJS or browser environment.

## Building the Package

To compile the TypeScript code, run:

```
npm -w chess-game run build
```

The resulting JavaScript files are placed in the `dist` directory of the package. After compiling, The `chess-game` package can then be used within the project.

## Usage

To track the state of a chess game, instantiate a `Chess` object, then call the `move` method to update the game state.

```TypeScript
import { Chess, BoardCoordinate, PieceColor } from "chess-game";

const chess = new Chess();

console.log(chess.getActiveColor()) // Should display the value of PieceColor.WHITE enum.
// Move white pawn from e2 to e4
chess.move({
  // BoardCoordinate is created with the 0-based index of the rank and the numerical
  // representation of the file (a = 0, b = 1, ..., h=7)
  from: new BoardCoordinate(1, 4),
  to: new BoardCoordinate(3, 4)
});

console.log(chess.getActiveColor()) // Should display the value of PieceColor.BLACK enum.
// Move black pawn from e7 to e5
chess.move({
  from: new BoardCoordinate(6, 4),
  to: new BoardCoordinate(4, 4)
});
```

An illegal move results in a `InvalidMoveException` object being thrown.

The `getBoard()` method can be used to obtain a `Board` object that contains info on the position of the pieces within the chess board.

```TypeScript
const board = chess.getBoard();
// Iterates through each piece in the board and their corresponding coordinates.
for(const { piece, coordinate } of board.pieces()) {
  console.log(piece);
  console.log(coordinate);
}

// Returns an 8x8 array where each row represents a rank from the chess board.
// The ranks are ordered from 1 to 8, and the elements in each rank are ordered from
// file A to H. Occupied tiles are set to a `Piece` object while the rest are
// set to `null`
const elements = board.getBoardElements();
```

For games that have finished, the `getResult()` method can be used to obtain the final result.

```TypeScript
const result = chess.getResult();
// Result is only set for finished games.
if(result !== null) {
  console.log(result.winner) // Set to the winning PieceColor enum, or null if draw
  console.log(result.reason) // Set to an GameEndReason enum value
}
```

For pawn promotion moves, a second object can be passed to the `move()` method indicating which piece the pawn will be promoted to.

```TypeScript
chess.move({
  from: new BoardCoordinate(6, 0),
  to: new BoardCoordinate(7, 0),
}, {
  // Can be set to "N" (Knight), "Q" (Queen), "R" (Rook), "B" (Bishop)
  pawnPromotionPiece: "Q",
});
```
