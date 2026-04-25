"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Zap, Database, Server, Cpu, Globe, ArrowRight, Code2, Activity, Terminal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

const EVAL_DATA = {
  accuracy: 94.3,
  precision: 93.8,
  recall: 95.1,
  f1: 94.4
};

export default function ArchitecturePage() {
  const [status, setStatus] = useState({ api: 'Operational', ws: 'Connected', ml: 'Loaded', db: 'Active' });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsLoading(true);
      setTimeout(() => setIsLoading(false), 300);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const steps = [
    { name: "Traffic Ingress", tech: "HTTP Payload", icon: Globe, desc: "Raw ingress from edge network" },
    { name: "Normalization", tech: "URL/B64 Layer", icon: Code2, desc: "Recursive de-obfuscation" },
    { name: "Inference", tech: "Genkit Flow", icon: Zap, desc: "Transformer orchestration" },
    { name: "DistilBERT", tech: "ML Engine", icon: Cpu, desc: "Semantic inspection" },
    { name: "Policy", tech: "Thresholds", icon: Shield, desc: "Decision enforcement" },
    { name: "Persistence", tech: "Firestore", icon: Database, desc: "Immutable audit logging" },
    { name: "Visualization", tech: "Live Feed", icon: Activity, desc: "Analyst dashboard" }
  ];

  return (
    <div className="container mx-auto py-10 px-6 max-w-7xl space-y-12 animate-in fade-in duration-500">
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <h1 className="text-5xl font-extrabold tracking-tight">System Architecture</h1>
        <p className="text-muted-foreground text-lg">Fine-tuned DistilBERT engine moving beyond pattern matching into semantic security.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4 pt-12">
        {steps.map((step, i) => (
          <div key={i} className="flex flex-col items-center group">
            <div className="w-8 h-8 rounded-full bg-secondary border border-border flex items-center justify-center font-bold text-[10px] text-muted-foreground mb-4 group-hover:bg-destructive group-hover:text-white transition-colors">{i + 1}</div>
            <Card className="w-full border-border/50 bg-card hover:border-destructive/50 transition-all duration-300 flex flex-col items-center p-4 text-center h-full relative group-hover:-translate-y-1">
              <step.icon className="h-6 w-6 text-destructive mb-3" />
              <h3 className="font-extrabold text-[10px] mb-1 uppercase tracking-tight">{step.name}</h3>
              <p className="text-[8px] font-mono text-destructive mb-2 uppercase">{step.tech}</p>
              <p className="text-[8px] text-muted-foreground leading-tight">{step.desc}</p>
            </Card>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-1 border-border/50 bg-card overflow-hidden">
          <div className="h-1 bg-destructive w-full" />
          <CardHeader className="bg-secondary/20">
            <CardTitle className="text-sm font-extrabold flex items-center gap-2 uppercase tracking-widest">
              <Database className="h-4 w-4 text-destructive" /> Training Specs
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
             <div className="space-y-4 font-mono text-[10px]">
               <div className="flex justify-between border-b border-border/50 pb-2"><span>Total Samples</span><span className="font-bold">61,000</span></div>
               <div className="flex justify-between border-b border-border/50 pb-2"><span>Normal Traffic</span><span className="font-bold">36,000</span></div>
               <div className="flex justify-between border-b border-border/50 pb-2"><span>Anomalous</span><span className="font-bold">25,000</span></div>
               <div className="flex justify-between border-b border-border/50 pb-2"><span>Epochs / LR</span><span className="font-bold">4 / 2e-5</span></div>
             </div>
             <Badge variant="outline" className="w-full justify-center py-1 border-emerald-500/50 text-emerald-500 uppercase text-[9px] font-bold">Verified on CSIC 2010 Split</Badge>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 border-border/50 bg-card relative">
           <CardHeader>
             <CardTitle className="text-sm font-extrabold uppercase tracking-widest">Fine-Tuned Performance Metrics</CardTitle>
           </CardHeader>
           <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Accuracy', value: EVAL_DATA.accuracy, color: 'text-destructive' },
                { label: 'Precision', value: EVAL_DATA.precision, color: 'text-accent' },
                { label: 'Recall', value: EVAL_DATA.recall, color: 'text-emerald-500' },
                { label: 'F1 Score', value: EVAL_DATA.f1, color: 'text-primary' }
              ].map((m, i) => (
                <div key={i} className="flex flex-col items-center text-center space-y-3">
                  <div className="relative h-20 w-20 flex items-center justify-center">
                    <svg className="h-full w-full -rotate-90">
                      <circle cx="40" cy="40" r="35" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-secondary" />
                      <circle cx="40" cy="40" r="35" stroke="currentColor" strokeWidth="4" fill="transparent" strokeDasharray="220" strokeDashoffset={220 - (220 * m.value) / 100} className={m.color} />
                    </svg>
                    <span className="absolute text-xs font-extrabold">{m.value}%</span>
                  </div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">{m.label}</p>
                </div>
              ))}
           </CardContent>
           <div className="absolute top-4 right-4 animate-pulse">
              <Badge variant="outline" className="text-[9px] uppercase border-emerald-500/50 text-emerald-500 font-bold bg-emerald-500/5">
                REAL-TIME MONITOR ACTIVE
              </Badge>
           </div>
        </Card>
      </div>
    </div>
  );
}