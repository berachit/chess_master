import Game from "../models/game.model.js";
import { makeMove as playChessMove } from "../services/chess.service.js";
import { processMove, resignGameService } from "../services/game.service.js";

export const registerGameHandlers = (io, socket) => {
  // Joining Game Channel
  socket.on("join_game", async ({ gameId }) => {
    try {
      if (!gameId) {
        return socket.emit("error_message", {
          success: false,
          message: "Game ID is required",
        });
      }

      const game = await Game.findById(gameId);

      if (!game) {
        return socket.emit("error_message", {
          success: false,
          message: "Game not found",
        });
      }

      const isWhitePlayer = game.whitePlayer.userId.equals(socket.user._id);
      const isBlackPlayer = game.blackPlayer.userId.equals(socket.user._id);

      if (!isWhitePlayer && !isBlackPlayer) {
        return socket.emit("error_message", {
          success: false,
          message: "You are not allowed to join this game",
        });
      }

      socket.join(gameId);
      socket.data.gameId = gameId;

      socket.emit("game_state", {
        success: true,
        message: "Game state synchronized successfully",
        game,
      });

      console.log(`${socket.user.username} joined game room ${gameId}`);

      socket.emit("game_joined", {
        success: true,
        gameId,
        message: "Joined game successfully",
      });

      socket.to(gameId).emit("player_joined", {
        message: `${socket.user.username} joined the room!`,
      });
    } catch (error) {
      socket.emit("error_message", {
        success: false,
        message: error.message,
      });
    }
  });

  socket.on("make_move", async ({ gameId, from, to, promotion }) => {
    try {
      if (!gameId || !from || !to) {
        return socket.emit("error_message", {
          success: false,
          message: "All the fields are required!",
        });
      }

      const currentUser = socket.user;

      const result = await processMove({
        gameId,
        to,
        from,
        promotion,
        currentUser,
      });

      io.to(gameId).emit("move_played", {
        success: true,
        game: result.game,
        move: result.moveResult.move,
      });

      if (resultmoveResult.isGameOver) {
        io.to(gameId).emit("game_finished", {
          success: true,
          gameId,
          result: result.moveResult.result,
          resultReason: result.moveResult.resultReason,
          winnerUserId: result.updatedGame.winnerUserId,
          updatedAt: result.updatedGame.updatedAt,
        });
      }
    } catch (error) {
      socket.emit("error_message", {
        success: false,
        message: error.message,
      });
    }
  });

  socket.on("resign_game", async ({ gameId }) => {
    try {
      const currentUser = socket.user;

      const result = await resignGameService({ gameId, currentUser });

      io.to(gameId).emit("player_resigned", {
        success: true,
        game: result.game,
        result: result.gameResult,
      });
    } catch (error) {
      socket.emit("error_message", {
        success: false,
        message: error.message,
      });
    }
  });
};
