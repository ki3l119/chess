import { jest, describe, it, expect, beforeEach } from "@jest/globals";

import { GameService } from "./game.service";
import { GameInfoDto, PieceColorChoice } from "chess-shared-types";
import { randomUUID } from "crypto";
import { PieceColor } from "./game";
import {
  GameNotFoundException,
  InvalidGameCreationException,
  InvalidGameJoinException,
  InvalidGameMoveException,
  InvalidGameStateException,
  InvalidStartException,
} from "./game.exception";
import { ConsoleLogger } from "@nestjs/common";

jest.useFakeTimers();

describe("GameService", () => {
  let gameService: GameService;

  beforeEach(() => {
    const logger = new ConsoleLogger();
    logger.setLogLevels([]);
    gameService = new GameService(logger);
  });

  describe("create", () => {
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

  describe("join", () => {
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

  describe("start", () => {
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

  describe("move", () => {
    let gameInfo: Required<GameInfoDto>;

    beforeEach(() => {
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

  describe("leave", () => {
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

  describe("timeout events", () => {
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
    });
  });

  describe("resign", () => {
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
});
