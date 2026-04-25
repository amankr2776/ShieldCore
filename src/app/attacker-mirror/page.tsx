"use client";

import { useState, useEffect, useRef, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { 
  Terminal, Activity, Shield, Zap, Crosshair, 
  Search, Eye, Code, Layers, Lock, Unlock,
  ChevronRight, Database, Globe, Play, Loader2,
  Tabs, TabsList, TabsTrigger, TabsContent,
  Skull, MessageSquare, User, TrendingUp,
  Scale, FileText, AlertOctagon, ZapOff,
  Video, Maximize2, MousePointer2, Hammer
} from 'lucide-react';
import { generateFakeRequest, getSeededData } from '@/lib/mock-data';
import { cn } from '@/lib/utils';
import * as THREE from 'three';

// --- CONSTANTS & DATA ---

const LEGAL_INFO = [
  { law: "CFAA 18 U.S.C. § 1030", penalty: "Up to 10 Years Prison", fine: "$250,000" },
  { law: "UK Computer Misuse Act", penalty: "Up to 14 Years Prison", fine: "Unlimited" },
  { law: "EU Cybercrime Directive", penalty: "5 Years Minimum", fine: "€100,000" }
];

const ATTACKER_PROFILES = [
  { handle: "v0id_walker", reputation: 98, breaches: 14, tools: "sqlmap, custom-xss", active: "2022" },
  { handle: "ghost_shell", reputation: 85, breaches: 8, tools: "metasploit, burp", active: "2023" },
  { handle: "red_mercury", reputation: 92, breaches: 21, tools: "gohacker, nmap", active: "2021" }
];

const CHAT_MESSAGES = [
  "Got the creds for the target?",
  "Testing WAF bypass now...",
  "ShieldCore is active. Heavy resistance.",
  "Payload rejected. Trying double-encoding.",
  "They're blocking everything. Abandoning."
];

// --- SUB-COMPONENTS ---

const Typewriter = ({ lines, delay = 30, onComplete, className }: { lines: string[], delay?: number, onComplete?: () => void, className?: string }) => {
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
    <div className={cn("space-y-1", className)}>
      {displayedLines.map((line, i) => (
        <div key={i} className="opacity-80 leading-tight break-all">{line}</div>
      ))}
      <div className="flex">
        <span className="opacity-100 break-all">{currentText}</span>
        <span className="w-1.5 h-4 bg-emerald-500 ml-1 animate-pulse shrink-0" />
      </div>
    </div>
  );
};

const ThreatAnatomyCanvas = ({ attack }: { attack: any }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !attack) return;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, alpha: true, antialias: true });
    renderer.setSize(300, 200);

    const group = new THREE.Group();
    scene.add(group);

    // Exploded blueprint parts
    const parts = [
      { color: 0xef4444, y: 1.5, label: 'Keyword' },
      { color: 0x06b6d4, y: 0, label: 'Operator' },
      { color: 0x22c55e, y: -1.5, label: 'Encoding' }
    ];

    parts.forEach((p, i) => {
      const geo = new THREE.BoxGeometry(2, 0.2, 1);
      const mat = new THREE.MeshBasicMaterial({ color: p.color, wireframe: true, transparent: true, opacity: 0.6 });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.y = p.y;
      group.add(mesh);
    });

    camera.position.z = 6;

    const animate = () => {
      requestAnimationFrame(animate);
      group.rotation.y += 0.01;
      group.rotation.x += 0.005;
      renderer.render(scene, camera);
    };
    animate();

    return () => renderer.dispose();
  }, [attack]);

  return <canvas ref={canvasRef} className="w-full h-full" />;
};

