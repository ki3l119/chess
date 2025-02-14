import { describe, it, expect } from "@jest/globals";

import { Game, PieceColor } from "./game";
import { randomUUID } from "crypto";
import {
  InvalidGameStateException,
  InvalidStartException,
} from "./game.exception";

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
    };
    game.setPlayer({
      id: expected.id,
      name: expected.name,
    });
    const actual = game.getPlayer();
    expect(actual).toStrictEqual(expected);
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
    const expected = game.getHost();

    expect(() => {
      game.getActivePlayer();
    }).toThrow(InvalidGameStateException);
  });
});
