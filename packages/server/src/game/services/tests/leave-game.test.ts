import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import { randomUUID } from "crypto";
import { ConsoleLogger } from "@nestjs/common";

import { GameService } from "../game.service";
import { GameHistoryService } from "../game-history.service";

jest.useFakeTimers();

describe("GameService.leave", () => {
  let gameService: GameService;

  beforeEach(() => {
    const logger = new ConsoleLogger();
    logger.setLogLevels([]);
    gameService = new GameService(logger, {} as GameHistoryService);
  });

  it("Game that has not started is destroyed upon host leaving", () => {
    const gameInfo = gameService.create(
      {
        id: randomUUID(),
        name: "Player 1",
      },
      { color: "WHITE" },
    );

    const { player } = gameService.join(
      {
        id: randomUUID(),
        name: "Player 2",
      },
      { gameId: gameInfo.id },
    );

    const actual = gameService.leave(gameInfo.id, gameInfo.host.id);

    expect(actual).toEqual({
      isHost: true,
    });
    expect(gameService.findById(gameInfo.id)).toBeNull();
  });

  it("Game that has not started is not destroyed upon non-host leaving", () => {
    const { id } = gameService.create(
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
      { gameId: id },
    );

    const actual = gameService.leave(id, player.id);

    expect(actual).toEqual({
      isHost: false,
    });
    expect(gameService.findById(id)).not.toBeNull();
  });

  it("Game is destroyed and result is returned when game is already ongoing", () => {
    const { id, host } = gameService.create(
      {
        id: randomUUID(),
        name: "Player 1",
      },
      { color: "WHITE" },
    );

    const { player } = gameService.join(
      {
        id: randomUUID(),
        name: "Player 2",
      },
      { gameId: id },
    );

    gameService.start(id, host.id);

    const actual = gameService.leave(id, player.id);

    expect(actual).toEqual({
      isHost: false,
      gameResult: {
        winner: "WHITE",
        reason: "ABANDONED",
      },
    });
    expect(gameService.findById(id)).toBeNull();
  });

  it("Player can create another game upon leaving", () => {
    const host = {
      id: randomUUID(),
      name: "Player 1",
    };
    const { id } = gameService.create(host, { color: "WHITE" });

    gameService.leave(id, host.id);

    gameService.create(host, { color: "BLACK" });
  });

  it("Player can join another game upon leaving", () => {
    const {
      id: gameId1,
      host: { id: hostId1 },
    } = gameService.create(
      {
        id: randomUUID(),
        name: "Player 1",
      },
      { color: "WHITE" },
    );

    const joiningPlayer = {
      id: randomUUID(),
      name: "Player 2",
    };

    gameService.join(joiningPlayer, { gameId: gameId1 });
    gameService.start(gameId1, hostId1);

    const { id: gameId2 } = gameService.create(
      {
        id: randomUUID(),
        name: "Player 3",
      },
      { color: "WHITE" },
    );

    gameService.leave(gameId1, joiningPlayer.id);
    gameService.join(joiningPlayer, { gameId: gameId2 });
  });

  it("Registered user can create another game upon leaving", () => {
    const userId = randomUUID();

    const player1 = {
      id: randomUUID(),
      name: "Player 1",
      userId,
    };

    const player2 = {
      id: randomUUID(),
      name: "Player 2",
      userId,
    };

    const { id: gameId } = gameService.create(player1, { color: "WHITE" });

    gameService.leave(gameId, player1.id);

    gameService.create(player2, { color: "BLACK" });
  });
});
