import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

interface DashboardCardProps {
  title: string;
  children: ReactNode;
  icon?: LucideIcon;
  action?: ReactNode;
  className?: string;
}

const DashboardCard = ({ title, children, icon: Icon, action, className = '' }: DashboardCardProps) => {
  return (
    <div className={`card-glass border border-card-border/80 shadow-[0_8px_30px_rgba(0,0,0,0.4)] p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center">
              <Icon className="w-5 h-5 text-primary" />
            </div>
          )}
          <h3 className="font-display font-semibold text-foreground">
            {title}
          </h3>
        </div>
        {action && (
          <div>
            {action}
          </div>
        )}
      </div>

      {/* Content */}
      <div>
        {children}
      </div>
    </div>
  );
};

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    positive: boolean;
  };
  color?: 'primary' | 'warning' | 'success' | 'destructive';
}

const colorClasses = {
  primary: 'bg-primary/10 text-primary border-primary/30',
  warning: 'bg-warning/10 text-warning border-warning/30',
  success: 'bg-success/10 text-success border-success/30',
  destructive: 'bg-destructive/10 text-destructive border-destructive/30',
};

export const StatCard = ({ label, value, icon: Icon, trend, color = 'primary' }: StatCardProps) => {
  return (
    <div className="card-glass border border-card-border/80 shadow-[0_8px_30px_rgba(0,0,0,0.4)] p-5">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-lg border flex items-center justify-center ${colorClasses[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        {trend && (
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${
            trend.positive 
              ? 'bg-success/10 text-success' 
              : 'bg-destructive/10 text-destructive'
          }`}>
            {trend.positive ? '+' : ''}{trend.value}%
          </span>
        )}
      </div>
      <p className="font-display text-2xl font-bold text-foreground mb-1">
        {value}
      </p>
      <p className="text-sm text-foreground-muted">
        {label}
      </p>
    </div>
  );
};

export default DashboardCard;
