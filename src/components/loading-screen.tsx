"use client";

import { useEffect, useState } from 'react';
import { Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

export function LoadingScreen() {
  const [text, setText] = useState('');
  const fullText = "Initializing threat detection systems...";
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      setText(fullText.slice(0, index));
      index++;
      if (index > fullText.length) clearInterval(interval);
    }, 40);

    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 2500);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[10000] bg-[#020408] flex flex-col items-center justify-center transition-opacity duration-500 animate-out fade-out fill-mode-forwards" style={{ animationDelay: '2s' }}>
      <div className="relative w-48 h-48 flex items-center justify-center">
        {/* Radar Sweep */}
        <div className="absolute inset-0 radar-sweep opacity-30" />
        <div className="absolute inset-4 border border-destructive/20 rounded-full" />
        <div className="absolute inset-12 border border-destructive/40 rounded-full" />
        
        <div className="relative p-6 bg-destructive/10 rounded-3xl border border-destructive/30 text-destructive animate-pulse">
          <Shield className="h-16 w-16" />
        </div>
      </div>
      
      <div className="mt-8 space-y-2 text-center">
        <p className="font-mono text-xs tracking-[0.3em] text-destructive uppercase animate-pulse">
          ShieldCore Core Ingress
        </p>
        <p className="font-mono text-sm text-muted-foreground h-5">
          {text}<span className="animate-blink">_</span>
        </p>
      </div>
      
      <div className="absolute bottom-12 left-0 right-0 flex justify-center">
        <div className="w-64 h-1 bg-secondary/20 rounded-full overflow-hidden">
          <div className="h-full bg-destructive animate-progress-fast" />
        </div>
      </div>
    </div>
  );
}
