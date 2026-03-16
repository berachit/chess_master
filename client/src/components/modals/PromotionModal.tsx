/**
 * Appears when pawn reaches last rank.
 */

interface Props {
  onSelect: (piece: "q" | "r" | "b" | "n") => void;
}

const pieces = [
  { id: "q", label: "♕" },
  { id: "r", label: "♖" },
  { id: "b", label: "♗" },
  { id: "n", label: "♘" },
];

const PromotionModal = ({ onSelect }: Props) => {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-background rounded-xl p-6 flex gap-4">
        {pieces.map((p) => (
          <button
            key={p.id}
            onClick={() => onSelect(p.id as any)}
            className="text-5xl hover:scale-110 transition"
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default PromotionModal;
