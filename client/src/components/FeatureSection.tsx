import { Users, Bot, History, Trophy, Brain, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';

interface FeatureCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  link: string;
  gradient: string;
}

const FeatureCard = ({ icon: Icon, title, description, link, gradient }: FeatureCardProps) => (
  <Link to={link} className="group">
    <div className="card-hover p-6 h-full">
      <div
        className={`w-14 h-14 rounded-xl ${gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
      >
        <Icon className="w-7 h-7 text-white" />
      </div>
      <h3 className="font-display text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
        {title}
      </h3>
      <p className="text-foreground-muted text-sm leading-relaxed">
        {description}
      </p>
    </div>
  </Link>
);

const FeatureSection = () => {
  const features: FeatureCardProps[] = [
    {
      icon: Users,
      title: 'Play Online',
      description: 'Challenge players from around the world in real-time matches. Compete in ranked games to climb the leaderboard.',
      link: '/game/online',
      gradient: 'bg-gradient-to-br from-emerald-500 to-teal-600',
    },
    {
      icon: Bot,
      title: 'Play vs AI',
      description: 'Practice against our advanced chess engine. Choose from multiple difficulty levels to match your skill.',
      link: '/game/bot',
      gradient: 'bg-gradient-to-br from-blue-500 to-indigo-600',
    },
    {
      icon: History,
      title: 'Game Replays',
      description: 'Review your past games move by move. Analyze your strategy and learn from your mistakes.',
      link: '/dashboard',
      gradient: 'bg-gradient-to-br from-amber-500 to-orange-600',
    },
    {
      icon: Trophy,
      title: 'Tournaments',
      description: 'Join weekly tournaments and special events. Win prizes and earn exclusive badges.',
      link: '/tournaments',
      gradient: 'bg-gradient-to-br from-rose-500 to-pink-600',
    },
    {
      icon: Brain,
      title: 'Chess Puzzles',
      description: 'Sharpen your tactical skills with thousands of puzzles. Track your progress and improve daily.',
      link: '/puzzles',
      gradient: 'bg-gradient-to-br from-violet-500 to-purple-600',
    },
    {
      icon: Globe,
      title: 'Global Community',
      description: 'Connect with chess enthusiasts worldwide. Join clubs, participate in forums, and make friends.',
      link: '/community',
      gradient: 'bg-gradient-to-br from-cyan-500 to-blue-600',
    },
  ];

  return (
    <section className="py-24 bg-background relative">
      {/* Background */}
      <div className="absolute inset-0 bg-noise pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Features
          </span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Everything You Need to
            <span className="text-gradient"> Excel at Chess</span>
          </h2>
          <p className="text-foreground-muted text-lg max-w-2xl mx-auto">
            From casual games to competitive tournaments, we've got all the tools 
            you need to improve your game and have fun doing it.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureSection;
