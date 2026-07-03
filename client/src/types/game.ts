export interface PlayerSnapShot {
  userId: string;
  username: string;
  ratingBefore: number;
  ratingAfter: number;
}

export interface TimeControlConfig {
  type: "bullet" | "blitz" | "rapid" | "classical" | "custom";
  initialSeconds: number;
  incrementSeconds: number;
}

export interface Game {
  _id: string;
  whitePlayer: PlayerSnapShot;
  blackPlayer: PlayerSnapShot;
  winnerUserId: string | null;
  initialFen: null;
  currentFen: null;
  moves: string[];
  pgn: string;
  status: "waiting" | "ongoing" | "finished" | "abandoned";
  result?: "white_win" | "black_win" | "draw" | "aborted";
  resultReason?:
    | "checkmate"
    | "resignation"
    | "timeout"
    | "stalemate"
    | "draw_agreement"
    | "insufficient_material"
    | "threefold_repetition"
    | "fifty_move_rule"
    | "aborted"
    | "disconnect_timeout";
  turn: "w" | "b";
  timeControl: TimeControlConfig;
  startedAt?: string;
  endedAt?: string;
  whiteTimeRemaining: number;
  blackTimeRemaining: number;
  lastMoveAt?: string;
  drawOfferedBy?: string | null;
  createdAt: string;
  updatedAt: string;
}
