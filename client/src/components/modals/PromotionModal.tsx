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
    <div className="bg-[hsl(222,47%,9%)] border border-[hsl(222,30%,18%)] rounded-xl p-5 flex gap-4 shadow-2xl relative z-40">
      {pieces.map((p) => (
        <button
          key={p.id}
          onClick={() => onSelect(p.id as any)}
          className="text-5xl hover:scale-110 transition-all duration-150 text-foreground"
        >
          {p.label}
        </button>
      ))}
    </div>
  );
};

export default PromotionModal;
