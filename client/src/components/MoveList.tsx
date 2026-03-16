/**
 * Shows the history of moves.
 */

interface Move {
  number: number;
  white: string;
  black?: string;
}

interface MoveListProps {
  moves: Move[];
  currentMove?: number;
  onMoveClick?: (moveNumber: number, isWhite: boolean) => void;
}

const MoveList = ({ moves, currentMove, onMoveClick }: MoveListProps) => {
  const handleMoveClick = (moveNumber: number, isWhite: boolean) => {
    if (onMoveClick) {
      onMoveClick(moveNumber, isWhite);
    }
  };

  return (
    <div className="card p-4 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 pb-3 border-b border-border">
        <h3 className="font-display font-semibold text-foreground">Moves</h3>
        <span className="text-xs text-foreground-muted">{moves.length} moves</span>
      </div>

      {/* Move List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {moves.length === 0 ? (
          <div className="flex items-center justify-center h-full text-foreground-muted text-sm">
            No moves yet
          </div>
        ) : (
          <div className="space-y-1">
            {moves.map((move) => (
              <div
                key={move.number}
                className="flex items-center text-sm rounded-lg hover:bg-secondary/50 transition-colors"
              >
                {/* Move Number */}
                <span className="w-8 text-foreground-subtle font-mono text-xs text-right pr-2">
                  {move.number}.
                </span>

                {/* White's Move */}
                <button
                  onClick={() => handleMoveClick(move.number, true)}
                  className={`
                    flex-1 px-2 py-1.5 text-left rounded-l-md font-mono transition-colors
                    ${currentMove === move.number * 2 - 1 
                      ? 'bg-primary/20 text-primary' 
                      : 'text-foreground hover:bg-secondary'
                    }
                  `}
                >
                  {move.white}
                </button>

                {/* Black's Move */}
                <button
                  onClick={() => handleMoveClick(move.number, false)}
                  disabled={!move.black}
                  className={`
                    flex-1 px-2 py-1.5 text-left rounded-r-md font-mono transition-colors
                    ${!move.black 
                      ? 'text-foreground-subtle cursor-default' 
                      : currentMove === move.number * 2 
                        ? 'bg-primary/20 text-primary' 
                        : 'text-foreground hover:bg-secondary'
                    }
                  `}
                >
                  {move.black || '...'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MoveList;
