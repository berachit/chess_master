import { Chess, Move } from "chess.js";

export const getBotMove = (game: Chess, level: string): Move | null => {
  const moves = game.moves({ verbose: true });

  if (moves.length === 0) return null;

  let move: Move;

  const pieceValue: Record<string, number> = {
    p: 1,
    n: 3,
    b: 3,
    r: 5,
    q: 9,
    k: 100,
  };

  // EASY → random
  if (level === "easy") {
    const captures = moves.filter((m) => m.captured);

    const safeCaptures = captures.filter((m) => {
      const gain = pieceValue[m.captured!] || 0;
      const loss = pieceValue[m.piece] || 0;
      return gain >= loss; // avoid stupid trades
    });

    if (safeCaptures.length && Math.random() < 0.4) {
      return safeCaptures[Math.floor(Math.random() * safeCaptures.length)];
    }

    return moves[Math.floor(Math.random() * moves.length)];
  }

  // INTERMEDIATE → prefer captures
  else if (level === "intermediate") {
    const captures = moves.filter((m) => m.captured);
    move = captures.length
      ? captures[Math.floor(Math.random() * captures.length)]
      : moves[Math.floor(Math.random() * moves.length)];
  }

  // HARD → scoring system
  else if (level === "hard") {
    const scoredMoves = moves.map((m) => ({
      move: m,
      score: (m.captured ? 10 : 0) + (m.san.includes("+") ? 5 : 0),
    }));

    scoredMoves.sort((a, b) => b.score - a.score);
    move = scoredMoves[0].move;
  }

  // IMPOSSIBLE → placeholder (stockfish later)
  else {
    move = moves[Math.floor(Math.random() * moves.length)];
  }

  return move;
};
