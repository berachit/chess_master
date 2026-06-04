import { Chess, Move } from "chess.js";
import { Game } from "js-chess-engine";

const difficulty = {
  easy: 1,
  intermediate: 3,
  hard: 5,
};

export const getBotMove = async (game: Chess, level: string): Promise<Move | null> => {
  const moves = game.moves({
    verbose: true,
  });

  if (!moves.length) return null;

  // IMPOSSIBLE LEVEL → Stockfish API
  if (level === "impossible") {
    try {
      const fenEncoded = encodeURIComponent(game.fen());
      const response = await fetch(`https://stockfish.online/api/s/v2.php?fen=${fenEncoded}&depth=10`);
      const data = await response.json();
      if (data && data.success && data.bestmove) {
        const rawMove = data.bestmove.split(" ")[1];
        if (rawMove) {
          const from = rawMove.slice(0, 2);
          const to = rawMove.slice(2, 4);
          const promotion = rawMove.slice(4) || undefined;
          
          const matchedMove = moves.find(
            (m) => m.from === from && m.to === to && (!promotion || m.promotion === promotion)
          );
          if (matchedMove) return matchedMove;
        }
      }
    } catch (error) {
      console.error("Error fetching Stockfish move:", error);
    }
    // Fallback to random if Stockfish fails
    return moves[Math.floor(Math.random() * moves.length)];
  }

  // EASY, INTERMEDIATE, HARD LEVEL → js-chess-engine
  try {
    const engineGame = new Game(game.fen());
    const aiMove = engineGame.ai({
      level: difficulty[level as keyof typeof difficulty] || 1,
    });

    const moveInfo = aiMove.move;
    if (!moveInfo) throw new Error("No move returned from js-chess-engine");

    const from = Object.keys(moveInfo)[0];
    const to = moveInfo[from as keyof typeof moveInfo];

    const move = game.move({
      from: from.toLowerCase(),
      to: String(to).toLowerCase(),
      promotion: "q",
    });

    game.undo();
    return move;
  } catch (error) {
    console.error("Error with js-chess-engine:", error);
    return moves[Math.floor(Math.random() * moves.length)];
  }
};
