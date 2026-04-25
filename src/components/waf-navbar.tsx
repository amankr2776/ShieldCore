"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield, Zap, Activity, BarChart3, Binary, Bell, LogOut, Moon, Sun } from 'lucide-react';
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

  useEffect(() => {
    const saved = localStorage.getItem('fusionx_theme') as 'dark' | 'light';
    if (saved) {
      setTheme(saved);
      document.documentElement.classList.toggle('dark', saved === 'dark');
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('fusionx_theme', next);
    document.documentElement.classList.toggle('dark', next === 'dark');
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

  if (!isAuthenticated && pathname !== '/') return null;

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-destructive" />
      <div className="container flex h-16 items-center justify-between px-6 mx-auto max-w-7xl">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight">
          <Shield className="h-6 w-6 text-destructive" />
          <span className="font-bold text-foreground">FusionX WAF</span>
        </Link>
        
        {isAuthenticated && (
          <div className="hidden md:flex gap-6 items-center">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative flex items-center gap-2 text-sm font-medium transition-all hover:text-foreground",
                    isActive ? "text-destructive" : "text-muted-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                  {isActive && (
                    <span className="absolute -bottom-[21px] left-0 right-0 h-[2px] bg-destructive animate-in fade-in slide-in-from-bottom-1" />
                  )}
                </Link>
              );
            })}
          </div>
        )}

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full text-muted-foreground hover:text-foreground">
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>

          {!isAuthenticated ? (
            <Button asChild size="sm" className="bg-destructive hover:bg-destructive/90 font-bold rounded-full px-6 text-white">
              <Link href="/login">Launch Dashboard</Link>
            </Button>
          ) : (
            <>
              <DropdownMenu onOpenChange={(open) => open && setUnreadCount(0)}>
                <DropdownMenuTrigger asChild>
                  <button className="relative p-2 text-muted-foreground hover:text-foreground transition-colors">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 h-4 w-4 bg-destructive text-[10px] font-bold text-white rounded-full flex items-center justify-center border-2 border-background animate-bounce">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80 bg-card border-border shadow-2xl">
                  <DropdownMenuLabel className="flex justify-between items-center px-4 py-3">
                    <span className="text-sm font-bold uppercase tracking-wider">Recent Alerts</span>
                    <Badge variant="destructive" className="text-[10px]">Critical Only</Badge>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <div className="max-h-[300px] overflow-auto">
                    {notifications.length === 0 ? (
                      <div className="py-8 text-center text-xs text-muted-foreground italic">
                        No critical threats detected recently.
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <DropdownMenuItem key={n.id} className="flex flex-col items-start gap-1 p-4 border-b border-border/30 last:border-0 hover:bg-secondary/50">
                          <div className="flex w-full justify-between items-center">
                            <span className="text-xs font-bold text-destructive flex items-center gap-1 uppercase tracking-tighter">
                              <Shield className="h-3 w-3" /> {n.attack}
                            </span>
                            <span className="text-[10px] font-mono text-muted-foreground">{n.time}</span>
                          </div>
                          <div className="flex w-full justify-between items-center mt-1">
                            <span className="text-xs font-mono">{n.ip}</span>
                            <span className="text-[10px] font-bold px-1.5 rounded bg-destructive/10 text-destructive">{n.score}% Score</span>
                          </div>
                        </DropdownMenuItem>
                      ))
                    )}
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="p-0">
                    <Link href="/live-feed" className="w-full text-center py-2 text-xs font-bold text-muted-foreground hover:text-destructive transition-colors">
                      View All Activity
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <div className="h-4 w-[1px] bg-border mx-1" />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full h-9 w-9 border border-border bg-secondary/50 overflow-hidden">
                    <div className="h-full w-full flex items-center justify-center font-bold text-xs bg-destructive/10 text-destructive">
                      AX
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">Security Analyst</p>
                      <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}