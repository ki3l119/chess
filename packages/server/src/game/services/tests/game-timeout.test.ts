import {
  jest,
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
} from "@jest/globals";
import { randomUUID } from "crypto";
import { ConsoleLogger } from "@nestjs/common";

import { GameService } from "../game.service";
import { GameHistoryService } from "../game-history.service";

jest.useFakeTimers();

describe("GameService timeout events", () => {
  let gameService: GameService;
  const gameHistoryServiceMock = {
    create: jest.fn<typeof GameHistoryService.prototype.create>(),
  };

  beforeEach(() => {
    const logger = new ConsoleLogger();
    logger.setLogLevels([]);
    gameService = new GameService(
      logger,
      gameHistoryServiceMock as unknown as GameHistoryService,
    );
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it("Emits timeout event on white timeout", () => {
    const gameInfo = gameService.create(
      {
        id: randomUUID(),
        name: "Player 1",
      },
      { color: "WHITE", playerTimerDuration: 20 },
    );

    const { player } = gameService.join(
      {
        id: randomUUID(),
        name: "Player 2",
      },
      { gameId: gameInfo.id },
    );

    gameService.start(gameInfo.id, gameInfo.host.id);

    const timeoutCallback = jest.fn();
    gameService.on("timeout", timeoutCallback);
    expect(timeoutCallback).not.toBeCalled();
    jest.advanceTimersByTime(20_000);

    expect(timeoutCallback).toBeCalledTimes(1);
    expect(timeoutCallback).toBeCalledWith(
      {
        id: gameInfo.id,
        host: {
          id: gameInfo.host.id,
          name: gameInfo.host.name,
          color: gameInfo.host.color,
        },
        player: {
          id: player.id,
          name: player.name,
          color: player.color,
        },
        isColorRandom: false,
        playerTimerDuration: 20,
      },
      {
        winner: "BLACK",
        reason: "TIMEOUT",
      },
    );
    expect(gameHistoryServiceMock.create.mock.calls.length).toBe(0);
  });

  it("Emits timeout event on black timeout", () => {
    const gameInfo = gameService.create(
      {
        id: randomUUID(),
        name: "Player 1",
      },
      { color: "WHITE", playerTimerDuration: 300 },
    );

    const { player } = gameService.join(
      {
        id: randomUUID(),
        name: "Player 2",
      },
      { gameId: gameInfo.id },
    );

    gameService.start(gameInfo.id, gameInfo.host.id);

    const timeoutCallback = jest.fn();
    gameService.on("timeout", timeoutCallback);
    expect(timeoutCallback).not.toBeCalled();

    jest.advanceTimersByTime(10_000);
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
      gameInfo.host.id,
    );

    jest.advanceTimersByTime(300_000);

    expect(timeoutCallback).toBeCalledTimes(1);
    expect(timeoutCallback).toBeCalledWith(
      {
        id: gameInfo.id,
        host: {
          id: gameInfo.host.id,
          name: gameInfo.host.name,
          color: gameInfo.host.color,
        },
        player: {
          id: player.id,
          name: player.name,
          color: player.color,
        },
        isColorRandom: false,
        playerTimerDuration: 300,
      },
      {
        winner: "WHITE",
        reason: "TIMEOUT",
      },
    );
    expect(gameHistoryServiceMock.create.mock.calls.length).toBe(0);
  });

  it("Create game history entry on timeout if at least one of the players is logged-in", () => {
    const userId = randomUUID();
    const gameInfo = gameService.create(
      {
        id: randomUUID(),
        name: "Player 1",
        userId: userId,
      },
      { color: "WHITE", playerTimerDuration: 20 },
    );

    const { player } = gameService.join(
      {
        id: randomUUID(),
        name: "Player 2",
      },
      { gameId: gameInfo.id },
    );

    gameService.start(gameInfo.id, gameInfo.host.id);

    const timeoutCallback = jest.fn();
    gameService.on("timeout", timeoutCallback);
    expect(timeoutCallback).not.toBeCalled();
    jest.advanceTimersByTime(20_000);

    expect(timeoutCallback).toBeCalledTimes(1);
    expect(timeoutCallback).toBeCalledWith(
      {
        id: gameInfo.id,
        host: {
          id: gameInfo.host.id,
          name: gameInfo.host.name,
          color: gameInfo.host.color,
        },
        player: {
          id: player.id,
          name: player.name,
          color: player.color,
        },
        isColorRandom: false,
        playerTimerDuration: 20,
      },
      {
        winner: "BLACK",
        reason: "TIMEOUT",
      },
    );
    expect(gameHistoryServiceMock.create.mock.calls.length).toBe(1);
    expect(gameHistoryServiceMock.create.mock.calls[0][0].whitePlayerId).toBe(
      userId,
    );
    expect(
      gameHistoryServiceMock.create.mock.calls[0][0].blackPlayerId,
    ).not.toBeDefined();
  });
});
