/**
 * Main chess board UI.
 * Handles rendering the board, pieces, and user moves.
 */

import { useState } from "react";

interface ChessBoardUIProps {
  size?: "sm" | "md" | "lg" | "xl";
  showCoordinates?: boolean;
  interactive?: boolean;
  position: Record<string, string | null>;
  highlightedSquares?: string[];
  selectedSquare?: string | null;
  kingInCheck?: string | null;
  kingInCheckmate?: string | null;
  onSquareClick?: (square: string) => void;
}

type PieceType =
  | "K"
  | "Q"
  | "R"
  | "B"
  | "N"
  | "P"
  | "k"
  | "q"
  | "r"
  | "b"
  | "n"
  | "p";

const pieceSymbols: Record<PieceType, string> = {
  K: "♔",
  Q: "♕",
  R: "♖",
  B: "♗",
  N: "♘",
  P: "♙",
  k: "♚",
  q: "♛",
  r: "♜",
  b: "♝",
  n: "♞",
  p: "♟",
};

const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
const ranks = ["8", "7", "6", "5", "4", "3", "2", "1"];

const sizeClasses = {
  sm: "w-48 h-48",
  md: "w-80 h-80",
  lg: "w-[400px] h-[400px]",
  xl: "w-[480px] h-[480px]",
};

const pieceSizeClasses = {
  sm: "text-xl",
  md: "text-3xl",
  lg: "text-4xl",
  xl: "text-5xl",
};

const ChessBoardUI = ({
  size = "lg",
  showCoordinates = true,
  interactive = true,
  position, // ✅ THIS WAS MISSING
  highlightedSquares = [],
  selectedSquare: controlledSelected,
  onSquareClick,
  kingInCheck,
  kingInCheckmate
}: ChessBoardUIProps) => {
  const [internalSelected, setInternalSelected] = useState<string | null>(null);
  const selectedSquare = controlledSelected ?? internalSelected;

  const handleSquareClick = (square: string) => {
    if (!interactive) return;

    if (onSquareClick) {
      onSquareClick(square);
    } else {
      setInternalSelected(selectedSquare === square ? null : square);
    }
  };

  const isLightSquare = (file: string, rank: string): boolean => {
    const fileIndex = files.indexOf(file);
    const rankIndex = ranks.indexOf(rank);
    return (fileIndex + rankIndex) % 2 === 0;
  };

  const isWhitePiece = (piece: PieceType): boolean => {
    return piece === piece.toUpperCase();
  };

  return (
    <div className="relative">
      {/* Board Container */}
      <div
        className={`${sizeClasses[size]} rounded-xl overflow-hidden border-4 border-board-border shadow-lg`}
        style={{
          boxShadow: "var(--shadow-lg), inset 0 2px 4px rgba(0,0,0,0.3)",
        }}
      >
        <div className="grid grid-cols-8 grid-rows-8 w-full h-full">
          {ranks.map((rank) =>
            files.map((file) => {
              const square = `${file}${rank}`;
              const piece = position[square];
              const isLight = isLightSquare(file, rank);
              const isSelected = selectedSquare === square;
              const isHighlighted = highlightedSquares.includes(square);
              const isCheckSquare = kingInCheck === square;
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
  ${isHighlighted ? "bg-primary/30" : ""}
  ${isCheckSquare ? "bg-red-500/40" : ""}
  ${isCheckmateSquare ? "bg-red-700 text-white" : ""}
  transition-all duration-150
`}
                >
                  {piece && (
                    <span
                      className={`
                        ${pieceSizeClasses[size]} select-none
                        ${isWhitePiece(piece as PieceType) ? "text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]" : "text-gray-900 drop-shadow-[0_1px_1px_rgba(255,255,255,0.3)]"}
                        ${interactive ? "hover:scale-110 transition-transform" : ""}
                      `}
                    >
                      {pieceSymbols[piece as PieceType]}
                    </span>
                  )}

                  {/* Coordinates */}
                  {showCoordinates && file === "a" && (
                    <span
                      className={`absolute left-0.5 top-0.5 text-[10px] font-medium ${isLight ? "text-board-dark/70" : "text-board-light/70"}`}
                    >
                      {rank}
                    </span>
                  )}
                  {showCoordinates && rank === "1" && (
                    <span
                      className={`absolute right-0.5 bottom-0.5 text-[10px] font-medium ${isLight ? "text-board-dark/70" : "text-board-light/70"}`}
                    >
                      {file}
                    </span>
                  )}
                </div>
              );
            }),
          )}
        </div>
      </div>
    </div>
  );
};

export default ChessBoardUI;