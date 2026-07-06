import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Link as LinkIcon,
  Copy,
  ArrowRight,
  Sparkles,
  Check,
  ChevronLeft,
} from "lucide-react";
import Navbar from "../components/Navbar";
import { useSocket } from "@/context/SocketContext";
import { useToast } from "@/hooks/use-toast";
import { createInvitationService } from "@/services/invitationService";

type ColorChoice = "white" | "black" | "random";
type TimeChoice = "1m" | "3m" | "5m" | "10m" | "30m" | "stopwatch" | "none";

const TIME_CONTROLS = [
  { id: "1m", label: "1 Min", desc: "Bullet ⚡" },
  { id: "3m", label: "3 Min", desc: "Blitz ⏰" },
  { id: "5m", label: "5 Min", desc: "Blitz ⏰" },
  { id: "10m", label: "10 Min", desc: "Rapid ⏳" },
  { id: "30m", label: "30 Min", desc: "Classical 📋" },
  { id: "stopwatch", label: "Stopwatch", desc: "Count Up ⏱️" },
  { id: "none", label: "Untimed", desc: "Casual ♾️" },
];

const PlayPrivate = () => {
  const [color, setColor] = useState<ColorChoice>("random");
  const [timeControl, setTimeControl] = useState<TimeChoice>("5m");
  const [roomCode, setRoomCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { socket } = useSocket();
  const { toast } = useToast();

  const parseTimeControl = (tc: string) => {
    if (tc === "none" || tc === "stopwatch") {
      return { type: "custom" as const, initialSeconds: 0 };
    }
    const match = tc.match(/^(\d+)m$/);
    const mins = match ? parseInt(match[1], 10) : 5;
    let type: "bullet" | "blitz" | "rapid" | "classical" = "blitz";
    if (mins <= 2) type = "bullet";
    else if (mins <= 9) type = "blitz";
    else if (mins <= 29) type = "rapid";
    else type = "classical";
    return { type, initialSeconds: mins * 60 };
  };

  const generateRoomCode = async () => {
    setLoading(true);
    try {
      const invPayload = {
        type: "link" as const,
        preferredColor: color,
        timeControl: parseTimeControl(timeControl),
      };

      const invitation = await createInvitationService(invPayload);
      setRoomCode(invitation.inviteCode);
      setCopied(false);
    } catch (error: any) {
      toast({
        title: "Challenge Failed",
        description: error.message || "Failed to generate the challenge link",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!socket || !roomCode) return;

    const handleGameCreated = (data: any) => {
      console.log("Game Created from invite: ", data);
      toast({
        title: "Match Accepted!",
        description:
          "Your opponent has accepted the challenge. Initializing...",
      });
      navigate(
        `/game/${data.gameId}?color=${color === "random" ? "white" : color}&time=${timeControl}`,
      );
    };

    socket.on("game_created", handleGameCreated);

    return () => {
      socket.off("game_created", handleGameCreated);
    };
  }, [socket, roomCode, navigate, color, timeControl]);

  const shareUrl = `${window.location.origin}/invite/${roomCode}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  const handleJoin = () => {
    const finalColor =
      color === "random" ? (Math.random() < 0.5 ? "white" : "black") : color;
    navigate(
      `/game/private?room=${roomCode}&color=${finalColor}&time=${timeControl}`,
    );
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="pt-8 pb-16 flex-grow flex justify-center">
        <div className="max-w-xl w-full px-4">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-foreground-muted hover:text-foreground text-sm font-semibold mb-6 transition-all active:scale-95"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Home
          </button>
          <div className="card-glass border border-card-border/80 p-4 sm:p-6 md:p-8 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden animate-fade-in">
            <div className="absolute top-[-30%] left-[-20%] w-[70%] h-[70%] rounded-full bg-primary/15 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-30%] right-[-20%] w-[70%] h-[70%] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />
            <div className="relative z-10">
              <div className="mb-6 sm:mb-8">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-display font-extrabold tracking-tight text-foreground bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent flex items-center gap-2">
                  Play vs Friend <LinkIcon className="w-6 h-6 text-primary" />
                </h1>
                <p className="text-xs sm:text-sm text-foreground-muted mt-1.5 font-medium">
                  Generate a challenge link, send it to a friend, and play.
                </p>
              </div>
              <div className="mb-6">
                <label className="text-[10px] sm:text-xs font-bold text-foreground-muted tracking-widest uppercase block mb-3">
                  1. Choose Your Color
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
                        <div className="mb-2 flex items-center justify-center">
                          {c === "white" && (
                            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white border border-slate-300 shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
                          )}
                          {c === "black" && (
                            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#1e293b] border border-slate-650 shadow-[0_0_10px_rgba(0,0,0,0.5)]" />
                          )}
                          {c === "random" && (
                            <div
                              className="w-6 h-6 sm:w-7 sm:h-7 rounded-full border border-slate-500 shadow-md"
                              style={{
                                background:
                                  "linear-gradient(90deg, #ffffff 50%, #1e293b 50%)",
                              }}
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
              <div className="mb-8">
                <label className="text-[10px] sm:text-xs font-bold text-foreground-muted tracking-widest uppercase block mb-3">
                  2. Choose Time Control
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {TIME_CONTROLS.map((tc) => {
                    const isSelected = timeControl === tc.id;
                    return (
                      <button
                        key={tc.id}
                        onClick={() => setTimeControl(tc.id as TimeChoice)}
                        className={`flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all duration-300 active:scale-95 hover:scale-[1.02]
                          ${
                            isSelected
                              ? "border-primary bg-primary/10 text-primary shadow-[0_0_12px_hsl(160,84%,39%,0.15)] font-bold"
                              : "border-border/60 bg-slate-900/40 text-foreground-muted hover:border-border/80 hover:text-foreground hover:bg-slate-900/60"
                          }`}
                      >
                        <span className="text-xs font-bold font-mono">
                          {tc.label}
                        </span>
                        <span className="text-[9px] sm:text-[10px] text-foreground-muted mt-0.5 font-medium truncate">
                          {tc.desc}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
              {!roomCode ? (
                <button
                  onClick={generateRoomCode}
                  disabled={loading}
                  className="w-full py-4 rounded-xl font-bold bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white tracking-wide text-center shadow-[0_4px_20px_rgba(20,184,166,0.3)] hover:shadow-[0_4px_30px_rgba(20,184,166,0.5)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 animate-pulse" /> Generate
                      Challenge Link
                    </>
                  )}
                </button>
              ) : (
                <div className="space-y-4 bg-slate-900/50 border border-border p-4 rounded-xl animate-slide-up">
                  <div>
                    <span className="text-xs text-foreground-muted font-bold tracking-wider uppercase">
                      Challenge Link Generated
                    </span>
                    <div className="flex flex-col sm:flex-row gap-2 mt-2">
                      <input
                        type="text"
                        readOnly
                        value={shareUrl}
                        placeholder="Challenge link"
                        title="Challenge link to share with your friend"
                        className="flex-grow text-xs px-3 py-2.5 bg-input border border-border rounded-lg text-foreground outline-none select-all font-mono min-w-0"
                        aria-label="Challenge link"
                      />
                      <button
                        onClick={handleCopy}
                        className={`w-full sm:w-auto px-4 py-2.5 text-xs font-bold rounded-lg border flex items-center justify-center gap-1.5 transition-all active:scale-95 shrink-0
                          ${
                            copied
                              ? "border-success bg-success/15 text-success"
                              : "border-border bg-slate-800 hover:bg-slate-700 text-foreground"
                          }`}
                      >
                        {copied ? (
                          <Check className="w-3.5 h-3.5" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                        {copied ? "Copied" : "Copy"}
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2.5 border-t border-border/45">
                    <div className="flex items-center justify-between sm:justify-start w-full sm:w-auto">
                      <span className="text-[10px] text-foreground-muted font-bold uppercase tracking-wider">
                        Room Code:
                      </span>
                      <span className="text-sm font-bold text-primary font-mono ml-1.5 tracking-wider">
                        {roomCode}
                      </span>
                    </div>
                    <button
                      onClick={handleJoin}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-lg font-bold text-xs bg-gradient-to-r from-emerald-500 to-teal-600 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-1 shadow-md hover:shadow-primary/20 text-white"
                    >
                      Join Room & Play <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
export default PlayPrivate;
