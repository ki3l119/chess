import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import { randomUUID } from "crypto";
import { ConsoleLogger } from "@nestjs/common";

import {
  InvalidGameJoinException,
  GameNotFoundException,
} from "../../game.exception";
import { PieceColor } from "../../game";
import { GameService } from "../game.service";
import { GameHistoryService } from "../game-history.service";

jest.useFakeTimers();

describe("GameService.join", () => {
  let gameService: GameService;

  beforeEach(() => {
    const logger = new ConsoleLogger();
    logger.setLogLevels([]);
    gameService = new GameService(logger, {} as GameHistoryService);
  });

  it("Joins existing game", () => {
    const expectedGameInfo = gameService.create(
      {
        id: randomUUID(),
        name: "Player 1",
      },
      { color: "BLACK" },
    );

    const joiningPlayer = {
      id: randomUUID(),
      name: "Player 2",
      userId: randomUUID(),
    };

    const expectedPlayer = {
      id: joiningPlayer.id,
      name: joiningPlayer.name,
      color: PieceColor.WHITE,
    };
    const { player: actualPlayer, ...actualGameInfo } = gameService.join(
      joiningPlayer,
      { gameId: expectedGameInfo.id },
    );

    expect(actualGameInfo).toEqual(expectedGameInfo);
    expect(actualPlayer).toEqual(expectedPlayer);
  });

  it("Throws exception if existing game is full", () => {
    const { id } = gameService.create(
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
      { gameId: id },
    );

    expect(() => {
      gameService.join(
        {
          id: randomUUID(),
          name: "Player 3",
        },
        { gameId: id },
      );
    }).toThrow(InvalidGameJoinException);
  });

  it("Throws exception if player is already part of another game", () => {
    const { id } = gameService.create(
      {
        id: randomUUID(),
        name: "Player 1",
      },
      { color: "BLACK" },
    );

    const newPlayer = {
      id: randomUUID(),
      name: "Player 2",
    };
    gameService.create(newPlayer, { color: "WHITE" });

    expect(() => {
      gameService.join(newPlayer, { gameId: id });
    }).toThrow(InvalidGameJoinException);
  });

  it("Throws exception if user associated with the player is in another game", () => {
    const { id } = gameService.create(
      {
        id: randomUUID(),
        name: "Player 1",
      },
      { color: "BLACK" },
    );

    const userId = randomUUID();
    gameService.create(
      {
        id: randomUUID(),
        name: "Player 2",
        userId,
      },
      { color: "WHITE" },
    );

    expect(() => {
      gameService.join(
        {
          id: randomUUID(),
          name: "Player 3",
          userId,
        },
        { gameId: id },
      );
    }).toThrow(InvalidGameJoinException);
  });

  it("Throws exception when game is not found", () => {
    const { id } = gameService.create(
      {
        id: randomUUID(),
        name: "Player 1",
      },
      { color: "BLACK" },
    );

    expect(() => {
      gameService.join(
        {
          id: randomUUID(),
          name: "Player 2",
        },
        { gameId: randomUUID() },
      );
    }).toThrow(GameNotFoundException);
  });
});
