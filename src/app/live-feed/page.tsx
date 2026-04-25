"use client";

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Play, Pause, Activity, Search, Trash2, Globe, Terminal,
  Fingerprint, Zap, Shield, CheckCircle2, AlertCircle,
  Syringe, Flame, Folder, Bomb, ShieldX
} from 'lucide-react';
import { generateFakeRequest, getSeededData } from '@/lib/mock-data';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { formatDistanceToNow } from 'date-fns';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

const ATTACK_ICONS: Record<string, any> = {
  'SQL Injection': Syringe,
  'XSS': Flame,
  'Path Traversal': Folder,
  'Command Injection': Terminal,
  'Buffer Overflow': Bomb,
  'SSRF': Globe,
  'Safe': CheckCircle2,
  'Suspicious': AlertCircle
};

export default function LiveFeedPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  const [isConnected, setIsConnected] = useState(true);
  const [replayStep, setReplayStep] = useState(-1);
  const [stats, setStats] = useState({
    total: 0,
    blocked: 0,
    avgScore: 0,
    history: Array.from({ length: 60 }, () => ({ val: Math.random() * 20 }))
  });

  const { toast } = useToast();

  useEffect(() => {
    const seed = getSeededData();
    setRequests(seed);
    const blocked = seed.filter(r => r.decision === 'BLOCKED').length;
    const scores = seed.map(r => r.score);
    const avgScore = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    setStats(prev => ({ ...prev, total: seed.length, blocked, avgScore }));
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isPaused && isConnected) {
        const newReq = generateFakeRequest();
        setRequests(prev => [newReq, ...prev].slice(0, 100));
        
        setStats(prev => {
          const newTotal = prev.total + 1;
          const newBlocked = prev.blocked + (newReq.decision === 'BLOCKED' ? 1 : 0);
          const newHistory = [...prev.history.slice(1), { val: newReq.score * 100 }];
          return { ...prev, total: newTotal, blocked: newBlocked, history: newHistory };
        });

        if (newReq.decision === 'BLOCKED') {
          toast({ 
            title: "THREAT NEUTRALIZED", 
            description: `${newReq.attackType} from ${newReq.ip}`, 
            variant: "destructive",
            className: "glass-card border-destructive/50 animate-blocked-shimmer"
          });
        }
      }
    }, 2500);
    return () => clearInterval(interval);
  }, [isPaused, isConnected, toast]);

  useEffect(() => {
    if (selectedRequest) {
      setReplayStep(-1);
      let step = 0;
      const interval = setInterval(() => {
        setReplayStep(step);
        step++;
        if (step >= 5) clearInterval(interval);
      }, 500);
      return () => clearInterval(interval);
    }
  }, [selectedRequest]);

  const filteredRequests = useMemo(() => {
    return requests.filter(req => {
      const matchesFilter = filter === 'ALL' || req.decision === filter;
      const matchesSearch = req.ip.toLowerCase().includes(search.toLowerCase()) || req.attackType.toLowerCase().includes(search.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [requests, filter, search]);

  return (
    <div className="relative min-h-screen dashboard-cursor">
      <div className="fixed inset-0 matrix-grid opacity-20 pointer-events-none" />
      
      <div className="container mx-auto py-12 px-6 max-w-7xl space-y-10 animate-in fade-in duration-1000 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-destructive font-mono text-[10px] tracking-[0.4em] uppercase animate-pulse">
              <Activity className="h-3 w-3" /> Live Forensic Feed
            </div>
            <h1 className="text-5xl font-black tracking-tighter uppercase text-gray-900 dark:text-white">TRAFFIC <span className="text-destructive">STREAM</span></h1>
            <p className="text-gray-500 dark:text-muted-foreground font-medium text-lg italic opacity-60">Edge-wide telemetry across global ingress nodes.</p>
          </div>
          <div className="flex items-center gap-4 bg-black/5 dark:bg-white/5 p-2 rounded-2xl border border-black/5 dark:border-white/5 backdrop-blur-xl">
            <div className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 text-[10px] font-black uppercase tracking-widest">
              <div className={cn("h-2 w-2 rounded-full", isConnected ? "bg-emerald-500 animate-pulse shadow-[0_0_10px_#22c55e]" : "bg-destructive")} />
              <span className="text-gray-500 dark:text-muted-foreground">{isConnected ? "Uplink Secure" : "Uplink Lost"}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: 'Total Ingress', value: stats.total, color: 'text-gray-900 dark:text-white', trend: '+12%', icon: Globe },
            { label: 'Neutralized', value: stats.blocked, color: 'text-destructive', trend: '+4%', icon: ShieldX },
            { label: 'Avg Threat Index', value: `${Math.round(stats.avgScore * 100)}%`, color: 'text-amber-500', trend: '-2%', icon: AlertCircle },
          ].map((s, i) => (
            <Card key={i} className="glass-card rounded-3xl overflow-hidden group p-1">
              <CardContent className="p-8 flex items-center justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-muted-foreground opacity-50">
                    <s.icon className="h-3 w-3" /> {s.label}
                  </div>
                  <div className={cn("text-4xl font-black tracking-tighter", s.color)}>{s.value}</div>
                  <div className="text-[10px] font-bold text-emerald-500">{s.trend} <span className="text-gray-400 dark:text-muted-foreground opacity-40">vs prev epoch</span></div>
                </div>
                <div className="w-24 h-12 opacity-50 group-hover:opacity-100 transition-opacity">
                   <ResponsiveContainer width="100%" height="100%">
                     <LineChart data={stats.history}>
                        <Line type="monotone" dataKey="val" stroke={i === 1 ? '#ef4444' : '#94a3b8'} strokeWidth={2} dot={false} />
                     </LineChart>
                   </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-black/[0.02] dark:bg-white/[0.02] p-6 rounded-3xl border border-black/5 dark:border-white/5">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <Button variant="outline" size="lg" onClick={() => setIsPaused(!isPaused)} className={cn("h-14 px-8 font-black uppercase text-[10px] tracking-widest rounded-2xl transition-all border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5", isPaused ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-destructive/10 text-destructive border-destructive/20")}>
              {isPaused ? <Play className="h-4 w-4 mr-2" /> : <Pause className="h-4 w-4 mr-2" />}
              {isPaused ? "Activate Feed" : "Suspend Feed"}
            </Button>
            <div className="relative flex-1 md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-muted-foreground opacity-30" />
              <Input placeholder="Search IP or Attack Class..." className="h-14 pl-12 bg-white dark:bg-black/40 rounded-2xl border-black/5 dark:border-white/5 focus-visible:ring-destructive font-mono text-xs text-gray-900 dark:text-white" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>
          <div className="flex items-center gap-4">
             <div className="flex gap-2 bg-white dark:bg-black/40 p-1.5 rounded-2xl border border-black/5 dark:border-white/5">
                {['ALL', 'BLOCKED', 'SAFE'].map(f => (
                  <button key={f} onClick={() => setFilter(f)} className={cn("px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all", filter === f ? "bg-destructive text-white shadow-lg" : "text-gray-500 dark:text-muted-foreground hover:text-gray-900 dark:hover:text-white")}>
                    {f}
                  </button>
                ))}
             </div>
             <Button variant="ghost" size="icon" className="h-14 w-14 rounded-2xl border border-black/5 dark:border-white/5 hover:bg-destructive/10 hover:text-destructive text-gray-400 dark:text-muted-foreground" onClick={() => setRequests([])}>
                <Trash2 className="h-5 w-5" />
             </Button>
          </div>
        </div>

        <div className="space-y-4 max-h-[1200px] overflow-auto pr-2 custom-scrollbar">
          {filteredRequests.map((req) => {
            const Icon = ATTACK_ICONS[req.attackType] || Shield;
            return (
              <Card 
                key={req.id} 
                onClick={() => setSelectedRequest(req)}
                className={cn(
                  "glass-card border-l-4 group cursor-pointer animate-in slide-in-from-top-4 duration-500",
                  req.decision === 'BLOCKED' ? "border-l-destructive bg-destructive/[0.02]" : "border-l-emerald-500 bg-emerald-500/[0.01]",
                )}
              >
                <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-6 flex-1 min-w-0">
                    <div className={cn("p-4 rounded-2xl border border-black/5 dark:border-white/5 transition-transform group-hover:scale-110", req.decision === 'BLOCKED' ? "bg-destructive/10 text-destructive" : "bg-emerald-500/10 text-emerald-500")}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                         <span className="text-[12px] font-mono font-black text-gray-900 dark:text-white">{req.ip}</span>
                         <span className="text-[10px] opacity-40 text-gray-500 dark:text-white">[{req.country}]</span>
                      </div>
                      <div className="flex items-center gap-3 text-[10px] font-mono text-gray-400 dark:text-muted-foreground">
                        <span className="text-destructive font-black">{req.method}</span>
                        <span className="truncate">{req.endpoint}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-3 w-full md:w-auto">
                    <div className="flex items-center gap-4">
                       <div className="text-right">
                          <p className="text-[9px] font-black uppercase text-gray-400 dark:text-muted-foreground opacity-50 mb-1">Intelligence Match</p>
                          <div className="flex items-center gap-3">
                             <div className="w-24 h-1 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
                                <div className={cn("h-full transition-all", req.decision === 'BLOCKED' ? "bg-destructive" : "bg-emerald-500")} style={{ width: `${req.score * 100}%` }} />
                             </div>
                             <span className={cn("text-xs font-black font-mono", req.decision === 'BLOCKED' ? "text-destructive" : "text-emerald-500")}>{Math.round(req.score * 100)}%</span>
                          </div>
                       </div>
                       <Badge variant="outline" className={cn("px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-xl", req.decision === 'BLOCKED' ? "bg-destructive/10 text-destructive border-destructive/20" : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20")}>
                         {req.attackType}
                       </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-[9px] font-black text-gray-400 dark:text-muted-foreground opacity-40 uppercase tracking-widest">
                       <span>{req.inferenceTime}ms LAT</span>
                       <span>{formatDistanceToNow(new Date(req.timestamp))} ago</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          
          {filteredRequests.length === 0 && (
            <div className="py-40 flex flex-col items-center justify-center space-y-6 opacity-20">
              <Terminal className="h-24 w-24 text-destructive animate-pulse" />
              <p className="font-black uppercase tracking-[0.5em] text-sm text-gray-400 dark:text-white">Synchronizing edge telemetry...</p>
            </div>
          )}
        </div>

        <Sheet open={!!selectedRequest} onOpenChange={(open) => !open && setSelectedRequest(null)}>
          <SheetContent className="w-full sm:max-w-2xl glass-card border-l border-black/10 dark:border-white/10 shadow-2xl p-0 overflow-hidden flex flex-col">
            <div className="sr-only">
              <SheetHeader>
                <SheetTitle>Incident Details</SheetTitle>
                <SheetDescription>Detailed forensic breakdown of the selected request</SheetDescription>
              </SheetHeader>
            </div>
            {selectedRequest && (
              <>
                <div className={cn("h-2 w-full", selectedRequest.decision === 'BLOCKED' ? "bg-destructive" : "bg-emerald-500")} />
                <div className="p-12 space-y-12 flex-1 overflow-auto custom-scrollbar no-scrollbar">
                  <SheetHeader>
                    <div className="flex items-center justify-between mb-4">
                      <Badge variant="outline" className="text-[10px] font-black uppercase px-4 py-1 border-black/10 dark:border-white/10 text-gray-500 dark:text-white">{selectedRequest.id.toUpperCase()}</Badge>
                      <span className="text-[10px] font-mono opacity-50 uppercase text-gray-500 dark:text-white">{selectedRequest.timestamp}</span>
                    </div>
                    <SheetTitle className="text-5xl font-black tracking-tighter uppercase leading-none text-gray-900 dark:text-white">{selectedRequest.attackType}</SheetTitle>
                    <SheetDescription className="font-mono text-[10px] uppercase tracking-[0.3em] text-destructive mt-3 font-black">Forensic Replay Timeline</SheetDescription>
                  </SheetHeader>

                  <div className="space-y-10">
                    <div className="section-label">De-obfuscation Pipeline</div>
                    <div className="space-y-8 relative">
                      <div className="absolute left-4 top-4 bottom-4 w-[2px] border-l-2 border-dashed border-black/10 dark:border-white/10" />
                      {[
                        { name: 'Raw Ingress', val: selectedRequest.payload || 'Initial telemetry capture' },
                        { name: 'Recursive Decode', val: 'Stripped 2 nested URL layers' },
                        { name: 'Semantic Tokenization', val: 'Identified 12 high-risk signatures' },
                        { name: 'Neural Inference', val: 'Llama 3 classification complete' },
                        { name: 'Action: ' + selectedRequest.decision, val: 'Ingress node isolated' }
                      ].map((step, idx) => (
                        <div key={idx} className={cn("pl-12 relative transition-all duration-700", idx > replayStep ? "opacity-0 translate-x-4" : "opacity-100 translate-x-0")}>
                          <div className={cn("absolute left-0 top-0 h-8 w-8 rounded-full flex items-center justify-center border-2 z-10", idx === replayStep ? "bg-destructive border-destructive scale-110" : "bg-gray-100 dark:bg-[#0a0c14] border-black/10 dark:border-white/10")}>
                            <span className="text-[10px] font-black text-gray-900 dark:text-white">{idx + 1}</span>
                          </div>
                          <div className="glass-card p-6 rounded-2xl">
                             <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-900 dark:text-white mb-2">{step.name}</h4>
                             <p className="text-[11px] font-mono text-gray-500 dark:text-muted-foreground break-all bg-black/5 dark:bg-black/40 p-3 rounded-lg border border-black/5 dark:border-white/5">{step.val}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-4 pt-12 border-t border-black/5 dark:border-white/5">
                     <Button className="flex-1 bg-destructive hover:bg-destructive/90 font-black uppercase text-xs h-16 rounded-2xl glow-btn">
                       Blacklist Origin
                     </Button>
                     <Button variant="outline" className="flex-1 font-black uppercase text-xs h-16 rounded-2xl border-black/10 dark:border-white/10 text-gray-900 dark:text-white">
                       Dismiss Signal
                     </Button>
                  </div>

                  <div className="pt-8 text-center">
                    <p className="text-[8px] font-black uppercase tracking-widest text-gray-400 dark:text-white opacity-30">ShieldCore Security Protocol SC-92</p>
                  </div>
                </div>
              </>
            )}
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