export default function AttackerMirrorPage() {
  const [attacks, setAttacks] = useState<any[]>([]);
  const [selectedAttack, setSelectedAttack] = useState<any | null>(null);
  const [isLive, setIsLive] = useState(true);
  const [isReplaying, setIsReplaying] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [defenderScore, setDefenderScore] = useState(124);
  const [frustration, setFrustration] = useState(0);
  const [showBreachAlert, setShowBreachAlert] = useState(false);
  const [activeTab, setActiveTab] = useState('exploit');
  const [replayKey, setReplayKey] = useState(0);

  useEffect(() => {
    const seed = getSeededData().slice(0, 50);
    setAttacks(seed);
    if (seed.length > 0) setSelectedAttack(seed[0]);
  }, []);

  useEffect(() => {
    if (!isLive || isReplaying) return;
    const interval = setInterval(() => {
      const newReq = generateFakeRequest();
      setAttacks(prev => [newReq, ...prev].slice(0, 50));
      handleLoadAttack(newReq);
    }, 12000);
    return () => clearInterval(interval);
  }, [isLive, isReplaying]);

  const handleLoadAttack = (attack: any) => {
    setIsReplaying(true);
    setCountdown(3);
    setSelectedAttack(attack);
    
    if (attack.score > 0.95) {
      setShowBreachAlert(true);
      setTimeout(() => setShowBreachAlert(false), 2500);
    }

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsReplaying(false);
          setReplayKey(k => k + 1);
          setDefenderScore(s => s + 1);
          setFrustration(f => Math.min(100, f + 15));
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const battleEvents = useMemo(() => {
    if (!selectedAttack) return [];
    return [
      { time: '0.0s', action: 'ATTACKER: TARGET DISCOVERED', side: 'left' },
      { time: '0.4s', action: 'ATTACKER: APPLYING OBFUSCATION', side: 'left' },
      { time: '0.5s', action: 'DEFENDER: INGRESS INTERCEPTED', side: 'right' },
      { time: '0.6s', action: 'DEFENDER: NEURAL CORE ACTIVE', side: 'right' },
      { time: '0.7s', action: 'ATTACKER: PAYLOAD LAUNCHED', side: 'left' },
      { time: '0.8s', action: 'DEFENDER: THREAT NEUTRALIZED', side: 'right' }
    ];
  }, [selectedAttack]);

  const attackerProfile = useMemo(() => ATTACKER_PROFILES[replayKey % ATTACKER_PROFILES.length], [replayKey]);

  return (
    <div className={cn(
      "relative min-h-screen bg-black overflow-hidden dashboard-cursor selection:bg-destructive/30 transition-all duration-300",
      showBreachAlert && "animate-shake"
    )}>
      
      {/* BREACH ALERT OVERLAY */}
      {showBreachAlert && (
        <div className="fixed inset-0 z-[10000] bg-destructive/20 backdrop-blur-md flex items-center justify-center animate-in fade-in zoom-in duration-300">
          <div className="relative">
            <div className="absolute inset-0 bg-destructive blur-[100px] opacity-40 animate-pulse" />
            <div className="border-4 border-destructive p-12 bg-black/80 rounded-[3rem] text-center space-y-4 relative z-10">
              <AlertOctagon className="h-24 w-24 text-destructive mx-auto animate-bounce" />
              <h2 className="text-7xl font-black text-white italic tracking-tighter uppercase">BREACH ATTEMPT REPELLED</h2>
              <p className="text-destructive font-mono text-xl font-bold uppercase tracking-[0.5em]">Neural Defense Locked</p>
            </div>
          </div>
        </div>
      )}

      {/* CCTV FEED (DRAGGABLE PIE) */}
      <div className="fixed top-28 right-10 z-[500] w-48 h-32 bg-black border border-white/10 rounded-xl overflow-hidden shadow-2xl group cursor-move hover:scale-110 transition-transform">
        <div className="absolute top-2 left-2 flex items-center gap-2 z-10">
          <div className="h-1.5 w-1.5 rounded-full bg-destructive animate-pulse" />
          <span className="text-[8px] font-black text-white uppercase tracking-widest">LIVE CCTV: NODE_04</span>
        </div>
        <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/hacker/200/150')] bg-cover opacity-40 grayscale contrast-125" />
        <div className="absolute inset-0 scanline opacity-20 pointer-events-none" />
        <div className="absolute bottom-2 right-2 text-[6px] font-mono text-white/40">SENS: THERMAL</div>
      </div>

      {/* HUD OVERLAY */}
      <div className="absolute top-24 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-8 px-10 py-4 bg-black/80 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl">
        <div className="flex items-center gap-3">
          <Switch id="live-mode" checked={isLive} onCheckedChange={setIsLive} />
          <Label htmlFor="live-mode" className="text-[10px] font-black uppercase tracking-widest opacity-60">Neural Intercept</Label>
        </div>
        <div className="w-[1px] h-8 bg-white/10" />
        <div className="flex flex-col items-center gap-1">
          <span className="text-[9px] font-black uppercase text-white/30 tracking-tighter">BATTLE SCORE</span>
          <div className="flex items-center gap-4 text-xl font-black italic tracking-tighter">
            <span className="text-destructive">ATK: 0</span>
            <span className="text-white/20">/</span>
            <span className="text-cyan-500">DEF: {defenderScore}</span>
          </div>
        </div>
        <div className="w-[1px] h-8 bg-white/10" />
        <div className="flex flex-col items-center">
          <span className="text-[9px] font-black uppercase text-white/30">ATTACK VELOCITY</span>
          <span className="text-xs font-mono text-destructive">2.4m/prep</span>
        </div>
        <div className="w-[1px] h-8 bg-white/10" />
        <div className="flex flex-col items-center">
          <span className="text-[9px] font-black uppercase text-white/30">DEFENSE VELOCITY</span>
          <span className="text-xs font-mono text-emerald-500">5.2ms/resp</span>
        </div>
      </div>

      {/* MAIN VIEWPORT */}
      <div className="flex h-screen w-full pt-20">
        
        {/* CENTER DIVIDER & TIMELINE */}
        <div className="absolute left-1/2 top-20 bottom-24 w-[2px] bg-white/5 z-50 overflow-hidden">
          <div className="h-full w-full bg-gradient-to-b from-transparent via-white/10 to-transparent" />
          <div className="absolute inset-0 flex flex-col items-center justify-start py-20 space-y-12">
            {battleEvents.map((evt, i) => (
              <div key={i} className={cn(
                "relative group flex flex-col items-center transition-all duration-700",
                isReplaying ? "opacity-0 scale-50" : "opacity-100 scale-100"
              )} style={{ transitionDelay: `${i * 100}ms` }}>
                <div className={cn(
                  "h-3 w-3 rounded-full border-2 border-black z-10 transition-transform group-hover:scale-150",
                  evt.side === 'left' ? "bg-destructive shadow-[0_0_10px_#ef4444]" : "bg-cyan-500 shadow-[0_0_10px_#06b6d4]"
                )} />
                <div className={cn(
                  "absolute top-0 whitespace-nowrap px-3 py-1 rounded-md text-[8px] font-black uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-all",
                  evt.side === 'left' ? "right-6 text-destructive bg-destructive/10" : "left-6 text-cyan-500 bg-cyan-500/10"
                )}>
                  {evt.time}: {evt.action}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* LEFT: ATTACKER WORKSTATION */}
        <div className="w-1/2 h-full bg-[#050505] p-12 pr-6 overflow-hidden flex flex-col space-y-6">
          <div className="flex justify-between items-end">
            <h2 className="text-3xl font-black tracking-tighter text-white uppercase italic">
              ATTACKER <span className="text-destructive">NODE_0x4F</span>
            </h2>
            <div className="flex flex-col items-end gap-1">
              <span className="text-[8px] font-black text-white/30 uppercase tracking-widest">Frustration Level</span>
              <div className="w-32 h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-destructive transition-all duration-500" style={{ width: `${frustration}%` }} />
              </div>
            </div>
          </div>

          <div className="flex-1 grid grid-cols-2 grid-rows-2 gap-6">
            
            {/* PANEL 1: MULTI-THREAD TERMINAL */}
            <Card className="bg-black/60 border-white/5 rounded-[2rem] overflow-hidden flex flex-col">
              <div className="bg-white/5 px-4 py-2 flex items-center justify-between">
                <div className="flex gap-4">
                  {['exploit', 'scanner', 'brute'].map(t => (
                    <button 
                      key={t} 
                      onClick={() => setActiveTab(t)}
                      className={cn(
                        "text-[9px] font-black uppercase tracking-widest transition-colors",
                        activeTab === t ? "text-destructive" : "text-white/20 hover:text-white/40"
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                <div className="h-2 w-2 rounded-full bg-destructive animate-pulse" />
              </div>
              <CardContent className="p-6 font-mono text-[10px] text-emerald-500/60 overflow-auto no-scrollbar">
                {!isReplaying ? (
                  <Typewriter key={`${replayKey}-${activeTab}`} lines={[
                    activeTab === 'exploit' ? `sqlmap -u "target.sh/api?id=1" --tamper=base64 --risk=3` :
                    activeTab === 'scanner' ? `nmap -sV -T4 104.22.44.11 --script vuln` :
                    `hydra -L users.txt -P rockyou.txt target.sh http-post-form`
                  ]} />
                ) : (
                  <div className="h-full flex items-center justify-center italic opacity-20">Synchronizing...</div>
                )}
              </CardContent>
            </Card>

            {/* PANEL 2: INTELLIGENCE BOARD */}
            <Card className="bg-black/40 border-dashed border-white/10 rounded-[2rem] p-6 relative">
              <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02)_0%,transparent_100%)]" />
              <h4 className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                <Skull className="h-3.5 w-3.5 text-destructive" /> Intel Board
              </h4>
              <div className="grid grid-cols-2 gap-3 overflow-auto no-scrollbar">
                {[
                  { txt: 'TARGET: SHIELDCORE_HUB', col: 'bg-destructive/20 border-destructive/30' },
                  { txt: 'WAF: NEURAL_ACTIVE', col: 'bg-amber-500/20 border-amber-500/30' },
                  { txt: 'EVASION: B64_LAYER', col: 'bg-cyan-500/20 border-cyan-500/30' },
                  { txt: 'STATUS: BLOCKED', col: 'bg-white/5 border-white/10' }
                ].map((note, i) => (
                  <div key={i} className={cn(
                    "p-3 rounded-xl border text-[9px] font-bold uppercase transition-all duration-1000",
                    isReplaying ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0",
                    note.col
                  )} style={{ transitionDelay: `${i * 300}ms` }}>
                    {note.txt}
                  </div>
                ))}
              </div>
            </Card>

            {/* PANEL 3: DARK WEB PROFILE */}
            <Card className="bg-black border-white/5 rounded-[2rem] p-6 flex flex-col space-y-4 shadow-inner">
               <div className="flex items-center gap-4 border-b border-white/5 pb-4">
                  <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center">
                    <User className="h-5 w-5 text-destructive" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-white uppercase">{attackerProfile.handle}</p>
                    <p className="text-[8px] font-bold text-white/40 uppercase tracking-widest">Reputation: {attackerProfile.reputation}%</p>
                  </div>
               </div>
               <div className="flex-1 space-y-3 overflow-auto no-scrollbar">
                  <p className="text-[8px] font-black text-emerald-500 uppercase flex items-center gap-2">
                    <MessageSquare className="h-3 w-3" /> Secure Chat Log
                  </p>
                  <div className="space-y-2 opacity-60">
                    {CHAT_MESSAGES.map((msg, i) => (
                      <div key={i} className="text-[9px] font-mono leading-tight">
                        <span className="text-white/30">[{14 + i}:00]</span> {msg}
                      </div>
                    ))}
                  </div>
               </div>
            </Card>

            {/* PANEL 4: PAYLOAD BUILDER */}
            <Card className="bg-black/60 border-white/5 rounded-[2rem] p-6 space-y-4 flex flex-col">
              <h4 className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em] flex items-center gap-2">
                <Hammer className="h-3.5 w-3.5 text-cyan-500" /> Payload Builder
              </h4>
              <div className="flex-1 flex flex-col justify-center space-y-2">
                {[
                  { step: 'RAW_SQL', val: "'OR'1'='1" },
                  { step: 'URL_ENC', val: "%27OR%271%27%3D%271" },
                  { step: 'BASE64', val: "J09SJzEnPScx" }
                ].map((s, i) => (
                  <div key={i} className={cn(
                    "relative p-3 rounded-xl border border-white/5 bg-white/[0.02] transition-all duration-700",
                    isReplaying ? "opacity-30 blur-sm" : "opacity-100 blur-0"
                  )} style={{ transitionDelay: `${i * 300}ms` }}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[8px] font-black text-white/40">{s.step}</span>
                      {i < 2 && <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 z-10"><ChevronRight className="h-4 w-4 rotate-90 text-white/20" /></div>}
                    </div>
                    <p className="text-[10px] font-mono text-destructive truncate">{s.val}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>

        {/* RIGHT: DEFENDER WORKSTATION */}
        <div className="w-1/2 h-full bg-[#020408] p-12 pl-6 overflow-hidden flex flex-col space-y-6">
          <div className="flex justify-between items-end">
            <h2 className="text-3xl font-black tracking-tighter text-white uppercase italic">
              DEFENDER <span className="text-cyan-500">CORE_92</span>
            </h2>
            <Badge variant="outline" className="bg-emerald-500/10 border-emerald-500/30 text-emerald-500 text-[10px] font-black uppercase">SYSTEM_SECURED</Badge>
          </div>

          <div className="flex-1 grid grid-cols-2 grid-rows-2 gap-6">
            
            {/* PANEL 1: NEURAL ATTENTION */}
            <Card className="bg-black/40 border-white/5 rounded-[2rem] p-6 flex flex-col space-y-6">
               <h4 className="text-[9px] font-black text-cyan-500 uppercase tracking-[0.3em] flex items-center gap-2">
                <TrendingUp className="h-3.5 w-3.5" /> Neural Explainability
              </h4>
              <div className="flex-1 relative flex items-center justify-center">
                 <div className="grid grid-cols-3 gap-8 w-full">
                    <div className="space-y-4">
                      {[1, 2, 3].map(i => <div key={i} className="h-8 w-full bg-white/5 rounded-lg border border-white/10" />)}
                    </div>
                    <div className="relative">
                       {/* Simulated Attention Lines */}
                       {!isReplaying && [1, 2, 3, 4, 5].map(i => (
                         <div key={i} className="absolute inset-0 border-t border-cyan-500/40 animate-pulse" style={{ transform: `rotate(${i * 30 - 90}deg)`, opacity: i * 0.2 }} />
                       ))}
                    </div>
                    <div className="flex items-center justify-center">
                       <div className="h-16 w-16 rounded-full border-4 border-cyan-500 animate-blocked-shimmer flex items-center justify-center">
                          <Zap className="h-8 w-8 text-cyan-500" />
                       </div>
                    </div>
                 </div>
              </div>
            </Card>

            {/* PANEL 2: THREAT ANATOMY */}
            <Card className="bg-black/40 border-white/5 rounded-[2rem] p-0 overflow-hidden relative">
               <div className="absolute top-6 left-6 z-10">
                 <h4 className="text-[9px] font-black text-cyan-500 uppercase tracking-[0.3em] flex items-center gap-2">
                  <Database className="h-3.5 w-3.5" /> Threat Anatomy
                 </h4>
               </div>
               <div className="h-full w-full">
                  <ThreatAnatomyCanvas attack={selectedAttack} />
               </div>
               <div className="absolute bottom-6 right-6 flex flex-col items-end gap-1">
                  <span className="text-[8px] font-black text-white/40 uppercase">Complexity Matrix</span>
                  <span className="text-xl font-black text-white tracking-tighter">LVL_4</span>
               </div>
            </Card>

            {/* PANEL 3: COUNTERMEASURE DEPLOYMENT */}
            <Card className="bg-black/40 border-white/5 rounded-[2rem] p-6 space-y-4">
              <h4 className="text-[9px] font-black text-cyan-500 uppercase tracking-[0.3em] flex items-center gap-2">
                <Shield className="h-3.5 w-3.5" /> Passive Defenses
              </h4>
              <div className="space-y-3">
                 {[
                   { name: 'Protocol Validation', icon: FileText, status: 'SECURED' },
                   { name: 'Semantic Analysis', icon: Activity, status: 'SECURED' },
                   { name: 'Behavioral Lock', icon: Lock, status: 'SECURED' }
                 ].map((d, i) => (
                   <div key={i} className={cn(
                     "flex items-center justify-between p-3 rounded-xl border transition-all duration-1000",
                     isReplaying ? "bg-white/5 border-white/10 opacity-30" : "bg-emerald-500/10 border-emerald-500/30 opacity-100"
                   )} style={{ transitionDelay: `${i * 300}ms` }}>
                      <div className="flex items-center gap-3">
                        <d.icon className="h-4 w-4 text-emerald-500" />
                        <span className="text-[9px] font-bold text-white uppercase">{d.name}</span>
                      </div>
                      {!isReplaying && <Badge className="bg-emerald-500 text-white text-[8px] font-black italic">SECURED</Badge>}
                   </div>
                 ))}
              </div>
            </Card>

            {/* PANEL 4: LEGAL CONSEQUENCES */}
            <Card className="bg-[#0f0f15] border-white/10 border-l-4 border-l-destructive rounded-[2rem] p-6 flex flex-col shadow-2xl relative">
              <div className="absolute top-4 right-6">
                <div className="border-4 border-destructive px-3 py-1 rounded rotate-12 text-destructive font-black text-xs opacity-40">PROSECUTABLE</div>
              </div>
              <h4 className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                <Scale className="h-3.5 w-3.5 text-white/50" /> Prosecution Dossier
              </h4>
              <div className="flex-1 space-y-4 font-serif italic text-white/70 text-xs">
                 <p className="border-b border-white/5 pb-2">"Subject activity violates federal cybercrime statutes..."</p>
                 <div className="grid grid-cols-2 gap-4 not-italic font-mono uppercase">
                    <div>
                      <p className="text-[8px] text-white/30 mb-1">Max Penalty</p>
                      <p className="text-xs text-white">{LEGAL_INFO[replayKey % 3].penalty}</p>
                    </div>
                    <div>
                      <p className="text-[8px] text-white/30 mb-1">Statutory Fine</p>
                      <p className="text-xs text-white">{LEGAL_INFO[replayKey % 3].fine}</p>
                    </div>
                 </div>
              </div>
            </Card>

          </div>
        </div>
      </div>

      {/* TIMELINE SCRUBBER */}
      <div className="fixed bottom-0 left-0 w-full h-24 bg-black/90 backdrop-blur-3xl border-t border-white/10 z-[1000] p-6 flex items-center gap-8">
        <div className="flex flex-col">
          <span className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Mirror Session Buffer</span>
          <span className="text-xs font-mono font-bold text-white/80">{attacks.length} Intercepts</span>
        </div>
        
        <div className="flex-1 flex items-center gap-1.5 overflow-x-auto no-scrollbar py-4">
          {attacks.map((atk, i) => (
            <button
              key={atk.id}
              onClick={() => handleLoadAttack(atk)}
              className={cn(
                "h-3 min-w-3 rounded-full transition-all hover:scale-150",
                selectedAttack?.id === atk.id ? "ring-2 ring-white ring-offset-2 ring-offset-black scale-150" : "opacity-40 hover:opacity-100",
                atk.decision === 'BLOCKED' ? "bg-destructive" : "bg-emerald-500"
              )}
            />
          ))}
        </div>

        <div className="flex items-center gap-6">
           <Button 
            variant="outline" 
            className={cn(
              "h-12 border-white/10 bg-white/5 hover:bg-white/10 text-white font-black uppercase text-[10px] tracking-widest px-8 rounded-2xl",
              isReplaying && "opacity-50 cursor-not-allowed"
            )} 
            onClick={() => frustration >= 100 ? setFrustration(0) : handleLoadAttack(attacks[0])}
            disabled={isReplaying}
           >
             {frustration >= 100 ? <><ZapOff className="h-4 w-4 mr-3" /> ATK ABANDONED</> : <><Crosshair className="h-4 w-4 mr-3" /> Replay Sync</>}
           </Button>
        </div>
      </div>

      <style jsx global>{`
        @keyframes scanline { 0% { bottom: 100%; } 100% { bottom: -100px; } }
        .scanline {
          width: 100%; height: 100px; z-index: 5;
          background: linear-gradient(0deg, rgba(239, 68, 68, 0) 0%, rgba(239, 68, 68, 0.1) 50%, rgba(239, 68, 68, 0) 100%);
          position: absolute; bottom: 100%; animation: scanline 4s linear infinite;
        }
        @keyframes shake {
          0%, 100% { transform: translate(0, 0); }
          10%, 30%, 50%, 70%, 90% { transform: translate(-4px, 0); }
          20%, 40%, 60%, 80% { transform: translate(4px, 0); }
        }
        .animate-shake { animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

    </div>
  );
}
