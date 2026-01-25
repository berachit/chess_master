// acts as the entire chess game brain for your UI:
// Uses chess.js as the rules engine (legal moves, check, checkmate, etc.)
// Uses React state only for things that affect rendering
// Converts FEN → board position for the UI

// Handles:
// Square selection
// Legal move highlighting
// Move execution
// Pawn promotion
// Check / checkmate detection

import { useState, useMemo } from "react";
import { Chess, Square, Move } from "chess.js";

export const useChessGame = () => {
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
  const [promotionMove, setPromotionMove] = useState<{
    from: Square;
    to: Square;
  } | null>(null);

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

  // heart of the game interaction
  const handleSquareClick = (square: Square) => {
    // if promotionMove popup is there helps to prevent the illegal click
    if (promotionMove) return;

    // returns the piece on the select sqaure
    // {type: "p", color: "w"}
    const clickedPiece = game.get(square);

    //  CASE 1: No piece selected yet
    if (!selectedSquare) {
      if (clickedPiece && clickedPiece.color === game.turn()) {
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
      clickedPiece.color === game.turn() &&
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
    } else {
      console.log("Illegal");
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

    setFen(game.fen());
    setPromotionMove(null);
    setSelectedSquare(null);
    setHighlightedSquares([]);
  };

  // 🧠 Board position derived from FEN
  const position = useMemo(() => {
    const temp = new Chess(fen);

    return temp
      .board()
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
      );
  }, [fen]);

  // ✅ SINGLE RETURN (correct)
  return {
    position,
    selectedSquare,
    highlightedSquares,
    handleSquareClick,
    promotePawn,
    promotionMove,
    kingSquare,
    moves: game.history({ verbose: true }) as Move[],
    turn: game.turn(),
    status: {
      check: game.inCheck(),
      checkmate: game.isCheckmate(),
      stalemate: game.isStalemate(),
    },
  };
};
