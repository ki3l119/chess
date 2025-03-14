import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import { randomUUID } from "crypto";
import { ConsoleLogger } from "@nestjs/common";

import { PieceColorChoice } from "chess-shared-types";
import { GameService } from "../game.service";
import {
  GameNotFoundException,
  InvalidGameStateException,
} from "../../game.exception";

jest.useFakeTimers();

describe("GameService.resign", () => {
  let gameService: GameService;

  beforeEach(() => {
    const logger = new ConsoleLogger();
    logger.setLogLevels([]);
    gameService = new GameService(logger);
  });

  it.each([
    ["WHITE", "BLACK"],
    ["BLACK", "WHITE"],
  ])("Returns the winning color (%#)", (losingColor, winningColor) => {
    const hostId = randomUUID();
    const gameInfo = gameService.create(
      {
        id: hostId,
        name: "Host",
      },
      {
        color: losingColor as PieceColorChoice,
      },
    );

    gameService.join(
      {
        id: randomUUID(),
        name: "Player",
      },
      {
        gameId: gameInfo.id,
      },
    );

    gameService.start(gameInfo.id, hostId);

    const gameResult = gameService.resign(gameInfo.id, hostId);
    expect(gameResult).toEqual({
      winner: winningColor,
      reason: "RESIGNED",
    });
    expect(gameService.findById(gameInfo.id)).toBeNull();
  });

  it("Throws exception on non-existent game", () => {
    const hostId = randomUUID();
    const gameInfo = gameService.create(
      {
        id: hostId,
        name: "Host",
      },
      {
        color: "WHITE",
      },
    );

    gameService.join(
      {
        id: randomUUID(),
        name: "Player",
      },
      {
        gameId: gameInfo.id,
      },
    );

    gameService.start(gameInfo.id, hostId);

    expect(() => {
      gameService.resign(randomUUID(), hostId);
    }).toThrow(GameNotFoundException);
    expect(gameService.findById(gameInfo.id)).not.toBeNull();
  });

  it("Throws exception when game has not yet started", () => {
    const hostId = randomUUID();
    const gameInfo = gameService.create(
      {
        id: hostId,
        name: "Host",
      },
      {
        color: "WHITE",
      },
    );

    gameService.join(
      {
        id: randomUUID(),
        name: "Player",
      },
      {
        gameId: gameInfo.id,
      },
    );

    expect(() => {
      gameService.resign(gameInfo.id, hostId);
    }).toThrow(InvalidGameStateException);
    expect(gameService.findById(gameInfo.id)).not.toBeNull();
  });
});
