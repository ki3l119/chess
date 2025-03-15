import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import { randomUUID } from "crypto";
import { ConsoleLogger } from "@nestjs/common";

import {
  GameNotFoundException,
  InvalidStartException,
} from "../../game.exception";
import { GameService } from "../game.service";
import { GameHistoryService } from "../game-history.service";

jest.useFakeTimers();

describe("GameService.start", () => {
  let gameService: GameService;

  beforeEach(() => {
    const logger = new ConsoleLogger();
    logger.setLogLevels([]);
    gameService = new GameService(logger, {} as GameHistoryService);
  });

  it("Host can start game with 2 players", () => {
    const gameInfo = gameService.create(
      {
        id: randomUUID(),
        name: "Player 1",
      },
      { color: "BLACK" },
    );

    gameService.join(
      {
        id: randomUUID(),
        name: "Player 2",
      },
      { gameId: gameInfo.id },
    );

    const actual = gameService.start(gameInfo.id, gameInfo.host.id);
    expect(actual.pieces.length).toBeGreaterThan(0);
    expect(actual.legalMoves.length).toBeGreaterThan(0);
  });

  it("Throws exception when there is only 1 player in game", () => {
    const gameInfo = gameService.create(
      {
        id: randomUUID(),
        name: "Player 1",
      },
      { color: "BLACK" },
    );

    expect(() => {
      gameService.start(gameInfo.id, gameInfo.host.id);
    }).toThrow(InvalidStartException);
  });

  it("Throws exception when game is not found", () => {
    const gameInfo = gameService.create(
      {
        id: randomUUID(),
        name: "Player 1",
      },
      { color: "BLACK" },
    );

    gameService.join(
      {
        id: randomUUID(),
        name: "Player 2",
      },
      { gameId: gameInfo.id },
    );

    expect(() => {
      gameService.start(randomUUID(), gameInfo.host.id);
    }).toThrow(GameNotFoundException);
  });

  it("Throws exception when non-host player tries to start game", () => {
    const gameInfo = gameService.create(
      {
        id: randomUUID(),
        name: "Player 1",
      },
      { color: "BLACK" },
    );

    const { player } = gameService.join(
      {
        id: randomUUID(),
        name: "Player 2",
      },
      { gameId: gameInfo.id },
    );

    expect(() => {
      gameService.start(gameInfo.id, player.id);
    }).toThrow(InvalidStartException);
  });
});
