import { Link } from "react-router-dom";
import { Users, Bot, Link as LinkIcon, Zap, Clock, Play, Trophy, ArrowRight } from "lucide-react";
import Navbar from "../components/Navbar";
import ChessBoardUI from "../components/ChessBoardUI";
import { useIsMobile } from "../hooks/use-mobile";
import React from "react";

// Standard starting chess position
const START_POSITION: Record<string, string | null> = {
  a8: 'r', b8: 'n', c8: 'b', d8: 'q', e8: 'k', f8: 'b', g8: 'n', h8: 'r',
  a7: 'p', b7: 'p', c7: 'p', d7: 'p', e7: 'p', f7: 'p', g7: 'p', h7: 'p',
  a6: null, b6: null, c6: null, d6: null, e6: null, f6: null, g6: null, h6: null,
  a5: null, b5: null, c5: null, d5: null, e5: null, f5: null, g5: null, h5: null,
  a4: null, b4: null, c4: null, d4: null, e4: null, f4: null, g4: null, h4: null,
  a3: null, b3: null, c3: null, d3: null, e3: null, f3: null, g3: null, h3: null,
  a2: 'P', b2: 'P', c2: 'P', d2: 'P', e2: 'P', f2: 'P', g2: 'P', h2: 'P',
  a1: 'R', b1: 'N', c1: 'B', d1: 'Q', e1: 'K', f1: 'B', g1: 'N', h1: 'R',
};

// Custom Classic Chess Rook SVG
const RookIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M4 22h16" />
    <path d="M5 22V8h14v14" />
    <path d="M5 8V3h3v2h3V3h2v2h3V3h3v5" />
    <path d="M10 12h4" />
    <path d="M10 16h4" />
  </svg>
);

