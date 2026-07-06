import { Link } from "react-router-dom";
import {
  Users,
  Bot,
  Link as LinkIcon,
  ChevronRight,
} from "lucide-react";

import Navbar from "../components/Navbar";


// Play actions config
const quickActions = [
  {
    label: "Play Online",
    icon: Users,
    path: "/play/online",
    color: "bg-gradient-to-br from-emerald-500 to-teal-600",
    primary: true,
  },
  {
    label: "Play vs Bot",
    icon: Bot,
    path: "/play/bot",
    color: "bg-gradient-to-br from-blue-500 to-indigo-600",
  },
  {
    label: "Private Game",
    icon: LinkIcon,
    path: "/play/private",
    color: "bg-gradient-to-br from-amber-500 to-orange-600",
  },
];

const Play = () => {

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-8 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-10">
            <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">
              Play Chess
            </h1>
            <p className="mt-2 text-foreground-muted max-w-2xl">
              Choose how you want to play — challenge players online, test your
              skills against AI, or start a private match with a friend.
            </p>
          </div>

          {/* Play Cards */}
          <div className="grid sm:grid-cols-3 gap-6 mb-12">
            {quickActions.map((action) => {
              const Card = (
                <div
                  className="
                    group relative card p-6 flex items-center gap-5 cursor-pointer
                    border border-border/50
                    hover:border-primary/50
                    hover:shadow-xl hover:shadow-primary/10
                    transition-all duration-300
                  "
                >
                  {action.primary && (
                    <span className="absolute top-3 right-3 text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                      Popular
                    </span>
                  )}

                  <div
                    className={`w-16 h-16 rounded-2xl ${action.color}
                      flex items-center justify-center
                      shadow-lg shadow-black/20
                      group-hover:scale-110 transition-transform`}
                  >
                    <action.icon className="w-7 h-7 text-white" />
                  </div>

                  <div>
                    <h3 className="text-lg font-display font-semibold text-foreground group-hover:text-primary transition-colors">
                      {action.label}
                    </h3>
                    <p className="text-sm text-foreground-muted">
                      Start a new game
                    </p>
                  </div>

                  <ChevronRight
                    className="
                      w-5 h-5 text-foreground-muted ml-auto
                      opacity-0 group-hover:opacity-100
                      translate-x-0 group-hover:translate-x-2
                      transition-all duration-300
                    "
                  />
                </div>
              );

              return (
                <Link key={action.label} to={action.path}>
                  {Card}
                </Link>
              );
            })}
          </div>
        </div>
      </main>


    </div>
  );
};

export default Play;
