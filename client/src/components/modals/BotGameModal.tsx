/**
 * Modal for starting a game vs AI bot.
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { playSound } from "@/utils/sound";

type Difficulty = "easy" | "intermediate" | "hard" | "impossible";
type ColorChoice = "white" | "black" | "random";
const BOT_LEVELS = {
  easy: { label: "PawnSlayer", elo: 800 },
  intermediate: { label: "KnightRider", elo: 1400 },
  hard: { label: "EndgameKing", elo: 2000 },
  impossible: { label: "Stockfish", elo: 3200 },
} as const;

const BotGameModal = ({ onClose }: { onClose: () => void }) => {
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [color, setColor] = useState<ColorChoice>("random");

  const navigate = useNavigate();

  const startGame = () => {
    const finalColor =
      color === "random" ? (Math.random() < 0.5 ? "white" : "black") : color;

    try {
      playSound("gameStart");
    } catch (e) {
      console.warn("Sound failed:", e);
    }

    navigate(`/game/bot?level=${difficulty}&color=${finalColor}`);
    onClose(); //  close modal after start
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card rounded-xl w-full max-w-md p-6">
        <h2 className="text-xl font-semibold mb-6">Challenge the Bot 🤖</h2>

        {/* Difficulty */}
        <div className="mb-5">
          <p className="text-sm font-medium mb-2">Difficulty</p>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(BOT_LEVELS).map(([key, value]) => (
              <button
                key={key}
                onClick={() => setDifficulty(key as Difficulty)}
                className={`
  p-4 rounded-xl transition-all
  bg-slate-800 hover:bg-slate-700
  active:scale-95
  flex flex-col items-center justify-center
  ${difficulty === key ? "ring-2 ring-emerald-400 scale-[1.02]" : ""}
${key === "impossible" ? " shadow-[0_0_10px_rgba(255,0,0,0.3)]" : ""}
`}
              >
                {/* Label */}
                <span className="text-base font-semibold">{value.label}</span>

                {/* ELO BELOW */}
                <span className="text-xs opacity-60 mt-1 tracking-wide">
                  {value.elo} ELO
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Color Choice */}
        <div className="mb-6">
          <p className="text-sm font-medium mb-2">Choose Your Pieces</p>
          <div className="grid grid-cols-3 gap-2">
            {["white", "black", "random"].map((c) => (
              <button
                key={c}
                onClick={() => setColor(c as ColorChoice)}
                className={`btn-secondary capitalize ${color === c ? "ring-2 ring-primary" : ""
                  }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="btn-secondary px-4 py-2 text-m">
            Cancel
          </button>
          <button onClick={startGame} className="btn-primary px-4 py-2 text-m">
            Start Game
          </button>
        </div>
      </div>
    </div>
  );
};

export default BotGameModal;
