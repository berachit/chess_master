import { AlertCircle, CheckCircle, Clock, XCircle, Trophy } from 'lucide-react';

export type GameStatus = 'playing' | 'check' | 'checkmate' | 'stalemate' | 'draw' | 'timeout' | 'resigned';

interface StatusBannerProps {
  status: GameStatus;
  winner?: 'white' | 'black' | null;
  playerColor?: 'white' | 'black';
}

const statusConfig: Record<GameStatus, {
  icon: React.ElementType;
  label: string;
  className: string;
}> = {
  playing: {
    icon: Clock,
    label: 'Game in Progress',
    className: 'bg-primary/10 text-primary border-primary/30',
  },
  check: {
    icon: AlertCircle,
    label: 'Check!',
    className: 'bg-warning/10 text-warning border-warning/30',
  },
  checkmate: {
    icon: Trophy,
    label: 'Checkmate!',
    className: 'bg-success/10 text-success border-success/30',
  },
  stalemate: {
    icon: CheckCircle,
    label: 'Stalemate - Draw',
    className: 'bg-muted text-foreground-muted border-border',
  },
  draw: {
    icon: CheckCircle,
    label: 'Game Drawn',
    className: 'bg-muted text-foreground-muted border-border',
  },
  timeout: {
    icon: XCircle,
    label: 'Time Out',
    className: 'bg-destructive/10 text-destructive border-destructive/30',
  },
  resigned: {
    icon: XCircle,
    label: 'Resigned',
    className: 'bg-destructive/10 text-destructive border-destructive/30',
  },
};

const StatusBanner = ({ status, winner, playerColor }: StatusBannerProps) => {
  const config = statusConfig[status];
  const Icon = config.icon;

  const getWinnerText = () => {
    if (!winner) return '';
    if (winner === playerColor) return 'You Win!';
    return `${winner.charAt(0).toUpperCase() + winner.slice(1)} Wins`;
  };

  return (
    <div className={`
      flex items-center justify-center gap-2 px-4 py-3 rounded-lg border
      ${config.className}
      animate-fade-in
    `}>
      <Icon className="w-5 h-5" />
      <span className="font-semibold">
        {config.label}
        {winner && (
          <span className="ml-2 font-display">
            — {getWinnerText()}
          </span>
        )}
      </span>
    </div>
  );
};

export default StatusBanner;
