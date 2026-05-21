import { Chess } from "chess.js";

export const createChessGame = () => {
  const chess = new Chess();

  return {
    initialFen: chess.fen(),
    currentFen: chess.fen(),
    pgn: chess.pgn(),
    moves: [],
    turn: chess.turn(),
  };
};

// Helper: Always load via PGN if available to maintain full history/3-fold rules
export const loadGame = (fen, pgn = "") => {
  const chess = new Chess();

  if (pgn) {
    chess.loadPgn(pgn);
  } else if (fen) {
    const success = chess.load(fen);

    if (!success) {
      throw new Error("Invalid FEN");
    }
  }

  return chess;
};

export const makeMove = (fen, pgn, move) => {
  try {
    // Loading from PGN preserves move history, 3-fold flags, and full logs
    const chess = loadGame(fen, pgn);

    const moveResult = chess.move(move);

    if (!moveResult) {
      return {
        success: false,
        message: "Illegal move",
      };
    }

    let result = null;
    let resultReason = null;

    if (chess.isCheckmate()) {
      result = chess.turn() === "w" ? "black_win" : "white_win";
      resultReason = "checkmate";
    } else if (chess.isStalemate()) {
      result = "draw";
      resultReason = "stalemate";
    } else if (chess.isThreefoldRepetition()) {
      result = "draw";
      resultReason = "threefold_repetition";
    } else if (chess.isInsufficientMaterial()) {
      result = "draw";
      resultReason = "insufficient_material";
    } else if (chess.isDraw()) {
      // Catch-all for 50-move rule or generic draws since isDrawByFiftyMoves does not exist
      result = "draw";
      resultReason = "fifty_move_rule";
    }

    return {
      success: true,
      move: moveResult,
      currentFen: chess.fen(),
      pgn: chess.pgn(),
      moves: chess.history({ verbose: true }),
      turn: chess.turn(),
      isCheck: chess.inCheck(),
      isCheckmate: chess.isCheckmate(),
      isDraw: chess.isDraw(),
      isStalemate: chess.isStalemate(),
      isGameOver: chess.isGameOver(),
      result,
      resultReason,
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
    };
  }
};

export const getLegalMoves = (fen, pgn = "") => {
  try {
    const chess = loadGame(fen, pgn);

    return {
      success: true,
      moves: chess.moves({ verbose: true }),
      turn: chess.turn(),
      isCheck: chess.inCheck(),
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
    };
  }
};

export const getGameStatus = (fen, pgn = "") => {
  try {
    const chess = loadGame(fen, pgn);

    let result = null;
    let resultReason = null;

    if (chess.isCheckmate()) {
      result = chess.turn() === "w" ? "black_win" : "white_win";
      resultReason = "checkmate";
    } else if (chess.isStalemate()) {
      result = "draw";
      resultReason = "stalemate";
    } else if (chess.isThreefoldRepetition()) {
      result = "draw";
      resultReason = "threefold_repetition";
    } else if (chess.isInsufficientMaterial()) {
      result = "draw";
      resultReason = "insufficient_material";
    } else if (chess.isDraw()) {
      result = "draw";
      resultReason = "fifty_move_rule";
    }

    return {
      success: true,
      currentFen: chess.fen(),
      pgn: chess.pgn(),
      turn: chess.turn(),
      isCheck: chess.inCheck(),
      isCheckmate: chess.isCheckmate(),
      isDraw: chess.isDraw(),
      isStalemate: chess.isStalemate(),
      isGameOver: chess.isGameOver(),
      moves: chess.history({ verbose: true }), // Properly populated now thanks to tracking PGN
      result,
      resultReason,
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
    };
  }
};