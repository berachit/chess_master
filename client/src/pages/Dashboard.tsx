import { Link } from "react-router-dom";
import {
  Users,
  Bot,
  Link as LinkIcon,
  Trophy,
  Target,
  Handshake,
  Clock,
  ChevronRight,
  Plus,
} from "lucide-react";
import Navbar from "../components/Navbar";

import DashboardCard, { StatCard } from "../components/DashboardCard";
import { useAppSelector } from "@/store/hooks";
import { useEffect, useState } from "react";
import { GameAnalytics } from "@/types/gameAnalytics";
import { getAnalyticsService, getGameHistoryService } from "@/services/authService";

const getRelativeTime = (dateString: string) => {
  if (!dateString) return "";
  const now = new Date();
  const ended = new Date(dateString);
  const diffMs = now.getTime() - ended.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;

  return ended.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

const Dashboard = () => {
  const { user: logginUser } = useAppSelector((state) => state.auth);
  const [analytics, setAnalytics] = useState<GameAnalytics | null>(null);
  const [recentGames, setRecentGames] = useState<any[]>([]);
  const [loadingGames, setLoadingGames] = useState<boolean>(true);
  const [gamesError, setGamesError] = useState<string>("");

  useEffect(() => {
    if (logginUser) {
      getAnalyticsService()
        .then(setAnalytics)
        .catch((err) => console.error("Error Fetching Analytics:", err));

      setLoadingGames(true);
      getGameHistoryService(1, 4)
        .then((res) => {
          if (res.success) {
            setRecentGames(res.games);
          } else {
            setGamesError("Failed to load recent games");
          }
        })
        .catch((err) => {
          console.error("Error Fetching Recent Games:", err);
          setGamesError("Error loading recent games");
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
    avatar: logginUser?.avatar || null,
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-8 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold text-foreground mb-2">
              Welcome back, {user.name.split(" ")[0]}! 👋
            </h1>
            <p className="text-foreground-muted">
              Ready for your next game? Your current rating is{" "}
              <span className="text-primary font-semibold">{user.rating}</span>
            </p>
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
                label="Total Wins"
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
                label="Current Rating"
                value={user.rating}
                icon={Target}
                color="primary"
              />
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Recent Games */}
            <div className="lg:col-span-2">
              <DashboardCard
                title="Recent Games"
                icon={Clock}
                className="hover:border-primary/20 transition-all duration-300"
                action={
                  <Link
                    to="/games"
                    className="text-sm text-primary hover:underline"
                  >
                    View all
                  </Link>
                }
              >
                <div className="space-y-3">
                  {loadingGames ? (
                    <div className="py-8 text-center">
                      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                      <p className="text-sm text-foreground-muted">Loading games...</p>
                    </div>
                  ) : gamesError ? (
                    <div className="py-8 text-center text-sm text-destructive">
                      {gamesError}
                    </div>
                  ) : recentGames.length === 0 ? (
                    <div className="py-8 text-center">
                      <p className="text-sm text-foreground-muted mb-4">No games played yet.</p>
                      <Link to="/play/online" className="btn-primary py-1.5 px-4 text-xs">
                        Play a Match
                      </Link>
                    </div>
                  ) : (
                    recentGames.map((game) => {
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
                      const relativeTime = getRelativeTime(game.endedAt);
                      const opponentRating = opponent.ratingAfter ?? opponent.ratingBefore ?? 1200;

                      return (
                        <Link
                          key={game._id}
                          to={`/game/${game._id}`}
                          className="flex items-center gap-4 p-4 rounded-xl border border-border/50 bg-secondary/10 hover:bg-secondary/40 hover:border-primary/40 active:scale-[0.99] transition-all duration-300 group relative overflow-hidden animate-fade-in"
                        >
                          {/* Result Indicator */}
                          <div
                            className={`
                            w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 border
                            ${resultLabel === "win" ? "bg-success/10 text-success border-success/30" : ""}
                            ${resultLabel === "loss" ? "bg-destructive/10 text-destructive border-destructive/30" : ""}
                            ${resultLabel === "draw" ? "bg-muted text-foreground-muted border-border" : ""}
                          `}
                          >
                            {resultLabel === "win"
                              ? "W"
                              : resultLabel === "loss"
                                ? "L"
                                : "D"}
                          </div>

                          {/* Game Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-foreground truncate">
                                vs {opponent.username}
                              </span>
                              <span className="text-xs text-foreground-muted shrink-0">
                                ({opponentRating})
                              </span>
                            </div>
                            <p className="text-sm text-foreground-muted">
                              {movesCount} moves • {relativeTime}
                            </p>
                          </div>

                          <ChevronRight className="w-5 h-5 text-foreground-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                      );
                    })
                  )}
                </div>
              </DashboardCard>
            </div>

            {/* Profile Card */}
            <div>
              <DashboardCard title="Your Profile" icon={Users} className="hover:border-primary/20 transition-all duration-300">
                <div className="text-center py-4">
                  {/* Avatar */}
                  <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border-2 border-primary/30 flex items-center justify-center mb-4">
                    <span className="text-3xl font-bold text-primary">
                      {user.name.charAt(0)}
                    </span>
                  </div>

                  {/* Name & Username */}
                  <h3 className="font-display text-xl font-bold text-foreground mb-1">
                    {user.name}
                  </h3>
                  <p className="text-foreground-muted text-sm mb-4">
                    @{user.username}
                  </p>

                  {/* Rating Badge */}
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 mb-6">
                    <Trophy className="w-4 h-4 text-primary" />
                    <span className="font-display font-bold text-primary">
                      {user.rating} ELO
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="space-y-2">
                    <Link to="/profile" className="btn-secondary w-full">
                      View Profile
                    </Link>
                    <Link to="/profile/edit" className="btn-ghost w-full">
                      Edit Profile
                    </Link>
                  </div>
                </div>
              </DashboardCard>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