const Index = () => {
  const isMobile = useIsMobile();
  const [hideBoard, setHideBoard] = React.useState(false);

  React.useEffect(() => {
    const handleResize = () => {
      setHideBoard(window.innerWidth < 1024);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);


  const ctaCards = [
    {
      title: "Play Online",
      subtitle: "Ranked • Casual • Matchmaking",
      path: "/play/online",
      icon: Users,
      iconColor: "text-emerald-500",
      bgClass: "bg-[#10b981]/[0.02] hover:bg-[#10b981]/[0.05]",
      borderClass: "border-primary/20 hover:border-primary/60",
      mobileBorderClass: "border-primary/30",
      hoverClass: "hover:shadow-[0_0_30px_rgba(16,185,129,0.15)]",
      hoverTiltClass: "hover:-rotate-[1deg] hover:scale-[1.02]",
      arrowBorderClass: "border-emerald-500/20",
      arrowColor: "text-emerald-500",
      arrowBgClass: "bg-emerald-500",
      arrowHoverColor: "text-black",
      arrowHoverBorderClass: "border-emerald-500",
      hasBgGlow: true,
    },
    {
      title: "Play vs Bot",
      subtitle: "Practice against AI",
      path: "/play/bot",
      icon: Bot,
      iconColor: "text-blue-500",
      bgClass: "bg-[#3b82f6]/[0.02] hover:bg-[#3b82f6]/[0.05]",
      borderClass: "border-border/30 hover:border-blue-500/50",
      mobileBorderClass: "border-border/40",
      hoverClass: "hover:shadow-[0_0_30px_rgba(59,130,246,0.08)]",
      hoverTiltClass: "hover:scale-[1.02]",
      arrowBorderClass: "border-blue-500/20",
      arrowColor: "text-blue-500",
      arrowBgClass: "bg-blue-500",
      arrowHoverColor: "text-black",
      arrowHoverBorderClass: "border-blue-500",
      hasBgGlow: false,
    },
    {
      title: "Private Match",
      subtitle: "Invite friends with a private room",
      path: "/play/private",
      icon: LinkIcon,
      iconColor: "text-purple-500",
      bgClass: "bg-[#a855f7]/[0.02] hover:bg-[#a855f7]/[0.05]",
      borderClass: "border-border/30 hover:border-purple-500/50",
      mobileBorderClass: "border-border/40",
      hoverClass: "hover:shadow-[0_0_30px_rgba(168,85,247,0.08)]",
      hoverTiltClass: "hover:rotate-[1deg] hover:scale-[1.02]",
      arrowBorderClass: "border-purple-500/20",
      arrowColor: "text-purple-500",
      arrowBgClass: "bg-purple-500",
      arrowHoverColor: "text-white",
      arrowHoverBorderClass: "border-purple-500",
      hasBgGlow: false,
    },
  ];

  const quickChips = [
    {
      label: "Bullet",
      icon: Zap,
      iconColor: "text-emerald-500",
      borderClass: "border-emerald-500/10 hover:border-emerald-500/40 hover:shadow-[0_0_15px_rgba(16,185,129,0.1)]",
    },
    {
      label: "Blitz",
      icon: Zap,
      iconColor: "text-blue-500",
      borderClass: "border-blue-500/10 hover:border-blue-500/40 hover:shadow-[0_0_15px_rgba(59,130,246,0.1)]",
    },
    {
      label: "Rapid",
      icon: Clock,
      iconColor: "text-teal-500",
      borderClass: "border-teal-500/10 hover:border-teal-500/40 hover:shadow-[0_0_15px_rgba(20,184,166,0.1)]",
    },
    {
      label: "Classical",
      icon: RookIcon,
      iconColor: "text-emerald-500",
      borderClass: "border-emerald-500/10 hover:border-emerald-500/40 hover:shadow-[0_0_15px_rgba(16,185,129,0.1)]",
    },
  ];


  return (
    <div className="relative min-h-[100dvh] bg-transparent overflow-hidden flex flex-col justify-between">
      {/* Top Navbar */}
      <Navbar />



      {/* Main Content Area */}
      <main className="relative z-10 flex-grow flex items-center justify-center py-8">
        <div 
          className="w-full max-w-[1500px] mx-auto flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-16"
          style={{ 
            paddingInline: "clamp(20px, 4vw, 60px)",
            gap: "clamp(24px, 4vw, 64px)"
          }}
        >
          
          {/* Left Column: Launcher Actions */}
          <div className="w-full lg:flex-grow flex flex-col gap-8 md:gap-12 text-left">
            
            {/* PLAY NOW Section */}
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-3">
                <span className="w-1 h-6 bg-primary rounded-full" />
                <h2 className="text-xs sm:text-sm font-bold tracking-widest text-foreground-muted uppercase">
                  PLAY NOW
                </h2>
              </div>

              {isMobile ? (
                /* Mobile Stacked Layout */
                <div className="flex flex-col gap-3">
                  {ctaCards.map((card) => (
                    <Link key={card.title} to={card.path} className="group block">
                      <div className={`w-full h-[76px] rounded-xl flex items-center justify-between px-5 border ${card.mobileBorderClass} ${card.bgClass} backdrop-blur-md transition-all duration-300 ease-out hover:scale-[1.01] active:scale-[0.99]`}>
                        <div className="flex items-center gap-4">
                          <card.icon className={`w-8 h-8 ${card.iconColor}`} />
                          <div className="text-left">
                            <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors leading-none">
                              {card.title}
                            </h3>
                            <p className="text-[11px] text-foreground-muted leading-none mt-1.5 font-medium">
                              {card.subtitle}
                            </p>
                          </div>
                        </div>
                        <div className={`w-9 h-9 rounded-full border ${card.arrowBorderClass} flex items-center justify-center bg-[#080b12]/50 ${card.arrowColor} transition-all duration-300 ease-out group-hover:${card.arrowBgClass} group-hover:${card.arrowHoverColor} group-hover:${card.arrowHoverBorderClass}`}>
                          <ArrowRight className="w-4 h-4 transition-transform duration-300 ease-out group-hover:translate-x-0.5" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                /* Desktop/Laptop/Tablet Horizontal Layout */
                <div className="flex flex-row items-center gap-6">
                  {ctaCards.map((card) => (
                    <Link key={card.title} to={card.path} className="group flex-1 max-w-[280px] block" style={{ minWidth: "220px" }}>
                      <div 
                        className={`relative rounded-2xl flex flex-col items-center justify-between p-8 text-center border ${card.borderClass} ${card.bgClass} backdrop-blur-md transition-all duration-300 ease-out ${card.hoverClass} ${card.hoverTiltClass}`}
                        style={{ height: "clamp(280px, 22vw, 320px)" }}
                      >
                        {/* Background Glow */}
                        {card.hasBgGlow && (
                          <div className="absolute inset-0 bg-primary/10 rounded-2xl blur-[24px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out pointer-events-none z-[-1]" />
                        )}

                        <div>
                          <card.icon className={`w-12 h-12 ${card.iconColor} mx-auto mb-6`} />
                          <h3 className="text-lg font-display font-extrabold text-foreground group-hover:text-primary transition-colors mb-2">
                            {card.title}
                          </h3>
                          <p className="text-xs text-foreground-muted font-medium leading-relaxed">
                            {card.subtitle}
                          </p>
                        </div>
                        <div className={`w-12 h-12 rounded-full border ${card.arrowBorderClass} flex items-center justify-center bg-[#080b12]/50 ${card.arrowColor} transition-all duration-300 ease-out group-hover:${card.arrowBgClass} group-hover:${card.arrowHoverColor} group-hover:${card.arrowHoverBorderClass}`}>
                          <ArrowRight className="w-5 h-5 transition-transform duration-300 ease-out group-hover:translate-x-1 group-hover:-rotate-12" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* QUICK GAME Section */}
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-3">
                <span className="w-1 h-6 bg-primary rounded-full" />
                <h2 className="text-xs sm:text-sm font-bold tracking-widest text-foreground-muted uppercase">
                  QUICK GAME
                </h2>
              </div>

              {/* Responsive chips grid on mobile, horizontal wraps on desktop */}
              <div className={isMobile ? "grid grid-cols-2 gap-3" : "flex flex-wrap items-center gap-3"}>
                {quickChips.map((chip) => (
                  <Link key={chip.label} to="/play/online" className="block">
                    <div className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl border bg-[#080b12]/40 text-sm font-semibold transition-all duration-300 ease-out ${chip.borderClass} hover:scale-[1.02] active:scale-[0.98] cursor-pointer`}>
                      <chip.icon className={`w-5 h-5 shrink-0 ${chip.iconColor}`} />
                      <span className="text-foreground font-medium">{chip.label}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: Chessboard Preview (Completely removed on mobile/tablet) */}
          {!hideBoard && (
            <div className="relative shrink-0 flex items-center justify-center animate-fade-in">
              {/* Soft glow behind board */}
              <div className="absolute inset-0 bg-primary/5 rounded-full blur-[60px] pointer-events-none" />
              
              {/* Chessboard container with relative aspects */}
              <div 
                className="relative"
                style={{ 
                  width: "clamp(340px, 38vw, 620px)", 
                  aspectRatio: "1" 
                }}
              >
                <ChessBoardUI size="fill" position={START_POSITION} interactive={false} showCoordinates={true} />
                
                {/* Floating Stats: Active Games (Top-Right) */}
                <div className="absolute -top-6 -right-12 z-30 card-glass border border-border/80 px-4 py-3 shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex items-center gap-3 animate-float">
                  <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-primary">
                    <Play className="w-4.5 h-4.5 fill-primary text-primary" />
                  </div>
                  <div>
                    <p className="text-[10px] text-foreground-muted font-semibold tracking-wider uppercase leading-none">Active Games</p>
                    <p className="font-display font-extrabold text-foreground text-lg leading-none mt-1">2,847</p>
                  </div>
                </div>

                {/* Floating Stats: Your Rank (Bottom-Left) */}
                <div 
                  className="absolute -bottom-6 -left-12 z-30 card-glass border border-border/80 px-4 py-3 shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex items-center gap-3 animate-float"
                  style={{ animationDelay: "1.5s" }}
                >
                  <div className="w-9 h-9 rounded-full bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center text-yellow-500">
                    <Trophy className="w-4.5 h-4.5 fill-yellow-500/20" />
                  </div>
                  <div>
                    <p className="text-[10px] text-foreground-muted font-semibold tracking-wider uppercase leading-none">Your Rank</p>
                    <p className="font-display font-extrabold text-foreground text-lg leading-none mt-1">#1,234</p>
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default Index;
