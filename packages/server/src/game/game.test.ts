import { jest, describe, it, expect } from "@jest/globals";

import { Game, PieceColor } from "./game";
import { randomUUID } from "crypto";
import {
  InvalidGameStateException,
  InvalidStartException,
} from "./game.exception";
import { BoardCoordinate } from "chess-game/dist/board";

jest.useFakeTimers();

describe("Game", () => {
  it("Sets joining player to opposing color of host", () => {
    const game = new Game(
      randomUUID(),
      {
        id: randomUUID(),
        name: "Host",
      },
      "WHITE",
    );
    const expected = {
      id: randomUUID(),
      name: "Opponent",
      color: PieceColor.BLACK,
      remainingTime: 600,
    };
    game.setPlayer({
      id: expected.id,
      name: expected.name,
    });
    const actual = game.getPlayer();
    expect(actual).toEqual(expected);
  });

  it("hasStarted returns true after start", () => {
    const game = new Game(
      randomUUID(),
      {
        id: randomUUID(),
        name: "Host",
      },
      "WHITE",
    );
    game.setPlayer({
      id: randomUUID(),
      name: "Opponent",
    });
    expect(game.hasStarted()).toBe(false);
    game.start();

    expect(game.hasStarted()).toBe(true);
  });

  it("Throws exception when starting a game with no second player", () => {
    const game = new Game(
      randomUUID(),
      {
        id: randomUUID(),
        name: "Host",
      },
      "WHITE",
    );

    expect(() => {
      game.start();
    }).toThrow(InvalidStartException);
  });

  it("Throws exception when starting an already started game", () => {
    const game = new Game(
      randomUUID(),
      {
        id: randomUUID(),
        name: "Host",
      },
      "WHITE",
    );
    game.setPlayer({
      id: randomUUID(),
      name: "Opponent",
    });
    game.start();
    expect(() => {
      game.start();
    }).toThrow(InvalidStartException);
  });

  it("The active player has the active color pieces in the game", () => {
    const game = new Game(
      randomUUID(),
      {
        id: randomUUID(),
        name: "Host",
      },
      "WHITE",
    );
    game.setPlayer({
      id: randomUUID(),
      name: "Opponent",
    });
    const expected = game.getHost();
    game.start();

    const actual = game.getActivePlayer();

    expect(actual).toStrictEqual(expected);
  });

  it("Throws exception on getting active player on a game that has not started", () => {
    const game = new Game(
      randomUUID(),
      {
        id: randomUUID(),
        name: "Host",
      },
      "WHITE",
    );
    game.setPlayer({
      id: randomUUID(),
      name: "Opponent",
    });

    expect(() => {
      game.getActivePlayer();
    }).toThrow(InvalidGameStateException);
  });

  it("Remaining time of player is reduced based on elapsed time of move", () => {
    const game = new Game(
      randomUUID(),
      {
        id: randomUUID(),
        name: "Host",
      },
      "WHITE",
      180,
    );
    game.setPlayer({
      id: randomUUID(),
      name: "Opponent",
    });

    game.start();

    jest.advanceTimersByTime(50_000);

    game.move({
      from: new BoardCoordinate(1, 4),
      to: new BoardCoordinate(3, 4),
    });

    expect(game.getHost().remainingTime).toBe(130);
  });

  it("Emits timeout event once player time has run out", () => {
    const game = new Game(
      randomUUID(),
      {
        id: randomUUID(),
        name: "Host",
      },
      "WHITE",
      180,
    );
    game.setPlayer({
      id: randomUUID(),
      name: "Opponent",
    });

    const onTimeout = jest.fn();

    game.on("timeout", onTimeout);

    game.start();

    expect(onTimeout).not.toHaveBeenCalled();
    jest.advanceTimersByTime(180_000);

    expect(onTimeout).toHaveBeenCalled();
    expect(onTimeout).toHaveBeenCalledTimes(1);
    expect(onTimeout).toHaveBeenCalledWith(game, game.getHost());
  });

  it("Timer switches to next player after move", () => {
    const game = new Game(
      randomUUID(),
      {
        id: randomUUID(),
        name: "Host",
      },
      "WHITE",
      180,
    );
    game.setPlayer({
      id: randomUUID(),
      name: "Opponent",
    });

    const onTimeout = jest.fn();

    game.on("timeout", onTimeout);

    game.start();

    game.move({
      from: new BoardCoordinate(1, 4),
      to: new BoardCoordinate(3, 4),
    });

    jest.advanceTimersByTime(3_000);

    game.move({
      from: new BoardCoordinate(6, 4),
      to: new BoardCoordinate(4, 4),
    });

    expect(game.getPlayer()?.remainingTime).toBe(177);
  });
});
