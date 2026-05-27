import Game from "../models/game.model.js";
import {
  acceptDrawService,
  declineDrawService,
  offerDrawService,
  processMove,
  resignGameService,
} from "../services/game.service.js";

const disconnectTimers = new Map();

export const registerGameHandlers = (io, socket) => {
  // Joining Game Channel
  if (!socket.user) {
    socket.disconnect();
    return;
  }

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

      const timerKey = `${gameId}-${socket.user._id}`;

      if (disconnectTimers.has(timerKey)) {
        clearTimeout(disconnectTimers.get(timerKey));
        disconnectTimers.delete(timerKey);
        socket.to(gameId).emit("player_reconnected", {
          success: true,
          gameId,
          playerId: socket.user._id,
          username: socket.user.username,
          message: `${socket.user.username} reconnected`,
        });
      }

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

  socket.on(
    "make_move",
    async ({ gameId, from, to, promotion, clientTimestamp }) => {
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
          clientTimestamp,
          currentUser,
        });

        io.to(gameId).emit("move_played", {
          success: true,
          game: result.game,
          move: result.moveResult.move,
        });

        if (result.moveResult.isGameOver) {
          io.to(gameId).emit("game_finished", {
            success: true,
            gameId,
            result: result.moveResult.result,
            resultReason: result.moveResult.resultReason,
            winnerUserId: result.game.winnerUserId,
            updatedAt: result.game.updatedAt,
          });
        }
      } catch (error) {
        socket.emit("error_message", {
          success: false,
          message: error.message,
        });
      }
    },
  );

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
  socket.on("disconnect", async () => {
    try {
      const gameId = socket.data.gameId;

      if (!gameId) {
        return;
      }

      const timerKey = `${gameId}-${socket.user._id}`;
      console.log(`${socket.user.username} disconnected from game ${gameId}`);

      socket.to(gameId).emit("player_disconnected", {
        success: true,
        gameId,
        playerId: socket.user._id,
        username: socket.user.username,
        message: `${socket.user.username} disconnected`,
      });

      const timeout = setTimeout(async () => {
        try {
          const game = await Game.findById(gameId);

          if (!game || game.status !== "ongoing") {
            return;
          }

          const isWhitePlayer = game.whitePlayer.userId.equals(socket.user._id);

          const winnerUserId = isWhitePlayer
            ? game.blackPlayer.userId
            : game.whitePlayer.userId;

          const result = isWhitePlayer ? "black_win" : "white_win";

          game.status = "finished";
          game.result = result;
          game.resultReason = "disconnect_timeout";
          game.winnerUserId = winnerUserId;
          game.endedAt = new Date();

          await game.save();

          io.to(gameId).emit("game_finished", {
            success: true,
            gameId,
            result,
            resultReason: "timeout",
            winnerUserId,
            message: `${socket.user.username} failed to reconnect`,
          });

          disconnectTimers.delete(timerKey);
        } catch (error) {
          console.log("Disconnect timeout error:", error.message);
        }
      }, 60000);

      disconnectTimers.set(timerKey, timeout);
    } catch (error) {
      console.log("Disconnect error:", error.message);
    }
  });

  socket.on("offer_draw", async ({ gameId }) => {
    try {
      const currentUser = socket.user;

      const game = await offerDrawService({ gameId, currentUser });

      io.to(gameId).emit("draw_offered", {
        success: true,
        game,
        offeredBy: currentUser.username,
      });
    } catch (error) {
      socket.emit("error_message", {
        success: false,
        message: error.message,
      });
    }
  });

  socket.on("accept_draw", async ({ gameId }) => {
    try {
      const currentUser = socket.user;

      const game = await acceptDrawService({ gameId, currentUser });

      io.to(gameId).emit("draw_accepted", {
        success: true,
        game,
      });

      io.to(gameId).emit("game_finished", {
        success: true,
        game,
        result: game.result,
        resultReason: game.resultReason,
      });
    } catch (error) {
      socket.emit("error_message", {
        success: false,
        message: error.message,
      });
    }
  });

  socket.on("decline_draw", async ({ gameId }) => {
    try {
      const currentUser = socket.user;

      const game = await declineDrawService({
        gameId,
        currentUser,
      });

      io.to(gameId).emit("draw_declined", {
        success: true,
        game,
      });
    } catch (error) {
      socket.emit("error_message", {
        success: false,
        message: error.message,
      });
    }
  });
};
