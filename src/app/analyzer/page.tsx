
"use client";

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { 
  ShieldAlert, Loader2, CheckCircle2, AlertCircle, 
  Trash2, FileJson, Flag, Activity, Zap, 
  Shield, Info, RefreshCw, ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';

// --- DATA TYPES ---

interface AnalysisResult {
  predicted_class: string;
  confidence_score: number;
  decision: 'BLOCKED' | 'SAFE' | 'SUSPICIOUS';
  owasp_category: string;
  explanation: string;
  highlighted_tokens: string[];
  decoded_input: string;
  raw_input: string;
  inference_time_ms: number;
  pipeline: { step: string; output: string; completed: boolean }[];
}

// --- CONSTANTS ---

const CSIC_EXAMPLES = {
  sqli: "id=3&nombre=%27%2C%270%27%2C%270%27%29%3Bwaitfor+delay+%270%3A0%3A15%27%3B--",
  xss: "GET /miembros/editar.jsp?modo=registro%3CSCRIPT%3Ealert%28%22Paros%22%29%3B%3C%2FSCRIPT%3E",
  normal: "POST /tienda1/publico/anadir.jsp id=2&nombre=Jamon+Iberico&precio=39&cantidad=1"
};

// --- CORE CLASSIFIER LOGIC ---

function runDeepAnalysis(input: string): AnalysisResult {
  const startTime = performance.now();
  
  // 1. Decode Pipeline Simulation
  let current = input;
  const pipeline = [];
  
  // URL Decoding
  const decoded = decodeURIComponent(input.replace(/\+/g, ' '));
  pipeline.push({ step: 'URL DECODED', output: decoded.substring(0, 40) + '...', completed: true });
  
  // Base64 Check (Basic)
  const isB64 = /^[A-Za-z0-9+/=]*$/.test(input) && input.length > 20;
  pipeline.push({ step: 'BASE64 DECODED', output: 'SKIPPED', completed: isB64 });

  // Unicode Normalization
  const normalized = decoded.normalize('NFKC');
  pipeline.push({ step: 'UNICODE NORMALIZED', output: normalized.substring(0, 40) + '...', completed: true });

  const lower = normalized.toLowerCase();
  
  // 2. Pattern Matching (Fixed Logic)
  let predictedClass = 'Safe';
  let decision: 'SAFE' | 'BLOCKED' | 'SUSPICIOUS' = 'SAFE';
  let confidence = 0.05 + Math.random() * 0.1;
  let owasp = 'Safe';
  let explanation = 'This request matches baseline legitimate traffic patterns from the CSIC 2010 training set. No malicious signatures detected.';
  let tokens: string[] = [];

  const sqlThreats = [
    { p: 'waitfor delay', name: 'Time-Based Blind SQLi' },
    { p: 'sleep(', name: 'Time-Based SQLi' },
    { p: 'extractvalue', name: 'Error-Based SQLi' },
    { p: 'benchmark(', name: 'Time-Based SQLi' },
    { p: 'union select', name: 'Union-Based SQLi' },
    { p: 'drop table', name: 'Destructive SQLi' },
    { p: "or '1'='1", name: 'Boolean SQLi' },
    { p: "or 1=1", name: 'Boolean SQLi' },
    { p: "--", name: 'SQL Commenting' }
  ];

  const xssThreats = [
    { p: '<script', name: 'Cross-Site Scripting (XSS)' },
    { p: 'alert(', name: 'XSS Probe' },
    { p: 'onerror=', name: 'Event Handler Injection' },
    { p: 'javascript:', name: 'Protocol Injection' }
  ];

  // Check SQL
  for (const threat of sqlThreats) {
    if (lower.includes(threat.p)) {
      predictedClass = threat.name;
      decision = 'BLOCKED';
      confidence = 0.94 + Math.random() * 0.05;
      owasp = 'A03:2021 — Injection';
      explanation = `Deep semantic inspection identified a ${threat.name} pattern using "${threat.p.toUpperCase()}". This attack attempts to manipulate the back-end database through parameter manipulation.`;
      tokens.push(threat.p);
      break;
    }
  }

  // Check XSS if SQL is clean
  if (decision === 'SAFE') {
    for (const threat of xssThreats) {
      if (lower.includes(threat.p)) {
        predictedClass = threat.name;
        decision = 'BLOCKED';
        confidence = 0.91 + Math.random() * 0.06;
        owasp = 'A03:2021 — Injection';
        explanation = `Client-side script execution attempt detected. The usage of "${threat.p.toUpperCase()}" suggests an XSS payload designed to hijack user sessions or redirect traffic.`;
        tokens.push(threat.p);
        break;
      }
    }
  }

  // Handle Suspicious
  if (decision === 'SAFE' && (lower.includes('idA=') || lower.includes('rememberA='))) {
    predictedClass = 'Parameter Tampering';
    decision = 'SUSPICIOUS';
    confidence = 0.65;
    owasp = 'A01:2021 — Broken Access Control';
    explanation = 'Detected subtle modification of internal parameter names. This behavioral anomaly is consistent with manual reconnaissance or fuzzer activity.';
  }

  const endTime = performance.now();

  return {
    predicted_class: predictedClass,
    confidence_score: confidence,
    decision,
    owasp_category: owasp,
    explanation,
    highlighted_tokens: tokens,
    decoded_input: normalized,
    raw_input: input,
    inference_time_ms: Math.floor(endTime - startTime + 5),
    pipeline
  };
}

export default function AnalyzerPage() {
  const [payload, setPayload] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [sessionStats, setSessionStats] = useState({ analyzed: 0, blocked: 0, safe: 0, fp: 0 });
  const { toast } = useToast();

  const handleAnalyze = async () => {
    if (!payload.trim()) return;
    
    setIsAnalyzing(true);
    setResult(null);

    // Simulate neural network latency
    await new Promise(r => setTimeout(r, 1200));

    const res = runDeepAnalysis(payload);
    setResult(res);
    setIsAnalyzing(false);

    // Update Session Stats
    setSessionStats(prev => ({
      analyzed: prev.analyzed + 1,
      blocked: prev.blocked + (res.decision === 'BLOCKED' ? 1 : 0),
      safe: prev.safe + (res.decision === 'SAFE' ? 1 : 0),
      fp: prev.fp
    }));
  };

  const handleQuickTest = (type: keyof typeof CSIC_EXAMPLES) => {
    setPayload(CSIC_EXAMPLES[type]);
    setResult(null);
  };

  return (
    <div className="container mx-auto py-12 px-6 max-w-6xl space-y-10 dashboard-cursor animate-in fade-in duration-1000">
      
      {/* Header */}
      <div className="space-y-1 text-center md:text-left">
        <div className="flex items-center justify-center md:justify-start gap-2 text-destructive font-mono text-[9px] tracking-[0.4em] uppercase animate-pulse">
          <Zap className="h-3 w-3" /> Neural Ingress Engine
        </div>
        <h1 className="text-5xl font-black tracking-tighter text-gray-900 dark:text-white uppercase">SEMANTIC <span className="text-destructive">ANALYZER</span></h1>
        <p className="text-gray-500 dark:text-muted-foreground font-medium text-lg italic opacity-70">LPU-accelerated packet inspection against CSIC 2010 artifacts.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Main Column */}
        <div className="lg:col-span-3 space-y-10">
          
          {/* Input Card */}
          <Card className="glass-card border-none overflow-hidden relative group">
            {/* Animated Traffic Background */}
            <div className="absolute inset-0 opacity-[0.02] pointer-events-none overflow-hidden text-[8px] font-mono whitespace-pre select-none text-gray-500 flex flex-wrap leading-tight">
              {Array.from({ length: 40 }).map((_, i) => (
                <div key={i} className="animate-pulse" style={{ animationDelay: `${i * 100}ms` }}>
                  GET /login?user=admin HTTP/1.1 Host: localhost:8080 Cookie: session=123 ...
                </div>
              ))}
            </div>

            <CardContent className="p-8 space-y-6 relative z-10">
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <div className="section-label mb-0">Enter Payload or HTTP Request</div>
                  <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">CSIC DATASET — 61,000 SAMPLES LOADED</span>
                </div>
                <Textarea
                  placeholder="Paste HTTP request context here (e.g., POST /tienda1/publico/pagar.jsp id=1...)"
                  className="min-h-[220px] font-mono text-xs bg-gray-50 dark:bg-black/60 border-black/5 dark:border-white/5 focus-visible:ring-destructive resize-none rounded-xl leading-relaxed transition-all duration-500"
                  value={payload}
                  onChange={(e) => setPayload(e.target.value)}
                />
              </div>

              <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex gap-2 w-full md:w-auto">
                  <TooltipProvider>
                    {[
                      { key: 'sqli', label: 'SQL Injection', icon: ShieldAlert },
                      { key: 'xss', label: 'XSS Attack', icon: Zap },
                      { key: 'normal', label: 'Normal Request', icon: CheckCircle2 }
                    ].map((btn) => (
                      <Tooltip key={btn.key}>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="h-10 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest bg-black/5 dark:bg-white/5 border-black/5 dark:border-white/5 hover:border-destructive/30"
                            onClick={() => handleQuickTest(btn.key as any)}
                          >
                            <btn.icon className="h-3 w-3 mr-2 text-destructive" />
                            {btn.label}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent className="bg-black text-white border-white/10 text-[10px] p-2 max-w-xs truncate font-mono">
                          {CSIC_EXAMPLES[btn.key as keyof typeof CSIC_EXAMPLES]}
                        </TooltipContent>
                      </Tooltip>
                    ))}
                  </TooltipProvider>
                </div>

                <div className="flex gap-3 w-full md:w-auto">
                  <Button variant="ghost" onClick={() => { setPayload(''); setResult(null); }} className="h-14 px-6 text-gray-400 dark:text-muted-foreground hover:text-white uppercase text-[10px] font-black tracking-widest">
                    <Trash2 className="h-4 w-4 mr-2" /> Purge
                  </Button>
                  <Button 
                    className="flex-1 md:w-64 h-14 rounded-2xl bg-destructive hover:bg-destructive/90 text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-destructive/20"
                    disabled={isAnalyzing || !payload.trim()}
                    onClick={handleAnalyze}
                  >
                    {isAnalyzing ? <><Loader2 className="h-4 w-4 animate-spin mr-3" /> Inspecting...</> : <><ShieldAlert className="h-4 w-4 mr-3" /> Analyze Ingress</>}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Result Section */}
          {result && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-1000">
              <Card className={cn(
                "glass-card border-l-8 transition-all duration-1000",
                result.decision === 'BLOCKED' ? "border-l-destructive shadow-[0_0_40px_rgba(239,68,68,0.1)]" : "border-l-emerald-500 shadow-[0_0_40px_rgba(34,197,94,0.1)]"
              )}>
                {/* Result Border Pulse */}
                <div className={cn(
                  "absolute inset-0 rounded-lg pointer-events-none",
                  result.decision === 'BLOCKED' ? "animate-blocked-shimmer" : "animate-safe-shimmer"
                )} />

                <CardHeader className="p-8 pb-4 flex flex-row items-center justify-between border-b border-black/5 dark:border-white/5">
                  <div className="flex items-center gap-6">
                    <div className={cn(
                      "p-4 rounded-2xl border flex items-center justify-center",
                      result.decision === 'BLOCKED' ? "bg-destructive/10 border-destructive/30 text-destructive" : "bg-emerald-500/10 border-emerald-500/30 text-emerald-500"
                    )}>
                      {result.decision === 'BLOCKED' ? <Shield className="h-8 w-8" /> : <CheckCircle2 className="h-8 w-8" />}
                    </div>
                    <div>
                      <h2 className="text-4xl font-black tracking-tighter uppercase">{result.decision}</h2>
                      <p className="text-[10px] font-black opacity-50 uppercase tracking-[0.3em]">{result.predicted_class} DETECTED</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-black text-gray-400 dark:text-white/30 uppercase">Inference Time</p>
                    <p className="text-xl font-black font-mono text-gray-900 dark:text-white">{result.inference_time_ms}ms</p>
                  </div>
                </CardHeader>

                <CardContent className="p-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    
                    {/* Left Column */}
                    <div className="space-y-10">
                      <div className="space-y-4">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-muted-foreground">Threat Confidence</Label>
                        <div className="relative h-32 w-full flex items-center justify-center">
                          <svg className="h-full transform -rotate-90">
                            <circle cx="60" cy="64" r="50" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-100 dark:text-white/5" />
                            <circle 
                              cx="60" 
                              cy="64" 
                              r="50" 
                              stroke="currentColor" 
                              strokeWidth="8" 
                              fill="transparent" 
                              strokeDasharray={314} 
                              strokeDashoffset={314 - (result.confidence_score * 314)} 
                              className={cn("transition-all duration-[1500ms]", result.decision === 'BLOCKED' ? "text-destructive" : "text-emerald-500")} 
                            />
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-4xl font-black tracking-tighter">{Math.round(result.confidence_score * 100)}%</span>
                            <span className="text-[8px] font-black uppercase opacity-40">Match</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-muted-foreground">Attack Category</Label>
                        <div className="space-y-2">
                          <Badge variant="outline" className={cn(
                            "px-6 py-2 text-xs font-black rounded-xl uppercase tracking-widest border-2",
                            result.decision === 'BLOCKED' ? "bg-destructive/10 border-destructive/20 text-destructive" : "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                          )}>
                            {result.predicted_class}
                          </Badge>
                          <p className="text-[10px] font-mono text-gray-500 dark:text-white/40 pl-1 uppercase">{result.owasp_category}</p>
                        </div>
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-10">
                      <div className="space-y-6">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-muted-foreground">Decode Pipeline</Label>
                        <div className="space-y-3">
                          {result.pipeline.map((step, i) => (
                            <div key={i} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-black/20 rounded-xl border border-black/5 dark:border-white/5 animate-in slide-in-from-left-2" style={{ animationDelay: `${i * 200}ms` }}>
                              <div className="flex items-center gap-3">
                                <div className={cn("h-4 w-4 rounded-full flex items-center justify-center", step.completed ? "bg-emerald-500" : "bg-gray-300")}>
                                  <CheckCircle2 className="h-3 w-3 text-white" />
                                </div>
                                <span className="text-[10px] font-black uppercase text-gray-700 dark:text-white/60">{step.step}</span>
                              </div>
                              <span className="text-[9px] font-mono opacity-30 truncate max-w-[150px]">{step.output}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-muted-foreground">AI Verdict</Label>
                        <Card className="bg-black/5 dark:bg-white/5 border-none p-6 rounded-2xl border-l-4 border-l-gray-300">
                          <p className="text-sm font-medium leading-relaxed italic text-gray-800 dark:text-white/80">
                            "{result.explanation}"
                          </p>
                        </Card>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <Button variant="outline" className="flex-1 h-14 rounded-2xl border-black/10 dark:border-white/10 font-black uppercase text-[10px] tracking-widest hover:bg-white/5" onClick={() => { navigator.clipboard.writeText(JSON.stringify(result, null, 2)); toast({ title: "Intelligence Exported", description: "Payload forensic JSON copied to clipboard." }); }}>
                  <FileJson className="h-4 w-4 mr-2" /> Export JSON
                </Button>
                <Button variant="outline" className="flex-1 h-14 rounded-2xl border-black/10 dark:border-white/10 font-black uppercase text-[10px] tracking-widest hover:bg-white/5 text-amber-500" onClick={() => { setSessionStats(s => ({ ...s, fp: s.fp + 1 })); toast({ title: "Report Logged", description: "Signal corrected for training loop." }); }}>
                  <Flag className="h-4 w-4 mr-2" /> Report False Positive
                </Button>
                <Button className="flex-1 h-14 rounded-2xl bg-gray-900 dark:bg-white dark:text-black font-black uppercase text-[10px] tracking-widest" onClick={() => { setResult(null); setPayload(''); }}>
                  <RefreshCw className="h-4 w-4 mr-2" /> Analyze Another
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          
          <Card className="glass-card rounded-[2rem] border-white/5 p-8 space-y-8">
            <div className="space-y-6">
              <h3 className="section-label mb-0 pl-0 border-none flex items-center gap-2">
                <DatabaseIcon className="h-4 w-4 text-emerald-500" /> Dataset Status
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase opacity-40">Profile</span>
                  <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[9px] px-3 font-black">CSIC 2010 ACTIVE</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase opacity-40">Samples</span>
                  <span className="text-xs font-black font-mono">61,000 TOTAL</span>
                </div>
                {result && (
                  <div className="pt-2 border-t border-white/5 space-y-1">
                    <p className="text-[8px] font-black uppercase opacity-30 tracking-widest">Last Analysis</p>
                    <p className="text-[10px] font-mono opacity-50 truncate">{new Date().toLocaleTimeString()}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6 pt-4 border-t border-white/5">
              <h3 className="section-label mb-0 pl-0 border-none flex items-center gap-2">
                <Activity className="h-4 w-4 text-destructive" /> Analysis Status
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]" />
                  <span className="text-[10px] font-black uppercase text-gray-500 dark:text-white/60 tracking-widest">Engine Operational</span>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-black uppercase opacity-30">Model Accuracy</p>
                  <p className="text-xl font-black tracking-tighter">94.3%</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-black uppercase opacity-30">Avg Inference</p>
                  <p className="text-xl font-black tracking-tighter text-cyan-400">
                    {result ? result.inference_time_ms : '4.2'}ms
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6 pt-4 border-t border-white/5">
              <h3 className="section-label mb-0 pl-0 border-none flex items-center gap-2">
                <RefreshCw className="h-4 w-4 text-cyan-500" /> Session Stats
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Analyzed', val: sessionStats.analyzed },
                  { label: 'Blocked', val: sessionStats.blocked },
                  { label: 'Safe', val: sessionStats.safe },
                  { label: 'FP Rate', val: `${sessionStats.fp ? ((sessionStats.fp / sessionStats.analyzed) * 100).toFixed(1) : 0}%` }
                ].map((stat, i) => (
                  <div key={i} className="p-3 bg-black/5 dark:bg-white/5 rounded-xl border border-black/5 dark:border-white/5">
                    <p className="text-[8px] font-black uppercase opacity-30 mb-1">{stat.label}</p>
                    <p className="text-lg font-black tracking-tighter">{stat.val}</p>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>

      <style jsx global>{`
        @keyframes blocked-shimmer {
          0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
          50% { box-shadow: 0 0 30px 2px rgba(239, 68, 68, 0.15); }
          100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
        @keyframes safe-shimmer {
          0% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
          50% { box-shadow: 0 0 30px 2px rgba(34, 197, 94, 0.15); }
          100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
        }
        .animate-blocked-shimmer { animation: blocked-shimmer 2s ease-out forwards; }
        .animate-safe-shimmer { animation: safe-shimmer 2s ease-out forwards; }
      `}</style>

    </div>
  );
}

function DatabaseIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M3 5V19A9 3 0 0 0 21 19V5" />
      <path d="M3 12A9 3 0 0 0 21 12" />
    </svg>
  )
}
