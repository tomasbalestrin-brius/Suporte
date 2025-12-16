import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Ticket, BookOpen, LogOut, User, Webhook } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import { BethelLogo } from '@/components/ui/BethelLogo';

export function Sidebar() {
  const navigate = useNavigate();
  const { user, signOut } = useAuthStore();

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/tickets', icon: Ticket, label: 'Tickets' },
    { to: '/admin/knowledge', icon: BookOpen, label: 'Base de Conhecimento' },
    { to: '/admin/webhooks', icon: Webhook, label: 'Webhooks' },
  ];

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <aside className="w-64 border-r border-border bg-card/50 backdrop-blur-sm flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <BethelLogo variant="full" className="text-foreground" subtitle="Suporte" />
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-all',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )
            }
          >
            <item.icon className="h-5 w-5" />
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer - User Info */}
      <div className="p-4 border-t border-border space-y-3">
        {user && (
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-muted/50">
            <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center flex-shrink-0">
              <User className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.name || user.email}</p>
              <p className="text-xs text-muted-foreground capitalize">{user.role || 'admin'}</p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sair
        </button>
      </div>
    </aside>
  );
}
