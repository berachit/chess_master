/** 
 * acts as the entire chess game brain for your UI:
 * Uses chess.js as the rules engine (legal moves, check, checkmate, etc.)
 * Uses React state only for things that affect rendering
 * Converts FEN → board position for the UI
 * Handles:
    - Square selection
    - Legal move highlighting
    - Move execution
    - Pawn promotion
    - Check / checkmate detection
*/

import { useState, useMemo, useEffect } from "react";
import { Chess, Square, Move } from "chess.js";
import { GameStatus } from "@/components/StatusBanner";
import { playSound } from "@/utils/sound";
import { getBotMove } from "@/bot/botEngine";

const pieceToSymbol: Record<string, string> = {
  p: "♟",
  n: "♞",
  b: "♝",
  r: "♜",
  q: "♛",
  k: "♚",

  P: "♙",
  N: "♘",
  B: "♗",
  R: "♖",
  Q: "♕",
  K: "♔",
};

type GameMode = "bot" | "online";

interface GameConfig {
  mode: GameMode;
  level?: string;
  playerColor?: "white" | "black";
}

export const useChessGame = ({
  mode = "bot",
  level = "easy",
  playerColor = "white",
}: GameConfig) => {
  // Chess() is mutable
  // We do NOT want React to re-create it on every render
  // Using useState with an initializer:
  // Creates the engine once
  // Keeps it stable forever
  const [game] = useState(() => new Chess());

  // FEN = single source of truth for React
  // game → mutable logic
  // fen → immutable snapshot for rendering
  const [fen, setFen] = useState(game.fen());

  // Stores which square the user clicked
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  // Squares where the selected piece can legally move
  const [highlightedSquares, setHighlightedSquares] = useState<string[]>([]);
  // Pawn promotion is not an instant move:
  // Pawn reaches last rank
  // UI asks: queen / rook / bishop / knight
  // Move completes

  const [hasBotMoved, setHasBotMoved] = useState(false);

  const [promotionMove, setPromotionMove] = useState<{
    from: Square;
    to: Square;
  } | null>(null);

  // useEffect(() => {
  //   playSound("gameStart");
  // }, []);

  useEffect(() => {
    if (mode !== "bot") return;

    if (currentTurn === botTurn && !game.isGameOver() && !hasBotMoved) {
      setHasBotMoved(true);

      const delay = 300 + Math.random() * 400;

      const timer = setTimeout(() => {
        makeBotMove(level);
      }, delay);

      return () => clearTimeout(timer);
    }

    // reset when it's player's turn
    if (currentTurn === playerTurn) {
      setHasBotMoved(false);
    }
  }, [fen]);

  // Find the current player’s king square
  // Used to highlight king when in check / checkmate
  const kingSquare = useMemo(() => {
    const temp = new Chess(fen);
    const board = temp.board();

    for (let rank = 0; rank < 8; rank++) {
      for (let file = 0; file < 8; file++) {
        const piece = board[rank][file];
        // this founds the king and should belong to the side whose turn it is
        if (piece && piece.type === "k" && piece.color === temp.turn()) {
          // converts array indices to chess notation
          const fileChar = "abcdefgh"[file];
          const rankChar = (8 - rank).toString();
          return `${fileChar}${rankChar}`;
        }
      }
    }
    return null;
    // Recompute only when position changes.
  }, [fen]);

  const playerTurn = playerColor === "white" ? "w" : "b";
  const botTurn = playerColor === "white" ? "b" : "w";
  const currentTurn = fen.split(" ")[1]; // "w" or "b"

  // heart of the game interaction
  const handleSquareClick = (square: Square) => {
    // 🚫 block if not player's turn (bot mode)
    if (mode === "bot" && currentTurn !== playerTurn) return;
    // if promotionMove popup is there helps to prevent the illegal click
    if (promotionMove) return;

    // returns the piece on the select sqaure
    // {type: "p", color: "w"}
    const clickedPiece = game.get(square);

    //  CASE 1: No piece selected yet
    if (!selectedSquare) {
      if (clickedPiece && clickedPiece.color === currentTurn) {
        // get all the legal moves from the selected sqaure
        const moves = game.moves({ square, verbose: true });
        if (moves.length > 0) {
          setSelectedSquare(square);
          // highlights all the possible moves
          setHighlightedSquares(moves.map((m) => m.to));
        }
      }
      return;
    }

    // Switch selection to another own piece
    // this is for update selection of the piece
    if (
      clickedPiece &&
      clickedPiece.color === currentTurn &&
      square !== selectedSquare
    ) {
      const moves = game.moves({ square, verbose: true });
      setSelectedSquare(square);
      setHighlightedSquares(moves.map((m) => m.to));
      return;
    }

    // Get all legal moves from selected square
    const legalMoves = game.moves({
      square: selectedSquare,
      verbose: true,
    });

    // Check if THIS square is a legal promotion move
    const promotionCandidate = legalMoves.find(
      (m) => m.to === square && m.flags.includes("p"),
    );

    // Pause and ask user ONLY if legal promotion
    if (promotionCandidate) {
      setPromotionMove({
        from: selectedSquare,
        to: square,
      });
      return;
    }

    // Legal move → returns a Move object
    // Illegal move → returns null
    const move = game.move({
      from: selectedSquare,
      to: square,
    });

    // if legal, updates the ui
    if (move) {
      setFen(game.fen());

      // 🔊 player sound
      if (move.captured) {
        playSound("capture");
      } else if (move.flags.includes("k") || move.flags.includes("q")) {
        playSound("castle");
      } else {
        playSound("moveSelf");
      }

      setTimeout(() => {
        if (game.isCheckmate()) {
          playSound("gameEnd");
        } else if (game.inCheck()) {
          playSound("moveCheck");
        }
      }, 100);

      // 🌐 ONLINE MODE (future)
      if (mode === "online") {
        // socket.emit("move", move)
      }
    } else {
      playSound("illegal");
    }

    setSelectedSquare(null);
    setHighlightedSquares([]);
  };

  // Pawn promotion -> Called when user clicks promotion piece like asking user to promote to which piece
  const promotePawn = (piece: "q" | "r" | "b" | "n") => {
    if (!promotionMove) return;

    // Completes the move
    game.move({
      from: promotionMove.from,
      to: promotionMove.to,
      promotion: piece,
    });

    playSound("promote");

    setFen(game.fen());
    setPromotionMove(null);
    setSelectedSquare(null);
    setHighlightedSquares([]);
  };

  // Board position derived from FEN
  const position = useMemo(() => {
    const temp = new Chess(fen);

    return (
      temp
        .board()
        // flatMap → transform + flatten
        .flatMap((row, rankIndex) =>
          row.map((piece, fileIndex) => {
            const file = "abcdefgh"[fileIndex];
            const rank = 8 - rankIndex;
            const square = `${file}${rank}`;

            return {
              square,
              piece: piece
                ? piece.color === "w"
                  ? piece.type.toUpperCase()
                  : piece.type
                : null,
            };
          }),
        )
        .reduce(
          (acc, { square, piece }) => {
            acc[square] = piece;
            return acc;
          },
          {} as Record<string, string | null>,
        )
    );
    // Recalculate only when the position changes
  }, [fen]);

  const capturedPieces = useMemo(() => {
    const white: string[] = [];
    const black: string[] = [];

    game.history({ verbose: true }).forEach((move) => {
      if (!move.captured) return;

      if (move.color === "w") {
        // White captured a black piece
        black.push(move.captured);
      } else {
        // Black captured a white piece
        white.push(move.captured.toUpperCase());
      }
    });

    // SORTING GOES HERE (THIS IS THE ANSWER)
    const order = ["p", "n", "b", "r", "q"];

    black.sort((a, b) => order.indexOf(a) - order.indexOf(b));
    white.sort(
      (a, b) => order.indexOf(a.toLowerCase()) - order.indexOf(b.toLowerCase()),
    );

    return {
      white: white.map((p) => pieceToSymbol[p]),
      black: black.map((p) => pieceToSymbol[p]),
    };
  }, [fen]);

  const status = {
    check: game.inCheck(),
    checkmate: game.isCheckmate(),

    draw: game.isDraw(),
    stalemate: game.isStalemate(),
    threefold: game.isThreefoldRepetition(),
    fiftyMove: game.isDrawByFiftyMoves(),
    insufficientMaterial: game.isInsufficientMaterial(),

    gameOver: game.isGameOver(),
  };

  const makeBotMove = (level: string) => {
    if (game.turn() !== botTurn) return;
    const move = getBotMove(game, level);
    if (!move) return;

    game.move(move);
    setFen(game.fen());

    // 🔊 bot sound
    if (move.captured) playSound("capture");
    else playSound("moveSelf");

    setTimeout(() => {
      if (game.isCheckmate()) playSound("gameEnd");
      else if (game.inCheck()) playSound("moveCheck");
    }, 100);
  };

  const drawReason = (() => {
    if (status.stalemate) return "Stalemate";
    if (status.threefold) return "Threefold repetition";
    if (status.fiftyMove) return "50-move rule";
    if (status.insufficientMaterial) return "Insufficient material";
    return null;
  })();

  const gameStatus: GameStatus = game.isCheckmate()
    ? "checkmate"
    : game.isStalemate()
      ? "stalemate"
      : game.isDraw()
        ? "draw"
        : game.inCheck()
          ? "check"
          : "playing";

  // SINGLE RETURN (correct)
  return {
    position,
    selectedSquare,
    highlightedSquares,
    handleSquareClick,
    promotePawn,
    promotionMove,
    kingSquare,
    moves: game.history({ verbose: true }) as Move[],
    turn: currentTurn,
    capturedPieces,
    status,
    drawReason,
    gameStatus,
  };
};
