"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield, Zap, Activity, BarChart3, Binary } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { name: 'Analyzer', href: '/analyzer', icon: Zap },
  { name: 'Live Feed', href: '/live-feed', icon: Activity },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Architecture', href: '/architecture', icon: Binary },
];

export function WafNavbar() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-6 mx-auto max-w-7xl">
        <Link href="/" className="flex items-center gap-2 font-headline font-bold text-xl tracking-tight">
          <Shield className="h-6 w-6 text-accent" />
          <span className="bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">FusionX WAF</span>
        </Link>
        
        <div className="flex gap-6">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex items-center gap-2 text-sm font-medium transition-colors hover:text-accent",
                  isActive ? "text-accent" : "text-muted-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
                {isActive && (
                  <span className="absolute -bottom-[21px] left-0 right-0 h-0.5 bg-accent" />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}