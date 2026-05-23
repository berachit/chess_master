import Game from "../models/game.model.js";
import { makeMove as playChessMove } from "../services/chess.service.js";

export const processMove = async ({
  gameId,
  to,
  from,
  promotion,
  clientTimestamp,
  currentUser,
}) => {
  const game = await Game.findById(gameId);

  if (!game) {
    throw new Error("Game not found");
  }

  if (game.status !== "ongoing") {
    throw new Error("Game is no longer active");
  }

  const isWhitePlayer = game.whitePlayer.userId.equals(currentUser._id);
  const isBlackPlayer = game.blackPlayer.userId.equals(currentUser._id);

  if (!isWhitePlayer && !isBlackPlayer) {
    throw new Error("You are not part of this game");
  }

  const playerAssignedColor = isWhitePlayer ? "w" : "b";

  if (game.turn !== playerAssignedColor) {
    throw new Error(`It is not your turn to move. Wait for your opponent.`);
  }

  const serverNow = Date.now();

  let reportedMoveTime =
    clientTimestamp !== undefined && clientTimestamp !== null
      ? Number(clientTimestamp)
      : serverNow;

  if (Number.isNaN(reportedMoveTime)) {
    reportedMoveTime = serverNow;
  }

  let executionTimestamp = reportedMoveTime;

  if (serverNow - reportedMoveTime > 5000 || reportedMoveTime > serverNow) {
    executionTimestamp = serverNow;
  }

  const now = executionTimestamp;

  const elapsedTime = now - new Date(game.lastMoveAt).getTime();

  let calculatedWhiteTime = game.whiteTimeRemaining;
  let calculatedBlackTime = game.blackTimeRemaining;

  if (playerAssignedColor === "w") {
    calculatedWhiteTime = Math.max(0, game.whiteTimeRemaining - elapsedTime);

    if (calculatedWhiteTime <= 0) {
      const updatedGame = await finishGame({
        game,
        result: "black_win",
        resultReason: "timeout",
        whiteTimeRemaining: 0,
        blackTimeRemaining: game.blackTimeRemaining,
      });

      return { game: updatedGame, timeout: true };
    }
  } else {
    calculatedBlackTime = Math.max(0, game.blackTimeRemaining - elapsedTime);

    if (calculatedBlackTime <= 0) {
      const updatedGame = await finishGame({
        game,
        result: "white_win",
        resultReason: "timeout",
        whiteTimeRemaining: game.whiteTimeRemaining,
        blackTimeRemaining: 0,
      });

      return { game: updatedGame, timeout: true };
    }
  }

  const moveResult = playChessMove(game.currentFen, game.pgn, {
    from,
    to,
    promotion,
  });

  if (!moveResult.success) {
    throw new Error(moveResult.message);
  }

  const incrementMs = game.timeControl.incrementSeconds * 1000;

  if (playerAssignedColor === "w") {
    calculatedWhiteTime += incrementMs;
  } else {
    calculatedBlackTime += incrementMs;
  }

  const updatePayload = {
    currentFen: moveResult.currentFen,
    pgn: moveResult.pgn,
    moves: moveResult.moves.map((m) => m.san),
    turn: moveResult.turn,
    whiteTimeRemaining: calculatedWhiteTime,
    blackTimeRemaining: calculatedBlackTime,
    lastMoveAt: new Date(now),
  };

  if (moveResult.isGameOver) {
    const updatedGame = await finishGame({
      game,
      result: moveResult.result,
      resultReason: moveResult.resultReason,
      whiteTimeRemaining: calculatedWhiteTime,
      blackTimeRemaining: calculatedBlackTime,
      extraFields: {
        currentFen: moveResult.currentFen,
        pgn: moveResult.pgn,
        moves: moveResult.moves.map((m) => m.san),
        turn: moveResult.turn,
        lastMoveAt: new Date(now),
      },
    });

    return {
      game: updatedGame,
      moveResult,
    };
  }

  const updatedGame = await Game.findOneAndUpdate(
    {
      _id: gameId,
      turn: game.turn,
      status: "ongoing",
    },
    { $set: updatePayload },
    { returnDocument: "after" },
  );

  if (!updatedGame) {
    throw new Error(
      "Conflict detected: The move was already processed or modified by another worker thread.",
    );
  }

  return { game: updatedGame, moveResult };
};

export const resignGameService = async ({ gameId, currentUser }) => {
  const game = await Game.findById(gameId);

  if (!game) {
    throw new Error("Game not found");
  }

  if (game.status !== "ongoing") {
    throw new Error("Game is no longer active");
  }

  const isWhitePlayer = game.whitePlayer.userId.equals(currentUser._id);
  const isBlackPlayer = game.blackPlayer.userId.equals(currentUser._id);

  if (!isWhitePlayer && !isBlackPlayer) {
    throw new Error("You are not part of this game");
  }

  const result = isWhitePlayer ? "black_win" : "white_win";

  const updatedGame = await finishGame({
    game,
    result,
    resultReason: "resignation",
    whiteTimeRemaining: game.whiteTimeRemaining,
    blackTimeRemaining: game.blackTimeRemaining,
  });

  if (!updatedGame) {
    throw new Error("Conflict detected: Game state was already updated");
  }

  return {
    game: updatedGame,
    gameResult: result,
  };
};

export const finishGame = async ({
  game,
  result,
  resultReason,
  whiteTimeRemaining,
  blackTimeRemaining,
  extraFields = {},
}) => {
  let winnerUserId = null;

  if (result === "white_win") {
    winnerUserId = game.whitePlayer.userId;
  }

  if (result === "black_win") {
    winnerUserId = game.blackPlayer.userId;
  }

  const updatedGame = await Game.findOneAndUpdate(
    {
      _id: game._id,
      status: "ongoing",
    },
    {
      $set: {
        status: "finished",
        result,
        resultReason,
        winnerUserId,
        whiteTimeRemaining,
        blackTimeRemaining,
        endedAt: new Date(),
        ...extraFields,
      },
    },
    {
      returnDocument: "after",
    },
  );

  if (!updatedGame) {
    throw new Error("Game was already finished");
  }

  return updatedGame;
};
