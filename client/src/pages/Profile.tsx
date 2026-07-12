import { Link } from "react-router-dom";
import {
  Trophy,
  Target,
  Handshake,
  Clock,
  Settings,
  ChevronRight,
  Calendar,
  MapPin,
  Globe,
} from "lucide-react";
import Navbar from "../components/Navbar";

import { StatCard } from "../components/DashboardCard";
import { useAppSelector } from "@/store/hooks";
import { useEffect, useState } from "react";
import { GameAnalytics } from "@/types/gameAnalytics";
import { getAnalyticsService, getGameHistoryService } from "@/services/authService";

const Profile = () => {
  const { user: logginUser } = useAppSelector((state) => state.auth);

  const [analytics, setAnalytics] = useState<GameAnalytics | null>(null);
  const [gameHistory, setGameHistory] = useState<any[]>([]);
  const [loadingGames, setLoadingGames] = useState<boolean>(true);
  const [gamesError, setGamesError] = useState<string>("");

  useEffect(() => {
    if (logginUser) {
      getAnalyticsService()
        .then(setAnalytics)
        .catch((err) => console.error("Error Fetching Analytics:", err));

      setLoadingGames(true);
      getGameHistoryService(1, 6)
        .then((res) => {
          if (res.success) {
            setGameHistory(res.games);
          } else {
            setGamesError("Failed to load game history");
          }
        })
        .catch((err) => {
          console.error("Error Fetching Game History:", err);
          setGamesError("Error loading game history");
        })
        .finally(() => {
          setLoadingGames(false);
        });
    }
  }, [logginUser]);

  const user = {
    name: logginUser?.name || "Guest User",
    username: logginUser?.name
      ? logginUser.name.toLowerCase().replace(/\s+/g, "")
      : "guest",
    rating: logginUser?.rating || 1200,
    peakRating: logginUser?.rating || 1200,
    avatar: logginUser?.avatar || null,
    joinDate: logginUser?.createdAt
      ? new Date(logginUser.createdAt).toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        })
      : "June 2026",
    location: logginUser?.location,
    bio: logginUser?.bio,
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-8 pb-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Profile Header */}
          <div className="card-glass border border-card-border/80 shadow-[0_8px_30px_rgba(0,0,0,0.4)] p-6 sm:p-8 mb-8 hover:border-primary/20 transition-all duration-300">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              {/* Avatar */}
              <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border-2 border-primary/30 flex items-center justify-center flex-shrink-0">
                <span className="text-4xl font-bold text-primary">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>

              {/* Info */}
              <div className="flex-1 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-2">
                  <h1 className="font-display text-2xl font-bold text-foreground">
                    {user.name}
                  </h1>
                  <span className="inline-flex items-center justify-center sm:justify-start gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-sm">
                    <Trophy className="w-4 h-4 text-primary" />
                    <span className="font-display font-bold text-primary">
                      {user.rating}
                    </span>
                  </span>
                </div>

                <p className="text-foreground-muted mb-4">@{user.username}</p>

                <p className="text-foreground-muted text-sm mb-4 max-w-md">
                  {user.bio}
                </p>

                {/* Meta Info */}
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-sm text-foreground-muted">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>Joined {user.joinDate}</span>
                  </div>
                  {user.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{user.location}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Edit Button */}
              <Link to="/profile/edit" className="btn-secondary flex-shrink-0">
                <Settings className="w-4 h-4" />
                Edit Profile
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
              <StatCard
                label="Games Played"
                value={analytics?.gamesPlayed ?? 0}
                icon={Target}
                color="primary"
              />
            </div>
            <div className="hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
              <StatCard
                label="Wins"
                value={analytics?.wins ?? 0}
                icon={Trophy}
                color="success"
              />
            </div>
            <div className="hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
              <StatCard
                label="Draws"
                value={analytics?.draws ?? 0}
                icon={Handshake}
                color="warning"
              />
            </div>
            <div className="hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
              <StatCard
                label="Win Rate"
                value={`${analytics?.winRate ?? 0}%`}
                icon={Target}
                color="primary"
              />
            </div>
          </div>

          {/* Game History */}
          <div className="card-glass border border-card-border/80 shadow-[0_8px_30px_rgba(0,0,0,0.4)] p-6 hover:border-primary/20 transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display font-semibold text-foreground flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Game History
              </h2>
              <Link
                to="/games"
                className="text-sm text-primary hover:underline"
              >
                View all
              </Link>
            </div>

            <div className="space-y-3">
              {loadingGames ? (
                <div className="py-12 text-center">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <p className="text-sm text-foreground-muted">Loading games history...</p>
                </div>
              ) : gamesError ? (
                <div className="py-12 text-center text-sm text-destructive">
                  {gamesError}
                </div>
              ) : gameHistory.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-sm text-foreground-muted mb-4">No games played yet.</p>
                  <Link to="/play/online" className="btn-primary py-1.5 px-4 text-xs">
                    Play a Match
                  </Link>
                </div>
              ) : (
                gameHistory.map((game) => {
                  const isWhite = game.whitePlayer.userId === logginUser?.id;
                  const opponent = isWhite ? game.blackPlayer : game.whitePlayer;
                  const isWinner = game.winnerUserId === logginUser?.id;
                  const isDraw = game.result === "draw";

                  let resultLabel: "win" | "loss" | "draw" = "loss";
                  if (isDraw) {
                    resultLabel = "draw";
                  } else if (isWinner) {
                    resultLabel = "win";
                  }

                  const movesCount = game.moves?.length ?? 0;
                  const opponentRating = opponent.ratingAfter ?? opponent.ratingBefore ?? 1200;

                  const gameDate = game.endedAt
                    ? new Date(game.endedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "Date unknown";

                  const timeControlText = game.timeControl
                    ? `${game.timeControl.type} (${Math.round(
                        game.timeControl.initialSeconds / 60
                      )}+${game.timeControl.incrementSeconds})`
                    : "Untimed";

                  return (
                    <Link
                      key={game._id}
                      to={`/game/${game._id}`}
                      className="flex items-center gap-4 p-4 rounded-xl border border-border/50 bg-secondary/10 hover:bg-secondary/40 hover:border-primary/40 active:scale-[0.99] transition-all duration-300 group relative overflow-hidden animate-fade-in"
                    >
                      {/* Result */}
                      <div
                        className={`
                        w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 uppercase border
                        ${resultLabel === "win" ? "bg-success/10 text-success border-success/30" : ""}
                        ${resultLabel === "loss" ? "bg-destructive/10 text-destructive border-destructive/30" : ""}
                        ${resultLabel === "draw" ? "bg-muted text-foreground-muted border-border" : ""}
                      `}
                      >
                        {resultLabel}
                      </div>

                      {/* Game Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-foreground truncate">
                            vs {opponent.username}
                          </span>
                          <span className="text-xs text-foreground-muted shrink-0">
                            ({opponentRating})
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-foreground-muted">
                          <span className="capitalize font-mono uppercase text-[10px] tracking-wide bg-secondary/80 px-1.5 py-0.5 rounded border border-border">
                            {timeControlText}
                          </span>
                          <span>•</span>
                          <span>{movesCount} moves</span>
                          <span>•</span>
                          <span>{gameDate}</span>
                        </div>
                      </div>

                      <ChevronRight className="w-5 h-5 text-foreground-muted opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                    </Link>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </main>


    </div>
  );
};

export default Profile;
