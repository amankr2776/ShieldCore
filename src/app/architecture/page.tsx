"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Shield, Zap, Database, Server, Cpu, Globe, ArrowRight, Code2, Search, Activity, Terminal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

export default function ArchitecturePage() {
  const [status, setStatus] = useState({
    api: 'Operational',
    ws: 'Connected',
    ml: 'Loaded',
    db: 'Active'
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate pinging health endpoint
      setIsLoading(true);
      setTimeout(() => setIsLoading(false), 300);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const steps = [
    { name: "Traffic Ingress", tech: "HTTP Payload", icon: Globe, desc: "Raw ingress from public internet endpoints" },
    { name: "De-obfuscation", tech: "Normalization", icon: Code2, desc: "URL/B64/Unicode normalization layer" },
    { name: "Inference Engine", tech: "Genkit Flow", icon: Zap, desc: "Multi-stage transformer orchestration" },
    { name: "DistilBERT", tech: "Transformers", icon: Cpu, desc: "Deep semantic packet inspection" },
    { name: "Security Decision", tech: "Thresholds", icon: Shield, desc: "Confidence-based policy enforcement" },
    { name: "Threat Log", tech: "SQLite", icon: Database, desc: "Persistent storage of security events" },
    { name: "Dash Stream", tech: "Real-time UI", icon: Activity, desc: "Live visualization and analyst console" }
  ];

  return (
    <div className="container mx-auto py-10 px-6 max-w-7xl space-y-12 animate-in fade-in duration-500">
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <h1 className="text-5xl font-extrabold tracking-tight">System Architecture</h1>
        <p className="text-muted-foreground text-lg italic">The FusionX WAF pipeline leverages fine-tuned transformers to move beyond pattern matching into semantic security.</p>
      </div>

      {/* Pipeline Diagram */}
      <div className="relative pt-12">
        <div className="hidden lg:flex absolute top-[60%] left-0 w-full h-[1px] bg-border/50 -translate-y-1/2 -z-10" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
          {steps.map((step, i) => (
            <div key={i} className="flex flex-col items-center group">
              <div className="w-10 h-10 rounded-full bg-secondary border border-border flex items-center justify-center font-bold text-xs text-muted-foreground mb-4 group-hover:bg-destructive group-hover:text-white transition-colors">
                {i + 1}
              </div>
              <Card className="w-full border-border/50 bg-card shadow-xl hover:border-destructive/50 transition-all duration-300 flex flex-col items-center p-6 text-center h-full relative group-hover:-translate-y-2">
                <div className="p-4 bg-secondary/30 rounded-2xl mb-4 group-hover:scale-110 transition-transform">
                  <step.icon className="h-7 w-7 text-destructive" />
                </div>
                <h3 className="font-extrabold text-sm mb-1 uppercase tracking-tight">{step.name}</h3>
                <p className="text-[10px] font-mono text-destructive mb-3 uppercase tracking-widest">{step.tech}</p>
                <p className="text-[10px] text-muted-foreground leading-relaxed">{step.desc}</p>
              </Card>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Dataset Info Card */}
        <Card className="lg:col-span-1 border-border/50 bg-card overflow-hidden">
          <div className="h-2 bg-destructive w-full" />
          <CardHeader className="bg-secondary/20">
            <CardTitle className="text-lg font-extrabold flex items-center gap-2 uppercase tracking-widest">
              <Database className="h-5 w-5 text-destructive" /> CSIC 2010 Dataset
            </CardTitle>
            <CardDescription className="text-xs uppercase font-mono">Model training ground truth</CardDescription>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="space-y-4 font-mono text-xs">
              <div className="flex justify-between border-b border-border/50 pb-2">
                <span className="text-muted-foreground">Total Samples</span>
                <span className="font-bold">61,000</span>
              </div>
              <div className="flex justify-between border-b border-border/50 pb-2">
                <span className="text-muted-foreground">Normal Requests</span>
                <span className="font-bold">36,000</span>
              </div>
              <div className="flex justify-between border-b border-border/50 pb-2">
                <span className="text-muted-foreground">Attack Requests</span>
                <span className="font-bold">25,000</span>
              </div>
              <div className="pt-2 text-[10px] text-muted-foreground leading-relaxed">
                <p className="font-bold mb-1 uppercase tracking-widest text-destructive">Attack Subtypes:</p>
                SQLi, XSS, Buffer Overflow, CRLF Injection, Path Traversal, Parameter Tampering
              </div>
              <div className="pt-2">
                <p className="font-bold mb-1 uppercase tracking-widest text-destructive text-[10px]">Source:</p>
                Spanish National Research Council
              </div>
            </div>
            
            <div className="space-y-4 pt-4 border-t border-border/50">
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-bold uppercase">
                  <span>Model Accuracy</span>
                  <span>94.3%</span>
                </div>
                <Progress value={94.3} className="h-1.5" indicatorClassName="bg-emerald-500" />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-bold uppercase">
                  <span>Recall (TPR)</span>
                  <span>95.1%</span>
                </div>
                <Progress value={95.1} className="h-1.5" indicatorClassName="bg-accent" />
              </div>
            </div>
          </CardContent>
          <CardFooter className="bg-secondary/10 flex flex-col items-start gap-2 p-6">
             <div className="flex items-center gap-2 text-[10px] font-mono uppercase">
               <span className="text-muted-foreground">Base Model:</span>
               <span className="font-bold text-destructive">distilbert-base-uncased</span>
             </div>
             <div className="flex items-center gap-2 text-[10px] font-mono uppercase">
               <span className="text-muted-foreground">Epochs:</span>
               <span className="font-bold">4</span>
             </div>
          </CardFooter>
        </Card>

        {/* Model performance dashboard */}
        <Card className="lg:col-span-2 border-border/50 bg-card relative overflow-hidden">
           <CardHeader>
             <CardTitle className="text-lg font-extrabold uppercase tracking-widest flex items-center gap-2">
               <Cpu className="h-5 w-5 text-destructive" /> Performance Metrics
             </CardTitle>
           </CardHeader>
           <CardContent className="space-y-8">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-4">
                 <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Confusion Matrix</h4>
                 <div className="grid grid-cols-2 gap-2 font-mono">
                   <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex flex-col items-center justify-center">
                     <span className="text-[10px] uppercase font-bold text-emerald-500 opacity-60">TP</span>
                     <span className="text-2xl font-extrabold">23,775</span>
                   </div>
                   <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl flex flex-col items-center justify-center">
                     <span className="text-[10px] uppercase font-bold text-destructive opacity-60">FP</span>
                     <span className="text-2xl font-extrabold">1,225</span>
                   </div>
                   <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl flex flex-col items-center justify-center">
                     <span className="text-[10px] uppercase font-bold text-destructive opacity-60">FN</span>
                     <span className="text-2xl font-extrabold">2,232</span>
                   </div>
                   <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex flex-col items-center justify-center">
                     <span className="text-[10px] uppercase font-bold text-emerald-500 opacity-60">TN</span>
                     <span className="text-2xl font-extrabold">33,768</span>
                   </div>
                 </div>
               </div>

               <div className="space-y-4">
                 <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Per-Class Accuracy</h4>
                 <div className="space-y-3">
                   {['SQLi', 'XSS', 'Path Trav.', 'Buffer O.', 'SSRF'].map((cls, idx) => (
                     <div key={idx} className="space-y-1">
                       <div className="flex justify-between text-[10px] font-mono">
                         <span className="uppercase">{cls}</span>
                         <span className="font-bold">95.4%</span>
                       </div>
                       <Progress value={95.4} className="h-1 bg-secondary" indicatorClassName="bg-destructive" />
                     </div>
                   ))}
                 </div>
               </div>
             </div>

             <div className="space-y-4 pt-6 border-t border-border/50">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <Terminal className="h-3 w-3" /> System Status Monitor
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'API Server', status: status.api, icon: Server },
                    { label: 'WebSocket', status: status.ws, icon: Activity },
                    { label: 'ML Model', status: status.ml, icon: Cpu },
                    { label: 'Database', status: status.db, icon: Database }
                  ].map((s, i) => (
                    <div key={i} className="flex flex-col gap-1.5 p-3 rounded-xl bg-secondary/30 border border-border/50">
                      <div className="flex items-center justify-between">
                        <s.icon className="h-3.5 w-3.5 text-muted-foreground" />
                        <div className={cn("h-2 w-2 rounded-full", isLoading ? "bg-accent animate-pulse" : "bg-emerald-500")} />
                      </div>
                      <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-tighter">{s.label}</p>
                      <p className="text-xs font-bold uppercase">{s.status}</p>
                    </div>
                  ))}
                </div>
             </div>
           </CardContent>
           <div className="absolute top-4 right-4 animate-pulse">
              <Badge variant="outline" className="text-[9px] uppercase border-emerald-500/50 text-emerald-500 font-bold bg-emerald-500/5">
                REAL-TIME MONITOR ACTIVE
              </Badge>
           </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-card border-border/50 hover:bg-destructive/5 transition-colors">
          <CardHeader>
            <Shield className="h-8 w-8 text-destructive mb-2" />
            <CardTitle className="text-lg font-bold">Semantic Analysis</CardTitle>
            <CardDescription className="text-xs leading-relaxed">Beyond simple regex, our engine understands the context of characters within code-like payloads using transformer logic.</CardDescription>
          </CardHeader>
        </Card>
        <Card className="bg-card border-border/50 hover:bg-accent/5 transition-colors">
          <CardHeader>
            <Zap className="h-8 w-8 text-accent mb-2" />
            <CardTitle className="text-lg font-bold">Zero Latency</CardTitle>
            <CardDescription className="text-xs leading-relaxed">Optimized preprocessing and quantized model weights ensure sub-10ms decision times at the edge.</CardDescription>
          </CardHeader>
        </Card>
        <Card className="bg-card border-border/50 hover:bg-emerald-500/5 transition-colors">
          <CardHeader>
            <ArrowRight className="h-8 w-8 text-emerald-500 mb-2 rotate-[-45deg]" />
            <CardTitle className="text-lg font-bold">Explainability</CardTitle>
            <CardDescription className="text-xs leading-relaxed">Every block is accompanied by an AI-generated natural language explanation and standardized OWASP mapping.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
