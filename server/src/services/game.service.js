import Game from "../models/game.model.js";
import { makeMove as playChessMove } from "../services/chess.service.js";

export const processMove = async ({
  gameId,
  to,
  from,
  promotion,
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

  const moveResult = playChessMove(game.currentFen, game.pgn, {
    from,
    to,
    promotion,
  });

  if (!moveResult.success) {
    throw new Error(moveResult.message);
  }

  const updatePayload = {
    currentFen: moveResult.currentFen,
    pgn: moveResult.pgn,
    moves: moveResult.moves.map((m) => m.san),
    turn: moveResult.turn,
  };

  if (moveResult.isGameOver) {
    updatePayload.status = "finished";
    updatePayload.result = moveResult.result;
    updatePayload.resultReason = moveResult.resultReason;
    updatePayload.endedAt = new Date();

    if (moveResult.result === "white_win") {
      updatePayload.winnerUserId = game.whitePlayer.userId;
    } else if (moveResult.result === "black_win") {
      updatePayload.winnerUserId = game.blackPlayer.userId;
    }
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

export const resignGameService = async ({gameId, currentUser}) => {
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
    
        const winnerUserId = isWhitePlayer
          ? game.blackPlayer.userId
          : game.whitePlayer.userId;
    
        const result = isWhitePlayer ? "black_win" : "white_win";
    
        const updatePayload = {
          winnerUserId,
          status: "finished",
          result,
          resultReason: "resignation",
          endedAt: new Date(),
        };
    
        const updatedGame = await Game.findOneAndUpdate(
          {
            _id: gameId,
            status: "ongoing",
          },
          {
            $set: updatePayload,
          },
          {
            returnDocument: "after",
          },
        );
    
        if (!updatedGame) {
          throw new Error("Conflict detected: Game state was already updated");
        }

        return {
            game: updatedGame,
            gameResult: result
        }
};

export const finishGame = () => {};
