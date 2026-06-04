import { useRef, useEffect } from "react";
import Navbar from "../components/Navbar";
import ChessBoardUI from "../components/ChessBoardUI";
import PromotionModal from "@/components/modals/PromotionModal";
import { useChessGame } from "@/hooks/useChessGame";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import {
  Clock, Crown,
  ChevronFirst, ChevronLeft, ChevronRight, ChevronLast,
  Flag, RefreshCcw, Trophy,
} from "lucide-react";

const gameData = {
  white: { name: "Magnus Carlsen",  rating: 2847, time: "4:32" },
  black: { name: "Hikaru Nakamura", rating: 2785, time: "5:15" },
};


interface PlayerRowProps {
  name: string; rating: number; time: string;
  isActive: boolean; isWhite: boolean; capturedPieces?: string[];
}

const PlayerRow = ({ name, rating, time, isActive, isWhite, capturedPieces = [] }: PlayerRowProps) => (
  <div
    className={`flex items-center justify-between px-3 py-2 rounded-xl border transition-all duration-300
      ${isActive
        ? "border-primary/50 bg-[hsl(222,47%,11%)] shadow-[0_0_14px_hsl(160,84%,39%,0.15)]"
        : "border-[hsl(222,30%,18%)] bg-[hsl(222,47%,9%)]"
      }`}
  >
    {/* Avatar + info */}
    <div className="flex items-center gap-2.5 min-w-0 flex-1">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 border-2
        ${isActive
          ? "border-primary bg-primary/20 text-primary"
          : "border-[hsl(222,30%,28%)] bg-[hsl(222,47%,15%)] text-foreground-muted"
        }`}>
        {name.charAt(0)}
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-1">
          <span className="font-semibold text-foreground text-sm truncate">{name}</span>
          {rating >= 2000 && <Crown className="w-3 h-3 text-warning shrink-0" />}
        </div>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className={`w-2 h-2 rounded-full shrink-0
            ${isWhite ? "bg-white border border-gray-400" : "bg-gray-700 border border-gray-500"}`} />
          <span className="text-xs text-foreground-muted">{rating} ELO</span>
        </div>
      </div>

      {/* Captured pieces (inline, desktop) */}
      {capturedPieces.length > 0 && (
        <div className="hidden sm:flex items-center ml-1 overflow-hidden">
          {capturedPieces.slice(0, 8).map((p, i) => (
            <span key={i} className="text-xs opacity-50 -ml-px first:ml-0 leading-none">{p}</span>
          ))}
          {capturedPieces.length > 8 && (
            <span className="text-[10px] text-foreground-muted ml-0.5">+{capturedPieces.length - 8}</span>
          )}
        </div>
      )}
    </div>

    {/* Timer */}
    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono font-bold text-sm
      min-w-[66px] justify-center shrink-0 ml-3
      ${isActive
        ? "bg-primary text-primary-foreground shadow-[0_0_10px_hsl(160,84%,39%,0.4)]"
        : "bg-[hsl(222,47%,15%)] text-foreground-muted"
      }`}>
      <Clock className="w-3.5 h-3.5 shrink-0" />
      {time}
    </div>
  </div>
);


interface MoveEntry { number: number; white: string; black?: string; }

