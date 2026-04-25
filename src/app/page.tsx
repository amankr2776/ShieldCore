
"use client";

import Link from 'next/link';
import { Shield, Zap, BarChart3, ArrowRight, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#0f1117] overflow-hidden">
      {/* Animated Background Grid */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_50%_-100px,#3962AC,transparent)]"></div>
      </div>

      {/* Hero Section */}
      <section className="relative z-10 container mx-auto px-6 py-24 flex flex-col items-center text-center space-y-8 animate-in fade-in slide-in-from-top-4 duration-1000">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-destructive/10 border border-destructive/20 text-destructive text-sm font-bold tracking-tight uppercase">
          <Zap className="h-4 w-4" />
          FusionX Hackathon 2026 Edition
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight max-w-4xl leading-tight">
          AI-Powered Web Application <span className="text-destructive">Security</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed">
          Real-time semantic threat detection using transformer intelligence. Stop encoded attacks that rule-based firewalls miss.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <Button asChild size="lg" className="bg-destructive hover:bg-destructive/90 text-white font-bold h-14 px-8 text-lg rounded-full">
            <Link href="/login">Get Started <ArrowRight className="ml-2 h-5 w-5" /></Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="h-14 px-8 text-lg rounded-full border-border/50 hover:bg-secondary/50">
            <Link href="/architecture">View Architecture</Link>
          </Button>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="relative z-10 container mx-auto px-6 py-12 border-y border-border/10 bg-secondary/5 backdrop-blur-sm">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <p className="text-3xl font-bold text-white">61,000</p>
            <p className="text-sm text-muted-foreground uppercase tracking-widest mt-1">Training Samples</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-destructive">94.3%</p>
            <p className="text-sm text-muted-foreground uppercase tracking-widest mt-1">Model Accuracy</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-white">6</p>
            <p className="text-sm text-muted-foreground uppercase tracking-widest mt-1">Attack Categories</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-accent">Under 10ms</p>
            <p className="text-sm text-muted-foreground uppercase tracking-widest mt-1">Inference</p>
          </div>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="relative z-10 container mx-auto px-6 py-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { 
              icon: Shield, 
              title: "Semantic Detection", 
              desc: "DistilBERT understands attack intent not just patterns. Catches encoded, obfuscated, and disguised attacks.",
              color: "text-destructive"
            },
            { 
              icon: Zap, 
              title: "7ms Inference", 
              desc: "Real-time classification pipeline processes every HTTP request in under 10 milliseconds with high precision.",
              color: "text-accent"
            },
            { 
              icon: BarChart3, 
              title: "Live Analytics", 
              desc: "Real-time dashboard showing threat trends, attack distribution, and top attacker intelligence.",
              color: "text-primary"
            }
          ].map((feature, i) => (
            <div key={i} className="group p-8 rounded-2xl bg-card border border-border/50 hover:border-destructive/30 transition-all duration-300 hover:shadow-2xl hover:shadow-destructive/5 flex flex-col items-center text-center">
              <div className={`p-4 rounded-full bg-secondary mb-6 group-hover:scale-110 transition-transform ${feature.color}`}>
                <feature.icon className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 container mx-auto px-6 py-12 mt-auto border-t border-border/10">
        <div className="flex flex-col md:row justify-between items-center gap-6">
          <div className="flex items-center gap-2 font-bold text-xl">
            <Shield className="h-6 w-6 text-destructive" />
            <span>FusionX WAF</span>
          </div>
          <div className="text-sm text-muted-foreground font-mono">
            FusionX WAF v1.0.0 | Powered by DistilBERT | Dataset: CSIC 2010 | Built for FusionX Hackathon 2026
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Lock className="h-3 w-3" /> Secured with transformer-level encryption
          </div>
        </div>
      </footer>
    </div>
  );
}
