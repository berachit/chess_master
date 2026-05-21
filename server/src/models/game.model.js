import mongoose from "mongoose";

const playerSnapshotSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    username: {
      type: String,
      required: true,
    },

    ratingBefore: {
      type: Number,
    },

    ratingAfter: {
      type: Number,
    },
  },
  {
    _id: false,
  },
);

const STARTING_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

const gameSchema = new mongoose.Schema(
  {
    whitePlayer: {
      type: playerSnapshotSchema,
      required: true,
    },

    blackPlayer: {
      type: playerSnapshotSchema,
      required: true,
    },

    winnerUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    initialFen: {
      type: String,
      default: STARTING_FEN,
    },

    currentFen: {
      type: String,
      default: STARTING_FEN,
    },

    moves: {
      type: [String],
      default: [],
    },

    pgn: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["waiting", "ongoing", "finished", "abandoned"],
      default: "waiting",
      index: true,
    },

    result: {
      type: String,
      enum: ["white_win", "black_win", "draw", "aborted"],
    },

    resultReason: {
      type: String,
      enum: [
        "checkmate",
        "resignation",
        "timeout",
        "stalemate",
        "draw_agreement",
        "insufficient_material",
        "threefold_repetition",
        "fifty_move_rule",
        "aborted",
      ],
    },
    turn: {
      type: String,
      enum: ["w", "b"],
      default: "w",
    },
    timeControl: {
      type: {
        type: String,
        enum: ["bullet", "blitz", "rapid", "classical", "custom"],
        required: true,
      },

      initialSeconds: {
        type: Number,
        required: true,
      },

      incrementSeconds: {
        type: Number,
        default: 0,
      },
    },
    startedAt: {
      type: Date,
    },

    endedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

gameSchema.index({
  "whitePlayer.userId": 1,
  createdAt: -1,
});

gameSchema.index({
  "blackPlayer.userId": 1,
  createdAt: -1,
});

gameSchema.index({
  status: 1,
  updatedAt: -1,
});

const Game = mongoose.model("Game", gameSchema);

export default Game;
