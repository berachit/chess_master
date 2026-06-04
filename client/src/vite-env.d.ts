/// <reference types="vite/client" />

declare module "js-chess-engine" {
  export class Game {
    constructor(fen?: string);
    ai(options?: { level?: number }): { move: Record<string, string>; board: any };
    aiMove(level?: number): Record<string, string>;
  }
  export const aiMove: any;
}
