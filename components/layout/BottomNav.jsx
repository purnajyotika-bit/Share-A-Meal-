import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, LayoutDashboard, MapPin, User } from 'lucide-react';

const TABS = [
  { to: '/',          icon: Home,             label: 'Home' },
  { to: '/dashboard', icon: LayoutDashboard,  label: 'Dashboard' },
  { to: '/nearby',    icon: MapPin,           label: 'Nearby' },
  { to: '/profile',   icon: User,             label: 'Profile' },
];

export default function BottomNav() {
  const { pathname } = useLocation();
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card/90 backdrop-blur-xl border-t border-border"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="flex">
        {TABS.map(({ to, icon: Icon, label }) => {
          const active = pathname === to;
          return (
            <Link key={to} to={to} className={`flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 select-none transition-colors
              ${active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
              <Icon className={`w-5 h-5 transition-transform ${active ? 'scale-110' : ''}`} />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
