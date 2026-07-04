import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Users, ShieldAlert, Sparkles, ChevronLeft } from "lucide-react";
import Navbar from "../components/Navbar";
import { playSound } from "@/utils/sound";
import { useSocket } from "@/context/SocketContext";
import { useAppSelector } from "@/store/hooks";
import { useToast } from "@/hooks/use-toast";

type TimeChoice = "1m" | "3m" | "5m" | "10m" | "30m" | "stopwatch";

const TIME_CONTROLS = [
  { id: "1m", label: "1 Min", desc: "Bullet ⚡" },
  { id: "3m", label: "3 Min", desc: "Blitz ⏰" },
  { id: "5m", label: "5 Min", desc: "Blitz ⏰" },
  { id: "10m", label: "10 Min", desc: "Rapid ⏳" },
  { id: "30m", label: "30 Min", desc: "Classical 📋" },
  { id: "stopwatch", label: "Stopwatch", desc: "Count Up ⏱️" },
];

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

const PlayOnline = () => {
  const [timeControl, setTimeControl] = useState<TimeChoice>("5m");
  const [isSearching, setIsSearching] = useState(false);
  const [searchStep, setSearchStep] = useState(0);

  const navigate = useNavigate();
  const { socket, isConnected } = useSocket();
  const { user } = useAppSelector((state) => state.auth);
  const { toast } = useToast();

  const searchStepsTexts = [
    "Connecting to matchmaker...",
    "Finding players in your ELO bracket...",
    "Matching ELO profiles...",
    "Securing game room server...",
    "Opponent found! Initializing board...",
  ];

  useEffect(() => {
    if (!isSearching) return;

    const interval = setInterval(() => {
      setSearchStep((prev) => {
        if (prev < searchStepsTexts.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [isSearching, navigate, timeControl]);

  // connecting socket listeners
  useEffect(() => {
    if (!socket || !isSearching) return;

    socket.on("queue_joined", (data) => {
      console.log("Queue joined: ", data);
    });

    socket.on("match_found", (data) => {
      console.log("Match Found: ", data);
      setIsSearching(false);
      const isWhite = data.game.whitePlayer.userId === user?.id;
      const assignedColour = isWhite ? "white" : "black";
      try {
        playSound("gameStart");
      } catch (e) {
        console.warn("Sound failed:", e);
      }
      navigate(
        `/game/${data.game._id}?color=${assignedColour}&time=${timeControl}`,
      );
    });

    socket.on("error_message", (data) => {
      toast({
        title: "Matchmaking Error",
        description: data.message,
        variant: "destructive",
      });
      setIsSearching(false);
    });

    return () => {
      socket.off("queue_joined");
      socket.off("match_found");
      socket.off("error_message");
    };
  }, [socket, isSearching, navigate, user, timeControl]);

  const handleFindOpponent = () => {
    if(!socket || !isConnected){
      toast({
        title: "Connection Offline",
        description:"Websocket connection not established. Retrying...",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    setSearchStep(0);
    socket.emit("join_queue", { timeControl: parseTimeControl(timeControl) });
  };

  const handleCancelSearch = () => {
    if(socket){
      socket.emit("leave_queue");
    }
    setIsSearching(false);
  }

  return (
    <div className="min-h-screen bg-background flex flex-col justify-between">
      <Navbar />
      <main className="pt-24 pb-16 flex-grow flex items-center justify-center">
        <div className="max-w-xl w-full px-4">
          <button
            onClick={() => navigate("/play")}
            disabled={isSearching}
            className="flex items-center gap-2 text-foreground-muted hover:text-foreground text-sm font-semibold mb-6 transition-all active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Play Choices
          </button>
          <div className="card-glass border border-card-border/80 p-4 sm:p-6 md:p-8 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden animate-fade-in">
            <div className="absolute top-[-30%] left-[-20%] w-[70%] h-[70%] rounded-full bg-primary/15 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-30%] right-[-20%] w-[70%] h-[70%] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />
            <div className="relative z-10">
              <div className="mb-6 sm:mb-8">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-display font-extrabold tracking-tight text-foreground bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent flex items-center gap-2">
                  Play Online Match{" "}
                  <Users className="w-6 h-6 text-primary animate-pulse" />
                </h1>
                <p className="text-xs sm:text-sm text-foreground-muted mt-1.5 font-medium">
                  Queue up for a ranked or casual match vs a human player
                  online.
                </p>
              </div>
              <div className="mb-6 bg-slate-800/30 border border-slate-700/50 p-4 rounded-xl flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs font-semibold text-foreground block">
                    Fair Play Notice
                  </span>
                  <span className="text-[11px] text-foreground-muted mt-0.5 block">
                    Colors are auto-assigned randomly to maintain matching
                    fairness. Clocks begin once the match is found.
                  </span>
                </div>
              </div>
              <div className="mb-8">
                <label className="text-[10px] sm:text-xs font-bold text-foreground-muted tracking-widest uppercase block mb-3">
                  Select Time Control
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {TIME_CONTROLS.map((tc) => {
                    const isSelected = timeControl === tc.id;
                    return (
                      <button
                        key={tc.id}
                        disabled={isSearching}
                        onClick={() => setTimeControl(tc.id as TimeChoice)}
                        className={`flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all duration-300 active:scale-95 disabled:pointer-events-none hover:scale-[1.02]
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
              <button
                onClick={handleFindOpponent}
                disabled={isSearching}
                className="w-full py-4 rounded-xl font-bold bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white tracking-wide text-center shadow-[0_4px_20px_rgba(20,184,166,0.3)] hover:shadow-[0_4px_30px_rgba(20,184,166,0.5)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2"
              >
                <Sparkles className="w-5 h-5 animate-pulse" /> Find Match
              </button>
            </div>
            {isSearching && (
              <div className="absolute inset-0 bg-background/95 backdrop-blur-md z-50 flex flex-col items-center justify-center p-6 animate-fade-in text-center">
                <div className="relative w-20 h-20 mb-6">
                  <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-ping" />
                  <div className="absolute inset-2 rounded-full border-4 border-teal-400/30 animate-pulse" />
                  <div className="absolute inset-4 rounded-full border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent animate-spin duration-700" />
                  <Users className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground font-display mb-1 text-white">
                  Searching for Opponent
                </h3>
                <p className="text-xs text-foreground-muted h-5 font-medium animate-pulse">
                  {searchStepsTexts[searchStep]}
                </p>
                <div className="w-48 bg-secondary h-1.5 rounded-full overflow-hidden mt-6 border border-border">
                  <div
                    className="bg-primary h-full animate-pulse-glow"
                    style={{
                      width: `${(searchStep + 1) * 20}%`,
                      transition: "width 0.4s ease-out",
                    }}
                  />
                </div>
                <button
                  onClick={handleCancelSearch}
                  className="mt-8 px-5 py-2.5 text-xs font-semibold rounded-lg bg-secondary border border-border text-foreground hover:bg-slate-800 transition-all active:scale-95"
                >
                  Cancel Search
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
export default PlayOnline;
