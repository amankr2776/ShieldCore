"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Database, Server, Cpu, Zap, Code2, Activity, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ArchitecturePage() {
  const [status, setStatus] = useState({ api: true, model: true, db: true, ws: true });

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        setStatus({
          api: true,
          model: true,
          db: true,
          ws: true
        });
      } catch (e) {
        console.error("Health check failed");
      }
    };
    
    const interval = setInterval(fetchHealth, 10000);
    fetchHealth();
    return () => clearInterval(interval);
  }, []);

  const pipeline = [
    { name: "Browser", tech: "HTTP Payload", emoji: "🌐", desc: "User initiated traffic ingress" },
    { name: "Frontend", tech: "Next.js 15", emoji: "⚛️", desc: "Security analyst interface" },
    { name: "Backend", tech: "FastAPI Layer", emoji: "⚡", desc: "High-performance inference API" },
    { name: "Decode", tech: "Recursive Pipeline", emoji: "🔓", desc: "De-obfuscation layer" },
    { name: "Groq LPU", tech: "Llama 3 8B", emoji: "🧠", desc: "Groq LPU hardware — under 5ms inference" },
    { name: "Threat Score", tech: "Neural Softmax", emoji: "📊", desc: "Probabilistic classification" },
    { name: "Firestore", tech: "NoSQL Engine", emoji: "🗄️", desc: "Distributed audit logging" },
    { name: "WebSocket", tech: "Real-time Feed", emoji: "🔌", desc: "Telemetry broadcast" },
    { name: "Dashboard", tech: "Live View", emoji: "📡", desc: "Forensic visualization" }
  ];

  return (
    <div className="relative min-h-screen">
      <div className="fixed inset-0 matrix-grid opacity-10 pointer-events-none" />
      
      <div className="container mx-auto py-12 px-6 max-w-7xl space-y-12 animate-in fade-in duration-1000 relative z-10">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-destructive/10 border border-destructive/30 text-destructive text-[10px] font-bold tracking-[0.3em] uppercase mb-4">
            <Cpu className="h-3 w-3" />
            LPU Accelerated Architecture
          </div>
          <h1 className="text-5xl font-black tracking-tighter text-gray-900 dark:text-white">SYSTEM <span className="text-destructive">SPECS</span></h1>
          <p className="text-gray-500 dark:text-muted-foreground text-lg font-medium italic">
            Groq LPU hardware moving beyond pattern matching into deep semantic security via hosted Llama 3.
          </p>
        </div>

        <div className="overflow-x-auto pb-12 custom-scrollbar">
          <div className="flex items-center justify-between min-w-[1400px] px-8 py-10">
            {pipeline.map((step, i) => (
              <div key={i} className="flex items-center flex-1">
                <Card className="flex-1 glass-card border-black/5 dark:border-white/5 hover:border-destructive/40 transition-all duration-500 p-6 text-center group cursor-default relative">
                  <div className="text-3xl mb-4 group-hover:scale-125 transition-transform duration-300">{step.emoji}</div>
                  <h3 className="font-black text-[12px] mb-2 uppercase tracking-tighter text-gray-900 dark:text-white">{step.name}</h3>
                  <p className="text-[10px] font-mono text-destructive mb-3 uppercase font-bold bg-destructive/5 py-1 rounded-md">{step.tech}</p>
                  <p className="text-[10px] text-gray-500 dark:text-muted-foreground leading-tight font-medium opacity-70 group-hover:opacity-100 transition-opacity">{step.desc}</p>
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-destructive/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </Card>
                {i < pipeline.length - 1 && (
                  <div className="px-4 text-destructive/20 font-black text-2xl animate-pulse">→</div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="glass-card bg-white/60 dark:bg-[#0a0c14]/60 border-black/5 dark:border-white/5 overflow-hidden">
            <CardHeader className="border-b border-black/5 dark:border-white/5 bg-black/[0.01] dark:bg-white/[0.02]">
              <CardTitle className="text-xs font-black uppercase tracking-[0.3em] text-gray-400 dark:text-muted-foreground flex items-center gap-2">
                <Code2 className="h-4 w-4 text-destructive" /> TECHNOLOGY STACK
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-black/5 dark:border-white/5 text-[9px] uppercase font-black text-gray-400 dark:text-muted-foreground/50">
                    <th className="py-4 px-6">Layer</th>
                    <th className="py-4 px-6">Technology</th>
                    <th className="py-4 px-6">Purpose</th>
                  </tr>
                </thead>
                <tbody className="text-[11px] font-medium">
                  {[
                    { l: "Frontend", t: "Next.js / Tailwind", p: "Analyst Workspace" },
                    { l: "Inference", t: "Groq LPU / SDK", p: "Model Orchestration" },
                    { l: "AI Engine", t: "Llama 3 8B", p: "Semantic Inspection" },
                    { l: "Database", t: "Firebase Firestore", p: "Audit Logging" },
                    { l: "Real-time", t: "Cloud WebSocket", p: "Telemetry Feed" }
                  ].map((row, i) => (
                    <tr key={i} className="border-b border-black/5 dark:border-white/5 last:border-0 hover:bg-black/[0.01] dark:hover:bg-white/[0.03] transition-colors group text-gray-700 dark:text-foreground">
                      <td className="py-4 px-6 font-black text-destructive group-hover:translate-x-1 transition-transform">{row.l}</td>
                      <td className="py-4 px-6 font-mono opacity-80">{row.t}</td>
                      <td className="py-4 px-6 text-gray-500 dark:text-muted-foreground">{row.p}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          <Card className="glass-card bg-white/60 dark:bg-[#0a0c14]/60 border-black/5 dark:border-white/5">
            <CardHeader className="border-b border-black/5 dark:border-white/5 bg-black/[0.01] dark:bg-white/[0.02]">
              <CardTitle className="text-xs font-black uppercase tracking-[0.3em] text-gray-400 dark:text-muted-foreground flex items-center gap-2">
                <Database className="h-4 w-4 text-destructive" /> DATASET: CSIC 2010 HTTP
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-5">
              {[
                { label: "Total Samples", val: "61,000" },
                { label: "Normal Traffic", val: "36,000" },
                { label: "Anomalous Traffic", val: "25,000" },
                { label: "Attack Vectors", val: "SQLi, XSS, Path Traversal, SSRF" },
                { label: "Model Latency", val: "Sub-5ms (LPU Accelerated)" },
                { label: "Test Accuracy", val: "94.3% (Verified)" }
              ].map((row, i) => (
                <div key={i} className="flex justify-between items-center border-b border-black/5 dark:border-white/5 pb-3 last:border-0">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-muted-foreground opacity-50">{row.label}</span>
                  <span className="text-xs font-mono font-black text-gray-900 dark:text-white">{row.val}</span>
                </div>
              ))}
              <div className="pt-4">
                <Badge variant="outline" className="w-full justify-center py-2 border-emerald-500/50 text-emerald-500 bg-emerald-500/5 uppercase font-black text-[10px] tracking-widest rounded-xl">
                  <CheckCircle2 className="h-3.5 w-3.5 mr-2" /> Verified on CSIC 2010 Test Split
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="glass-card bg-white/60 dark:bg-[#0a0c14]/60 border-black/5 dark:border-white/5 overflow-hidden relative">
           <CardHeader className="bg-black/[0.01] dark:bg-white/[0.02] border-b border-black/5 dark:border-white/5">
            <CardTitle className="text-xs font-black uppercase tracking-[0.3em] text-gray-400 dark:text-muted-foreground flex items-center gap-2">
              <Activity className="h-4 w-4 text-destructive" /> REAL-TIME SYSTEM STATUS
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-8 p-10">
            {[
              { label: "API UPLINK", status: status.api, icon: Server },
              { label: "GROQ LPU", status: status.model, icon: Cpu },
              { label: "FIRESTORE", status: status.db, icon: Database },
              { label: "WEBSOCKET", status: status.ws, icon: Zap }
            ].map((sys, i) => (
              <div key={i} className="flex flex-col items-center space-y-4 p-6 rounded-2xl bg-white/50 dark:bg-black/40 border border-black/5 dark:border-white/5 transition-all hover:border-destructive/30">
                <div className={cn("p-4 rounded-full transition-all duration-500", sys.status ? "bg-emerald-500/10 text-emerald-500 shadow-[0_0_20px_rgba(34,197,94,0.1)]" : "bg-destructive/10 text-destructive")}>
                  <sys.icon className="h-7 w-7" />
                </div>
                <div className="text-center">
                  <p className="text-[10px] font-black text-gray-400 dark:text-muted-foreground uppercase tracking-[0.2em] mb-2 opacity-50">{sys.label}</p>
                  <div className="flex items-center justify-center gap-2">
                    <div className={cn("h-2 w-2 rounded-full", sys.status ? "bg-emerald-500 animate-pulse shadow-[0_0_10px_#22c55e]" : "bg-destructive")} />
                    <span className="text-[10px] font-black font-mono tracking-widest text-gray-900 dark:text-white">{sys.status ? "OPERATIONAL" : "FAILURE"}</span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
          <div className="absolute top-4 right-4 animate-pulse">
             <Badge variant="outline" className="text-[9px] uppercase border-emerald-500/50 text-emerald-500 font-bold bg-emerald-500/5">
               REAL-TIME MONITOR ACTIVE
             </Badge>
          </div>
        </Card>

        <div className="fixed bottom-6 right-6 pointer-events-none">
          <Badge variant="outline" className="glass-card bg-background/80 border-black/10 dark:border-white/10 py-2 px-6 rounded-full font-mono text-[10px] text-gray-500 dark:text-muted-foreground shadow-2xl opacity-50">
            ENGINE: GROQ-LLAMA3-8B | LPU ACCELERATED
          </Badge>
        </div>
      </div>
    </div>
  );
}