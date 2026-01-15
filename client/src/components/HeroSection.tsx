import { Link } from 'react-router-dom';
import { Play, Bot, Users, Zap, Shield, Trophy } from 'lucide-react';
import ChessBoardUI from './ChessBoardUI';

const HeroSection = () => {
  const features = [
    { icon: Zap, label: 'Real-time Matches' },
    { icon: Shield, label: 'Anti-Cheat System' },
    { icon: Trophy, label: 'Ranked Play' },
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-hero pt-16">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-noise pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      
      {/* Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px),
                            linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 mb-6 animate-fade-in">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-sm font-medium text-primary">10,000+ players online</span>
            </div>

            {/* Headline */}
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-foreground mb-6 animate-slide-up">
              Master the Game,
              <br />
              <span className="text-gradient">Dominate the Board</span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg sm:text-xl text-foreground-muted max-w-xl mx-auto lg:mx-0 mb-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              Experience chess like never before. Play against friends, challenge AI opponents, 
              and climb the global rankings in our premium chess platform.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <Link to="/game/online" className="btn-primary btn-lg w-full sm:w-auto group">
                <Users className="w-5 h-5" />
                Play Online
                <span className="ml-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all">→</span>
              </Link>
              <Link to="/game/bot" className="btn-secondary btn-lg w-full sm:w-auto group">
                <Bot className="w-5 h-5" />
                Play vs Bot
              </Link>
            </div>

            {/* Feature Pills */}
            <div className="flex flex-wrap items-center gap-3 justify-center lg:justify-start mt-8 animate-slide-up" style={{ animationDelay: '0.3s' }}>
              {features.map((feature) => (
                <div
                  key={feature.label}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary border border-border text-sm text-foreground-muted"
                >
                  <feature.icon className="w-4 h-4 text-primary" />
                  {feature.label}
                </div>
              ))}
            </div>
          </div>

          {/* Right Content - Chess Board Preview */}
          <div className="hidden lg:flex justify-center items-center animate-float">
            <div className="relative">
              {/* Glow Effect */}
              <div className="absolute inset-0 bg-gradient-glow scale-150" />
              
              {/* Chess Board */}
              <div className="relative transform rotate-3 hover:rotate-0 transition-transform duration-500">
                <ChessBoardUI size="md" showCoordinates interactive={false} />
              </div>

              {/* Floating Stats */}
              <div className="absolute -top-4 -right-4 card p-3 animate-fade-in" style={{ animationDelay: '0.5s' }}>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <Play className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-foreground-subtle">Active Games</p>
                    <p className="font-display font-bold text-foreground">2,847</p>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-4 -left-4 card p-3 animate-fade-in" style={{ animationDelay: '0.7s' }}>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-warning/20 flex items-center justify-center">
                    <Trophy className="w-4 h-4 text-warning" />
                  </div>
                  <div>
                    <p className="text-xs text-foreground-subtle">Your Rank</p>
                    <p className="font-display font-bold text-foreground">#1,234</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-fade-in" style={{ animationDelay: '1s' }}>
        <span className="text-xs text-foreground-subtle">Scroll to explore</span>
        <div className="w-5 h-8 rounded-full border-2 border-foreground-subtle flex items-start justify-center p-1">
          <div className="w-1 h-2 rounded-full bg-primary animate-bounce" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
