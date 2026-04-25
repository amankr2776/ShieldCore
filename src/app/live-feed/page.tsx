
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
  Clock, Search, Trash2, X, Info, Globe 
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
  const [stats, setStats] = useState({
    total: 0,
    blocked: 0,
    safe: 0,
    suspicious: 0,
    avgInference: 0
  });

  const { toast } = useToast();
  const requestsRef = useRef(requests);
  const statsRef = useRef(stats);

  useEffect(() => {
    requestsRef.current = requests;
  }, [requests]);

  useEffect(() => {
    statsRef.current = stats;
  }, [stats]);

  // Initial Seed
  useEffect(() => {
    const seed = getSeededData();
    setRequests(seed);
    
    // Calculate initial stats
    const counts = seed.reduce((acc, r) => {
      acc[r.decision]++;
      acc.total++;
      acc.totalLat += r.inferenceTime;
      return acc;
    }, { SAFE: 0, BLOCKED: 0, SUSPICIOUS: 0, total: 0, totalLat: 0 });

    setStats({
      total: counts.total,
      blocked: counts.BLOCKED,
      safe: counts.SAFE,
      suspicious: counts.SUSPICIOUS,
      avgInference: parseFloat((counts.totalLat / counts.total).toFixed(2))
    });
  }, []);

  // Update loop
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isPaused && isConnected) {
        const newReq = generateFakeRequest();
        
        const newTotal = statsRef.current.total + 1;
        const newBlocked = statsRef.current.blocked + (newReq.decision === 'BLOCKED' ? 1 : 0);
        const newSafe = statsRef.current.safe + (newReq.decision === 'SAFE' ? 1 : 0);
        const newSuspicious = statsRef.current.suspicious + (newReq.decision === 'SUSPICIOUS' ? 1 : 0);
        const newAvg = parseFloat(((statsRef.current.avgInference * statsRef.current.total + newReq.inferenceTime) / newTotal).toFixed(2));

        setStats({
          total: newTotal,
          blocked: newBlocked,
          safe: newSafe,
          suspicious: newSuspicious,
          avgInference: newAvg
        });

        setRequests(prev => [newReq, ...prev].slice(0, 200));

        if (newReq.decision === 'BLOCKED') {
          toast({
            title: "THREAT BLOCKED",
            description: `${newReq.attackType} from ${newReq.ip}`,
            variant: "destructive"
          });
          // Update tab title
          document.title = `FusionX WAF | Live Feed — ${newBlocked} Blocked`;
        }
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [isPaused, isConnected, toast]);

  const filteredRequests = useMemo(() => {
    return requests.filter(req => {
      const matchesFilter = filter === 'ALL' || req.decision === filter;
      const matchesSearch = 
        req.ip.toLowerCase().includes(search.toLowerCase()) || 
        req.attackType.toLowerCase().includes(search.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [requests, filter, search]);

  const getDecisionStyles = (decision: string) => {
    switch (decision) {
      case 'BLOCKED': return 'bg-destructive/10 text-destructive border-destructive/20 blocked-gradient';
      case 'SAFE': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 safe-gradient';
      case 'SUSPICIOUS': return 'bg-amber-500/10 text-amber-500 border-amber-500/20 suspicious-gradient';
      default: return '';
    }
  };

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div className="container mx-auto py-6 px-6 max-w-7xl space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Traffic Feed</h1>
          <p className="text-muted-foreground text-sm">Real-time inspection of edge network ingress.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/50 border border-border/50 text-xs">
            <div className={cn("h-2 w-2 rounded-full", isConnected ? "bg-emerald-500 animate-pulse" : "bg-destructive")} />
            <span className="font-bold text-muted-foreground uppercase">{isConnected ? "Connected" : "Disconnected"}</span>
          </div>
        </div>
      </div>

      {/* Stat Bar */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Total', value: stats.total, color: 'text-muted-foreground' },
          { label: 'Blocked', value: stats.blocked, color: 'text-destructive', border: 'border-destructive/20' },
          { label: 'Safe', value: stats.safe, color: 'text-emerald-500', border: 'border-emerald-500/20' },
          { label: 'Suspicious', value: stats.suspicious, color: 'text-amber-500', border: 'border-amber-500/20' },
          { label: 'Avg Latency', value: `${stats.avgInference}ms`, color: 'text-accent', border: 'border-accent/20' },
        ].map((s, i) => (
          <Card key={i} className={cn("bg-card border-border", s.border)}>
            <CardContent className="p-4 flex flex-col items-center justify-center text-center space-y-1">
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">{s.label}</span>
              <span className={cn("text-2xl font-extrabold", s.color)}>{s.value}</span>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-border/50 bg-card shadow-xl flex flex-col min-h-[600px] overflow-hidden">
        {/* Controls Bar */}
        <div className="p-4 border-b border-border/50 flex flex-col md:row items-center justify-between gap-4 bg-secondary/20 backdrop-blur-md">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setIsPaused(!isPaused)}
              className={cn("h-9 font-bold rounded-full", isPaused ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "")}
            >
              {isPaused ? <Play className="h-4 w-4 mr-2" /> : <Pause className="h-4 w-4 mr-2" />}
              {isPaused ? "Resume" : "Pause"}
            </Button>
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search IP or Attack..." 
                className="h-9 pl-9 bg-background/50 rounded-full border-border/50"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[140px] h-9 rounded-full bg-background/50 border-border/50 font-bold text-xs uppercase">
                <SelectValue placeholder="All Traffic" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Traffic</SelectItem>
                <SelectItem value="BLOCKED">Blocked Only</SelectItem>
                <SelectItem value="SAFE">Safe Only</SelectItem>
                <SelectItem value="SUSPICIOUS">Suspicious Only</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-9 font-bold text-muted-foreground hover:text-destructive rounded-full"
              onClick={() => setRequests([])}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear
            </Button>
          </div>
        </div>

        {/* Table Area */}
        <div className="flex-1 overflow-auto max-h-[600px]">
          <Table>
            <TableHeader className="sticky top-0 bg-card z-10 shadow-sm">
              <TableRow className="border-b border-border/50 hover:bg-transparent">
                <TableHead className="w-[120px] text-[10px] uppercase font-bold tracking-widest">Time</TableHead>
                <TableHead className="text-[10px] uppercase font-bold tracking-widest">Country</TableHead>
                <TableHead className="text-[10px] uppercase font-bold tracking-widest">IP Source</TableHead>
                <TableHead className="text-[10px] uppercase font-bold tracking-widest">Endpoint</TableHead>
                <TableHead className="text-[10px] uppercase font-bold tracking-widest">Threat Class</TableHead>
                <TableHead className="text-right text-[10px] uppercase font-bold tracking-widest">Score</TableHead>
                <TableHead className="text-center text-[10px] uppercase font-bold tracking-widest">Inference</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRequests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-96 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center space-y-4">
                      <Clock className="h-12 w-12 opacity-10" />
                      <p className="uppercase tracking-widest text-xs font-bold">Waiting for edge activity...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredRequests.map((req) => (
                  <TableRow 
                    key={req.id} 
                    className={cn(
                      "transition-all duration-300 animate-slide-down border-b border-border/20 cursor-pointer group",
                      getDecisionStyles(req.decision),
                      req.decision === 'BLOCKED' && "hover:bg-destructive/20 animate-pulse-subtle"
                    )}
                    onClick={() => setSelectedRequest(req)}
                  >
                    <TableCell className="font-mono text-[10px] font-bold text-muted-foreground">{formatTime(req.timestamp)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <span className="text-lg grayscale group-hover:grayscale-0 transition-all">
                          {req.country === 'US' ? '🇺🇸' : req.country === 'DE' ? '🇩🇪' : req.country === 'UK' ? '🇬🇧' : req.country === 'RU' ? '🇷🇺' : req.country === 'BR' ? '🇧🇷' : req.country === 'FR' ? '🇫🇷' : req.country === 'CN' ? '🇨🇳' : req.country === 'IE' ? '🇮🇪' : req.country === 'SG' ? '🇸🇬' : req.country === 'NL' ? '🇳🇱' : req.country === 'JP' ? '🇯🇵' : req.country === 'AU' ? '🇦🇺' : '🏳️'}
                        </span>
                        <span className="text-[10px] font-bold text-muted-foreground">{req.country}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs font-bold">{req.ip}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-xs font-mono">{req.endpoint}</span>
                        <span className="text-[9px] uppercase font-bold opacity-40">{req.category}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {req.decision === 'BLOCKED' ? <ShieldAlert className="h-4 w-4 text-destructive" /> : 
                         req.decision === 'SAFE' ? <ShieldCheck className="h-4 w-4 text-emerald-500" /> : 
                         <AlertTriangle className="h-4 w-4 text-amber-500" />}
                        <span className={cn(
                          "text-xs font-extrabold uppercase tracking-tighter",
                          req.decision === 'BLOCKED' ? "text-destructive" : 
                          req.decision === 'SUSPICIOUS' ? "text-amber-500" : "text-muted-foreground"
                        )}>
                          {req.attackType}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs font-bold">
                      <span className={cn(req.score > 0.8 && "text-destructive")}>{Math.round(req.score * 100)}%</span>
                    </TableCell>
                    <TableCell className="text-center font-mono text-xs text-muted-foreground">{req.inferenceTime}ms</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                        <Info className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Side Drawer for Details */}
      <Sheet open={!!selectedRequest} onOpenChange={(open) => !open && setSelectedRequest(null)}>
        <SheetContent className="w-full sm:max-w-xl bg-card border-l border-border/50 shadow-2xl p-0 overflow-hidden flex flex-col">
          {selectedRequest && (
            <>
              <div className={cn("h-1.5 w-full", 
                selectedRequest.decision === 'BLOCKED' ? "bg-destructive" : 
                selectedRequest.decision === 'SAFE' ? "bg-emerald-500" : "bg-amber-500")} 
              />
              <div className="p-8 space-y-8 flex-1 overflow-auto">
                <SheetHeader>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className={cn("px-4 py-1.5 text-xs font-extrabold uppercase tracking-widest", getDecisionStyles(selectedRequest.decision))}>
                      {selectedRequest.decision} DETECTED
                    </Badge>
                    <span className="text-[10px] font-mono text-muted-foreground">{selectedRequest.id}</span>
                  </div>
                  <SheetTitle className="text-3xl font-extrabold tracking-tight mt-4">
                    {selectedRequest.attackType}
                  </SheetTitle>
                  <SheetDescription className="text-muted-foreground font-mono text-xs">
                    Event captured at {new Date(selectedRequest.timestamp).toLocaleString()}
                  </SheetDescription>
                </SheetHeader>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-secondary/30 rounded-2xl border border-border/50 space-y-1">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Source IP</p>
                    <p className="font-mono text-lg font-bold">{selectedRequest.ip}</p>
                    <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Globe className="h-3 w-3" /> Origin: {selectedRequest.country}
                    </p>
                  </div>
                  <div className="p-4 bg-secondary/30 rounded-2xl border border-border/50 space-y-1">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Threat Score</p>
                    <p className="font-mono text-lg font-bold text-destructive">{Math.round(selectedRequest.score * 100)}%</p>
                    <p className="text-[10px] text-muted-foreground uppercase">High Confidence</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground border-b border-border/50 pb-2">Technical Details</h4>
                  <div className="grid grid-cols-2 gap-y-4">
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase">Method</p>
                      <Badge variant="outline" className="font-bold text-xs">{selectedRequest.method}</Badge>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase">Endpoint</p>
                      <p className="text-xs font-mono">{selectedRequest.endpoint}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase">Category</p>
                      <p className="text-xs uppercase font-bold tracking-tighter">{selectedRequest.category}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase">Inference</p>
                      <p className="text-xs font-bold font-mono text-accent">{selectedRequest.inferenceTime}ms</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground border-b border-border/50 pb-2">Decoded Payload</h4>
                  <div className="p-4 bg-black/50 rounded-xl border border-border/50 font-mono text-xs break-all leading-relaxed max-h-[200px] overflow-auto">
                    {selectedRequest.payload}
                  </div>
                </div>

                <div className="pt-8 flex gap-3">
                  <Button className="flex-1 bg-destructive hover:bg-destructive/90 font-bold uppercase text-xs rounded-full">
                    Blacklist IP
                  </Button>
                  <Button variant="outline" className="flex-1 border-border font-bold uppercase text-xs rounded-full">
                    Export PCAP
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
