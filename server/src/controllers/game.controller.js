import Game from "../models/game.model.js";
import { User } from "../models/user.model.js";
import { createChessGame } from "../services/chess.service.js";
import { makeMove as playChessMove } from "../services/chess.service.js";

export const createGame = async (req, res) => {
  try {
    const { opponentId, preferredColor, timeControl } = req.body;

    if (!opponentId || !preferredColor || !timeControl) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const { type, initialSeconds, incrementSeconds } = timeControl;
    const allowedTimeControls = [
      "bullet",
      "blitz",
      "rapid",
      "classical",
      "custom",
    ];

    if (!type || !initialSeconds) {
      return res.status(400).json({
        success: false,
        message: "timeControl must contain both 'type' and 'initialSeconds'",
      });
    }

    if (!allowedTimeControls.includes(type)) {
      return res.status(400).json({
        success: false,
        message: `Invalid time control type. Must be one of: ${allowedTimeControls.join(", ")}`,
      });
    }

    if (typeof initialSeconds !== "number" || initialSeconds <= 0) {
      return res.status(400).json({
        success: false,
        message: "initialSeconds must be a positive number",
      });
    }

    const currentUser = req.user;

    const opponent = await User.findById(opponentId);

    if (!opponent) {
      return res.status(404).json({
        success: false,
        message: "Opponent not found",
      });
    }

    if (currentUser._id.equals(opponent._id)) {
      return res.status(400).json({
        success: false,
        message: "You cannot play against yourself",
      });
    }

    if (!["black", "white", "random"].includes(preferredColor)) {
      return res.status(400).json({
        success: false,
        message: "Invalid color preference",
      });
    }

    let whitePlayer;
    let blackPlayer;

    let currentPlayerSnapshot = {
      userId: currentUser._id,
      username: currentUser.username,
      ratingBefore: currentUser.rating,
    };

    let opponentPlayerSnapshot = {
      userId: opponent._id,
      username: opponent.username,
      ratingBefore: opponent.rating,
    };

    if (preferredColor === "white") {
      whitePlayer = currentPlayerSnapshot;
      blackPlayer = opponentPlayerSnapshot;
    } else if (preferredColor === "black") {
      whitePlayer = opponentPlayerSnapshot;
      blackPlayer = currentPlayerSnapshot;
    } else {
      const isWhite = Math.random() < 0.5;

      whitePlayer = isWhite ? currentPlayerSnapshot : opponentPlayerSnapshot;
      blackPlayer = isWhite ? opponentPlayerSnapshot : currentPlayerSnapshot;
    }

    const chessState = createChessGame();

    const game = await Game.create({
      whitePlayer,
      blackPlayer,
      initialFen: chessState.initialFen,
      currentFen: chessState.currentFen,
      pgn: chessState.pgn,
      moves: chessState.moves,
      turn: chessState.turn,
      status: "ongoing",
      timeControl: {
        type,
        initialSeconds,
        incrementSeconds: incrementSeconds || 0,
      },
      startedAt: new Date(),
    });

    res.status(201).json({
      success: true,
      message: "Game created successfully",
      game,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const makeMove = async (req, res) => {
  try {
    const { gameId } = req.params;

    const { to, from, promotion } = req.body;

    const currentUser = req.user;

    if (!from || !to) {
      return res.status(400).json({
        success: false,
        message: "Both 'from' and 'to' are required",
      });
    }

    const game = await Game.findById(gameId);

    if (!game) {
      return res.status(404).json({
        success: false,
        message: "Game not found",
      });
    }

    if (game.status !== "ongoing") {
      return res.status(400).json({
        success: false,
        message: "Game is no longer active",
      });
    }

    const isWhitePlayer = game.whitePlayer.userId.equals(currentUser._id);
    const isBlackPlayer = game.blackPlayer.userId.equals(currentUser._id);

    if (!isWhitePlayer && !isBlackPlayer) {
      return res.status(403).json({
        success: false,
        message: "You are not part of this game",
      });
    }

    const playerAssignedColor = isWhitePlayer ? "w" : "b";

    if (game.turn !== playerAssignedColor) {
      return res.status(400).json({
        success: false,
        message: `It is not your turn to move. Wait for your opponent.`,
      });
    }

    const moveResult = playChessMove(game.currentFen, game.pgn, {
      from,
      to,
      promotion,
    });

    if (!moveResult.success) {
      return res.status(400).json({
        success: false,
        message: moveResult.message,
      });
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
      return res.status(409).json({
        success: false,
        message:
          "Conflict detected: The move was already processed or modified by another worker thread.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Move played successfully",
      game: updatedGame,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getGame = async (req, res) => {
  try {
    const { gameId } = req.params;

    const currentUser = req.user;

    const game = await Game.findById(gameId).lean();

    if (!game) {
      return res.status(404).json({
        success: false,
        message: "Game not found",
      });
    }

    const isWhitePlayer =
      game.whitePlayer.userId.toString() === currentUser._id.toString();
    const isBlackPlayer =
      game.blackPlayer.userId.toString() === currentUser._id.toString();

    if (!isWhitePlayer && !isBlackPlayer) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to access this game",
      });
    }

    res.status(200).json({
      success: true,
      game,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const resignGame = async (req, res) => {
  try {
    const { gameId } = req.params;

    const currentUser = req.user;

    const game = await Game.findById(gameId);

    if (!game) {
      return res.status(404).json({
        success: false,
        message: "Game not found",
      });
    }

    if (game.status !== "ongoing") {
      return res.status(400).json({
        success: false,
        message: "Game is no longer active",
      });
    }

    const isWhitePlayer = game.whitePlayer.userId.equals(currentUser._id);
    const isBlackPlayer = game.blackPlayer.userId.equals(currentUser._id);

    if (!isWhitePlayer && !isBlackPlayer) {
      return res.status(403).json({
        success: false,
        message: "You are not part of this game",
      });
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
      return res.status(409).json({
        success: false,
        message: "Conflict detected: Game state was already updated",
      });
    }

    res.status(200).json({
      success: true,
      message: `${currentUser.username} resigned the game`,
      game: updatedGame,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const offerDraw = async (req, res) => {
  try {
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const accpetDraw = async (req, res) => {
  try {
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const abortGame = async (req, res) => {
  try {
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const handleDisconnect = async (req, res) => {
  try {
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const handleReconnect = async (req, res) => {
  try {
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const timeoutGame = async (req, res) => {
  try {
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
