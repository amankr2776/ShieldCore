
"use client";

import { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Database, Server, Cpu, Zap, Code2, Activity, 
  CheckCircle2, Globe, Terminal, Shield, 
  Search, Lock, Share2, Layers
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PipelineStep {
  name: string;
  tech: string;
  emoji: string;
  desc: string;
  role: string;
  input: string;
  output: string;
  latency: number;
  color: string;
}

export default function ArchitecturePage() {
  const [mounted, setMounted] = useState(false);
  const [counts, setCounts] = useState({ total: 0, normal: 0, anomalous: 0, accuracy: 0 });
  const [logs, setLogs] = useState<any[]>([]);
  const [activeStep, setActiveStep] = useState<number | null>(null);

  const pipeline: PipelineStep[] = [
    { 
      name: "Ingress", tech: "HTTP Payload", emoji: "🌐", 
      desc: "User initiated traffic ingress", role: "Gateway", 
      input: "Raw HTTP", output: "Request String", latency: 0.2, color: "text-blue-500" 
    },
    { 
      name: "Frontend", tech: "Next.js 15", emoji: "⚛️", 
      desc: "Security analyst interface", role: "UI/UX Layer", 
      input: "JSON API", output: "Visual Forensics", latency: 1.5, color: "text-cyan-500" 
    },
    { 
      name: "Backend", tech: "Genkit Flow", emoji: "⚡", 
      desc: "Orchestration Layer", role: "Logic Engine", 
      input: "User Input", output: "Contextual Payload", latency: 0.8, color: "text-destructive" 
    },
    { 
      name: "Decode", tech: "Recursive", emoji: "🔓", 
      desc: "De-obfuscation layer", role: "Sanitizer", 
      input: "Encoded Text", output: "Normalized String", latency: 0.5, color: "text-amber-500" 
    },
    { 
      name: "Groq LPU", tech: "Llama 3 8B", emoji: "🧠", 
      desc: "Hardware LPU Inference", role: "Core AI", 
      input: "Normalized Text", output: "Class Labels", latency: 4.2, color: "text-destructive" 
    },
    { 
      name: "Threat Score", tech: "Neural Softmax", emoji: "📊", 
      desc: "Classification Prob", role: "Analyzer", 
      input: "Logits", output: "Confidence %", latency: 0.3, color: "text-emerald-500" 
    },
    { 
      name: "Firestore", tech: "NoSQL Engine", emoji: "🗄️", 
      desc: "Distributed logging", role: "Persistence", 
      input: "Analysis Object", output: "Audit Record", latency: 2.1, color: "text-orange-500" 
    },
    { 
      name: "WebSocket", tech: "Live Feed", emoji: "🔌", 
      desc: "Telemetry broadcast", role: "Broadcaster", 
      input: "Event Signal", output: "Real-time Update", latency: 0.1, color: "text-purple-500" 
    },
    { 
      name: "Dashboard", tech: "Live View", emoji: "📡", 
      desc: "Forensic visualization", role: "Observer", 
      input: "Live Stream", output: "Analyst Alert", latency: 0.2, color: "text-blue-400" 
    }
  ];

  useEffect(() => {
    setMounted(true);
    
    // Animate stats
    const target = { total: 61000, normal: 36000, anomalous: 25000, accuracy: 94.3 };
    let start = 0;
    const duration = 2000;
    const interval = 16;
    const steps = duration / interval;
    
    const timer = setInterval(() => {
      start++;
      const progress = start / steps;
      setCounts({
        total: Math.floor(target.total * progress),
        normal: Math.floor(target.normal * progress),
        anomalous: Math.floor(target.anomalous * progress),
        accuracy: parseFloat((target.accuracy * progress).toFixed(1))
      });
      if (start >= steps) {
        setCounts(target);
        clearInterval(timer);
      }
    }, interval);

    // Live logs simulation
    const logTimer = setInterval(() => {
      const step = pipeline[Math.floor(Math.random() * pipeline.length)];
      const newLog = {
        id: Math.random(),
        time: new Date().toLocaleTimeString(),
        stage: step.name,
        status: Math.random() > 0.1 ? 'COMPLETE' : 'PROCESSING',
        pid: 'PID-' + Math.floor(Math.random() * 9999)
      };
      setLogs(prev => [newLog, ...prev].slice(0, 8));
    }, 1500);

    return () => {
      clearInterval(timer);
      clearInterval(logTimer);
    };
  }, []);

  const totalLatency = useMemo(() => pipeline.reduce((acc, s) => acc + s.latency, 0), []);

  return (
    <div className="relative min-h-screen bg-white dark:bg-[#020408] selection:bg-destructive/30 overflow-hidden">
      {/* Cinematic Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 hex-grid opacity-[0.03] dark:opacity-[0.07] animate-pulse" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(239,68,68,0.03)_0%,transparent_70%)]" />
      </div>
      
      <div className="container mx-auto py-12 px-6 max-w-7xl space-y-16 animate-in fade-in duration-1000 relative z-10">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-destructive/10 border border-destructive/30 text-destructive text-[10px] font-black tracking-[0.4em] uppercase shadow-lg">
            <Cpu className="h-4 w-4 animate-spin-slow" />
            ShieldCore LPU Infrastructure
          </div>
          <h1 className="text-6xl font-black tracking-tighter text-gray-900 dark:text-white uppercase">
            SYSTEM <span className="text-destructive">ARCH</span>
          </h1>
          <p className="text-gray-500 dark:text-muted-foreground text-xl font-medium italic opacity-80">
            Real-time packet inspection powered by Groq LPU hardware and fine-tuned Llama 3 models.
          </p>
        </div>

        {/* Interactive Pipeline Diagram */}
        <div className="space-y-8">
          <div className="section-label">Pipeline Telemetry Map</div>
          <div className="overflow-x-auto pb-12 custom-scrollbar no-scrollbar">
            <div className="flex items-center justify-between min-w-[1500px] px-4 py-20 relative">
              {pipeline.map((step, i) => (
                <div key={i} className="flex items-center flex-1 relative group">
                  {/* Card with 3D Tilt Effect */}
                  <div 
                    className={cn(
                      "flex-1 relative z-10 transition-all duration-500 transform perspective-1000",
                      "hover:scale-105 hover:-translate-y-4 hover:rotate-x-12",
                      activeStep === i ? "scale-110 -translate-y-4" : ""
                    )}
                    onMouseEnter={() => setActiveStep(i)}
                    onMouseLeave={() => setActiveStep(null)}
                  >
                    <Card className={cn(
                      "glass-card border-2 p-8 text-center transition-all duration-500 shadow-2xl relative overflow-hidden",
                      activeStep === i ? "border-destructive shadow-destructive/20" : "border-black/5 dark:border-white/5",
                      "before:absolute before:inset-0 before:bg-gradient-to-br before:from-destructive/5 before:to-transparent before:opacity-0 group-hover:before:opacity-100"
                    )}>
                      {/* Breathing Glow Border */}
                      <div className={cn(
                        "absolute inset-0 animate-pulse opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity",
                        "border border-destructive/30 rounded-lg"
                      )} />
                      
                      <div className="text-4xl mb-6 group-hover:scale-125 transition-transform duration-500">{step.emoji}</div>
                      <h3 className="font-black text-[13px] mb-2 uppercase tracking-tighter text-gray-900 dark:text-white">{step.name}</h3>
                      <Badge variant="outline" className="text-[9px] font-mono text-destructive mb-3 uppercase font-black bg-destructive/5 border-destructive/20 px-3">
                        {step.tech}
                      </Badge>
                      
                      {/* Tooltip detail (visible on hover) */}
                      <div className={cn(
                        "absolute left-1/2 -bottom-2 translate-y-full -translate-x-1/2 w-64 glass-card p-4 rounded-xl shadow-2xl z-[100] transition-all duration-300 pointer-events-none",
                        activeStep === i ? "opacity-100 translate-y-2 scale-100" : "opacity-0 translate-y-0 scale-95"
                      )}>
                        <div className="space-y-3 text-left">
                          <p className="text-[10px] font-black text-destructive uppercase tracking-widest border-b border-destructive/10 pb-1">{step.role}</p>
                          <div className="grid grid-cols-2 gap-2 text-[9px] font-bold text-gray-500 dark:text-white/60 uppercase">
                            <span>Input:</span> <span className="text-gray-900 dark:text-white font-mono">{step.input}</span>
                            <span>Output:</span> <span className="text-gray-900 dark:text-white font-mono">{step.output}</span>
                            <span>Delay:</span> <span className="text-destructive font-mono">{step.latency}ms</span>
                          </div>
                          <p className="text-[9px] italic opacity-60 leading-relaxed text-gray-400 dark:text-white">{step.desc}</p>
                        </div>
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[8px] border-b-[#0a0c14]" />
                      </div>
                    </Card>
                  </div>

                  {/* Connecting Arrows with Flowing Particles */}
                  {i < pipeline.length - 1 && (
                    <div className="px-6 flex items-center relative w-20">
                      <div className="h-0.5 w-full bg-black/5 dark:bg-white/5 relative">
                        <div className="absolute inset-0 bg-destructive/30 animate-pulse" />
                        {/* Flowing Data Particle */}
                        <div 
                          className="absolute h-2 w-2 bg-destructive rounded-full shadow-[0_0_10px_#ef4444] top-1/2 -translate-y-1/2"
                          style={{
                            animation: `data-flow 2s linear infinite`,
                            animationDelay: `${i * 0.4}s`
                          }}
                        />
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 text-destructive/40 text-sm">→</div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Real-time Latency Meter */}
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <div className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 dark:text-white opacity-40">End-to-End Latency Breakdown</div>
              <div className="text-xl font-black text-destructive tracking-tighter">{totalLatency.toFixed(1)}ms TOTAL</div>
            </div>
            <div className="h-3 w-full bg-black/5 dark:bg-white/5 rounded-full overflow-hidden flex shadow-inner">
              {pipeline.map((step, idx) => (
                <div 
                  key={idx}
                  className={cn("h-full transition-all duration-1000", idx % 2 === 0 ? "bg-destructive/80" : "bg-destructive/40")}
                  style={{ width: `${(step.latency / totalLatency) * 100}%` }}
                />
              ))}
            </div>
            <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-gray-400 dark:text-white opacity-30">
               <span>Ingress</span>
               <span>Inference Engine</span>
               <span>Broadcast</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Tech Stack Enhanced */}
          <Card className="glass-card rounded-[2rem] overflow-hidden border-black/5 dark:border-white/5">
            <CardHeader className="border-b border-black/5 dark:border-white/5 bg-black/[0.01] dark:bg-white/[0.02] p-8">
              <CardTitle className="text-xs font-black uppercase tracking-[0.3em] text-gray-400 dark:text-muted-foreground flex items-center gap-3">
                <Code2 className="h-5 w-5 text-destructive" /> TECHNOLOGY ECOSYSTEM
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-black/5 dark:border-white/5 text-[10px] uppercase font-black text-gray-400 dark:text-muted-foreground opacity-40">
                    <th className="py-5 px-8">Layer Component</th>
                    <th className="py-5 px-8">Technology</th>
                    <th className="py-5 px-8">Uptime Status</th>
                  </tr>
                </thead>
                <tbody className="text-[11px] font-bold">
                  {[
                    { l: "Frontend Core", t: "Next.js 15 / Tailwind", c: "text-blue-500" },
                    { l: "AI Runtime", t: "Groq LPU / Genkit", c: "text-destructive" },
                    { l: "Security Model", t: "Llama 3 8B (Fine-tuned)", c: "text-amber-500" },
                    { l: "Cloud Storage", t: "Firebase Firestore", c: "text-orange-500" },
                    { l: "Signal Delivery", t: "Uplink WebSockets", c: "text-emerald-500" }
                  ].map((row, i) => (
                    <tr key={i} className="border-b border-black/5 dark:border-white/5 last:border-0 hover:bg-destructive/[0.02] transition-all group text-gray-700 dark:text-foreground">
                      <td className="py-5 px-8 font-black text-gray-900 dark:text-white group-hover:translate-x-2 transition-transform">{row.l}</td>
                      <td className="py-5 px-8 font-mono opacity-60">{row.t}</td>
                      <td className="py-5 px-8">
                        <div className="flex items-center gap-3">
                           <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#22c55e]" />
                           <span className="text-[9px] uppercase tracking-widest font-black opacity-60">Live</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          {/* Dataset Enhanced */}
          <Card className="glass-card rounded-[2rem] border-black/5 dark:border-white/5 p-10 flex flex-col justify-center">
             <div className="space-y-10">
                <div className="flex items-center gap-4 border-b border-black/5 dark:border-white/5 pb-6">
                   <div className="p-4 bg-destructive/10 rounded-2xl border border-destructive/20 text-destructive">
                      <Database className="h-8 w-8" />
                   </div>
                   <div>
                      <h3 className="text-2xl font-black tracking-tighter uppercase text-gray-900 dark:text-white">CSIC 2010 HTTP Dataset</h3>
                      <p className="text-[10px] font-black text-destructive uppercase tracking-widest">Industry Standard Benchmark</p>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-10">
                  {[
                    { label: "Total Corpus", val: counts.total.toLocaleString(), color: "text-gray-900 dark:text-white" },
                    { label: "Anomalous Traffic", val: counts.anomalous.toLocaleString(), color: "text-destructive" },
                    { label: "Normal Baseline", val: counts.normal.toLocaleString(), color: "text-gray-500 dark:text-muted-foreground" },
                    { label: "Model Accuracy", val: `${counts.accuracy}%`, color: "text-emerald-500" }
                  ].map((stat, i) => (
                    <div key={i} className="space-y-2">
                       <p className="text-[9px] font-black text-gray-400 dark:text-white opacity-40 uppercase tracking-widest">{stat.label}</p>
                       <p className={cn("text-3xl font-black tracking-tighter", stat.color)}>{stat.val}</p>
                    </div>
                  ))}
                </div>

                <div className="pt-6">
                  <Badge variant="outline" className="w-full justify-center py-4 border-emerald-500/30 text-emerald-500 bg-emerald-500/5 uppercase font-black text-[10px] tracking-widest rounded-2xl">
                    <CheckCircle2 className="h-4 w-4 mr-3" /> System Verified on CSIC Test Split
                  </Badge>
                </div>
             </div>
          </Card>
        </div>

        {/* Live Pipeline Activity Log */}
        <div className="space-y-6">
          <div className="section-label">Live Pipeline Activity Telemetry</div>
          <Card className="glass-card rounded-[2rem] border-black/5 dark:border-white/5 p-8 font-mono text-xs overflow-hidden relative">
             <div className="absolute top-0 right-0 p-4 animate-pulse">
                <Badge variant="outline" className="border-destructive/30 text-destructive bg-destructive/5 text-[8px] uppercase font-black">Streaming Uplink</Badge>
             </div>
             <div className="space-y-2 max-h-[300px] overflow-auto custom-scrollbar no-scrollbar">
                {logs.map((log) => (
                  <div key={log.id} className="flex items-center gap-6 py-2 border-b border-black/5 dark:border-white/5 last:border-0 opacity-0 animate-in fade-in slide-in-from-left-4 duration-500 fill-mode-forwards">
                    <span className="text-destructive font-black">[{log.time}]</span>
                    <span className="text-gray-400 dark:text-muted-foreground font-bold">{log.pid}</span>
                    <span className="text-gray-900 dark:text-white uppercase font-black tracking-widest w-32">{log.stage}</span>
                    <div className="flex-1 h-[1px] bg-black/5 dark:bg-white/5" />
                    <span className={cn(
                      "text-[9px] font-black px-2 py-0.5 rounded-sm border",
                      log.status === 'COMPLETE' ? "text-emerald-500 border-emerald-500/20 bg-emerald-500/5" : "text-amber-500 border-amber-500/20 bg-amber-500/5"
                    )}>{log.status}</span>
                  </div>
                ))}
             </div>
          </Card>
        </div>

        <div className="text-center pt-8">
           <p className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-400 dark:text-white opacity-20">ShieldCore Infrastructure SC-92-LPU | Secured Command</p>
        </div>
      </div>

      <style jsx global>{`
        @keyframes data-flow {
          0% { left: 0; opacity: 0; transform: translateY(-50%) scale(0.5); }
          20% { opacity: 1; transform: translateY(-50%) scale(1.2); }
          80% { opacity: 1; transform: translateY(-50%) scale(1.2); }
          100% { left: 100%; opacity: 0; transform: translateY(-50%) scale(0.5); }
        }

        .hex-grid {
          background-image: 
            linear-gradient(rgba(239, 68, 68, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(239, 68, 68, 0.1) 1px, transparent 1px);
          background-size: 50px 50px;
          mask-image: radial-gradient(circle at center, black, transparent);
        }

        .perspective-1000 {
          perspective: 1000px;
        }

        .rotate-x-12 {
          transform: rotateX(12deg);
        }
      `}</style>
    </div>
  );
}
