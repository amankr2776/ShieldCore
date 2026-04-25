
"use client";

import { useState, useEffect, useRef, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/select';
import { 
  Play, Pause, Activity, ShieldAlert, ShieldCheck, AlertTriangle, 
  Clock, Search, Trash2, X, Info, Globe, ChevronRight, Terminal 
} from 'lucide-react';
import { generateFakeRequest, getSeededData } from '@/lib/mock-data';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';

export default function LiveFeedPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  const [isConnected, setIsConnected] = useState(true);
  const [replayStep, setReplayStep] = useState(-1);
  const [newRequestIds, setNewRequestIds] = useState<Set<string>>(new Set());
  const [stats, setStats] = useState({
    total: 0,
    blocked: 0,
    safe: 0,
    suspicious: 0,
    avgInference: 0
  });

  const { toast } = useToast();
  const statsRef = useRef(stats);

  useEffect(() => { statsRef.current = stats; }, [stats]);

  useEffect(() => {
    const seed = getSeededData();
    setRequests(seed);
    const counts = seed.reduce((acc, r) => {
      acc[r.decision]++;
      acc.total++;
      acc.totalLat += r.inferenceTime;
      return acc;
    }, { SAFE: 0, BLOCKED: 0, SUSPICIOUS: 0, total: 0, totalLat: 0 });
    setStats({ total: counts.total, blocked: counts.BLOCKED, safe: counts.SAFE, suspicious: counts.SUSPICIOUS, avgInference: parseFloat((counts.totalLat / counts.total).toFixed(2)) });
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isPaused && isConnected) {
        const newReq = generateFakeRequest();
        const newTotal = statsRef.current.total + 1;
        setStats({ ...statsRef.current, total: newTotal, blocked: statsRef.current.blocked + (newReq.decision === 'BLOCKED' ? 1 : 0), safe: statsRef.current.safe + (newReq.decision === 'SAFE' ? 1 : 0), suspicious: statsRef.current.suspicious + (newReq.decision === 'SUSPICIOUS' ? 1 : 0), avgInference: parseFloat(((statsRef.current.avgInference * statsRef.current.total + newReq.inferenceTime) / newTotal).toFixed(2)) });
        setRequests(prev => [newReq, ...prev].slice(0, 100));
        setNewRequestIds(prev => new Set(prev).add(newReq.id));
        setTimeout(() => setNewRequestIds(prev => {
          const next = new Set(prev);
          next.delete(newReq.id);
          return next;
        }), 2000);

        if (newReq.decision === 'BLOCKED') {
          toast({ 
            title: "CRITICAL ALERT", 
            description: `${newReq.attackType} intercepted from ${newReq.ip}`, 
            variant: "destructive",
            className: "glass-card border-destructive/50 badge-glow-red"
          });
        }
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [isPaused, isConnected, toast]);

  useEffect(() => {
    if (selectedRequest && selectedRequest.decode_steps) {
      setReplayStep(-1);
      let step = 0;
      const interval = setInterval(() => {
        setReplayStep(step);
        step++;
        if (step >= selectedRequest.decode_steps.length) clearInterval(interval);
      }, 600);
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

  const getDecisionGlow = (decision: string) => {
    switch (decision) {
      case 'BLOCKED': return 'bg-destructive/20 text-destructive border-destructive/30 badge-glow-red';
      case 'SAFE': return 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30 badge-glow-green';
      case 'SUSPICIOUS': return 'bg-amber-500/20 text-amber-500 border-amber-500/30 badge-glow-amber';
      default: return '';
    }
  };

  return (
    <div className="relative min-h-screen">
      <div className="fixed inset-0 matrix-grid opacity-30 pointer-events-none" />
      
      <div className="container mx-auto py-12 px-6 max-w-7xl space-y-8 animate-in fade-in duration-1000 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-destructive font-mono text-[10px] tracking-[0.3em] uppercase animate-pulse">
              <Activity className="h-3 w-3" /> Live Telemetry Feed
            </div>
            <h1 className="text-5xl font-black tracking-tighter uppercase">TRAFFIC <span className="text-destructive">ENGINE</span></h1>
            <p className="text-muted-foreground font-medium text-lg italic">Continuous neural monitoring of global ingress streams.</p>
          </div>
          <div className="flex items-center gap-4 bg-white/5 p-2 rounded-2xl border border-white/5 backdrop-blur-xl">
            <div className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white/5 border border-white/5 text-[10px] font-black uppercase tracking-widest">
              <div className={cn("h-2 w-2 rounded-full", isConnected ? "bg-emerald-500 animate-pulse shadow-[0_0_10px_#22c55e]" : "bg-destructive")} />
              <span className="text-muted-foreground">{isConnected ? "Uplink Established" : "Uplink Severed"}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: 'Ingress Node', value: stats.total, color: 'text-white' },
            { label: 'Neutralized', value: stats.blocked, color: 'text-destructive', glow: 'badge-glow-red' },
            { label: 'Validated', value: stats.safe, color: 'text-emerald-500', glow: 'badge-glow-green' },
            { label: 'Anomalous', value: stats.suspicious, color: 'text-amber-500', glow: 'badge-glow-amber' },
            { label: 'Latency', value: `${stats.avgInference}ms`, color: 'text-primary' },
          ].map((s, i) => (
            <Card key={i} className="glass-card bg-white/[0.02] border-white/5 group">
              <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-1">
                <span className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground font-black opacity-50 group-hover:opacity-100 transition-opacity">{s.label}</span>
                <span className={cn("text-3xl font-black tracking-tighter", s.color)}>{s.value}</span>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="glass-card bg-[#0a0c14]/80 shadow-2xl border-white/5 flex flex-col min-h-[650px] overflow-hidden rounded-3xl">
          <div className="p-6 border-b border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 bg-white/[0.02]">
            <div className="flex items-center gap-4 w-full md:w-auto">
              <Button variant="outline" size="sm" onClick={() => setIsPaused(!isPaused)} className={cn("h-11 px-8 font-black uppercase text-[10px] tracking-widest rounded-xl transition-all border-white/10 hover:bg-white/5", isPaused ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "")}>
                {isPaused ? <Play className="h-4 w-4 mr-2" /> : <Pause className="h-4 w-4 mr-2" />}
                {isPaused ? "Resume Feed" : "Suspend Feed"}
              </Button>
              <div className="relative flex-1 md:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground opacity-50" />
                <Input placeholder="Filter IP or Attack Class..." className="h-11 pl-12 bg-black/40 rounded-xl border-white/10 focus-visible:ring-destructive font-mono text-xs" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
            </div>
            <div className="flex items-center gap-4 w-full md:w-auto">
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-[180px] h-11 rounded-xl bg-black/40 border-white/10 font-black text-[10px] uppercase tracking-widest">
                  <SelectValue placeholder="All Streams" />
                </SelectTrigger>
                <SelectContent className="glass-card border-white/10 p-2">
                  <SelectItem value="ALL">All Streams</SelectItem>
                  <SelectItem value="BLOCKED">Blocked Only</SelectItem>
                  <SelectItem value="SAFE">Safe Only</SelectItem>
                  <SelectItem value="SUSPICIOUS">Suspicious Only</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="ghost" size="sm" className="h-11 px-6 font-black uppercase text-[10px] tracking-widest text-muted-foreground hover:text-destructive hover:bg-white/5 rounded-xl" onClick={() => setRequests([])}>
                <Trash2 className="h-4 w-4 mr-2" /> Purge
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-auto max-h-[600px] relative scrollbar-hide">
            <Table>
              <TableHeader className="sticky top-0 bg-[#0a0c14] z-50 shadow-xl border-b border-white/5">
                <TableRow className="border-none hover:bg-transparent">
                  <TableHead className="w-[120px] text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground pl-8">Epoch</TableHead>
                  <TableHead className="text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground">Ingress Source</TableHead>
                  <TableHead className="text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground">Protocol/Path</TableHead>
                  <TableHead className="text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground">Neural Class</TableHead>
                  <TableHead className="text-right text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground pr-8">Match</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.map((req) => (
                  <TableRow 
                    key={req.id} 
                    className={cn(
                      "transition-all duration-500 border-white/5 cursor-pointer group hover:bg-white/[0.03]",
                      newRequestIds.has(req.id) && req.decision === 'BLOCKED' && "bg-destructive/40 transition-none",
                      req.decision === 'BLOCKED' && "bg-destructive/[0.02]",
                      req.decision === 'SAFE' && "bg-emerald-500/[0.01]"
                    )}
                    onClick={() => setSelectedRequest(req)}
                  >
                    <TableCell className="font-mono text-[10px] font-black text-muted-foreground opacity-50 pl-8">{new Date(req.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}</TableCell>
                    <TableCell className="font-mono text-xs font-bold tracking-tight">
                      <div className="flex items-center gap-2">
                         <span className="text-[10px] opacity-40">[{req.country}]</span>
                         {req.ip}
                      </div>
                    </TableCell>
                    <TableCell className="text-[10px] font-mono opacity-80 uppercase tracking-tighter">
                      <span className="text-destructive font-black mr-2">{req.method}</span>
                      {req.endpoint}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className={cn("px-4 py-1 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all duration-500", getDecisionGlow(req.decision))}>
                          {req.attackType}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-black text-xs tracking-tighter pr-8">
                      <span className={cn(req.score > 0.8 && "text-destructive")}>{Math.round(req.score * 100)}%</span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filteredRequests.length === 0 && (
              <div className="py-32 flex flex-col items-center justify-center space-y-6 opacity-30">
                <Terminal className="h-20 w-20 text-destructive animate-pulse" />
                <p className="font-black uppercase tracking-[0.4em] text-xs">Waiting for ingress signal</p>
              </div>
            )}
          </div>
        </Card>

        <Sheet open={!!selectedRequest} onOpenChange={(open) => !open && setSelectedRequest(null)}>
          <SheetContent className="w-full sm:max-w-xl glass-card border-l border-white/10 shadow-2xl p-0 overflow-hidden flex flex-col">
            {selectedRequest && (
              <>
                <div className={cn("h-2 w-full transition-colors duration-1000", selectedRequest.decision === 'BLOCKED' ? "bg-destructive shadow-[0_0_15px_#ef4444]" : selectedRequest.decision === 'SAFE' ? "bg-emerald-500 shadow-[0_0_15px_#22c55e]" : "bg-amber-500 shadow-[0_0_15px_#f59e0b]")} />
                <div className="p-10 space-y-10 flex-1 overflow-auto custom-scrollbar">
                  <SheetHeader>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className={cn("px-6 py-2 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl", getDecisionGlow(selectedRequest.decision))}>{selectedRequest.decision} DETECTED</Badge>
                      <div className="text-[10px] font-mono opacity-50 uppercase tracking-widest">INCIDENT_{selectedRequest.id.toUpperCase()}</div>
                    </div>
                    <SheetTitle className="text-4xl font-black tracking-tighter mt-6 uppercase leading-none">{selectedRequest.attackType}</SheetTitle>
                    <SheetDescription className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mt-2">Neural Forensic Trace Analysis</SheetDescription>
                  </SheetHeader>

                  <div className="space-y-6">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground border-b border-white/10 pb-4">De-obfuscation Pipeline Replay</h4>
                    <div className="space-y-6">
                      {selectedRequest.decode_steps?.map((step: any, idx: number) => (
                        <div key={idx} className={cn("transition-all duration-700 transform", idx > replayStep ? "opacity-0 translate-y-8" : "opacity-100 translate-y-0")}>
                          <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-destructive mb-3">
                            <div className="h-6 w-6 rounded-lg bg-destructive/10 border border-destructive/30 flex items-center justify-center text-[10px]">{idx + 1}</div>
                            {step.step_name}
                          </div>
                          <div className="p-6 bg-black/40 rounded-2xl border border-white/5 font-mono text-[11px] break-all leading-relaxed shadow-inner text-muted-foreground">
                            {step.output}
                          </div>
                          {idx < selectedRequest.decode_steps.length - 1 && idx <= replayStep && (
                            <div className="flex justify-center mt-6"><ChevronRight className="h-5 w-5 text-destructive/30 rotate-90 animate-bounce" /></div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 pt-12 border-t border-white/5">
                     <Button className="w-full bg-destructive hover:bg-destructive/90 font-black uppercase text-xs tracking-widest rounded-2xl h-16 glow-btn shadow-2xl transition-all duration-300">Blacklist Origin Node</Button>
                     <Button variant="ghost" className="w-full font-black uppercase text-[10px] tracking-widest h-12 text-muted-foreground hover:bg-white/5">Ignore Signal</Button>
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
