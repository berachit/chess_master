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
import { getAnalyticsService } from "@/services/authService";

const stats = {
  gamesPlayed: 1284,
  wins: 847,
  draws: 198,
  losses: 239,
  winRate: 66,
};

const gameHistory = [
  {
    id: "1",
    opponent: "hikaru",
    result: "win",
    moves: 34,
    date: "2024-01-15",
    rating: 2785,
    opening: "Sicilian Defense",
  },
  {
    id: "2",
    opponent: "firouzja",
    result: "draw",
    moves: 52,
    date: "2024-01-14",
    rating: 2760,
    opening: "Italian Game",
  },
  {
    id: "3",
    opponent: "caruana",
    result: "loss",
    moves: 41,
    date: "2024-01-13",
    rating: 2795,
    opening: "Queen's Gambit",
  },
  {
    id: "4",
    opponent: "nepo",
    result: "win",
    moves: 28,
    date: "2024-01-12",
    rating: 2755,
    opening: "Ruy Lopez",
  },
  {
    id: "5",
    opponent: "ding",
    result: "win",
    moves: 56,
    date: "2024-01-11",
    rating: 2780,
    opening: "French Defense",
  },
  {
    id: "6",
    opponent: "anish",
    result: "draw",
    moves: 45,
    date: "2024-01-10",
    rating: 2750,
    opening: "English Opening",
  },
];

const Profile = () => {
  const { user: logginUser } = useAppSelector((state) => state.auth);

  const [analytics, setAnalytics] = useState<GameAnalytics | null>(null);

  useEffect(() => {
    if (logginUser) {
      getAnalyticsService()
        .then(setAnalytics)
        .catch((err) => console.error("Error Fetching Analytics:", err));
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

      <main className="pt-24 pb-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Profile Header */}
          <div className="card p-6 sm:p-8 mb-8">
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
            <StatCard
              label="Games Played"
              value={analytics?.gamesPlayed ?? 0}
              icon={Target}
              color="primary"
            />
            <StatCard
              label="Wins"
              value={analytics?.wins ?? 0}
              icon={Trophy}
              color="success"
            />
            <StatCard
              label="Draws"
              value={analytics?.draws ?? 0}
              icon={Handshake}
              color="warning"
            />
            <StatCard
              label="Win Rate"
              value={`${analytics?.winRate ?? 0}%`}
              icon={Target}
              color="primary"
            />
          </div>

          {/* Rating Progress */}
          <div className="card p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-semibold text-foreground">
                Rating Progress
              </h2>
              <span className="text-sm text-foreground-muted">
                Peak:{" "}
                <span className="text-primary font-semibold">
                  {user.peakRating}
                </span>
              </span>
            </div>

            {/* Simple rating bar visualization */}
            <div className="relative h-4 bg-secondary rounded-full overflow-hidden">
              <div
                className="absolute left-0 top-0 h-full bg-gradient-to-r from-primary to-primary-glow rounded-full transition-all duration-1000"
                style={{ width: `${(user.rating / user.peakRating) * 100}%` }}
              />
            </div>
            <div className="flex justify-between mt-2 text-xs text-foreground-muted">
              <span>0</span>
              <span>Current: {user.rating}</span>
              <span>{user.peakRating}</span>
            </div>
          </div>

          {/* Game History */}
          <div className="card p-6">
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
              {gameHistory.map((game) => (
                <Link
                  key={game.id}
                  to={`/game/${game.id}/replay`}
                  className="flex items-center gap-4 p-4 -mx-2 rounded-lg hover:bg-secondary/50 transition-colors group"
                >
                  {/* Result */}
                  <div
                    className={`
                    w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0
                    ${game.result === "win" ? "bg-success/10 text-success" : ""}
                    ${game.result === "loss" ? "bg-destructive/10 text-destructive" : ""}
                    ${game.result === "draw" ? "bg-muted text-foreground-muted" : ""}
                  `}
                  >
                    {game.result === "win"
                      ? "WIN"
                      : game.result === "loss"
                        ? "LOSS"
                        : "DRAW"}
                  </div>

                  {/* Game Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-foreground">
                        vs {game.opponent}
                      </span>
                      <span className="text-xs text-foreground-muted">
                        ({game.rating})
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-foreground-muted">
                      <span>{game.opening}</span>
                      <span>•</span>
                      <span>{game.moves} moves</span>
                      <span>•</span>
                      <span>{game.date}</span>
                    </div>
                  </div>

                  <ChevronRight className="w-5 h-5 text-foreground-muted opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>


    </div>
  );
};

export default Profile;
