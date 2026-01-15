import { 
  Flag, 
  RefreshCcw, 
  ChevronFirst, 
  ChevronLast, 
  ChevronLeft, 
  ChevronRight,
  MessageCircle,
  Settings
} from 'lucide-react';

interface GameControlsProps {
  onResign?: () => void;
  onOfferDraw?: () => void;
  onFirst?: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
  onLast?: () => void;
  canGoBack?: boolean;
  canGoForward?: boolean;
}

const GameControls = ({
  onResign,
  onOfferDraw,
  onFirst,
  onPrevious,
  onNext,
  onLast,
  canGoBack = true,
  canGoForward = false,
}: GameControlsProps) => {
  return (
    <div className="card p-4">
      <div className="flex flex-col gap-4">
        {/* Navigation Controls */}
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={onFirst}
            disabled={!canGoBack}
            className="btn-icon disabled:opacity-30"
            title="First move"
          >
            <ChevronFirst className="w-5 h-5" />
          </button>
          <button
            onClick={onPrevious}
            disabled={!canGoBack}
            className="btn-icon disabled:opacity-30"
            title="Previous move"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={onNext}
            disabled={!canGoForward}
            className="btn-icon disabled:opacity-30"
            title="Next move"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <button
            onClick={onLast}
            disabled={!canGoForward}
            className="btn-icon disabled:opacity-30"
            title="Last move"
          >
            <ChevronLast className="w-5 h-5" />
          </button>
        </div>

        {/* Game Actions */}
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={onOfferDraw}
            className="btn-secondary btn-sm flex-1"
            title="Offer draw"
          >
            <RefreshCcw className="w-4 h-4" />
            <span className="hidden sm:inline">Draw</span>
          </button>
          <button
            onClick={onResign}
            className="px-4 py-2 rounded-lg bg-destructive/10 text-destructive border border-destructive/30 hover:bg-destructive/20 transition-colors flex items-center gap-2 flex-1 justify-center text-sm font-semibold"
            title="Resign"
          >
            <Flag className="w-4 h-4" />
            <span className="hidden sm:inline">Resign</span>
          </button>
        </div>

        {/* Additional Actions */}
        <div className="flex items-center justify-center gap-2 pt-2 border-t border-border">
          <button className="btn-ghost btn-sm flex-1" title="Chat">
            <MessageCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Chat</span>
          </button>
          <button className="btn-ghost btn-sm flex-1" title="Settings">
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameControls;
