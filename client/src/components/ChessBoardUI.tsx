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
      className={`${sizeClasses[size]} h-auto rounded-xl overflow-hidden border-4 border-board-border flex flex-col`}
      style={{
        boxShadow: "var(--shadow-lg), 0 0 20px rgba(16,185,129,0.15), inset 0 2px 4px rgba(0,0,0,0.3)",
      }}
    >
      {/* 8x8 Squares Grid */}
      <div 
        className="grid grid-cols-8 grid-rows-8 w-full aspect-square"
        style={{
          // Required so cqw units inside resolve to THIS element's width.
          // Each square = 12.5cqw, pieces at 10cqw ≈ 80% of square.
          containerType: "inline-size",
        }}
      >
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
                  ${isCheckSquare ? "bg-red-500/40" : ""}
                  ${isCheckmateSquare ? "bg-red-700" : ""}
                  transition-colors duration-100
                `}
              >
                {/* Highlight/Move Hint Indicator */}
                {isHighlighted && !isSelected && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                    {piece ? (
                      // Capture target: beautiful thick circular border
                      <div
                        className="w-[82%] h-[82%] rounded-full border-primary/40 transition-all duration-200"
                        style={{ borderWidth: "0.8cqw" }}
                      />
                    ) : (
                      // Move target: clean small dot in the center
                      <div className="w-[26%] h-[26%] rounded-full bg-primary/45 shadow-[0_0_8px_rgba(20,184,166,0.3)] transition-all duration-200" />
                    )}
                  </div>
                )}

                {/* Piece */}
                {piece && (
                  <span
                    className={`
                      ${size !== "fill" ? pieceSizeClasses[size] : ""}
                      relative select-none leading-none z-20
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

                {/* Rank label (Inside squares, leftmost column only) */}
                {showCoordinates && file === rankLabelFile && (
                  <span className={`absolute ${rankLabelPos} text-[10px] font-bold leading-none select-none
                    ${isLight ? "text-board-dark/50" : "text-board-light/50"}`}>
                    {rank}
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Bottom coordinate bar (Center aligned file letters, 'd' is blank as in screenshot) */}
      {showCoordinates && (
        <div className="w-full h-6 bg-[#080b12] flex items-center text-[10px] font-bold select-none border-t border-board-border/30">
          <div className="grid grid-cols-8 w-full text-center">
            {files.map((file, idx) => {
              const isLastColumn = idx === 7;
              const label = file === "d" ? "" : file;
              return (
                <span key={file} className="relative inline-block text-foreground-subtle/70">
                  {label}
                  {isLastColumn && (
                    <span className="absolute right-2 bottom-0 text-[8px] opacity-70 text-foreground-subtle/70">
                      {flipped ? "8" : "1"}
                    </span>
                  )}
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChessBoardUI;