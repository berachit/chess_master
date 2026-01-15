import { Crown, Clock } from 'lucide-react';

interface PlayerPanelProps {
  name: string;
  rating: number;
  avatar?: string;
  time: string;
  isActive: boolean;
  isWhite: boolean;
  capturedPieces?: string[];
}

const PlayerPanel = ({
  name,
  rating,
  avatar,
  time,
  isActive,
  isWhite,
  capturedPieces = [],
}: PlayerPanelProps) => {
  return (
    <div className={`
      card p-4 flex items-center justify-between
      ${isActive ? 'border-primary/50 shadow-glow' : ''}
      transition-all duration-300
    `}>
      {/* Player Info */}
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className={`
          relative w-12 h-12 rounded-xl overflow-hidden
          ${avatar ? '' : 'bg-gradient-to-br from-secondary to-secondary/50'}
          border-2 ${isActive ? 'border-primary' : 'border-border'}
        `}>
          {avatar ? (
            <img src={avatar} alt={name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-xl font-bold text-foreground-muted">
                {name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          {/* Online indicator */}
          {isActive && (
            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-success border-2 border-card animate-pulse" />
          )}
        </div>

        {/* Name & Rating */}
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground">{name}</span>
            {rating >= 2000 && (
              <Crown className="w-4 h-4 text-warning" />
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-foreground-muted">
            <span className={`
              w-3 h-3 rounded-full
              ${isWhite ? 'bg-white border border-gray-300' : 'bg-gray-800 border border-gray-600'}
            `} />
            <span>{rating} ELO</span>
          </div>
        </div>
      </div>

      {/* Timer & Captured */}
      <div className="flex items-center gap-4">
        {/* Captured Pieces */}
        {capturedPieces.length > 0 && (
          <div className="flex items-center -space-x-1">
            {capturedPieces.slice(0, 5).map((piece, i) => (
              <span key={i} className="text-lg opacity-60">{piece}</span>
            ))}
            {capturedPieces.length > 5 && (
              <span className="text-xs text-foreground-muted ml-1">+{capturedPieces.length - 5}</span>
            )}
          </div>
        )}

        {/* Timer */}
        <div className={`
          flex items-center gap-2 px-4 py-2 rounded-lg font-mono font-bold text-lg
          ${isActive 
            ? 'bg-primary text-primary-foreground' 
            : 'bg-secondary text-foreground-muted'
          }
        `}>
          <Clock className="w-4 h-4" />
          {time}
        </div>
      </div>
    </div>
  );
};

export default PlayerPanel;
