import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import NotificationBell from './NotificationBell';
import LanguageSwitcher from './LanguageSwitcher';
import { useAuth } from '@/lib/AuthContext';
import { useLanguage } from '@/lib/LanguageContext';

export default function Navbar() {
  const location = useLocation();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const isActive = (p) => location.pathname === p;

  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);

  return (
    <nav className="sticky top-0 z-50 bg-card/80 backdrop-blur-xl border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full overflow-hidden ring-2 ring-primary/30 bg-primary/10 flex items-center justify-center shrink-0">
              <img
                src="https://media.base44.com/images/public/6a017c522945d53d0a49d427/b7df7c42b_ChatGPTImageJun4202607_14_22PM.png"
                alt="MealConnect Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="leading-tight">
              <span className="font-bold text-foreground text-[15px] tracking-tight">Share A Meal</span>
              <span className="block text-[9px] font-semibold tracking-[0.2em] text-muted-foreground uppercase">FoodBridge</span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            <Link to="/leaderboard"><Button variant={isActive('/leaderboard') ? 'secondary' : 'ghost'} size="sm">{t('nav_leaderboard')}</Button></Link>
            <Link to="/fundraising"><Button variant={isActive('/fundraising') ? 'secondary' : 'ghost'} size="sm">{t('nav_fundraising')}</Button></Link>
            {user && <>
              <Link to="/dashboard"><Button variant={isActive('/dashboard') ? 'secondary' : 'ghost'} size="sm">{t('nav_dashboard')}</Button></Link>
              <Link to="/nearby"><Button variant={isActive('/nearby') ? 'secondary' : 'ghost'} size="sm">{t('nav_nearby')}</Button></Link>
              <Link to="/analytics"><Button variant={isActive('/analytics') ? 'secondary' : 'ghost'} size="sm">{t('nav_analytics')}</Button></Link>
            </>}
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setDark(d => !d)} aria-label="Toggle theme">
              {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            <LanguageSwitcher />
            {user ? (
              <>
                <NotificationBell />
                <Link to="/profile">
                  <Button variant="ghost" size="sm" className="hidden md:flex">{user.full_name || t('nav_profile')}</Button>
                </Link>
              </>
            ) : (
              <Link to="/"><Button size="sm" className="bg-primary hover:bg-primary/90 text-white">Get started</Button></Link>
            )}
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden"><Menu className="w-5 h-5" /></Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64">
                <div className="flex flex-col gap-2 mt-8">
                  <Link to="/leaderboard" onClick={() => setOpen(false)}><Button variant="ghost" className="w-full justify-start">{t('nav_leaderboard')}</Button></Link>
                  <Link to="/fundraising" onClick={() => setOpen(false)}><Button variant="ghost" className="w-full justify-start">{t('nav_fundraising')}</Button></Link>
                  {user && <>
                    <Link to="/dashboard" onClick={() => setOpen(false)}><Button variant="ghost" className="w-full justify-start">{t('nav_dashboard')}</Button></Link>
                    <Link to="/nearby" onClick={() => setOpen(false)}><Button variant="ghost" className="w-full justify-start">{t('nav_nearby')}</Button></Link>
                    <Link to="/analytics" onClick={() => setOpen(false)}><Button variant="ghost" className="w-full justify-start">{t('nav_analytics')}</Button></Link>
                    <Link to="/profile" onClick={() => setOpen(false)}><Button variant="ghost" className="w-full justify-start">{t('nav_profile')}</Button></Link>
                  </>}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
