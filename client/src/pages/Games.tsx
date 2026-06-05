import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Trophy,
  Target,
  Handshake,
  Clock,
  ChevronRight,
  AlertCircle,
  ChevronLeft,
  Calendar,
  Swords,
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useAppSelector } from "@/store/hooks";
import {
  getGameHistoryService,
  GameHistoryResponse,
} from "@/services/authService";

const Games = () => {
  const { user: currentUser } = useAppSelector((state) => state.auth);

  const [historyResponse, setHistoryResponse] =
    useState<GameHistoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;

  useEffect(() => {
    if (!currentUser) return;
    setLoading(true);
    getGameHistoryService(page, limit)
      .then((res) => {
        if (res.success) {
          setHistoryResponse(res);
        } else {
          setError("Failed to fetch game history");
        }
      })
      .catch((err: any) => {
        console.error("Error fetching game history:", err);
        setError(
          err.response?.data?.message ||
            err.message ||
            "Failed to load game history",
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, [currentUser, page]);

  const handlePrevPage = () => {
    if (page > 1) setPage((p) => p - 1);
  };

  const handleNextPage = () => {
    if (historyResponse?.pagination.hasNextPage) {
      setPage((p) => p + 1);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-between">
      <Navbar />

      <main className="pt-24 pb-16 flex-grow">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-display font-bold text-foreground">
                My Games ⚔️
              </h1>
              <p className="text-foreground-muted text-sm mt-1">
                View your complete online match history and replay past chess
                battles.
              </p>
            </div>
            {historyResponse && (
              <span className="text-xs bg-secondary/80 px-3 py-1.5 rounded-full border border-border text-foreground font-semibold">
                Total Games: {historyResponse.pagination.totalGames}
              </span>
            )}
          </div>

          {/* Alert Error */}
          {error && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm mb-6">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Main List */}
          {loading ? (
            <div className="card-glass border border-card-border/80 p-12 text-center rounded-2xl">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-sm text-foreground-muted">
                Loading your chess history...
              </p>
            </div>
          ) : !historyResponse || historyResponse.games.length === 0 ? (
            <div className="card-glass border border-card-border/80 p-12 text-center rounded-2xl flex flex-col items-center justify-center">
              <div className="w-14 h-14 rounded-2xl bg-secondary/80 flex items-center justify-center text-foreground-muted border border-border/80 mb-4 animate-fade-in">
                <Swords className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-1">
                No Games Played Yet
              </h3>
              <p className="text-sm text-foreground-muted max-w-sm mb-6">
                You haven't played any online matches yet. Challenge other
                players online to start your history!
              </p>
              <Link to="/play/online" className="btn-primary">
                Play a Match
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-3">
                {historyResponse.games.map((game) => {
                  const isWhite = game.whitePlayer.userId === currentUser?.id;
                  const opponent = isWhite
                    ? game.blackPlayer
                    : game.whitePlayer;

                  const isWinner = game.winnerUserId === currentUser?.id;
                  const isDraw = game.result === "draw";

                  let outcomeLabel = "Loss";
                  let outcomeClass =
                    "bg-destructive/10 text-destructive border-destructive/30";

                  if (isDraw) {
                    outcomeLabel = "Draw";
                    outcomeClass =
                      "bg-muted text-foreground-muted border-border";
                  } else if (isWinner) {
                    outcomeLabel = "Win";
                    outcomeClass =
                      "bg-success/10 text-success border-success/30";
                  }

                  const timeControlText = game.timeControl
                    ? `${game.timeControl.type} (${Math.round(
                        game.timeControl.initialSeconds / 60,
                      )}+${game.timeControl.incrementSeconds})`
                    : "Untimed";

                  const formatReason = (reason: string) => {
                    if (!reason) return "";
                    return reason.replace(/_/g, " ");
                  };

                  const formattedDate = game.endedAt
                    ? new Date(game.endedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "Date unknown";

                  return (
                    <Link
                      key={game._id}
                      to={`/game/${game._id}`}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-border/50 bg-secondary/10 hover:bg-secondary/40 hover:border-primary/40 active:scale-[0.99] transition-all duration-300 group relative overflow-hidden"
                    >
                      {/* Left: Result Badge + Player names */}
                      <div className="flex items-center gap-4 min-w-0 flex-1">
                        <div
                          className={`w-14 h-12 rounded-lg flex flex-col items-center justify-center font-bold text-xs border uppercase shrink-0 ${outcomeClass}`}
                        >
                          <span>{outcomeLabel}</span>
                          {game.resultReason && (
                            <span className="text-[8px] opacity-70 font-medium normal-case truncate max-w-full px-1">
                              {formatReason(game.resultReason)}
                            </span>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                            <span className="font-semibold text-foreground text-sm truncate">
                              vs {opponent.username}
                            </span>
                            <span className="text-xs text-foreground-muted">
                              (
                              {opponent.ratingAfter ??
                                opponent.ratingBefore ??
                                1200}
                              )
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-foreground-muted">
                            <span className="capitalize flex items-center gap-1 font-medium">
                              <span
                                className={`w-2.5 h-2.5 rounded-full shrink-0 border ${
                                  isWhite
                                    ? "bg-white border-slate-400"
                                    : "bg-slate-900 border-slate-700"
                                }`}
                              />
                              Played as {isWhite ? "White" : "Black"}
                            </span>
                            <span className="opacity-50">•</span>
                            <span className="flex items-center gap-1 font-mono uppercase text-[10px] tracking-wide">
                              {timeControlText}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Date, Moves & Arrow */}
                      <div className="flex items-center justify-between sm:justify-end gap-6 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-border/40">
                        <div className="text-right">
                          <p className="text-xs text-foreground font-semibold flex items-center gap-1 sm:justify-end">
                            <Calendar className="w-3.5 h-3.5 text-primary" />
                            {formattedDate}
                          </p>
                          <p className="text-[11px] text-foreground-muted mt-1 font-medium">
                            {game.moves?.length ?? 0} moves played
                          </p>
                        </div>
                        <div className="w-8 h-8 rounded-lg bg-secondary/80 border border-border flex items-center justify-center group-hover:bg-primary/20 group-hover:border-primary/40 transition-colors">
                          <ChevronRight className="w-4 h-4 text-foreground-muted group-hover:text-primary transition-colors" />
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>

              {/* Pagination */}
              {historyResponse.pagination.totalPages > 1 && (
                <div className="flex items-center justify-between pt-6 border-t border-border/40">
                  <button
                    onClick={handlePrevPage}
                    disabled={page === 1}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-secondary/80 border border-border text-foreground hover:bg-secondary disabled:opacity-40 disabled:pointer-events-none transition-all"
                  >
                    <ChevronLeft className="w-4 h-4" /> Previous
                  </button>
                  <span className="text-xs text-foreground-muted font-medium">
                    Page {page} of {historyResponse.pagination.totalPages}
                  </span>
                  <button
                    onClick={handleNextPage}
                    disabled={!historyResponse.pagination.hasNextPage}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-secondary/80 border border-border text-foreground hover:bg-secondary disabled:opacity-40 disabled:pointer-events-none transition-all"
                  >
                    Next <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Games;
