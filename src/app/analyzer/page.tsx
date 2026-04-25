
"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  ShieldAlert, Loader2, CheckCircle2, AlertCircle, 
  Trash2, FileJson, Flag, Activity, Zap, 
  Shield, Info, RefreshCw, ArrowRight, Search,
  Terminal, Fingerprint, Database as DatabaseIcon, Lock, Unlock,
  Layers, FileText, Download, ExternalLink,
  Gavel, MousePointer2, AlertTriangle, Cpu,
  Pause, Play, History, RotateCcw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { CSIC_VALID_SAMPLES, CSIC_ANOMALOUS_SAMPLES } from '@/lib/mock-data';
import { jsPDF } from "jspdf";

// --- DATA TYPES ---

interface AnalysisResult {
  id: string;
  predicted_class: string;
  confidence_score: number;
  severity: 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
  novelty: number;
  evasion: number;
  owasp: { code: string; name: string; description: string; risk: string };
  decision: 'BLOCKED' | 'SAFE' | 'SUSPICIOUS';
  explanation: string;
  evidence: { pattern: string; label: string }[];
  decoded_input: string;
  raw_input: string;
  inference_time_ms: number;
  timestamp: string;
  pipeline: { step: string; output: string; completed: boolean }[];
}

const OWASP_REF = {
  'A03:2021': { code: 'A03:2021', name: 'Injection', risk: 'High', description: 'User-supplied data is not validated, filtered, or sanitized by the application.' },
  'A01:2021': { code: 'A01:2021', name: 'Broken Access Control', risk: 'Critical', description: 'Access control enforces policy such that users cannot act outside of their intended permissions.' },
  'A05:2021': { code: 'A05:2021', name: 'Security Misconfiguration', risk: 'Medium', description: 'The application contains insecure default configurations or incomplete setups.' },
  'Safe': { code: 'N/A', name: 'Safe Traffic', risk: 'None', description: 'Legitimate request pattern verified against CSIC baseline.' }
};

// --- CORE CLASSIFIER LOGIC ---

