import { randomUUID } from "crypto";

export enum PieceColor {
  WHITE,
  BLACK,
}

export class Game {
  readonly id: string;

  constructor() {
    this.id = randomUUID();
  }
}
