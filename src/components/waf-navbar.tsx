"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield, Zap, Activity, BarChart3, Binary, Bell, LogOut, Moon, Sun, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect } from 'react';
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger,
  SheetHeader,
  SheetTitle,
  SheetDescription 
} from '@/components/ui/sheet';

const navItems = [
  { name: 'Analyzer', href: '/analyzer', icon: Zap },
  { name: 'Live Feed', href: '/live-feed', icon: Activity },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Architecture', href: '/architecture', icon: Binary },
];

export function WafNavbar() {
  const pathname = usePathname();
  const { isAuthenticated, logout, user } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  const isLandingPage = pathname === '/';

  useEffect(() => {
    const saved = localStorage.getItem('theme') as 'dark' | 'light' | null;
    const initialTheme = saved || 'dark';
    setTheme(initialTheme);
    if (initialTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    const interval = setInterval(() => {
      if (Math.random() > 0.8) {
        const newNotif = {
          id: Math.random(),
          type: 'BLOCKED',
          ip: '192.168.' + Math.floor(Math.random() * 255) + '.' + Math.floor(Math.random() * 255),
          attack: ['SQL Injection', 'XSS', 'Path Traversal'][Math.floor(Math.random() * 3)],
          time: new Date().toLocaleTimeString(),
          score: Math.floor(Math.random() * 15) + 85
        };
        setNotifications(prev => [newNotif, ...prev].slice(0, 5));
        setUnreadCount(prev => prev + 1);
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  if (!isAuthenticated && !isLandingPage && pathname !== '/login') return null;

  return (
    <nav className={cn(
      "sticky top-0 z-[5000] w-full transition-all duration-500 border-b",
      isLandingPage 
        ? "bg-transparent border-transparent" 
        : "bg-white/80 dark:bg-black/80 backdrop-blur-xl border-gray-200 dark:border-white/10"
    )}>
      <div className="container flex h-20 items-center justify-between px-6 mx-auto max-w-7xl">
        <Link href="/" className="flex items-center gap-3 font-black text-2xl tracking-tighter text-gray-900 dark:text-white">
          <Shield className="h-8 w-8 text-destructive animate-pulse" />
          <span className="hidden sm:inline">SHIELDCORE <span className="text-destructive">WAF</span></span>
        </Link>
        
        {isAuthenticated && !isLandingPage && (
          <div className="hidden lg:flex gap-1 items-center bg-gray-100 dark:bg-white/5 p-1 rounded-2xl border border-gray-200 dark:border-white/5">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative flex items-center gap-2 px-6 py-2.5 text-xs font-bold uppercase tracking-widest transition-all rounded-xl",
                    isActive 
                      ? "bg-destructive text-white shadow-lg shadow-destructive/20" 
                      : "text-gray-500 dark:text-muted-foreground hover:text-gray-900 dark:hover:text-foreground hover:bg-black/5 dark:hover:bg-white/10"
                  )}
                >
                  <item.icon className="h-3.5 w-3.5" />
                  {item.name}
                </Link>
              );
            })}
          </div>
        )}

        <div className="flex items-center gap-3">
          {!isLandingPage && (
            <>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={toggleTheme} 
                className="rounded-full h-10 w-10 text-gray-500 dark:text-muted-foreground hover:text-gray-900 dark:hover:text-foreground hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
              >
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>

              {!isAuthenticated ? (
                <Button asChild size="sm" className="bg-destructive hover:bg-destructive/90 text-white font-bold rounded-xl px-8 h-12 glow-btn">
                  <Link href="/login">Initialize</Link>
                </Button>
              ) : (
                <div className="flex items-center gap-2">
                  <DropdownMenu onOpenChange={(open) => open && setUnreadCount(0)}>
                    <DropdownMenuTrigger asChild>
                      <button className="relative p-2 text-gray-500 dark:text-muted-foreground hover:text-gray-900 dark:hover:text-foreground transition-colors group">
                        <Bell className="h-5 w-5 group-hover:rotate-12 transition-transform" />
                        {unreadCount > 0 && (
                          <span className="absolute top-1 right-1 h-4 w-4 bg-destructive text-[10px] font-bold text-white rounded-full flex items-center justify-center border-2 border-white dark:border-background shadow-lg badge-glow-red">
                            {unreadCount}
                          </span>
                        )}
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-80 glass-card border-gray-200 dark:border-white/10 shadow-2xl p-0 overflow-hidden">
                      <div className="bg-destructive/10 p-4 border-b border-gray-100 dark:border-white/5">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-destructive">Alert Stream</span>
                          <Badge variant="destructive" className="text-[9px] rounded-sm px-1.5 py-0">Critical</Badge>
                        </div>
                      </div>
                      <div className="max-h-[350px] overflow-auto">
                        {notifications.length === 0 ? (
                          <div className="py-12 text-center text-xs text-gray-400 dark:text-muted-foreground italic font-mono uppercase tracking-widest opacity-50">
                            Zero Threat Activity
                          </div>
                        ) : (
                          notifications.map((n) => (
                            <DropdownMenuItem key={n.id} className="flex flex-col items-start gap-1 p-4 border-b border-gray-100 dark:border-white/5 last:border-0 hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer">
                              <div className="flex w-full justify-between items-center">
                                <span className="text-[10px] font-black text-destructive flex items-center gap-1 uppercase tracking-tighter">
                                  <Shield className="h-3 w-3" /> {n.attack}
                                </span>
                                <span className="text-[9px] font-mono text-gray-400 dark:text-muted-foreground opacity-70">{n.time}</span>
                              </div>
                              <div className="flex w-full justify-between items-center mt-1">
                                <span className="text-xs font-mono font-bold tracking-tight text-gray-700 dark:text-white">{n.ip}</span>
                                <span className="text-[10px] font-bold px-1.5 rounded-sm bg-destructive/10 text-destructive">{n.score}% Confidence</span>
                              </div>
                            </DropdownMenuItem>
                          ))
                        )}
                      </div>
                      <Link href="/live-feed" className="block w-full text-center py-3 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-muted-foreground hover:text-destructive hover:bg-gray-50 dark:hover:bg-white/5 transition-all bg-gray-50/50 dark:bg-white/5">
                        View Full Feed
                      </Link>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="rounded-xl h-10 w-10 border border-gray-200 dark:border-white/10 bg-gray-100 dark:bg-white/5 overflow-hidden hover:bg-gray-200 dark:hover:bg-white/10 transition-colors">
                        <div className="h-full w-full flex items-center justify-center font-black text-xs text-destructive">
                          SC
                        </div>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 glass-card border-gray-200 dark:border-white/10 p-2">
                      <DropdownMenuLabel className="px-3 py-2">
                        <div className="flex flex-col space-y-1">
                          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-muted-foreground">Analyst Node</p>
                          <p className="text-sm font-bold tracking-tight truncate text-gray-900 dark:text-white">{user?.email}</p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator className="bg-gray-100 dark:bg-white/5" />
                      <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer rounded-lg font-bold text-xs uppercase tracking-widest mt-1">
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout System
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  
                  <div className="lg:hidden">
                    <Sheet>
                      <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="rounded-xl h-10 w-10 text-gray-500 dark:text-muted-foreground hover:bg-gray-100 dark:hover:bg-white/10">
                          <Menu className="h-5 w-5" />
                        </Button>
                      </SheetTrigger>
                      <SheetContent side="right" className="glass-card border-l border-gray-200 dark:border-white/10 w-80 p-0">
                        <div className="sr-only">
                          <SheetHeader>
                            <SheetTitle>Navigation Menu</SheetTitle>
                            <SheetDescription>Access dashboard features and telemetry</SheetDescription>
                          </SheetHeader>
                        </div>
                        <div className="p-8 space-y-8">
                          <div className="flex items-center gap-3 font-black text-2xl tracking-tighter text-gray-900 dark:text-white">
                            <Shield className="h-8 w-8 text-destructive" />
                            <span>SHIELDCORE <span className="text-destructive">WAF</span></span>
                          </div>
                          <div className="flex flex-col gap-4">
                            {navItems.map((item) => (
                              <Link key={item.href} href={item.href} className="flex items-center gap-4 p-4 rounded-2xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/5 hover:border-destructive/30 transition-all font-bold uppercase tracking-widest text-xs text-gray-700 dark:text-white">
                                <item.icon className="h-5 w-5 text-destructive" />
                                {item.name}
                              </Link>
                            ))}
                          </div>
                        </div>
                      </SheetContent>
                    </Sheet>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  );
}