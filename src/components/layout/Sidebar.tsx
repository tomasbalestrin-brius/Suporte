import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Ticket, Sparkles, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Sidebar() {
  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/tickets', icon: Ticket, label: 'Tickets' },
    { to: '/admin/knowledge', icon: BookOpen, label: 'Base de Conhecimento' },
  ];

  return (
    <aside className="w-64 border-r border-border bg-card/50 backdrop-blur-sm flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-lg">Suporte</h2>
            <p className="text-xs text-muted-foreground">Automatizado</p>
          </div>
        </div>
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

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <p className="text-xs text-center text-muted-foreground">
          Sistema de Suporte v1.0
        </p>
      </div>
    </aside>
  );
}
