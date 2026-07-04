import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Swords, Trophy, Clock, ChevronLeft, ArrowRight } from "lucide-react";
import Navbar from "../components/Navbar";
import { getInvitationByCodeService } from "@/services/invitationService";
import { Invitation } from "@/types/invitation";
import { useToast } from "@/hooks/use-toast";
import { useAppSelector } from "@/store/hooks";
import { useSocket } from "@/context/SocketContext";

const InviteLanding = () => {
  const { code } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user: currentUser } = useAppSelector((state) => state.auth);
  const { socket } = useSocket();

  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!code) return;
    getInvitationByCodeService(code)
      .then((data) => {
        setInvitation(data);
      })
      .catch((err: any) => {
        setError(err.response?.data?.message || "Invitation not found or expired");
      })
      .finally(() => setLoading(false));
  }, [code]);

  useEffect(() => {
    if (!socket) return;

    socket.on("invitation_accepted", (response) => {
      toast({
        title: "Challenge Accepted!",
        description: "Setting up the chessboard...",
      });
      const isWhite = response.game.whitePlayer.userId === currentUser?.id;
      const myColor = isWhite ? "white" : "black";
      const tcMinutes = response.invitation.timeControl?.initialSeconds 
        ? `${Math.round(response.invitation.timeControl.initialSeconds / 60)}m`
        : "none";

      navigate(`/game/${response.game._id}?color=${myColor}&time=${tcMinutes}`);
    });

    socket.on("error_message", (data) => {
      toast({
        title: "Failed to Accept",
        description: data.message,
        variant: "destructive",
      });
      setAccepting(false);
    });

    return () => {
      socket.off("invitation_accepted");
      socket.off("error_message");
    };
  }, [socket, currentUser, navigate]);

  const handleAccept = () => {
    if (!code || !socket) return;
    setAccepting(true);
    socket.emit("accept_invite_code", { inviteCode: code });
  };

  const displayTime = invitation?.timeControl?.initialSeconds
    ? `${Math.round(invitation.timeControl.initialSeconds / 60)} Minutes`
    : "Untimed (Casual)";

  return (
    <div className="min-h-screen bg-background flex flex-col justify-between">
      <Navbar />

      <main className="pt-24 pb-16 flex-grow flex items-center justify-center">
        <div className="max-w-md w-full px-4">
          <button
            onClick={() => navigate("/play")}
            className="flex items-center gap-2 text-foreground-muted hover:text-foreground text-sm font-semibold mb-6"
          >
            <ChevronLeft className="w-4 h-4" /> Cancel
          </button>

          <div className="card-glass border border-card-border/80 p-6 rounded-2xl shadow-2xl relative overflow-hidden text-center">
            <div className="absolute top-[-30%] left-[-20%] w-[70%] h-[70%] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />

            {loading ? (
              <div className="py-12">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-sm text-foreground-muted">Loading challenge details...</p>
              </div>
            ) : error ? (
              <div className="py-8">
                <div className="w-14 h-14 bg-destructive/10 text-destructive border border-destructive/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Swords className="w-7 h-7" />
                </div>
                <h2 className="text-lg font-bold text-foreground">Challenge Unavailable</h2>
                <p className="text-xs text-foreground-muted mt-2 px-4">{error}</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="w-16 h-16 bg-primary/10 text-primary border border-primary/20 rounded-2xl flex items-center justify-center mx-auto animate-bounce">
                  <Swords className="w-8 h-8" />
                </div>

                <div>
                  <h1 className="text-xl font-display font-extrabold tracking-tight text-foreground">
                    Chess Challenge Received!
                  </h1>
                  <p className="text-xs text-foreground-muted mt-1">
                    You have been challenged to a match.
                  </p>
                </div>

                {/* Sender Card */}
                <div className="bg-secondary/45 border border-border p-4 rounded-xl space-y-3">
                  <div className="flex items-center justify-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
                    <span className="font-semibold text-sm text-foreground">
                      {invitation?.sender.username || "Chess Master"}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/40 text-xs">
                    <div className="flex flex-col items-center">
                      <span className="text-[10px] text-foreground-muted uppercase font-bold tracking-wider mb-0.5">Rating</span>
                      <span className="font-bold text-primary flex items-center gap-1">
                        <Trophy className="w-3.5 h-3.5" />
                        {invitation?.sender.rating || 1200} ELO
                      </span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-[10px] text-foreground-muted uppercase font-bold tracking-wider mb-0.5">Time</span>
                      <span className="font-bold text-foreground flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {displayTime}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleAccept}
                  disabled={accepting}
                  className="w-full py-3.5 rounded-xl font-bold bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg active:scale-95 transition-all flex items-center justify-center gap-1.5"
                >
                  {accepting ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      Accept & Start Match <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default InviteLanding;