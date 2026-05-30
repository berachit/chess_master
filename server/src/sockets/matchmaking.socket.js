import { User } from "../models/user.model.js";
import { createGameService } from "../services/game.service.js";
import {
  addPlayerToQueue,
  findMatchAndExtract,
  removePlayerFromQueue,
} from "../services/matchmaking.service.js";

export const registerMatchmakingHandlers = (io, socket) => {
  socket.on("join_queue", async ({ timeControl }) => {
  try {
    const opponent = findMatchAndExtract({
      userId: socket.user._id,
      rating: socket.user.rating,
      timeControl,
    });

    if (opponent) {
      const opponentUser = await User.findById(opponent.userId);

      if (!opponentUser) {
        throw new Error("Opponent not found");
      }

      const game = await createGameService({
        player1: socket.user,
        player2: opponentUser,
        preferredColor: "random",
        timeControl,
      });

      io.to(socket.id).emit("match_found", {
        success: true,
        game,
      });

      io.to(opponent.socketId).emit("match_found", {
        success: true,
        game,
      });

      return;
    }

    await addPlayerToQueue({
      userId: socket.user._id,
      username: socket.user.username,
      rating: socket.user.rating,
      socketId: socket.id,
      timeControl,
    });

    socket.emit("queue_joined", {
      success: true,
      timeControl,
      message: "Searching for opponent...",
    });
  } catch (error) {
    socket.emit("error_message", {
      success: false,
      message: error.message,
    });
  }
});

  socket.on("leave_queue", async () => {
    try {
      await removePlayerFromQueue(socket.user._id);

      socket.emit("queue_left", {
        success: true,
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
      await removePlayerFromQueue(socket.user._id);
    } catch (error) {
      console.log("Matchmaking Error: ", error.message);
    }
  });
};
