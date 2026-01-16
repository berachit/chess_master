import { useState } from "react";

type Difficulty = "easy" | "intermediate" | "hard";
type ColorChoice = "white" | "black" | "random";

const BotGameModal = ({ onClose }: { onClose: () => void }) => {
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [color, setColor] = useState<ColorChoice>("random");

  const startGame = () => {
    console.log({
      difficulty,
      color,
    });

    // later:
    // navigate(`/play/bot?level=${difficulty}&color=${color}`);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card rounded-xl w-full max-w-md p-6">
        <h2 className="text-xl font-semibold mb-6">Play vs Bot</h2>

        {/* Difficulty */}
        <div className="mb-5">
          <p className="text-sm font-medium mb-2">Difficulty</p>
          <div className="grid grid-cols-3 gap-2">
            {["easy", "intermediate", "hard"].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setDifficulty(lvl as Difficulty)}
                className={`btn-secondary capitalize ${
                  difficulty === lvl ? "ring-2 ring-primary" : ""
                }`}
              >
                {lvl}
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
                className={`btn-secondary capitalize ${
                  color === c ? "ring-2 ring-primary" : ""
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="btn-secondary px-4 py-2 text-m"
          >
            Cancel
          </button>
          <button
            onClick={startGame}
            className="btn-primary px-4 py-2 text-m"
          >
            Start Game
          </button>
        </div>
      </div>
    </div>
  );
};

export default BotGameModal;
