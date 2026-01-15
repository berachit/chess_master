import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Crown } from 'lucide-react';

interface AuthCardProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}

const AuthCard = ({ title, subtitle, children, footer }: AuthCardProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-hero py-12 px-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-noise pointer-events-none" />
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center">
            <Crown className="w-6 h-6 text-primary" />
          </div>
          <span className="font-display font-bold text-2xl text-foreground">
            Chess<span className="text-primary">Master</span>
          </span>
        </Link>

        {/* Card */}
        <div className="card p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="font-display text-2xl font-bold text-foreground mb-2">
              {title}
            </h1>
            <p className="text-foreground-muted">
              {subtitle}
            </p>
          </div>

          {/* Form Content */}
          <div className="space-y-6">
            {children}
          </div>

          {/* Footer */}
          <div className="mt-6 pt-6 border-t border-border text-center">
            {footer}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthCard;
