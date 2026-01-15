import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';

const CTASection = () => {
  return (
    <section className="py-24 bg-background relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-noise pointer-events-none" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="card p-8 sm:p-12 text-center relative overflow-hidden">
          {/* Gradient Border Effect */}
          <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/20 via-transparent to-primary/10 pointer-events-none" />
          
          {/* Content */}
          <div className="relative z-10">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 mb-6">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Free to Play Forever</span>
            </div>

            {/* Headline */}
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Ready to Make Your
              <span className="text-gradient"> First Move?</span>
            </h2>

            {/* Description */}
            <p className="text-foreground-muted text-lg max-w-2xl mx-auto mb-8">
              Join thousands of players already enjoying ChessMaster. 
              No credit card required – just pure chess excitement.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/signup" className="btn-primary btn-lg group w-full sm:w-auto">
                Start Playing Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/game/demo" className="btn-outline btn-lg w-full sm:w-auto">
                Try Demo Game
              </Link>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap items-center justify-center gap-8 mt-12 pt-8 border-t border-border">
              <div className="text-center">
                <p className="font-display text-3xl font-bold text-foreground">50K+</p>
                <p className="text-sm text-foreground-muted">Active Players</p>
              </div>
              <div className="text-center">
                <p className="font-display text-3xl font-bold text-foreground">1M+</p>
                <p className="text-sm text-foreground-muted">Games Played</p>
              </div>
              <div className="text-center">
                <p className="font-display text-3xl font-bold text-foreground">4.9★</p>
                <p className="text-sm text-foreground-muted">User Rating</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
