"use client";

import { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Terminal, Shield, Zap, Crosshair, 
  Search, Eye, Code, Layers, Lock, Unlock,
  ChevronRight, Database, Globe, Play, Loader2,
  Skull, MessageSquare, User, TrendingUp,
  Scale, FileText, AlertOctagon, ZapOff,
  Activity, CheckCircle2, AlertCircle, 
  ArrowLeft, ArrowRight, RotateCcw, Info,
  Fingerprint, Hammer, Gavel, ExternalLink,
  Target, X
} from 'lucide-react';
import { generateFakeRequest, getSeededData } from '@/lib/mock-data';
import { cn } from '@/lib/utils';

// --- CONSTANTS & MAPPINGS ---

const EXPLAIN_MAP: Record<string, string> = {
  'SQL Injection': 'Fake database commands hidden in text fields',
  'XSS': 'Malicious scripts designed to steal user sessions',
  'Path Traversal': 'Attempt to access restricted system files',
  'Command Injection': 'Trying to run unauthorized server commands',
  'Buffer Overflow': 'Overwhelming the system memory to cause a crash',
  'SSRF': 'Tricking the server into attacking other internal systems',
  'BASE64 DECODE': 'Stripping away a common digital disguise layer',
  'URL DECODE': 'Translating web-encoded characters back to plain text',
  'UNICODE NORMALIZE': 'Fixing text tricks that use look-alike characters',
  'DISTILBERT TRANSFORMER': 'Advanced AI brain that reads the "meaning" of the request',
  'SOFTMAX CLASSIFICATION': 'The AI making its final percentage-based decision',
  'PROSECUTABLE': 'This activity violates federal cybercrime statutes',
};

// --- SUB-COMPONENTS ---

const Typewriter = ({ lines, delay = 20, onComplete, className }: { lines: string[], delay?: number, onComplete?: () => void, className?: string }) => {
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [currentText, setCurrentText] = useState("");
  const [displayedLines, setDisplayedLines] = useState<string[]>([]);

  useEffect(() => {
    if (currentLineIndex >= lines.length) {
      onComplete?.();
      return;
    }

    const line = lines[currentLineIndex];
    if (currentText.length < line.length) {
      const timer = setTimeout(() => {
        setCurrentText(line.slice(0, currentText.length + 1));
      }, delay);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        setDisplayedLines(prev => [...prev, line]);
        setCurrentText("");
        setCurrentLineIndex(prev => prev + 1);
      }, delay * 2);
      return () => clearTimeout(timer);
    }
  }, [currentLineIndex, currentText, lines, delay, onComplete]);

  return (
    <div className={cn("space-y-1 font-mono text-[11px]", className)}>
      {displayedLines.map((line, i) => {
        let color = "text-emerald-500/80";
        if (line.startsWith('sqlmap') || line.startsWith('curl')) color = "text-yellow-500";
        if (line.includes('vulnerable') || line.includes('target')) color = "text-cyan-400";
        if (line.includes('payload')) color = "text-red-400";
        return <div key={i} className={cn("break-all", color)}>{line}</div>;
      })}
      <div className="flex">
        <span className="text-white break-all">{currentText}</span>
        <span className="w-1.5 h-3.5 bg-red-500 ml-1 animate-pulse shrink-0" />
      </div>
    </div>
  );
};

