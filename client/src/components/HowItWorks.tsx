import { UserPlus, Gamepad2, TrendingUp, ArrowRight } from 'lucide-react';

const steps = [
  {
    icon: UserPlus,
    number: '01',
    title: 'Create Your Account',
    description: 'Sign up in seconds with just your email. No credit card required to start playing.',
  },
  {
    icon: Gamepad2,
    number: '02',
    title: 'Choose Your Game Mode',
    description: 'Play against friends, random opponents, or challenge our AI at various difficulty levels.',
  },
  {
    icon: TrendingUp,
    number: '03',
    title: 'Improve & Climb Ranks',
    description: 'Track your progress, analyze games, and watch your rating soar as you master new strategies.',
  },
];

const HowItWorks = () => {
  return (
    <section className="py-24 bg-background-secondary relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-noise pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Getting Started
          </span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Start Playing in
            <span className="text-gradient"> Three Simple Steps</span>
          </h2>
          <p className="text-foreground-muted text-lg max-w-2xl mx-auto">
            Getting started with ChessMaster is quick and easy. 
            You'll be playing your first game in under a minute.
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connection Lines */}
          <div className="hidden md:block absolute top-20 left-1/3 right-1/3 h-0.5">
            <div className="w-full h-full bg-gradient-to-r from-primary/50 via-primary to-primary/50" />
          </div>

          {steps.map((step, index) => (
            <div key={step.number} className="relative">
              <div className="card p-8 text-center h-full">
                {/* Number Badge */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-primary text-primary-foreground font-display font-bold text-sm flex items-center justify-center shadow-glow">
                  {index + 1}
                </div>

                {/* Icon */}
                <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 flex items-center justify-center mb-6">
                  <step.icon className="w-8 h-8 text-primary" />
                </div>

                {/* Content */}
                <h3 className="font-display text-xl font-semibold text-foreground mb-3">
                  {step.title}
                </h3>
                <p className="text-foreground-muted text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>

              {/* Arrow (hidden on last item) */}
              {index < steps.length - 1 && (
                <div className="hidden md:flex absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                  <ArrowRight className="w-8 h-8 text-primary/50" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