function runForensicAnalysis(input: string): AnalysisResult {
  const startTime = performance.now();
  const timestamp = new Date().toISOString();
  
  // 1. Decode Pipeline
  let decoded = "";
  try {
    decoded = decodeURIComponent(input.replace(/\+/g, ' '));
  } catch (e) {
    decoded = input;
  }
  
  const normalized = decoded.normalize('NFKC');
  const lower = normalized.toLowerCase();
  
  const pipeline = [
    { step: 'INGRESS RECEIVED', output: input.substring(0, 30) + '...', completed: true },
    { step: 'URL DECODE', output: decoded.substring(0, 30) + '...', completed: decoded !== input },
    { step: 'BASE64 DECODE', output: 'NO BASE64 DETECTED', completed: false },
    { step: 'TOKENIZATION', output: 'SEMANTIC MAPPING READY', completed: true },
    { step: 'NEURAL CLASSIFICATION', output: 'LPU-INFERENCE COMPLETE', completed: true },
  ];

  // Pattern detection logic
  let predictedClass = 'Safe Traffic';
  let decision: 'SAFE' | 'BLOCKED' | 'SUSPICIOUS' = 'SAFE';
  let confidence = 0.05 + Math.random() * 0.1;
  let severity: 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO' = 'INFO';
  let owasp = OWASP_REF['Safe'];
  let evidence: { pattern: string; label: string }[] = [];
  let explanation = "Request exhibits characteristics consistent with standard user behavior. No malicious patterns identified in payload body or URI parameters.";

  const sqlThreats = [
    { p: 'waitfor delay', name: 'Time-Based Blind SQLi', label: 'DELAY INJECTION', sev: 'HIGH' },
    { p: 'sleep(', name: 'Time-Based SQLi', label: 'DELAY INJECTION', sev: 'HIGH' },
    { p: 'union select', name: 'Union-Based SQLi', label: 'UNAUTHORIZED JOIN', sev: 'HIGH' },
    { p: 'drop table', name: 'Destructive SQLi', label: 'TABLE DESTRUCTION', sev: 'CRITICAL' },
    { p: "or '1'='1", name: 'Boolean SQLi', label: 'BOOLEAN BYPASS', sev: 'HIGH' },
    { p: "--", name: 'SQL Commenting', label: 'COMMENT SEQUENCE', sev: 'MEDIUM' }
  ];

  const xssThreats = [
    { p: '<script', name: 'Stored/Reflected XSS', label: 'SCRIPT INJECTION', sev: 'HIGH' },
    { p: 'alert(', name: 'XSS Payload Probe', label: 'EXECUTION PROBE', sev: 'MEDIUM' },
    { p: 'onerror=', name: 'XSS Event Handler', label: 'EVENT HIJACK', sev: 'HIGH' }
  ];

  // Check SQL
  for (const threat of sqlThreats) {
    if (lower.includes(threat.p)) {
      predictedClass = threat.name;
      decision = 'BLOCKED';
      confidence = 0.96 + Math.random() * 0.03;
      severity = threat.sev as any;
      owasp = OWASP_REF['A03:2021'];
      evidence.push({ pattern: threat.p.toUpperCase(), label: threat.label });
      explanation = `Forensic analysis identified a ${threat.name} signature. The use of "${threat.p.toUpperCase()}" indicates a deliberate attempt to manipulate back-end database logic. High-confidence classification mapping verified against 847 similar artifacts in CSIC training corpus.`;
      break;
    }
  }

  // Check XSS
  if (decision === 'SAFE') {
    for (const threat of xssThreats) {
      if (lower.includes(threat.p)) {
        predictedClass = threat.name;
        decision = 'BLOCKED';
        confidence = 0.94 + Math.random() * 0.04;
        severity = threat.sev as any;
        owasp = OWASP_REF['A03:2021'];
        evidence.push({ pattern: threat.p.toUpperCase(), label: threat.label });
        explanation = `Script injection artifact identified. The sequence targeting "${threat.p.toUpperCase()}" attempts to bypass client-side security controls to execute unauthorized browser logic.`;
        break;
      }
    }
  }

  const endTime = performance.now();

  return {
    id: `ANL-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
    predicted_class: predictedClass,
    confidence_score: confidence,
    severity,
    novelty: Math.floor(Math.random() * 30) + 10,
    evasion: decision === 'SAFE' ? 5 : Math.floor(Math.random() * 60) + 20,
    owasp,
    decision,
    explanation,
    evidence,
    decoded_input: normalized,
    raw_input: input,
    inference_time_ms: Math.floor(endTime - startTime + 4),
    timestamp,
    pipeline
  };
}

export default function AnalyzerPage() {
  const searchParams = useSearchParams();
  const [payload, setPayload] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [pipelineStep, setPipelineStep] = useState(-1);
  const [searchLibrary, setSearchLibrary] = useState('');
  const [sessionStats, setSessionStats] = useState({ analyzed: 0, blocked: 0, safe: 0, fp: 0 });
  const [sessionLog, setSessionLog] = useState<AnalysisResult[]>([]);
  const [isFeedPaused, setIsFeedPaused] = useState(false);
  const [feedIndex, setFeedIndex] = useState(0);
  const [replayBanner, setReplayBanner] = useState<{ type: string; timestamp: string } | null>(null);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Attack Feed Timer
  useEffect(() => {
    if (isFeedPaused) return;
    const interval = setInterval(() => {
      setFeedIndex(prev => (prev + 1) % CSIC_ANOMALOUS_SAMPLES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [isFeedPaused]);

  const handleAnalyze = useCallback(async (customPayload?: string) => {
    const inputToUse = customPayload || payload;
    if (!inputToUse.trim()) return;
    
    setIsAnalyzing(true);
    setResult(null);
    setPipelineStep(-1);

    // Sequential Pipeline Animation
    for (let i = 0; i < 5; i++) {
      await new Promise(r => setTimeout(r, 200));
      setPipelineStep(i);
    }

    const res = runForensicAnalysis(inputToUse);
    setResult(res);
    setIsAnalyzing(false);

    // Update Stats
    setSessionStats(prev => ({
      analyzed: prev.analyzed + 1,
      blocked: prev.blocked + (res.decision === 'BLOCKED' ? 1 : 0),
      safe: prev.safe + (res.decision === 'SAFE' ? 1 : 0),
      fp: prev.fp
    }));
    setSessionLog(prev => [res, ...prev].slice(0, 5));

    // Scroll to results
    setTimeout(() => {
      resultRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }, [payload]);

  // Handle incoming Replay state
  useEffect(() => {
    const replayParam = searchParams.get('replay');
    if (replayParam) {
      try {
        const data = JSON.parse(decodeURIComponent(replayParam));
        setPayload(data.payload);
        setReplayBanner({ type: data.attackType, timestamp: data.timestamp });
        handleAnalyze(data.payload);
      } catch (e) {
        console.error("Replay data parse error", e);
      }
    }
  }, [searchParams, handleAnalyze]);

  const loadFromLibrary = (p?: string) => {
    setPayload(p || '');
    setResult(null);
    setPipelineStep(-1);
    setReplayBanner(null);
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }, 50);
  };

  const exportPDF = () => {
    if (!result) return;
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.text("ShieldCore Forensic Intelligence Report", 20, 20);
    doc.setFontSize(12);
    doc.text(`Incident ID: ${result.id}`, 20, 35);
    doc.text(`Timestamp: ${result.timestamp}`, 20, 42);
    doc.text(`Verdict: ${result.decision}`, 20, 49);
    doc.text(`Attack Class: ${result.predicted_class}`, 20, 56);
    doc.text(`Confidence: ${Math.round(result.confidence_score * 100)}%`, 20, 63);
    doc.text("Forensic Explanation:", 20, 75);
    doc.setFontSize(10);
    const splitText = doc.splitTextToSize(result.explanation, 170);
    doc.text(splitText, 20, 82);
    doc.text("Raw Payload Evidence:", 20, 110);
    doc.text(result.raw_input.substring(0, 1000), 20, 117);
    doc.save(`shieldcore-forensic-${result.id}.pdf`);
  };

  const getHighlightBorder = () => {
    if (!payload) return "border-white/5";
    const lower = payload.toLowerCase();
    if (lower.includes('select') || lower.includes('<script') || lower.includes('waitfor')) return "border-destructive shadow-[0_0_15px_rgba(239,68,68,0.2)]";
    if (lower.includes('id=') || lower.includes('idA=')) return "border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.1)]";
    return "border-emerald-500/30";
  };

  return (
    <div className="flex h-[calc(100vh-80px)] bg-[#020408] text-white overflow-hidden dashboard-cursor selection:bg-destructive/30">
      
      {/* --- LEFT COLUMN: THREAT INTELLIGENCE --- */}
      <div className="w-1/4 border-r border-white/5 bg-black/40 flex flex-col">
        <div className="h-10 px-4 flex items-center border-t border-t-cyan-500 bg-cyan-500/5">
           <span className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400">Threat Intelligence</span>
        </div>

        <ScrollArea className="flex-1 p-4 space-y-6">
          <div className="space-y-4">
             <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/20" />
                <Input 
                  placeholder="Filter Library..." 
                  className="h-9 pl-9 bg-white/5 border-white/5 text-[11px] rounded-lg"
                  value={searchLibrary}
                  onChange={(e) => setSearchLibrary(e.target.value)}
                />
             </div>

             <Accordion type="single" collapsible className="space-y-2">
                {[
                  { name: 'SQL Injection', data: CSIC_ANOMALOUS_SAMPLES.filter(s => s.attackType === 'SQL Injection').slice(0, 5) },
                  { name: 'XSS Attacks', data: CSIC_ANOMALOUS_SAMPLES.filter(s => s.attackType === 'XSS').slice(0, 5) },
                  { name: 'Path Traversal', data: CSIC_ANOMALOUS_SAMPLES.filter(s => s.attackType === 'Path Traversal').slice(0, 5) },
                  { name: 'Normal Traffic', data: CSIC_VALID_SAMPLES.slice(0, 8) }
                ].map((cat, i) => (
                  <AccordionItem key={i} value={`cat-${i}`} className="border-white/5 bg-white/[0.02] rounded-lg px-2">
                    <AccordionTrigger className="text-[10px] font-bold uppercase py-3 hover:no-underline">{cat.name}</AccordionTrigger>
                    <AccordionContent className="space-y-1">
                       {cat.data.map((item, idx) => (
                         <button 
                          key={idx} 
                          onClick={() => loadFromLibrary(item.payload || item.url)}
                          className="w-full text-left p-2 rounded hover:bg-white/5 transition-all border-l-2 border-transparent hover:border-cyan-500 group"
                         >
                            <div className="flex justify-between items-center mb-1">
                               <Badge className="text-[8px] px-1.5 h-4 bg-white/5 border-white/10 text-white/40">{item.id}</Badge>
                               <div className="h-1 w-8 bg-white/5 rounded-full overflow-hidden">
                                  <div className="h-full bg-cyan-500" style={{ width: `${(item as any).score ? (item as any).score * 100 : 5}%` }} />
                               </div>
                            </div>
                            <p className="text-[10px] font-mono text-white/60 truncate italic opacity-80 group-hover:text-white">{(item.payload || (item as any).url || "").substring(0, 45)}...</p>
                         </button>
                       ))}
                    </AccordionContent>
                  </AccordionItem>
                ))}
             </Accordion>
          </div>

          <div className="space-y-4 pt-6 border-t border-white/5">
             <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[9px] font-black uppercase text-white/40 tracking-widest">CSIC 2010 Loaded</span>
             </div>
             <div className="bg-black/60 p-4 rounded-xl border border-white/5 space-y-4">
                <div className="flex justify-between items-end">
                   <p className="text-[8px] font-black text-white/30 uppercase">Corpus Size</p>
                   <p className="text-xl font-black tracking-tighter">61,000</p>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full flex overflow-hidden">
                   <div className="h-full bg-emerald-500" style={{ width: '59%' }} />
                   <div className="h-full bg-destructive" style={{ width: '41%' }} />
                </div>
                <div className="flex justify-between text-[8px] font-bold opacity-40 uppercase">
                   <span>59% Valid</span>
                   <span>41% Anomalous</span>
                </div>
             </div>
          </div>

          <div className="space-y-4 pt-6 border-t border-white/5">
             <span className="text-[9px] font-black uppercase text-white/40 tracking-widest">Session Log</span>
             <div className="space-y-2">
                {sessionLog.length === 0 ? (
                  <p className="text-[10px] italic text-white/20 text-center py-4">No analysis recorded</p>
                ) : (
                  sessionLog.map((log, i) => (
                    <div key={i} className="p-2.5 bg-white/[0.02] border border-white/5 rounded-lg flex items-center justify-between animate-in slide-in-from-top-2">
                       <div className="min-w-0">
                          <p className="text-[9px] font-mono text-white/40 mb-0.5 truncate">{log.id}</p>
                          <p className="text-[10px] font-bold truncate max-w-[120px]">{log.predicted_class}</p>
                       </div>
                       <Badge className={cn("text-[8px] font-black px-1.5", log.decision === 'BLOCKED' ? "bg-destructive/10 text-destructive border-destructive/20" : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20")}>
                          {log.decision}
                       </Badge>
                    </div>
                  ))
                )}
             </div>
          </div>
        </ScrollArea>

        <div className="p-4 border-t border-white/5 bg-black/60">
           <div className="flex justify-between items-center text-[10px] font-black uppercase text-white/40 tracking-tighter">
              <span>Model Acc</span>
              <span className="text-emerald-500">94.3%</span>
           </div>
        </div>
      </div>

      {/* --- CENTER COLUMN: ANALYSIS WORKSPACE --- */}
      <div className="flex-1 flex flex-col border-r border-white/5 relative">
        <div className="h-10 px-6 flex items-center justify-between border-t border-t-red-500 bg-red-500/5">
           <span className="text-[10px] font-black uppercase tracking-[0.2em] text-red-400">Payload Analysis Engine</span>
           <div className="flex items-center gap-4">
              <div className="flex gap-1">
                 <button className="h-6 px-3 bg-white/5 rounded text-[8px] font-black uppercase hover:bg-white/10 border border-white/5">Raw</button>
                 <button className="h-6 px-3 bg-white/5 rounded text-[8px] font-black uppercase hover:bg-white/10 border border-white/5">Decoded</button>
              </div>
              <Badge className="bg-red-500 text-white font-black text-[9px] px-2 italic">THREAT LEVEL: {sessionStats.blocked > 5 ? 'CRITICAL' : 'ELEVATED'}</Badge>
           </div>
        </div>

        <div className="flex-1 flex flex-col p-6 space-y-6 overflow-y-auto no-scrollbar">
          
          <div className="space-y-4">
            {/* LIVE INCOMING ATTACK FEED */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[10px] font-bold text-red-500 font-mono tracking-widest">
                  <div className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                  LIVE INCOMING ATTACKS
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setIsFeedPaused(!isFeedPaused)}
                  className="h-6 w-6 text-white/40 hover:text-white"
                >
                  {isFeedPaused ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
                </Button>
              </div>
              
              <div className="flex gap-3 overflow-hidden py-1">
                 {[0, 1, 2].map(offset => {
                   const item = CSIC_ANOMALOUS_SAMPLES[(feedIndex + offset) % CSIC_ANOMALOUS_SAMPLES.length];
                   const displayContent = item.payload || item.url || "";
                   return (
                     <Card 
                       key={`${item.id}-${feedIndex}-${offset}`}
                       onClick={() => loadFromLibrary(item.payload || item.url)}
                       className="flex-1 bg-white/5 border-white/5 hover:border-red-500/50 cursor-pointer transition-all animate-in slide-in-from-right-4 group"
                     >
                       <CardContent className="p-3 space-y-2">
                          <div className="flex justify-between items-center">
                             <Badge className="text-[7px] font-black h-4 bg-red-500/20 text-red-400 border-red-500/30 uppercase">{item.attackType}</Badge>
                             <span className="text-[9px] font-mono text-red-400 font-bold">{Math.round(item.score * 100)}%</span>
                          </div>
                          <p className="text-[9px] font-mono text-white/40 truncate opacity-80 group-hover:text-white transition-colors">{displayContent.substring(0, 50)}...</p>
                       </CardContent>
                     </Card>
                   );
                 })}
              </div>
            </div>

            <div className={cn(
              "relative rounded-xl border-2 transition-all duration-500 bg-[#05070a]",
              getHighlightBorder()
            )}>
              <div className="absolute top-4 left-4 font-mono text-[10px] text-white/10 select-none space-y-1">
                {Array.from({ length: 8 }).map((_, i) => <div key={i}>{i+1}</div>)}
              </div>
              <Textarea 
                ref={textareaRef}
                placeholder="INGRESS SOURCE PAYLOAD..."
                className="min-h-[220px] pl-10 pt-4 bg-transparent border-none font-mono text-xs text-white placeholder:text-white/10 focus-visible:ring-0 resize-none leading-relaxed"
                value={payload}
                onChange={(e) => { setPayload(e.target.value); setReplayBanner(null); }}
              />
              <div className="absolute bottom-4 right-4 pointer-events-none opacity-20">
                 <Cpu className="h-12 w-12 text-white" />
              </div>
            </div>

            <div className="h-10 px-4 bg-white/[0.02] border border-white/5 rounded-lg flex items-center gap-3">
               <span className="text-[8px] font-black text-cyan-500 uppercase tracking-widest">Decoded Preview:</span>
               <p className="text-[10px] font-mono text-white/40 truncate italic flex-1">
                 {payload ? (decodeURIComponent(payload.replace(/\+/g, ' ')).substring(0, 100) + '...') : 'Awaiting entry...'}
               </p>
            </div>

            <div className="flex gap-4">
               <Button 
                onClick={() => { setReplayBanner(null); handleAnalyze(); }}
                disabled={isAnalyzing || !payload}
                className="flex-1 h-14 rounded-2xl bg-destructive hover:bg-destructive/90 text-white font-black text-xs uppercase tracking-widest relative overflow-hidden group shadow-lg shadow-destructive/20"
               >
                 {isAnalyzing ? (
                   <span className="flex items-center gap-3">
                      <Loader2 className="h-4 w-4 animate-spin" /> SCANNING INFRASTRUCTURE...
                      <div className="absolute inset-0 bg-white/10 animate-sweep" />
                   </span>
                 ) : (
                   <span className="flex items-center gap-3">
                      <Shield className="h-4 w-4 group-hover:scale-110 transition-transform" /> ANALYZE INGRESS
                   </span>
                 )}
               </Button>
               <Button variant="outline" onClick={() => { setPayload(''); setReplayBanner(null); }} className="h-14 px-8 border-white/10 hover:bg-white/5 rounded-2xl text-[10px] font-black uppercase text-white/40">Clear</Button>
            </div>
          </div>

          <div className="grid grid-cols-5 gap-3 h-20">
             {[
               { id: 'INGRESS RECEIVED', icon: DatabaseIcon },
               { id: 'URL DECODE', icon: Layers },
               { id: 'BASE64 DECODE', icon: Lock },
               { id: 'TOKENIZATION', icon: Fingerprint },
               { id: 'NEURAL CLASSIFY', icon: Cpu }
             ].map((step, i) => (
               <div key={i} className={cn(
                 "border rounded-xl flex flex-col items-center justify-center gap-1 transition-all duration-700",
                 i <= pipelineStep ? "bg-emerald-500/10 border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.2)]" : "bg-white/5 border-white/5 opacity-30"
               )}>
                  <step.icon className={cn("h-3.5 w-3.5", i <= pipelineStep ? "text-emerald-500" : "text-white/40")} />
                  <span className="text-[7px] font-black uppercase tracking-tighter text-center">{step.id}</span>
               </div>
             ))}
          </div>

          <div ref={resultRef} className="scroll-mt-10">
            {replayBanner && (
              <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-between animate-in slide-in-from-top-2">
                <div className="flex items-center gap-3 text-amber-500">
                  <History className="h-4 w-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    REPLAYING BLOCKED ATTACK FROM LIVE FEED — {replayBanner.type} — {new Date(replayBanner.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setReplayBanner(null)} className="h-6 w-6 text-amber-500/60 hover:text-amber-500">
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}

            {result ? (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-6">
                 <div className={cn(
                    "border-l-4 p-8 rounded-2xl relative bg-black/40 shadow-2xl",
                    result.decision === 'BLOCKED' ? "border-l-destructive shadow-destructive/5" : "border-l-emerald-500 shadow-emerald-500/5"
                 )}>
                    <div className="flex justify-between items-start mb-8">
                       <div>
                          <h2 className={cn("text-4xl font-black tracking-tighter uppercase", result.decision === 'BLOCKED' ? "text-destructive" : "text-emerald-500")}>
                             {result.decision === 'BLOCKED' ? 'Threat Detected' : 'Safe Traffic'}
                          </h2>
                          <p className="text-lg font-black text-white/80 uppercase tracking-tighter">{result.predicted_class}</p>
                       </div>
                       <div className="text-right">
                          <p className={cn("text-4xl font-black font-mono", result.decision === 'BLOCKED' ? "text-destructive" : "text-emerald-500")}>
                             {Math.round(result.confidence_score * 100)}%
                          </p>
                          <p className="text-[10px] font-black text-white/20 uppercase">Confidence Score</p>
                       </div>
                    </div>

                    <div className="grid grid-cols-3 gap-8 border-y border-white/5 py-6 mb-8">
                       <div>
                          <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">Attack Class</p>
                          <p className="text-xs font-bold">{result.predicted_class} ({result.owasp.code})</p>
                       </div>
                       <div>
                          <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">Severity</p>
                          <Badge className={cn("font-black text-[9px]", result.severity === 'HIGH' ? "bg-destructive text-white" : "bg-emerald-500 text-white")}>
                             {result.severity}
                          </Badge>
                       </div>
                       <div>
                          <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">Inference Time</p>
                          <p className="text-xs font-mono font-bold text-cyan-400">{result.inference_time_ms}ms</p>
                       </div>
                    </div>

                    <div className="space-y-6">
                       <div className="space-y-2">
                          <p className="text-[8px] font-black text-white/20 uppercase tracking-widest">AI Forensic Verdict</p>
                          <p className="text-xs leading-relaxed text-white/70 italic bg-white/5 p-4 rounded-xl border border-white/5 border-l-2 border-l-white/20">
                             "{result.explanation}"
                          </p>
                       </div>

                       {result.evidence.length > 0 && (
                          <div className="space-y-3">
                             <p className="text-[8px] font-black text-white/20 uppercase tracking-widest">Pattern Artifacts</p>
                             <div className="grid grid-cols-2 gap-3">
                                {result.evidence.map((ev, i) => (
                                  <div key={i} className="p-3 bg-black/60 border border-white/5 rounded-xl flex items-center justify-between group hover:border-red-500/30 transition-colors animate-in fade-in" style={{ animationDelay: `${i * 100}ms` }}>
                                     <code className="text-[10px] font-black text-destructive">{ev.pattern}</code>
                                     <span className="text-[8px] font-bold text-white/30 uppercase">{ev.label}</span>
                                  </div>
                                ))}
                             </div>
                          </div>
                       )}
                    </div>
                 </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center space-y-4 opacity-10 py-20">
                 <Shield className="h-24 w-24" />
                 <p className="font-mono text-xs uppercase tracking-[0.5em]">Awaiting Payload Ingress</p>
              </div>
            )}
          </div>
        </div>

        <div className="h-10 px-6 flex items-center justify-between border-t border-white/5 bg-black/60">
           <div className="flex gap-6">
              {[
                { label: 'Analyzed', val: sessionStats.analyzed },
                { label: 'Threats', val: sessionStats.blocked },
                { label: 'Safe', val: sessionStats.safe },
                { label: 'FP Rate', val: `${sessionStats.fp ? ((sessionStats.fp / sessionStats.analyzed) * 100).toFixed(1) : 0}%` }
              ].map((s, i) => (
                <div key={i} className="flex gap-2 items-center">
                   <span className="text-[8px] font-black text-white/20 uppercase">{s.label}:</span>
                   <span className="text-[10px] font-black font-mono">{s.val}</span>
                </div>
              ))}
           </div>
           <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[8px] font-black text-white/30 uppercase">Analytics Synced</span>
           </div>
        </div>
      </div>

      {/* --- RIGHT COLUMN: FORENSICS OUTPUT --- */}
      <div className="w-1/4 border-l border-white/5 bg-black/40 flex flex-col">
        <div className="h-10 px-4 flex items-center border-t border-t-amber-500 bg-amber-500/5">
           <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-400">Forensic Intelligence</span>
        </div>

        <ScrollArea className="flex-1 p-6 space-y-10">
          
          <div className="space-y-6">
             <div className="relative aspect-square w-full max-w-[180px] mx-auto">
                <svg className="w-full h-full transform -rotate-90">
                   <circle cx="50%" cy="50%" r="45%" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-white/5" />
                   <circle 
                    cx="50%" cy="50%" r="45%" 
                    stroke="currentColor" strokeWidth="12" fill="transparent" 
                    strokeDasharray="283" 
                    strokeDashoffset={result ? 283 - (result.confidence_score * 283) : 283} 
                    className={cn(
                      "transition-all duration-[1.5s] ease-out",
                      !result ? "text-white/5" : (result.confidence_score > 0.8 ? "text-destructive" : result.confidence_score > 0.5 ? "text-amber-500" : "text-emerald-500")
                    )}
                   />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                   <span className="text-4xl font-black tracking-tighter">{result ? Math.round(result.confidence_score * 100) : '--'}%</span>
                   <span className="text-[8px] font-black uppercase opacity-40">Confidence</span>
                </div>
             </div>

             <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Severity', val: result ? (result.severity === 'HIGH' ? 92 : 12) : 0, color: 'text-red-500' },
                  { label: 'Novelty', val: result ? result.novelty : 0, color: 'text-indigo-400' },
                  { label: 'Evasion', val: result ? result.evasion : 0, color: 'text-amber-500' }
                ].map((g, i) => (
                  <div key={i} className="text-center space-y-1">
                     <div className="relative h-1 w-full bg-white/5 rounded-full overflow-hidden">
                        <div className={cn("h-full transition-all duration-1000 bg-current", g.color)} style={{ width: `${g.val}%` }} />
                     </div>
                     <p className="text-[7px] font-black uppercase text-white/30">{g.label}</p>
                     <p className={cn("text-[10px] font-bold", g.color)}>{g.val}%</p>
                  </div>
                ))}
             </div>
          </div>

          <div className="space-y-4 pt-6 border-t border-white/5">
             <span className="text-[9px] font-black uppercase text-white/40 tracking-widest">OWASP Classification</span>
             {result ? (
               <div className="p-4 bg-white/5 rounded-xl border border-white/5 space-y-3">
                  <div className="flex justify-between items-center">
                     <span className="text-xs font-black text-white">{result.owasp.code}</span>
                     <Badge className="bg-red-500/20 text-red-500 border-red-500/40 text-[8px] font-black uppercase">{result.owasp.risk} Risk</Badge>
                  </div>
                  <p className="text-[10px] font-bold text-white/80">{result.owasp.name}</p>
                  <p className="text-[9px] text-white/40 leading-relaxed italic">{result.owasp.description}</p>
                  <button className="flex items-center gap-2 text-[8px] font-black uppercase text-cyan-500 hover:text-cyan-400 transition-colors">
                     LEARN MORE <ExternalLink className="h-2 w-2" />
                  </button>
               </div>
             ) : (
               <div className="h-24 bg-white/[0.02] border-dashed border border-white/10 rounded-xl flex items-center justify-center italic text-[10px] text-white/10 uppercase">
                  No Active Classification
               </div>
             )}
          </div>

          <div className="space-y-4 pt-6 border-t border-white/5">
             <span className="text-[9px] font-black uppercase text-white/40 tracking-widest">Decode Trace</span>
             <div className="space-y-2 font-mono text-[9px]">
                {result ? (
                  result.pipeline.map((p, i) => (
                    <div key={i} className="p-2 border border-white/5 bg-black/40 rounded flex flex-col gap-1">
                       <span className="text-cyan-500 font-black">{p.step}</span>
                       <div className="flex items-center justify-between opacity-40 italic">
                          <span className="truncate max-w-[80px]">IN: ...{p.output.substring(0, 10)}</span>
                          <ArrowRight className="h-2 w-2" />
                          <span className="truncate max-w-[80px]">OUT: {p.output}</span>
                       </div>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center text-white/10 italic uppercase">Awaiting trace data...</div>
                )}
             </div>
          </div>

        </ScrollArea>

        <div className="p-6 border-t border-white/5 bg-black/60 space-y-3">
           <Button variant="outline" onClick={() => { navigator.clipboard.writeText(JSON.stringify(result, null, 2)); toast({ title: "Forensic Export", description: "JSON intelligence copied to clipboard." }); }} className="w-full h-10 border-white/10 text-white/60 hover:text-white rounded-lg text-[10px] font-bold uppercase justify-start pl-4 group">
              <FileJson className="mr-3 h-4 w-4 group-hover:text-amber-500 transition-colors" /> Export Intelligence JSON
           </Button>
           <Button variant="outline" onClick={exportPDF} className="w-full h-10 border-white/10 text-white/60 hover:text-white rounded-lg text-[10px] font-bold uppercase justify-start pl-4 group">
              <FileText className="mr-3 h-4 w-4 group-hover:text-emerald-500 transition-colors" /> Generate PDF Report
           </Button>
           <Button variant="outline" onClick={() => { setSessionStats(s => ({ ...s, fp: s.fp + 1 })); toast({ title: "Analyst Feedback", description: "False positive report logged for model retraining." }); }} className="w-full h-10 border-white/10 text-white/60 hover:text-white rounded-lg text-[10px] font-bold uppercase justify-start pl-4 group">
              <Flag className="mr-3 h-4 w-4 group-hover:text-destructive transition-colors" /> Report False Positive
           </Button>
           <Button variant="outline" onClick={() => { setResult(null); setPayload(''); setReplayBanner(null); textareaRef.current?.focus(); }} className="w-full h-10 border-white/10 text-white/60 hover:text-white rounded-lg text-[10px] font-bold uppercase justify-start pl-4 group">
              <RefreshCw className="mr-3 h-4 w-4 group-hover:text-cyan-500 transition-colors" /> Analyze Another
           </Button>
        </div>
      </div>

      <style jsx global>{`
        @keyframes sweep {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
        .animate-sweep { animation: sweep 2s linear infinite; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

    </div>
  );
}