export default function AttackerMirrorPage() {
  const router = useRouter();
  const [attacks, setAttacks] = useState<any[]>([]);
  const [selectedAttack, setSelectedAttack] = useState<any | null>(null);
  const [isLive, setIsLive] = useState(true);
  const [explainMode, setExplainMode] = useState(false);
  const [replayStage, setReplayStage] = useState(0); 
  const [frustration, setFrustration] = useState(45);
  const [showBreachAlert, setShowBreachAlert] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [isReplaying, setIsReplaying] = useState(false);
  
  // Replay Trigger
  const triggerSequence = (attack: any) => {
    setSelectedAttack(attack);
    setReplayStage(0);
    setCountdown(3);
    
    const cd = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(cd);
          startSequence();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const startSequence = () => {
    setReplayStage(1);
    setTimeout(() => setReplayStage(2), 2000);
    setTimeout(() => setReplayStage(3), 4000);
    setTimeout(() => {
      setReplayStage(4);
      if (selectedAttack?.score > 0.95) {
        setShowBreachAlert(true);
        setTimeout(() => setShowBreachAlert(false), 3000);
      }
    }, 6000);
  };

  useEffect(() => {
    const seed = getSeededData().slice(0, 30);
    setAttacks(seed);
    if (seed.length > 0) triggerSequence(seed[0]);
  }, []);

  // Live Mode Simulation
  useEffect(() => {
    if (!isLive || replayStage !== 0) return;
    const interval = setInterval(() => {
      const newReq = generateFakeRequest();
      setAttacks(prev => [newReq, ...prev].slice(0, 30));
      triggerSequence(newReq);
    }, 12000);
    return () => clearInterval(interval);
  }, [isLive, replayStage]);

  const explain = (term: string) => {
    if (!explainMode) return term;
    return EXPLAIN_MAP[term.toUpperCase()] || term;
  };

  const battleEvents = useMemo(() => {
    if (!selectedAttack) return [];
    return [
      { side: 'left', time: '0ms', text: 'Target Found: /api/v1/auth', icon: Target },
      { side: 'right', time: '5ms', text: 'Edge Node Intercepted Packet', icon: Shield },
      { side: 'left', time: '450ms', text: 'Crafted SQL Injection Payload', icon: Hammer },
      { side: 'right', time: '455ms', text: 'De-obfuscation Layers Active', icon: Layers },
      { side: 'left', time: '1200ms', text: 'Applied Base64 Encoding', icon: Code },
      { side: 'right', time: '1205ms', text: 'Neural Transformer Activated', icon: Zap },
      { side: 'left', time: '2800ms', text: 'Exploit Launched', icon: Activity },
      { side: 'right', time: '2808ms', text: 'Final Decision: BLOCKED', icon: Lock },
    ].filter((_, i) => (i / 2) < replayStage);
  }, [selectedAttack, replayStage]);

  const handleReplayInAnalyzer = () => {
    if (!selectedAttack) return;
    setIsReplaying(true);
    setTimeout(() => {
      const replayData = encodeURIComponent(JSON.stringify({
        payload: selectedAttack.payload || selectedAttack.endpoint,
        attackType: selectedAttack.attackType,
        timestamp: selectedAttack.timestamp
      }));
      router.push(`/analyzer?replay=${replayData}`);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden dashboard-cursor selection:bg-destructive/30 transition-colors">
      
      {/* --- BREACH ALERT OVERLAY --- */}
      {showBreachAlert && (
        <div className="fixed inset-0 z-[10000] bg-destructive/30 backdrop-blur-xl flex items-center justify-center animate-in fade-in zoom-in duration-300">
           <div className="border-4 border-destructive p-16 bg-card rounded-[4rem] text-center space-y-6 shadow-[0_0_100px_rgba(239,68,68,0.5)]">
              <AlertOctagon className="h-32 w-32 text-destructive mx-auto animate-bounce" />
              <h2 className="text-8xl font-black italic tracking-tighter uppercase">BREACH REPELLED</h2>
              <p className="text-destructive font-mono text-2xl font-bold uppercase tracking-[0.6em]">System Integrity 100%</p>
           </div>
        </div>
      )}

      {/* --- REPLAY COUNTDOWN --- */}
      {countdown > 0 && (
        <div className="fixed inset-0 z-[9000] bg-background/60 backdrop-blur-sm flex items-center justify-center">
           <div className="text-center space-y-4">
              <p className="text-[10px] font-black uppercase tracking-[0.5em] opacity-40">Synchronizing Mirror</p>
              <h1 className="text-9xl font-black italic animate-pulse">{countdown}</h1>
           </div>
        </div>
      )}

      {/* --- TOP HEADER BAR --- */}
      <header className="h-20 shrink-0 border-b border-border/40 bg-card/40 backdrop-blur-xl flex items-center justify-between px-10 relative z-50">
        <div className="flex items-center gap-6">
          <h1 className="text-xl font-black italic tracking-tighter uppercase flex items-center gap-3">
             <div className="h-3 w-3 rounded-full bg-red-500 animate-pulse" />
             ATTACKER <span className="opacity-20">vs</span> DEFENDER <span className="text-cyan-600 dark:text-cyan-500">MIRROR</span>
          </h1>
        </div>

        <div className="flex items-center gap-12">
          <div className="flex items-center gap-6 bg-accent px-8 py-2 rounded-2xl border border-border/40">
             <div className="text-center">
                <p className="text-[8px] font-black text-red-500 uppercase tracking-widest">Attacker</p>
                <p className="text-2xl font-black italic">0</p>
             </div>
             <div className="opacity-20 font-black italic text-xl">VS</div>
             <div className="text-center">
                <p className="text-[8px] font-black text-cyan-600 dark:text-cyan-500 uppercase tracking-widest">Defender</p>
                <p className="text-2xl font-black italic">{attacks.filter(a => a.decision === 'BLOCKED').length}</p>
             </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center space-x-3 bg-accent px-4 py-2 rounded-xl">
               <Switch id="explain-mode" checked={explainMode} onCheckedChange={setExplainMode} />
               <Label htmlFor="explain-mode" className="text-[10px] font-black uppercase tracking-widest opacity-60">Explain Mode</Label>
            </div>
            <div className="flex items-center space-x-3 bg-accent px-4 py-2 rounded-xl">
               <Switch id="live-mode" checked={isLive} onCheckedChange={setIsLive} />
               <Label htmlFor="live-mode" className="text-[10px] font-black uppercase tracking-widest opacity-60">Live Intercept</Label>
            </div>
            <Select onValueChange={(v) => triggerSequence(attacks.find(a => a.id === v))}>
               <SelectTrigger className="w-[180px] bg-accent border-border/40 rounded-xl h-10 text-[10px] font-black uppercase">
                 <SelectValue placeholder="Select Attack" />
               </SelectTrigger>
               <SelectContent className="bg-card border-border/40">
                 {attacks.map(a => (
                   <SelectItem key={a.id} value={a.id} className="text-[10px] font-bold uppercase">{a.attackType} - {a.ip}</SelectItem>
                 ))}
               </SelectContent>
            </Select>
            <Button variant="ghost" size="icon" onClick={() => triggerSequence(selectedAttack)} className="h-10 w-10 border border-border/40 rounded-xl hover:bg-accent">
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="absolute bottom-[-1px] left-0 w-full h-[1px] bg-gradient-to-r from-red-500 via-border/20 to-cyan-500" />
      </header>

      {/* --- MAIN SPLIT VIEW --- */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* LEFT PANEL: ATTACKER SIDE */}
        <div className="flex-1 bg-gradient-to-br from-background to-red-500/5 p-8 flex flex-col space-y-8 overflow-y-auto no-scrollbar border-r border-border/40">
          <div className="flex justify-between items-center">
            <div className="space-y-1">
               <h2 className="text-3xl font-black text-red-500 uppercase italic tracking-tighter flex items-center gap-3">
                 <Skull className="h-8 w-8" /> Attacker Side
               </h2>
               <div className="flex items-center gap-2">
                 <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                 <span className="text-[10px] font-bold text-red-500/60 uppercase tracking-[0.3em]">Intercepted Hacker Workstation</span>
               </div>
            </div>
            <Badge variant="outline" className="bg-red-500/10 border-red-500/30 text-red-500 font-mono text-[9px] px-3 py-1 uppercase">Node_0x4F Active</Badge>
          </div>

          <Card className="bg-card/60 border-border/40 rounded-[2rem] overflow-hidden flex flex-col shadow-2xl">
             <div className="bg-red-500/5 px-6 py-3 border-b border-border/40 flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-red-600 dark:text-red-400">Current Objective</span>
                <Terminal className="h-3.5 w-3.5 text-red-500/40" />
             </div>
             <CardContent className="p-8 space-y-6">
                <div className="bg-accent p-4 rounded-xl border border-border/40">
                   <p className="text-sm font-bold leading-relaxed">
                     {selectedAttack?.attackType === 'SQL Injection' ? 'ATTACKER IS TRYING TO BYPASS YOUR LOGIN BY INJECTING FAKE SQL COMMANDS INTO THE USERNAME FIELD' : 'ATTACKER IS ATTEMPTING TO EXPLOIT A KNOWN VULNERABILITY PATTERN TO GAIN UNAUTHORIZED ACCESS'}
                   </p>
                   {explainMode && <p className="text-[10px] font-medium opacity-40 mt-2 italic uppercase">Plain English Summary for Non-Technical Stakeholders</p>}
                </div>
                
                <div className="bg-black rounded-xl p-6 border border-border/40 font-mono min-h-[160px] relative">
                   <div className="absolute top-3 right-4 flex gap-1.5">
                      <div className="h-1.5 w-1.5 rounded-full bg-red-500/40" />
                      <div className="h-1.5 w-1.5 rounded-full bg-red-500/40" />
                   </div>
                   {replayStage >= 1 ? (
                     <Typewriter lines={[
                        `sqlmap -u "shieldcore.ai/login" --data="user=${selectedAttack?.payload}"`,
                        `[INFO] testing for SQL Injection on parameter 'user'`,
                        `[INFO] parameter 'user' is vulnerable. confirming...`,
                        `[PAYLOAD] ${selectedAttack?.payload?.substring(0, 40) || 'N/A'}...`
                     ]} />
                   ) : (
                     <div className="h-full flex items-center justify-center opacity-10 italic text-xs uppercase tracking-widest">Waiting for session...</div>
                   )}
                </div>
             </CardContent>
          </Card>

          <Card className="bg-card/40 border-dashed border-border/40 rounded-[2rem] p-8 flex flex-col space-y-6">
             <span className="text-[10px] font-black uppercase tracking-widest opacity-30">Payload Construction Stack</span>
             <div className="space-y-4">
                {[
                  { label: 'Start with Malicious Intent', val: selectedAttack?.payload?.split(' ')[0] || 'OR 1=1' },
                  { label: 'Add Encoding', val: 'J09S' + (selectedAttack?.id || 'X9') + '...' , explain: explain('Base64 Decode') },
                  { label: 'Obfuscate', val: '0x' + (selectedAttack?.id.repeat(4) || 'FF') , explain: 'Adding noise to confuse traditional systems' },
                  { label: 'Launch', val: selectedAttack?.payload?.substring(0, 30) + '...' }
                ].map((step, i) => (
                  <div key={i} className={cn(
                    "flex items-start gap-6 p-4 rounded-2xl border transition-all duration-700",
                    replayStage >= (i + 1) ? "bg-red-500/5 border-red-500/20 opacity-100" : "opacity-30 border-border/40"
                  )}>
                     <div className="h-8 w-8 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center shrink-0">
                        <span className="text-xs font-black text-red-500">{i + 1}</span>
                     </div>
                     <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-60">{step.label}</p>
                        <code className="text-[10px] text-red-600 dark:text-red-400 block font-mono bg-accent p-2 rounded border border-border/40 truncate max-w-sm">{step.val}</code>
                        {explainMode && step.explain && <p className="text-[10px] font-medium text-red-500/40 italic">({step.explain})</p>}
                     </div>
                  </div>
                ))}
             </div>
          </Card>

          <Card className="bg-card border-border/40 rounded-[2rem] p-8 space-y-8">
             <div className="grid grid-cols-2 gap-8">
                <div className="space-y-4">
                   <span className="text-[10px] font-black uppercase tracking-widest opacity-30">Attacker Intel</span>
                   <div className="flex flex-col gap-3">
                      <div className="flex justify-between items-center">
                         <span className="text-[9px] font-bold opacity-40 uppercase">Skill Level</span>
                         <Badge className="bg-red-500 text-white font-black text-[9px] px-3">ADVANCED</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                         <span className="text-[9px] font-bold opacity-40 uppercase">Tool Estimate</span>
                         <span className="text-[11px] font-black font-mono italic">SQLMAP v1.7.2</span>
                      </div>
                      <div className="flex justify-between items-center">
                         <span className="text-[9px] font-bold opacity-40 uppercase">Target Goal</span>
                         <span className="text-[11px] font-black text-red-500 uppercase tracking-tighter">DATA EXFILTRATION</span>
                      </div>
                   </div>

                   <Button 
                      variant="outline" 
                      onClick={handleReplayInAnalyzer}
                      disabled={isReplaying}
                      className="w-full mt-4 h-10 border-red-500 text-red-500 hover:bg-red-600 hover:text-white transition-all rounded-xl font-black uppercase text-[10px] tracking-widest"
                   >
                      {isReplaying ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Play className="h-4 w-4 mr-2 fill-current" />}
                      {isReplaying ? "REPLAYING" : "REPLAY ATTACK"}
                   </Button>
                </div>
                <div className="space-y-4">
                   <span className="text-[10px] font-black uppercase tracking-widest opacity-30">Frustration Level</span>
                   <div className="space-y-3">
                      <div className="flex justify-between items-end">
                         <p className="text-2xl font-black italic tracking-tighter text-red-500">FRUSTRATED {frustration}%</p>
                      </div>
                      <Progress value={frustration} className="h-2 bg-accent" indicatorClassName="bg-red-500 shadow-[0_0_15px_#ef4444]" />
                      <p className="text-[9px] font-medium opacity-30 uppercase italic">"Attacker is attempting evasive maneuvers..."</p>
                   </div>
                </div>
             </div>
          </Card>
        </div>

        {/* CENTER SPINE: BATTLE TIMELINE */}
        <div className="w-[60px] bg-card/80 flex flex-col items-center py-8 relative">
           <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[1px] bg-border/20" />
           
           <div className="flex flex-col items-center gap-8 z-10 w-full px-2">
              {battleEvents.map((evt, i) => (
                <div key={i} className={cn(
                  "relative group w-full flex flex-col items-center transition-all duration-700 animate-in zoom-in-50",
                  evt.side === 'left' ? "text-red-500" : "text-cyan-600 dark:text-cyan-500"
                )}>
                  <div className={cn(
                    "h-3 w-3 rounded-full border-2 border-background transition-transform scale-150",
                    evt.side === 'left' ? "bg-red-500 shadow-[0_0_10px_#ef4444]" : "bg-cyan-500 shadow-[0_0_10px_#06b6d4]"
                  )} />
                  <div className={cn(
                    "absolute top-[-5px] whitespace-nowrap px-3 py-1 rounded-md text-[8px] font-black uppercase tracking-tighter bg-card border border-border/20",
                    evt.side === 'left' ? "right-6 border-red-500/30" : "left-6 border-cyan-500/30"
                  )}>
                    {evt.text}
                    <div className="opacity-40 text-[7px] mt-0.5">{evt.time}</div>
                  </div>
                </div>
              ))}
           </div>
        </div>

        {/* RIGHT PANEL: DEFENDER SIDE */}
        <div className="flex-1 bg-gradient-to-bl from-background to-cyan-500/5 p-8 flex flex-col space-y-8 overflow-y-auto no-scrollbar">
          <div className="flex justify-between items-center">
            <div className="space-y-1">
               <h2 className="text-3xl font-black text-cyan-600 dark:text-cyan-500 uppercase italic tracking-tighter flex items-center gap-3">
                 <Shield className="h-8 w-8" /> Defender Side
               </h2>
               <div className="flex items-center gap-2">
                 <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                 <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-500 uppercase tracking-[0.3em]">ShieldCore Neural Ingress Core</span>
               </div>
            </div>
            <Badge variant="outline" className="bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-500 font-mono text-[9px] px-3 py-1 uppercase">Protected Mode Active</Badge>
          </div>

          <Card className="glass-card border-border/40 bg-card/40 rounded-[2rem] overflow-hidden flex flex-col shadow-2xl">
             <div className="bg-cyan-500/5 px-6 py-3 border-b border-border/40 flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-cyan-600 dark:text-cyan-400">Response Logic</span>
                <Fingerprint className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400 opacity-40" />
             </div>
             <CardContent className="p-8 space-y-8">
                <div className="bg-accent p-4 rounded-xl border border-border/40">
                   <p className="text-sm font-bold leading-relaxed">
                     {explain('DistilBERT Transformer')}: {selectedAttack?.decision === 'BLOCKED' ? `OUR AI DETECTED THE HIDDEN ATTACK AND BLOCKED IT IN ${selectedAttack?.inferenceTime} MILLISECONDS` : 'SYSTEM IS MONITORING SECURE TRAFFIC'}
                   </p>
                </div>

                <div className="grid grid-cols-1 gap-6">
                   {[
                     { label: 'Request Received', val: selectedAttack?.ip + ' → ' + selectedAttack?.endpoint, icon: Globe },
                     { label: 'Decode Pipeline', val: explain('Base64 Decode') + ' Verified', icon: Layers, check: true },
                     { label: 'AI Analysis', val: Math.round((selectedAttack?.score || 0) * 100) + '% ' + explain('Softmax Classification'), icon: Zap, check: true },
                     { label: 'Final Decision', val: selectedAttack?.decision || 'BLOCKED', icon: Gavel, stamp: true }
                   ].map((stage, i) => (
                     <div key={i} className={cn(
                       "flex items-center justify-between p-5 rounded-2xl border transition-all duration-700",
                       replayStage >= (i + 1) ? "bg-cyan-500/5 border-cyan-500/20" : "opacity-30 border-border/40"
                     )}>
                        <div className="flex items-center gap-5">
                           <div className="h-10 w-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
                              <stage.icon className="h-5 w-5 text-cyan-600 dark:text-cyan-500" />
                           </div>
                           <div>
                              <p className="text-[9px] font-black opacity-40 uppercase mb-1">Stage {i+1}: {stage.label}</p>
                              <p className="text-xs font-bold">{stage.val}</p>
                           </div>
                        </div>
                        {replayStage >= (i+1) && stage.check && <CheckCircle2 className="h-5 w-5 text-emerald-500 animate-in zoom-in" />}
                        {replayStage >= (i+1) && stage.stamp && (
                          <Badge className="bg-red-500/20 border-red-500/50 text-red-500 font-black italic px-4 py-1 text-[11px] animate-in slide-in-from-right-4">
                            {selectedAttack?.decision === 'BLOCKED' ? 'BLOCKED' : 'SAFE'}
                          </Badge>
                        )}
                     </div>
                   ))}
                </div>
             </CardContent>
          </Card>

          <Card className="bg-card/40 border-border/40 rounded-[2rem] p-8 space-y-6">
             <span className="text-[10px] font-black uppercase tracking-widest opacity-30">Forensic Evidence</span>
             <div className="space-y-3">
                {[
                  { text: 'DECODED PAYLOAD CONTAINS SQL INJECTION PATTERN', sev: 'HIGH' },
                  { text: 'BOOLEAN LOGIC DETECTED — OR 1 EQUALS 1', sev: 'HIGH' },
                  { text: 'OWASP A03 2021 VIOLATION', sev: 'MEDIUM' }
                ].map((reason, i) => (
                  <div key={i} className={cn(
                    "flex items-center justify-between p-4 rounded-xl border border-border/40 bg-background/20 transition-all duration-1000 delay-300",
                    replayStage >= 4 ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
                  )}>
                     <div className="flex items-center gap-3">
                        <AlertCircle className="h-4 w-4 text-red-500" />
                        <span className="text-[10px] font-bold opacity-70">{reason.text}</span>
                     </div>
                     <Badge variant="outline" className="border-red-500/30 text-red-500 text-[8px] font-black">{reason.sev}</Badge>
                  </div>
                ))}
             </div>
          </Card>

          <Card className="bg-card border-border/40 rounded-[2rem] p-8 space-y-6">
             <span className="text-[10px] font-black uppercase tracking-widest opacity-30">Defender Recommendations</span>
             <div className="space-y-4">
                {[
                  { title: 'Block This IP Range', desc: 'Three other IPs from this subnet have attacked recently.', color: 'border-l-red-500' },
                  { title: 'Enable Rate Limiting', desc: 'Login endpoint has received 47 requests in 2 minutes.', color: 'border-l-amber-500' },
                  { title: 'Review Auth Logic', desc: 'Attacker targeting username field with known vulnerability patterns.', color: 'border-l-cyan-600' }
                ].map((rec, i) => (
                  <div key={i} className={cn(
                    "p-4 rounded-xl border border-border/40 bg-background/20 border-l-4 transition-all duration-1000",
                    rec.color,
                    replayStage >= 4 ? "opacity-100" : "opacity-0"
                  )} style={{ transitionDelay: `${i * 200}ms` }}>
                     <div className="flex items-center justify-between">
                        <div className="space-y-1">
                           <p className="text-xs font-black uppercase">{rec.title}</p>
                           <p className="text-[10px] opacity-40">{rec.desc}</p>
                        </div>
                        <Button size="sm" className="h-8 rounded-lg bg-accent border border-border/40 text-[9px] font-black hover:bg-accent opacity-60 uppercase">Apply</Button>
                     </div>
                  </div>
                ))}
             </div>
          </Card>
        </div>
      </div>

      {/* --- BOTTOM TIMELINE BAR --- */}
      <footer className="h-24 shrink-0 bg-card border-t border-border/40 px-10 flex items-center gap-10">
        <div className="flex items-center gap-4">
           <Button variant="ghost" size="icon" className="h-10 w-10 border border-border/40 rounded-xl" onClick={() => {
              const idx = attacks.findIndex(a => a.id === selectedAttack?.id);
              if (idx < attacks.length - 1) triggerSequence(attacks[idx + 1]);
           }}>
              <ArrowLeft className="h-4 w-4" />
           </Button>
           <div className="space-y-1 text-center min-w-[80px]">
              <p className="text-[9px] font-black opacity-30 uppercase tracking-widest">History</p>
              <p className="text-xs font-mono font-bold opacity-80">{attacks.length} Events</p>
           </div>
           <Button variant="ghost" size="icon" className="h-10 w-10 border border-border/40 rounded-xl" onClick={() => {
              const idx = attacks.findIndex(a => a.id === selectedAttack?.id);
              if (idx > 0) triggerSequence(attacks[idx - 1]);
           }}>
              <ArrowRight className="h-4 w-4" />
           </Button>
        </div>

        <div className="flex-1 h-12 bg-accent rounded-2xl border border-border/40 relative flex items-center px-6 overflow-hidden">
           <div className="absolute top-1/2 left-0 w-full h-[1px] opacity-10 bg-current -translate-y-1/2" />
           <div className="flex-1 flex items-center justify-between relative z-10">
              {attacks.map((atk) => (
                <button
                  key={atk.id}
                  onClick={() => triggerSequence(atk)}
                  className={cn(
                    "h-4 w-4 rounded-full transition-all hover:scale-150 group relative",
                    selectedAttack?.id === atk.id ? "ring-2 ring-current ring-offset-4 ring-offset-background scale-125" : "opacity-40",
                    atk.decision === 'BLOCKED' ? "bg-red-500 shadow-[0_0_10px_#ef4444]" : "bg-cyan-500 shadow-[0_0_10px_#06b6d4]"
                  )}
                >
                   <div className="absolute bottom-8 left-1/2 -translate-x-1/2 px-3 py-1 bg-card border border-border/40 rounded text-[8px] font-black uppercase whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all">
                     {atk.attackType} — {Math.round(atk.score * 100)}%
                   </div>
                </button>
              ))}
           </div>
        </div>

        <div className="flex items-center gap-6">
           <div className="text-right">
              <p className="text-[8px] font-black opacity-30 uppercase tracking-[0.4em]">Strategic Defense</p>
              <p className="text-[10px] font-mono font-bold opacity-60">ShieldCore Cluster v1.0</p>
           </div>
           <div className="h-12 w-12 rounded-full border border-border/40 bg-accent flex items-center justify-center">
              <Activity className="h-5 w-5 text-emerald-500 animate-pulse" />
           </div>
        </div>
      </footer>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

    </div>
  );
}
