import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import { randomUUID } from "crypto";
import { ConsoleLogger } from "@nestjs/common";

import { GameInfoDto } from "chess-shared-types";
import { InvalidGameMoveException } from "../../game.exception";
import { GameService } from "../game.service";

jest.useFakeTimers();

describe("GameService.move", () => {
  let gameService: GameService;
  let gameInfo: Required<GameInfoDto>;

  beforeEach(() => {
    const logger = new ConsoleLogger();
    logger.setLogLevels([]);
    gameService = new GameService(logger);
    const { id } = gameService.create(
      {
        id: randomUUID(),
        name: "Player 1",
      },
      { color: "WHITE" },
    );

    gameInfo = gameService.join(
      {
        id: randomUUID(),
        name: "Player 2",
      },
      { gameId: id },
    );

    gameService.start(gameInfo.id, gameInfo.host.id);
  });

  it("Returns success on legal move", () => {
    const result = gameService.move(
      gameInfo.id,
      {
        from: {
          rank: 1,
          file: 4,
        },
        to: {
          rank: 3,
          file: 4,
        },
      },
      gameInfo.host.id,
    );

    expect(result.gameResult).toBeUndefined();
    expect(result.legalMoves.length).toBeGreaterThan(0);
    expect(result.newPosition.length).toBeGreaterThan(0);
  });

  it("Throws error on illegal move", () => {
    expect(() => {
      gameService.move(
        gameInfo.id,
        {
          from: {
            rank: 1,
            file: 4,
          },
          to: {
            rank: 4,
            file: 4,
          },
        },
        gameInfo.host.id,
      );
    }).toThrow(InvalidGameMoveException);
  });

  it("Throws error if non-active player makes a move", () => {
    expect(() => {
      gameService.move(
        gameInfo.id,
        {
          from: {
            rank: 1,
            file: 4,
          },
          to: {
            rank: 3,
            file: 4,
          },
        },
        gameInfo.player.id,
      );
    }).toThrow(InvalidGameMoveException);
  });

  it("Game result is returned upon reaching end game condition", () => {
    const moveSequence = [
      {
        from: {
          rank: 1,
          file: 4,
        },
        to: {
          rank: 3,
          file: 4,
        },
      },
      {
        from: {
          rank: 6,
          file: 0,
        },
        to: {
          rank: 5,
          file: 0,
        },
      },
      {
        from: {
          rank: 0,
          file: 5,
        },
        to: {
          rank: 3,
          file: 2,
        },
      },
      {
        from: {
          rank: 6,
          file: 1,
        },
        to: {
          rank: 5,
          file: 1,
        },
      },
      {
        from: {
          rank: 0,
          file: 3,
        },
        to: {
          rank: 2,
          file: 5,
        },
      },
      {
        from: {
          rank: 5,
          file: 0,
        },
        to: {
          rank: 4,
          file: 0,
        },
      },
      {
        from: {
          rank: 2,
          file: 5,
        },
        to: {
          rank: 6,
          file: 5,
        },
      },
    ];

    for (let i = 0; i < moveSequence.length; i++) {
      const playerId = i % 2 === 0 ? gameInfo.host.id : gameInfo.player.id;
      const result = gameService.move(gameInfo.id, moveSequence[i], playerId);

      if (i !== moveSequence.length - 1) {
        expect(result.gameResult).toBeUndefined();
      } else {
        expect(result.gameResult).toEqual({
          winner: "WHITE",
          reason: "CHECKMATE",
        });
      }
    }
  });
});
