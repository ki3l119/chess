import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import { randomUUID } from "crypto";
import { ConsoleLogger } from "@nestjs/common";

import { InvalidGameCreationException } from "../../game.exception";
import { PieceColor } from "../../game";
import { GameService } from "../game.service";

jest.useFakeTimers();

describe("GameService.create", () => {
  let gameService: GameService;

  beforeEach(() => {
    const logger = new ConsoleLogger();
    logger.setLogLevels([]);
    gameService = new GameService(logger);
  });

  it("Creates new game", () => {
    const newPlayer = {
      id: randomUUID(),
      name: "Host",
    };
    const expected = {
      host: {
        id: newPlayer.id,
        name: newPlayer.name,
        color: PieceColor.WHITE,
      },
      isColorRandom: false,
      playerTimerDuration: 600,
    };
    const { id, ...actual } = gameService.create(newPlayer, {
      color: "WHITE",
    });

    expect(id).toBeDefined();
    expect(actual).toEqual(expected);
  });

  it("Throws invalid game creation if player with id is already part of a game", () => {
    const newPlayer = {
      id: randomUUID(),
      name: "Host",
    };
    gameService.create(newPlayer, {
      color: "WHITE",
    });

    expect(() => {
      gameService.create(newPlayer, { color: "BLACK" });
    }).toThrow(InvalidGameCreationException);
  });

  it("Specifies that the color choice has been randomized", () => {
    const newPlayer = {
      id: randomUUID(),
      name: "Host",
    };
    const { isColorRandom } = gameService.create(newPlayer, {
      color: "RANDOM",
    });

    expect(isColorRandom).toBe(true);
  });

  it("Throws invalid game creation if registered user is already part of a game", () => {
    const userId = randomUUID();

    gameService.create(
      {
        id: randomUUID(),
        name: "Player 1",
        userId: userId,
      },
      { color: "WHITE" },
    );

    expect(() => {
      gameService.create(
        {
          id: randomUUID(),
          name: "Player 2",
          userId: userId,
        },
        { color: "WHITE" },
      );
    }).toThrow(InvalidGameCreationException);
  });
});