const MovePanel = ({
  moves,
  activeIndex,
}: {
  moves: MoveEntry[];
  activeIndex: number;
}) => {
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!listRef.current) return;
    const active = listRef.current.querySelector("[data-active='true']") as HTMLElement | null;
    if (active) active.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [activeIndex]);

  const isWhiteActive = (rowIdx: number) => activeIndex === rowIdx * 2;
  const isBlackActive = (rowIdx: number) => activeIndex === rowIdx * 2 + 1;

  return (
  <div className="flex flex-col rounded-xl border border-[hsl(222,30%,18%)] bg-[hsl(222,47%,9%)] overflow-hidden flex-1 min-h-0">
    <div className="flex items-center justify-between px-3 py-2 border-b border-[hsl(222,30%,18%)] shrink-0">
      <span className="text-sm font-semibold text-foreground">Moves</span>
      <span className="text-xs text-foreground-muted">{moves.length} moves</span>
    </div>
    <div ref={listRef} className="flex-1 overflow-y-auto custom-scrollbar px-1.5 py-1">
      {moves.length === 0 ? (
        <div className="flex items-center justify-center py-6 text-foreground-muted text-xs">
          No moves yet
        </div>
      ) : (
        <div className="space-y-0.5">
          {moves.map((move, rowIdx) => {
            const wa = isWhiteActive(rowIdx);
            const ba = isBlackActive(rowIdx);
            return (
              <div
                key={move.number}
                data-active={wa || ba}
                className="flex items-center text-xs rounded-md"
              >
                <span className="w-7 text-right pr-1.5 text-foreground-subtle font-mono shrink-0 py-1">
                  {move.number}.
                </span>
                <button className={`flex-1 px-2 py-1 text-left rounded-md font-mono transition-colors
                  ${wa ? "bg-primary/25 text-primary font-bold" : "text-foreground hover:bg-[hsl(222,47%,15%)]"}`}>
                  {move.white}
                </button>
                <button disabled={!move.black}
                  className={`flex-1 px-2 py-1 text-left rounded-md font-mono transition-colors
                  ${ba ? "bg-primary/25 text-primary font-bold"
                    : !move.black ? "text-foreground-subtle cursor-default"
                    : "text-foreground hover:bg-[hsl(222,47%,15%)]"}`}>
                  {move.black || "..."}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  </div>
  );
};

const ControlsPanel = ({
  canGoBack = false, canGoForward = false,
  onFirst, onPrev, onNext, onLast, onDraw, onResign,
}: {
  canGoBack?: boolean; canGoForward?: boolean;
  onFirst?: () => void; onPrev?: () => void;
  onNext?: () => void; onLast?: () => void;
  onDraw?: () => void; onResign?: () => void;
}) => (
  <div className="rounded-xl border border-[hsl(222,30%,18%)] bg-[hsl(222,47%,9%)] p-2.5 space-y-2 shrink-0">
    <div className="flex items-center justify-center gap-1">
      {[
        { Icon: ChevronFirst, fn: onFirst, dis: !canGoBack,    t: "First" },
        { Icon: ChevronLeft,  fn: onPrev,  dis: !canGoBack,    t: "Prev"  },
        { Icon: ChevronRight, fn: onNext,  dis: !canGoForward, t: "Next"  },
        { Icon: ChevronLast,  fn: onLast,  dis: !canGoForward, t: "Last"  },
      ].map(({ Icon, fn, dis, t }) => (
        <button key={t} onClick={fn} disabled={dis} title={t}
          className="flex items-center justify-center w-9 h-8 rounded-lg
            bg-[hsl(222,47%,15%)] text-foreground-muted
            hover:bg-[hsl(222,47%,22%)] hover:text-foreground
            disabled:opacity-30 disabled:cursor-not-allowed transition-all">
          <Icon className="w-4 h-4" />
        </button>
      ))}
    </div>
    <div className="flex gap-2">
      <button onClick={onDraw}
        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold
          bg-[hsl(222,47%,15%)] text-foreground-muted border border-[hsl(222,30%,22%)]
          hover:border-primary/40 hover:text-foreground transition-all">
        <RefreshCcw className="w-3.5 h-3.5" /> Draw
      </button>
      <button onClick={onResign}
        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold
          bg-destructive/10 text-destructive border border-destructive/30
          hover:bg-destructive/20 transition-all">
        <Flag className="w-3.5 h-3.5" /> Resign
      </button>
    </div>
  </div>
);

const Game = () => {
  const { id } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const mode      = id === "bot" ? "bot" : "online";
  const level     = params.get("level") || "easy";
  const color     = (params.get("color") || "white") as "white" | "black";
  const isFlipped = color === "black";

  const {
    position, selectedSquare, highlightedSquares,
    handleSquareClick, promotePawn, promotionMove,
    moves, status, capturedPieces,
    goToFirst, goToPrev, goToNext, goToLast,
    canGoBack, canGoForward, activeIndex,
    turn,
    viewIndex,
    kingInCheck,
    kingInCheckmate,
    resign,
    declareDraw,
    resetGame,
    drawReason,
  } = useChessGame({ mode, level, playerColor: color });

  // Listen to keyboard arrow keys for navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      if (
        activeEl &&
        (activeEl.tagName === "INPUT" ||
          activeEl.tagName === "TEXTAREA" ||
          activeEl.isContentEditable)
      ) {
        return;
      }

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goToPrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        goToNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [goToPrev, goToNext]);

  const formattedMoves = moves.reduce((acc: MoveEntry[], move, i) => {
    if (i % 2 === 0) acc.push({ number: acc.length + 1, white: move.san });
    else acc[acc.length - 1].black = move.san;
    return acc;
  }, []);

  const topPlayer      = isFlipped ? gameData.white : gameData.black;
  const bottomPlayer   = isFlipped ? gameData.black : gameData.white;
  const topCaptured    = isFlipped ? capturedPieces.white : capturedPieces.black;
  const bottomCaptured = isFlipped ? capturedPieces.black : capturedPieces.white;

  const isTopActive    = (viewIndex !== -1 || !status.gameOver) && turn === (isFlipped ? "w" : "b");
  const isBottomActive = (viewIndex !== -1 || !status.gameOver) && turn === (!isFlipped ? "w" : "b");

  const boardProps = {
    size: "fill" as const,
    showCoordinates: true,
    interactive: viewIndex === -1 && !status.gameOver,
    flipped: isFlipped,
    position, selectedSquare, highlightedSquares,
    kingInCheck,
    kingInCheckmate,
    onSquareClick: handleSquareClick,
  };

  const shadow = "0 12px 40px hsl(222 47% 4% / 0.8), 0 0 0 1px hsl(222 30% 28% / 0.4)";

  const BS = "min(calc(100vh - 216px), calc(100vw - 316px))";

  const PromoOverlay = () => promotionMove ? (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <PromotionModal onSelect={promotePawn} />
    </div>
  ) : null;

  const GameEndOverlay = () => {
    if (!status.gameOver) return null;

    let title = "Game Over";
    let subtitle = "";
    
    if (status.resigned) {
      title = "Resigned";
      subtitle = "Game ended by resignation";
    } else if (status.checkmate) {
      title = "Checkmate!";
      const winnerColor = turn === "w" ? "Black" : "White";
      const userWon = (winnerColor.toLowerCase() === color);
      subtitle = userWon ? "You Win!" : `${winnerColor} Wins`;
    } else if (status.stalemate) {
      title = "Stalemate";
      subtitle = "Draw by stalemate";
    } else if (status.draw) {
      title = "Draw";
      subtitle = drawReason || "Game drawn by agreement";
    }

    return (
      <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-black/65 backdrop-blur-md animate-fade-in">
        <div className="bg-[hsl(222,47%,9%)] border border-[hsl(222,30%,18%)] rounded-2xl p-6 text-center max-w-sm w-[85%] shadow-2xl relative flex flex-col items-center gap-4 animate-slide-up">
          <div className={`w-14 h-14 rounded-full flex items-center justify-center border-2 
            ${status.checkmate && (turn !== (color === "white" ? "w" : "b")) 
              ? "border-primary bg-primary/20 text-primary shadow-[0_0_15px_rgba(20,184,166,0.2)]" 
              : "border-foreground-muted bg-secondary/40 text-foreground-muted"
            }`}
          >
            {status.checkmate && (turn !== (color === "white" ? "w" : "b")) ? (
              <Trophy className="w-7 h-7" />
            ) : (
              <Flag className="w-7 h-7" />
            )}
          </div>
          
          <div>
            <h2 className="text-2xl font-bold text-foreground tracking-tight">{title}</h2>
            <p className="text-sm text-foreground-muted mt-1">{subtitle}</p>
          </div>

          <div className="flex flex-col gap-2 w-full mt-2">
            <button
              onClick={resetGame}
              className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold transition-all duration-200
                bg-primary text-primary-foreground hover:scale-[1.02] active:scale-[0.98]
                shadow-[0_0_15px_rgba(20,184,166,0.3)] hover:shadow-[0_0_22px_rgba(20,184,166,0.4)]"
            >
              Rematch
            </button>
            <button
              onClick={() => navigate("/play")}
              className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold transition-all duration-200
                bg-[hsl(222,47%,15%)] text-foreground border border-[hsl(222,30%,22%)]
                hover:bg-[hsl(222,47%,22%)] hover:border-primary/30"
            >
              New Game
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div
        className="hidden md:flex items-center justify-center gap-3"
        style={{
          minHeight: "100vh",
          paddingTop: 76,       /* 64px navbar + 12px gap */
          paddingBottom: 12,
          paddingLeft: 12,
          paddingRight: 12,
        }}
      >
        {/* ── LEFT column: player info wrapping the board ── */}
        <div className="shrink-0 flex flex-col gap-2" style={{ width: BS }}>
          {/* Opponent (top) */}
          <PlayerRow
            name={topPlayer.name} rating={topPlayer.rating} time={topPlayer.time}
            isActive={isTopActive} isWhite={isFlipped} capturedPieces={topCaptured}
          />

          {/* Board */}
          <div
            className="relative rounded-2xl overflow-hidden border-4 border-[hsl(222,30%,22%)]"
            style={{ width: BS, height: BS, boxShadow: shadow }}
          >
            <ChessBoardUI {...boardProps} />
            <PromoOverlay />
            <GameEndOverlay />
          </div>

          {/* Player (bottom) */}
          <PlayerRow
            name={bottomPlayer.name} rating={bottomPlayer.rating} time={bottomPlayer.time}
            isActive={isBottomActive} isWhite={!isFlipped} capturedPieces={bottomCaptured}
          />
        </div>

        {/* ── RIGHT sidebar: moves + controls ── */}
        <div
          className="shrink-0 flex flex-col gap-2 self-stretch"
          style={{ width: 280 }}
        >
          {/* Move list — activeIndex highlights the viewed move */}
          <MovePanel moves={formattedMoves} activeIndex={activeIndex} />
          <ControlsPanel
            canGoBack={canGoBack} canGoForward={canGoForward}
            onFirst={goToFirst} onPrev={goToPrev} onNext={goToNext} onLast={goToLast}
            onDraw={declareDraw} onResign={resign}
          />
        </div>
      </div>

      <div
        className="md:hidden flex flex-col gap-2 px-3 pb-8"
        style={{ paddingTop: 76 }}
      >
        {/* Opponent */}
        <PlayerRow
          name={topPlayer.name} rating={topPlayer.rating} time={topPlayer.time}
          isActive={isTopActive} isWhite={isFlipped} capturedPieces={topCaptured}
        />

        {/* Board — full width, square */}
        <div
          className="relative w-full rounded-2xl overflow-hidden border-4 border-[hsl(222,30%,22%)]"
          style={{ aspectRatio: "1 / 1", boxShadow: shadow }}
        >
          <ChessBoardUI {...boardProps} />
          <PromoOverlay />
          <GameEndOverlay />
        </div>

        {/* Player */}
        <PlayerRow
          name={bottomPlayer.name} rating={bottomPlayer.rating} time={bottomPlayer.time}
          isActive={isBottomActive} isWhite={!isFlipped} capturedPieces={bottomCaptured}
        />

        {/* Move list */}
        <div style={{ height: 220 }} className="flex flex-col">
          <MovePanel moves={formattedMoves} activeIndex={activeIndex} />
        </div>

        {/* Controls */}
        <ControlsPanel
          canGoBack={canGoBack} canGoForward={canGoForward}
          onFirst={goToFirst} onPrev={goToPrev} onNext={goToNext} onLast={goToLast}
          onDraw={declareDraw} onResign={resign}
        />
      </div>
    </div>
  );
};

export default Game;
