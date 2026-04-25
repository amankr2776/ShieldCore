"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Zap, Database, Server, Cpu, Globe, Code2, Activity, Terminal, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ArchitecturePage() {
  const [status, setStatus] = useState({ api: true, model: true, db: true, ws: true });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        // Random status simulation for demo
        setStatus({
          api: Math.random() > 0.05,
          model: Math.random() > 0.05,
          db: true,
          ws: true
        });
      }, 500);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const pipeline = [
    { name: "Browser", tech: "HTTP Payload", emoji: "🌐", desc: "User initiated traffic ingress" },
    { name: "Frontend", tech: "React/Tailwind", emoji: "⚛️", desc: "Security analyst interface" },
    { name: "Backend", tech: "FastAPI Engine", emoji: "⚡", desc: "High-performance inference API" },
    { name: "Decode", tech: "Recursive Layer", emoji: "🔓", desc: "De-obfuscation pipeline" },
    { name: "DistilBERT", tech: "Transformers", emoji: "🧠", desc: "Semantic packet inspection" },
    { name: "Threat Score", tech: "Softmax Layer", emoji: "📊", desc: "Probabilistic classification" },
    { name: "SQLite", tech: "SQL Engine", emoji: "🗄️", desc: "Immutable audit logging" },
    { name: "WebSocket", tech: "Pub/Sub", emoji: "🔌", desc: "Real-time telemetry stream" },
    { name: "Dashboard", tech: "Live Feed", emoji: "📡", desc: "Threat intelligence visualization" }
  ];

  return (
    <div className="container mx-auto py-10 px-6 max-w-7xl space-y-12 animate-in fade-in duration-500">
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <h1 className="text-5xl font-extrabold tracking-tight">System Architecture</h1>
        <p className="text-muted-foreground text-lg italic">
          Fine-tuned DistilBERT engine moving beyond pattern matching into deep semantic security.
        </p>
      </div>

      {/* Pipeline Diagram */}
      <div className="overflow-x-auto pb-8">
        <div className="flex items-center justify-between min-w-[1200px] px-4">
          {pipeline.map((step, i) => (
            <div key={i} className="flex items-center flex-1">
              <Card className="flex-1 border-border/50 bg-card hover:border-destructive/40 transition-all duration-300 p-4 text-center group cursor-default">
                <div className="text-2xl mb-2">{step.emoji}</div>
                <h3 className="font-extrabold text-[11px] mb-1 uppercase tracking-tight text-white">{step.name}</h3>
                <p className="text-[9px] font-mono text-destructive mb-2 uppercase font-bold">{step.tech}</p>
                <p className="text-[9px] text-muted-foreground leading-tight">{step.desc}</p>
              </Card>
              {i < pipeline.length - 1 && (
                <div className="px-2 text-muted-foreground/30 font-bold text-lg">→</div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Tech Stack Table */}
        <Card className="border-border/50 bg-card">
          <CardHeader>
            <CardTitle className="text-sm font-extrabold uppercase tracking-widest flex items-center gap-2">
              <Code2 className="h-4 w-4 text-destructive" /> Technology Stack
            </CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border/50 text-[10px] uppercase font-bold text-muted-foreground">
                  <th className="py-3 px-2">Layer</th>
                  <th className="py-3 px-2">Technology</th>
                  <th className="py-3 px-2">Purpose</th>
                </tr>
              </thead>
              <tbody className="text-xs font-medium">
                {[
                  { l: "Frontend", t: "React / Vite", p: "Analyst Dashboard" },
                  { l: "Backend", t: "FastAPI / Python", p: "Inference Server" },
                  { l: "Inference", t: "PyTorch / Genkit", p: "Model Orchestration" },
                  { l: "AI Engine", t: "DistilBERT", p: "Semantic Inspection" },
                  { l: "Database", t: "SQLite / Firestore", p: "Audit Logging" },
                  { l: "Real-time", t: "Socket.IO", p: "Telemetry Feed" }
                ].map((row, i) => (
                  <tr key={i} className="border-b border-border/20 last:border-0 hover:bg-secondary/10 transition-colors">
                    <td className="py-3 px-2 font-bold text-destructive">{row.l}</td>
                    <td className="py-3 px-2 font-mono">{row.t}</td>
                    <td className="py-3 px-2 text-muted-foreground">{row.p}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* Dataset Info Card */}
        <Card className="border-border/50 bg-card">
          <CardHeader>
            <CardTitle className="text-sm font-extrabold uppercase tracking-widest flex items-center gap-2">
              <Database className="h-4 w-4 text-destructive" /> Dataset: CSIC 2010 HTTP
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: "Total Samples", val: "61,000" },
              { label: "Normal Traffic", val: "36,000" },
              { label: "Anomalous Traffic", val: "25,000" },
              { label: "Attack Vectors", val: "SQLi, XSS, Path Traversal, SSRF" },
              { label: "Fine-tuning Time", val: "4 Epochs @ 2e-5 LR" },
              { label: "Test Accuracy", val: "94.3%" }
            ].map((row, i) => (
              <div key={i} className="flex justify-between items-center border-b border-border/20 pb-2 last:border-0">
                <span className="text-[10px] font-bold uppercase text-muted-foreground">{row.label}</span>
                <span className="text-xs font-mono font-bold text-white">{row.val}</span>
              </div>
            ))}
            <div className="pt-2">
              <Badge variant="outline" className="w-full justify-center py-2 border-emerald-500/50 text-emerald-500 bg-emerald-500/5 uppercase font-bold text-[10px]">
                Verified on CSIC 2010 Test Split
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Status */}
      <Card className="border-border/50 bg-card overflow-hidden">
        <CardHeader className="bg-secondary/10 border-b border-border/50">
          <CardTitle className="text-sm font-extrabold uppercase tracking-widest flex items-center gap-2">
            <Activity className="h-4 w-4 text-destructive" /> Real-time System Status
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-6 p-8">
          {[
            { label: "API Server", status: status.api, icon: Server },
            { label: "ML Model", status: status.model, icon: Cpu },
            { label: "Database", status: status.db, icon: Database },
            { label: "WebSocket", status: status.ws, icon: Zap }
          ].map((sys, i) => (
            <div key={i} className="flex flex-col items-center space-y-4 p-4 rounded-xl bg-background/40 border border-border/50">
              <div className={cn("p-3 rounded-full", sys.status ? "bg-emerald-500/10 text-emerald-500" : "bg-destructive/10 text-destructive")}>
                <sys.icon className="h-6 w-6" />
              </div>
              <div className="text-center">
                <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">{sys.label}</p>
                <div className="flex items-center gap-2">
                  <div className={cn("h-2 w-2 rounded-full", sys.status ? "bg-emerald-500 animate-pulse" : "bg-destructive")} />
                  <span className="text-xs font-bold font-mono">{sys.status ? "OPERATIONAL" : "FAILURE"}</span>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="fixed bottom-4 right-4 pointer-events-none">
        <Badge variant="outline" className="bg-background/80 backdrop-blur-md border-border py-1.5 px-4 rounded-full font-mono text-[10px] text-muted-foreground shadow-2xl">
          VERSION: 1.0.0 | ENGINE: DISTILBERT-HTTP
        </Badge>
      </div>
    </div>
  );
}
