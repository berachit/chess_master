/**
 * Main chess board UI.
 * Handles rendering the board, pieces, and user moves.
 * Supports `flipped` prop to render from black's perspective.
 * Supports size="fill" to fill parent container (used for responsive layout).
 */

import { useState } from "react";

interface ChessBoardUIProps {
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "fill";
  showCoordinates?: boolean;
  interactive?: boolean;
  flipped?: boolean;
  position: Record<string, string | null>;
  highlightedSquares?: string[];
  selectedSquare?: string | null;
  kingInCheck?: string | null;
  kingInCheckmate?: string | null;
  onSquareClick?: (square: string) => void;
}

type PieceType =
  | "K" | "Q" | "R" | "B" | "N" | "P"
  | "k" | "q" | "r" | "b" | "n" | "p";

const pieceSymbols: Record<PieceType, string> = {
  K: "♔", Q: "♕", R: "♖", B: "♗", N: "♘", P: "♙",
  k: "♚", q: "♛", r: "♜", b: "♝", n: "♞", p: "♟",
};

// Perspective arrays
const WHITE_RANKS = ["8", "7", "6", "5", "4", "3", "2", "1"];
const WHITE_FILES = ["a", "b", "c", "d", "e", "f", "g", "h"];
const BLACK_RANKS = ["1", "2", "3", "4", "5", "6", "7", "8"];
const BLACK_FILES = ["h", "g", "f", "e", "d", "c", "b", "a"];
const ALL_FILES   = ["a", "b", "c", "d", "e", "f", "g", "h"];

const sizeClasses: Record<string, string> = {
  sm:   "w-48 h-48",
  md:   "w-80 h-80",
  lg:   "w-[400px] h-[400px]",
  xl:   "w-[520px] h-[520px]",
  "2xl":"w-[580px] h-[580px]",
  fill: "w-full h-full",     // fills parent container
};

const pieceSizeClasses: Record<string, string> = {
  sm:   "text-2xl",
  md:   "text-4xl",
  lg:   "text-5xl",
  xl:   "text-5xl",
  "2xl":"text-6xl",
  fill: "",  // font-size set via inline style using cqw
};

const ChessBoardUI = ({
  size = "xl",
  showCoordinates = true,
  interactive = true,
  flipped = false,
  position,
  highlightedSquares = [],
  selectedSquare: controlledSelected,
  onSquareClick,
  kingInCheck,
  kingInCheckmate,
}: ChessBoardUIProps) => {
  const [internalSelected, setInternalSelected] = useState<string | null>(null);
  const selectedSquare = controlledSelected ?? internalSelected;

  const ranks = flipped ? BLACK_RANKS : WHITE_RANKS;
  const files = flipped ? BLACK_FILES : WHITE_FILES;

  // Which edge shows coordinates
  const rankLabelFile = flipped ? "h" : "a";
  const fileLabelRank = flipped ? "8" : "1";
  const rankLabelPos  = flipped ? "right-0.5 top-0.5" : "left-0.5 top-0.5";
  const fileLabelPos  = flipped ? "left-0.5 top-0.5"  : "right-0.5 bottom-0.5";

  const handleSquareClick = (square: string) => {
    if (!interactive) return;
    if (onSquareClick) {
      onSquareClick(square);
    } else {
      setInternalSelected(selectedSquare === square ? null : square);
    }
  };

  const isLightSquare = (file: string, rank: string): boolean => {
    const fileIndex = ALL_FILES.indexOf(file);
    const rankIndex = parseInt(rank) - 1;
    return (fileIndex + rankIndex) % 2 !== 0;
  };

  const isWhitePiece = (piece: PieceType) => piece === piece.toUpperCase();

  return (
    <div
      className={`${sizeClasses[size]} rounded-xl overflow-hidden border-4 border-board-border`}
      style={{
        boxShadow: "var(--shadow-lg), inset 0 2px 4px rgba(0,0,0,0.3)",
        // Required so cqw units inside resolve to THIS element's width.
        // Each square = 12.5cqw, pieces at 10cqw ≈ 80% of square.
        containerType: "inline-size",
      }}
    >
      <div className="grid grid-cols-8 grid-rows-8 w-full h-full">
        {ranks.map((rank) =>
          files.map((file) => {
            const square = `${file}${rank}`;
            const piece  = position[square];
            const isLight         = isLightSquare(file, rank);
            const isSelected      = selectedSquare === square;
            const isHighlighted   = highlightedSquares.includes(square);
            const isCheckSquare   = kingInCheck === square;
            const isCheckmateSquare = kingInCheckmate === square;

            return (
              <div
                key={square}
                onClick={() => handleSquareClick(square)}
                className={`
                  relative flex items-center justify-center
                  ${isLight ? "board-square-light" : "board-square-dark"}
                  ${interactive ? "cursor-pointer board-square" : ""}
                  ${isSelected ? "ring-2 ring-inset ring-primary" : ""}
                  ${isHighlighted && !isSelected ? "bg-primary/30" : ""}
                  ${isCheckSquare ? "bg-red-500/40" : ""}
                  ${isCheckmateSquare ? "bg-red-700" : ""}
                  transition-colors duration-100
                `}
              >
                {/* Piece */}
                {piece && (
                  <span
                    className={`
                      ${size !== "fill" ? pieceSizeClasses[size] : ""}
                      select-none leading-none
                      ${isWhitePiece(piece as PieceType)
                        ? "text-white drop-shadow-[0_2px_4px_rgba(0,0,0,1)]"
                        : "text-gray-900 drop-shadow-[0_1px_3px_rgba(255,255,255,0.5)]"
                      }
                      ${interactive ? "hover:scale-110 transition-transform duration-100" : ""}
                    `}
                    style={
                      size === "fill"
                        ? {
                            // 10cqw = 80% of one square (12.5cqw).
                            // Board container has containerType:inline-size so cqw resolves correctly.
                            fontSize: "10cqw",
                            lineHeight: 1,
                          }
                        : undefined
                    }
                  >
                    {pieceSymbols[piece as PieceType]}
                  </span>
                )}

                {/* Rank label */}
                {showCoordinates && file === rankLabelFile && (
                  <span className={`absolute ${rankLabelPos} text-[10px] font-bold leading-none
                    ${isLight ? "text-board-dark/70" : "text-board-light/70"}`}>
                    {rank}
                  </span>
                )}

                {/* File label */}
                {showCoordinates && rank === fileLabelRank && (
                  <span className={`absolute ${fileLabelPos} text-[10px] font-bold leading-none
                    ${isLight ? "text-board-dark/70" : "text-board-light/70"}`}>
                    {file}
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ChessBoardUI;