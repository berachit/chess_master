import Game from "../models/game.model.js";
import { User } from "../models/user.model.js";
import { createChessGame } from "../services/chess.service.js";
import { processMove, resignGameService } from "../services/game.service.js";

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
      whiteTimeRemaining: initialSeconds * 1000,
      blackTimeRemaining: initialSeconds * 1000,
      lastMoveAt: new Date(),
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

    const { to, from, promotion, clientTimestamp } = req.body;

    const currentUser = req.user;

    if (!from || !to) {
      return res.status(400).json({
        success: false,
        message: "Both 'from' and 'to' are required",
      });
    }

    const result = await processMove({
      gameId,
      to,
      from,
      promotion,
      clientTimestamp,
      currentUser,
    });

    res.status(200).json({
      success: true,
      message: "Move played successfully",
      game: result.game,
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

    const result = await resignGameService({ gameId, currentUser });

    res.status(200).json({
      success: true,
      message: `${currentUser.username} resigned the game`,
      game: result.game,
      result: result.gameResult,
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

export const acceptDraw = async (req, res) => {
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
