import { randomUUID } from "crypto";

export enum PieceColor {
  WHITE = "WHITE",
  BLACK = "BLACK",
}

export class Game {
  readonly id: string;

  constructor() {
    this.id = randomUUID();
  }
}
