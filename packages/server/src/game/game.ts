import { Chess, PieceColor } from "chess-game";
import { PieceColorChoice } from "chess-shared-types";

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
}
