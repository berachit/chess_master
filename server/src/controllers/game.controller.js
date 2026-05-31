import Game from "../models/game.model.js";
import { User } from "../models/user.model.js";
import {
  abortGameService,
  acceptDrawService,
  createGameService,
  declineDrawService,
  getAnalyticsService,
  offerDrawService,
  processMove,
  resignGameService,
} from "../services/game.service.js";

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

    const game = await createGameService({
      player1: currentUser,
      player2: opponent,
      preferredColor,
      timeControl,
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

export const getActiveGames = async (req, res) => {
  try {
    const currentUser = req.user;

    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const filter = {
      status: "ongoing",
      $or: [
        { "whitePlayer.userId": currentUser._id },
        { "blackPlayer.userId": currentUser._id },
      ],
    };

    const [games, totalGames] = await Promise.all([
      Game.find(filter).sort({ updatedAt: -1 }).skip(skip).limit(limit).lean(),
      Game.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      games,
      pagination: {
        page,
        limit,
        totalGames,
        totalPages: Math.ceil(totalGames / limit),
        hasNextPage: page * limit < totalGames,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getGameHistory = async (req, res) => {
  try {
    const currentUser = req.user;

    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const filter = {
      status: "finished",
      $or: [
        { "whitePlayer.userId": currentUser._id },
        { "blackPlayer.userId": currentUser._id },
      ],
    };

    const [games, totalGames] = await Promise.all([
      Game.find(filter).sort({ endedAt: -1 }).skip(skip).limit(limit).lean(),
      Game.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      games,
      pagination: {
        page,
        limit,
        totalGames,
        totalPages: Math.ceil(totalGames / limit),
        hasNextPage: page * limit < totalGames,
        hasPrevPage: page > 1,
      },
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
    const { gameId } = req.params;

    const currentUser = req.user;

    const game = await offerDrawService({ gameId, currentUser });

    res
      .status(200)
      .json({ success: true, message: "Draw offered successfully", game });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const acceptDraw = async (req, res) => {
  try {
    const { gameId } = req.params;

    const currentUser = req.user;

    const game = await acceptDrawService({ gameId, currentUser });

    res.status(200).json({ success: true, message: "Draw accepted", game });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const declineDraw = async (req, res) => {
  try {
    const { gameId } = req.params;

    const currentUser = req.user;

    const game = await declineDrawService({ gameId, currentUser });

    res.status(200).json({
      success: true,
      message: "Draw Declined",
      game,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const abortGame = async (req, res) => {
  try {
    const currentUser = req.user;

    const { gameId } = req.params;
    const game = await abortGameService({ gameId, currentUser });

    res.status(200).json({
      success: true,
      message: "Game aborted successfully",
      game,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAnalytics = async (req, res) => {
  try {
    const user = req.user;

    const analytics = await getAnalyticsService(user._id);
    res.status(200).json({
      success: true,
      analytics,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
