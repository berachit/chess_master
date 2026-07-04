import Game from "../models/game.model.js";
import {
  abortGameService,
  acceptDrawService,
  declineDrawService,
  finishGame,
  offerDrawService,
  processMove,
  resignGameService,
} from "../services/game.service.js";

const disconnectTimers = new Map();

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

      const userId = socket.user._id;
      const username = socket.user.username;

      socket.data.userId = userId;
      socket.data.username = username;

      const timerKey = `${gameId}-${userId}`;

      if (disconnectTimers.has(timerKey)) {
        clearTimeout(disconnectTimers.get(timerKey));
        disconnectTimers.delete(timerKey);

        socket.to(gameId).emit("player_reconnected", {
          success: true,
          gameId,
          playerId: userId,
          username,
          message: `${username} reconnected`,
        });
      }

      socket.emit("game_state", {
        success: true,
        message: "Game state synchronized successfully",
        game,
      });

      console.log(`${username} joined game room ${gameId}`);

      socket.emit("game_joined", {
        success: true,
        gameId,
        message: "Joined game successfully",
      });

      socket.to(gameId).emit("player_joined", {
        message: `${username} joined the room!`,
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

        if (result.timeout) {
          io.to(gameId).emit("game_finished", {
            success: true,
            gameId,
            result: result.game.result,
            resultReason: result.game.resultReason,
            winnerUserId: result.game.winnerUserId,
            updatedAt: result.game.updatedAt,
          });

          return;
        }

        io.to(gameId).emit("move_played", {
          success: true,
          game: result.game,
          move: result.moveResult,
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
        gameId,
        game: result.game,
        result: result.gameResult,
        winnerUserId: result.game.winnerUserId,
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

      const userId = socket.data.userId;
      const username = socket.data.username;

      if (!userId) {
        console.log(
          "Disconnect cleanup skipped: User identifier vanished from memory scope.",
        );
        return;
      }

      const timerKey = `${gameId}-${userId}`;
      console.log(`${username} disconnected from game ${gameId}`);

      socket.to(gameId).emit("player_disconnected", {
        success: true,
        gameId,
        playerId: userId,
        username: username,
        message: `${username} disconnected`,
      });

      const timeout = setTimeout(async () => {
        try {
          const game = await Game.findById(gameId);

          if (!game || game.status !== "ongoing") {
            disconnectTimers.delete(timerKey);
            return;
          }

          const isWhitePlayer = game.whitePlayer.userId.equals(userId);

          const result = isWhitePlayer ? "black_win" : "white_win";

          const updatedGame = await finishGame({
            game,
            result,
            resultReason: "disconnect_timeout",
            whiteTimeRemaining: game.whiteTimeRemaining,
            blackTimeRemaining: game.blackTimeRemaining,
          });
          io.to(gameId).emit("game_finished", {
            success: true,
            gameId,
            result,
            resultReason: "disconnect_timeout",
            winnerUserId: updatedGame.winnerUserId,
            message: `${username} failed to reconnect`,
          });

          disconnectTimers.delete(timerKey);
        } catch (error) {
          disconnectTimers.delete(timerKey);
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

      socket.to(gameId).emit("draw_offered", {
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

  socket.on("abort_game", async ({ gameId }) => {
    try {
      const currentUser = socket.user;

      const game = await abortGameService({
        gameId,
        currentUser,
      });

      io.to(gameId).emit("game_aborted", {
        success: true,
        game,
      });

      io.to(gameId).emit("game_finished", {
        success: true,
        result: "aborted",
        resultReason: "aborted",
        game,
      });
    } catch (error) {
      socket.emit("error_message", {
        success: false,
        message: error.message,
      });
    }
  });

  socket.on("request_rematch", async ({ gameId }) => {
    try {
      const currentUser = socket.user;
      socket.to(gameId).emit("rematch_offered", {
        success: true,
        offeredBy: currentUser.username,
      });
    } catch (error) {
      socket.emit("error_message", {
        success: false,
        message: error.message,
      });
    }
  });

  socket.on("accept_rematch", async ({ gameId }) => {
    try {
      const Game = (await import("../models/game.model.js")).default;
      const game = await Game.findById(gameId);
      if (!game) {
        throw new Error("Original game not found");
      }

      const User = (await import("../models/user.model.js")).User;
      const whiteUser = await User.findById(game.whitePlayer.userId);
      const blackUser = await User.findById(game.blackPlayer.userId);

      if (!whiteUser || !blackUser) {
        throw new Error("Players not found");
      }

      const isWhite = game.whitePlayer.userId.equals(socket.user._id);
      const player1 = socket.user;
      const player2 = isWhite ? blackUser : whiteUser;
      const preferredColor = isWhite ? "black" : "white";

      const { createGameService } = await import("../services/game.service.js");
      const newGame = await createGameService({
        player1,
        player2,
        preferredColor,
        timeControl: game.timeControl,
      });

      io.to(gameId).emit("rematch_accepted", {
        success: true,
        newGameId: newGame._id,
      });
    } catch (error) {
      socket.emit("error_message", {
        success: false,
        message: error.message,
      });
    }
  });
};
