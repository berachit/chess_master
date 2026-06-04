import { Link } from 'react-router-dom';
import { 
  Users, 
  Bot, 
  Link as LinkIcon, 
  Trophy, 
  Target, 
  Handshake,
  Clock,
  ChevronRight,
  Plus
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import DashboardCard, { StatCard } from '../components/DashboardCard';

// Placeholder data
const user = {
  name: 'Magnus Carlsen',
  username: 'magnuschess',
  rating: 2847,
  avatar: null,
};

const recentGames = [
  { id: '1', opponent: 'hikaru', result: 'win', moves: 34, time: '5 min ago', rating: 2785 },
  { id: '2', opponent: 'firouzja', result: 'draw', moves: 52, time: '2 hours ago', rating: 2760 },
  { id: '3', opponent: 'caruana', result: 'loss', moves: 41, time: '1 day ago', rating: 2795 },
  { id: '4', opponent: 'nepo', result: 'win', moves: 28, time: '2 days ago', rating: 2755 },
];

const quickActions = [
  { label: 'Play Online', icon: Users, path: '/play/online', color: 'bg-gradient-to-br from-emerald-500 to-teal-600' },
  { label: 'Play vs Bot', icon: Bot, path: '/play/bot', color: 'bg-gradient-to-br from-blue-500 to-indigo-600' },
  { label: 'Private Game', icon: LinkIcon, path: '/play/private', color: 'bg-gradient-to-br from-amber-500 to-orange-600' },
];

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold text-foreground mb-2">
              Welcome back, {user.name.split(' ')[0]}! 👋
            </h1>
            <p className="text-foreground-muted">
              Ready for your next game? Your current rating is <span className="text-primary font-semibold">{user.rating}</span>
            </p>
          </div>


          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              label="Games Played"
              value={1284}
              icon={Target}
              trend={{ value: 12, positive: true }}
              color="primary"
            />
            <StatCard
              label="Total Wins"
              value={847}
              icon={Trophy}
              trend={{ value: 8, positive: true }}
              color="success"
            />
            <StatCard
              label="Draws"
              value={198}
              icon={Handshake}
              color="warning"
            />
            <StatCard
              label="Current Rating"
              value={user.rating}
              icon={Target}
              trend={{ value: 15, positive: true }}
              color="primary"
            />
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Recent Games */}
            <div className="lg:col-span-2">
              <DashboardCard
                title="Recent Games"
                icon={Clock}
                action={
                  <Link to="/games" className="text-sm text-primary hover:underline">
                    View all
                  </Link>
                }
              >
                <div className="space-y-3">
                  {recentGames.map((game) => (
                    <Link
                      key={game.id}
                      to={`/game/${game.id}/replay`}
                      className="flex items-center gap-4 p-3 -mx-3 rounded-lg hover:bg-secondary/50 transition-colors group"
                    >
                      {/* Result Indicator */}
                      <div className={`
                        w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm
                        ${game.result === 'win' ? 'bg-success/10 text-success' : ''}
                        ${game.result === 'loss' ? 'bg-destructive/10 text-destructive' : ''}
                        ${game.result === 'draw' ? 'bg-muted text-foreground-muted' : ''}
                      `}>
                        {game.result === 'win' ? 'W' : game.result === 'loss' ? 'L' : 'D'}
                      </div>

                      {/* Game Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-foreground">vs {game.opponent}</span>
                          <span className="text-xs text-foreground-muted">({game.rating})</span>
                        </div>
                        <p className="text-sm text-foreground-muted">
                          {game.moves} moves • {game.time}
                        </p>
                      </div>

                      <ChevronRight className="w-5 h-5 text-foreground-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  ))}
                </div>
              </DashboardCard>
            </div>

            {/* Profile Card */}
            <div>
              <DashboardCard title="Your Profile" icon={Users}>
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
                    <span className="font-display font-bold text-primary">{user.rating} ELO</span>
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

      <Footer />
    </div>
  );
};

export default Dashboard;
