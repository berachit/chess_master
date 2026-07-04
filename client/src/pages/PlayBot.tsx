import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bot, Zap, Trophy, Flame, ChevronLeft } from "lucide-react";
import Navbar from "../components/Navbar";

import { playSound } from "@/utils/sound";

type Difficulty = "easy" | "intermediate" | "hard" | "impossible";
type ColorChoice = "white" | "black" | "random";

const BOT_LEVELS = {
  easy: {
    label: "PawnSlayer",
    elo: 800,
    desc: "Good for beginners",
    icon: Zap,
    color: "text-emerald-400",
  },
  intermediate: {
    label: "KnightRider",
    elo: 1400,
    desc: "A steady challenger",
    icon: Bot,
    color: "text-blue-400",
  },
  hard: {
    label: "EndgameKing",
    elo: 2000,
    desc: "Positional master",
    icon: Trophy,
    color: "text-amber-400",
  },
  impossible: {
    label: "Stockfish",
    elo: 3200,
    desc: "The ultimate engine",
    icon: Flame,
    color: "text-rose-500 font-extrabold shadow-[0_0_10px_rgba(239,68,68,0.2)]",
  },
} as const;

const PlayBot = () => {
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [color, setColor] = useState<ColorChoice>("random");

  const navigate = useNavigate();

  const handleStartGame = () => {
    const finalColor =
      color === "random" ? (Math.random() < 0.5 ? "white" : "black") : color;

    try {
      playSound("gameStart");
    } catch (e) {
      console.warn("Sound failed:", e);
    }

    navigate(
      `/game/bot?level=${difficulty}&color=${finalColor}&time=none`,
    );
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-between">
      <Navbar />

      <main className="pt-24 pb-16 flex-grow flex items-center justify-center">
        <div className="max-w-xl w-full px-4">
          {/* Back Link */}
          <button
            onClick={() => navigate("/play")}
            className="flex items-center gap-2 text-foreground-muted hover:text-foreground text-sm font-semibold mb-6 transition-all active:scale-95"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Play Choices
          </button>

          {/* Premium Card */}
          <div className="card-glass border border-card-border/80 p-4 sm:p-6 md:p-8 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden animate-fade-in">
            {/* Ambient Background Glows */}
            <div className="absolute top-[-30%] left-[-20%] w-[70%] h-[70%] rounded-full bg-primary/15 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-30%] right-[-20%] w-[70%] h-[70%] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />

            <div className="relative z-10">
              {/* Header */}
              <div className="mb-6 sm:mb-8">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-display font-extrabold tracking-tight text-foreground bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                  Challenge the Bot 🤖
                </h1>
                <p className="text-xs sm:text-sm text-foreground-muted mt-1.5 font-medium">
                  Configure your game controls and match up against our engine
                  personalities.
                </p>
              </div>

              {/* Bot selection */}
              <div className="mb-6">
                <label className="text-[10px] sm:text-xs font-bold text-foreground-muted tracking-widest uppercase block mb-3">
                  1. Choose Your Opponent
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Object.entries(BOT_LEVELS).map(([key, lvl]) => {
                    const IconComp = lvl.icon;
                    const isSelected = difficulty === key;

                    const badgeStyles = {
                      easy: "bg-emerald-950/40 text-emerald-400 border-emerald-500/20",
                      intermediate:
                        "bg-blue-950/40 text-blue-400 border-blue-500/20",
                      hard: "bg-amber-950/40 text-amber-400 border-amber-500/20",
                      impossible:
                        "bg-rose-950/40 text-rose-400 border-rose-500/20 shadow-[0_0_10px_rgba(244,63,94,0.1)]",
                    }[key as Difficulty];

                    return (
                      <button
                        key={key}
                        onClick={() => setDifficulty(key as Difficulty)}
                        className={`flex items-center gap-3 p-3 rounded-xl text-left border transition-all duration-300
                          active:scale-95 hover:scale-[1.01] group
                          ${
                            isSelected
                              ? "bg-primary/10 border-primary shadow-[0_0_15px_hsl(160,84%,39%,0.15)]"
                              : "bg-slate-900/40 border-border/60 hover:bg-slate-900/70 hover:border-border/80"
                          }`}
                      >
                        <div
                          className={`p-2 rounded-lg border transition-transform duration-300 group-hover:scale-110 shrink-0
                          ${
                            isSelected
                              ? "bg-primary/20 border-primary text-primary"
                              : "bg-slate-800 border-border/80 text-foreground-muted"
                          }`}
                        >
                          <IconComp className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-bold text-xs sm:text-sm text-foreground truncate">
                              {lvl.label}
                            </span>
                            <span
                              className={`text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded font-mono font-bold border ${badgeStyles}`}
                            >
                              {lvl.elo}
                            </span>
                          </div>
                          <span className="text-[9px] sm:text-[10px] text-foreground-muted mt-0.5 block truncate font-medium">
                            {lvl.desc}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Color choice */}
              <div className="mb-6">
                <label className="text-[10px] sm:text-xs font-bold text-foreground-muted tracking-widest uppercase block mb-3">
                  2. Choose Color
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {(["white", "random", "black"] as ColorChoice[]).map((c) => {
                    const isSelected = color === c;
                    return (
                      <button
                        key={c}
                        onClick={() => setColor(c)}
                        className={`flex flex-col items-center justify-center p-3 rounded-xl border capitalize transition-all duration-300 active:scale-95 hover:scale-[1.02]
                          ${
                            isSelected
                              ? "border-primary bg-primary/10 text-primary shadow-[0_0_15px_hsl(160,84%,39%,0.15)] font-bold text-xs"
                              : "border-border/60 bg-slate-900/40 text-foreground-muted hover:border-border/80 hover:text-foreground hover:bg-slate-900/60 text-xs font-semibold"
                          }`}
                      >
                        {/* Circle Indicator */}
                        <div className="mb-2 flex items-center justify-center">
                          {c === "white" && (
                            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white border border-slate-300 shadow-[0_0_10px_rgba(255,255,255,0.5)] animate-fade-in" />
                          )}
                          {c === "black" && (
                            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#1e293b] border border-slate-650 shadow-[0_0_10px_rgba(0,0,0,0.5)] animate-fade-in" />
                          )}
                          {c === "random" && (
                            <div 
                              className="w-6 h-6 sm:w-7 sm:h-7 rounded-full border border-slate-500 shadow-md animate-fade-in"
                              style={{ background: "linear-gradient(90deg, #ffffff 50%, #1e293b 50%)" }}
                            />
                          )}
                        </div>
                        <span className="text-[10px] sm:text-xs font-semibold">
                          {c}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={handleStartGame}
                className="w-full mt-8 py-4 rounded-xl font-bold bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white tracking-wide text-center shadow-[0_4px_20px_rgba(20,184,166,0.3)] hover:shadow-[0_4px_30px_rgba(20,184,166,0.5)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
              >
                Start Game vs {BOT_LEVELS[difficulty].label}
              </button>
            </div>
          </div>
        </div>
      </main>


    </div>
  );
};

export default PlayBot;
