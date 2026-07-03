import { Game } from "./game";

export interface Invitation {
  _id: string;
  sender: {
    _id: string;
    username: string;
    rating: string;
  };
  reciever: string | null;
  status: "pending" | "accepted" | "declined" | "expired";
  preferredColor: "white" | "black" | "random";
  type: "direct" | "link";
  inviteCode: string | null;
  game: Game | string | null;
  expiresAt: string;
  timeControl: {
    type: "bullet" | "blitz" | "rapid" | "classical" | "custom";
    initialSeconds: number;
    incrementSeconds: number;
  };
  createdAt: string;
  updatedAt: string;
}
