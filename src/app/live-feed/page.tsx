"use client";

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Play, Pause, Activity, ShieldAlert, ShieldCheck, AlertTriangle, Clock } from 'lucide-react';
import { generateFakeRequest } from '@/lib/mock-data';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function LiveFeedPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [isPaused, setIsPaused] = useState(false);
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

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isPaused) {
        const newReq = generateFakeRequest();
        
        // Stats update
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

        // Feed update
        setRequests(prev => [newReq, ...prev].slice(0, 100));

        // Toast for blocked events
        if (newReq.decision === 'BLOCKED') {
          toast({
            title: "THREAT BLOCKED",
            description: `${newReq.attackType} detected from ${newReq.ip}`,
            variant: "destructive"
          });
        }
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [isPaused, toast]);

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
      {/* Stat Bar */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center space-y-1">
            <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Total Requests</span>
            <span className="text-2xl font-bold">{stats.total}</span>
          </CardContent>
        </Card>
        <Card className="bg-card border-destructive/20 border">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center space-y-1">
            <span className="text-xs uppercase tracking-wider text-destructive font-semibold">Blocked</span>
            <span className="text-2xl font-bold text-destructive">{stats.blocked}</span>
          </CardContent>
        </Card>
        <Card className="bg-card border-emerald-500/20 border">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center space-y-1">
            <span className="text-xs uppercase tracking-wider text-emerald-500 font-semibold">Safe</span>
            <span className="text-2xl font-bold text-emerald-500">{stats.safe}</span>
          </CardContent>
        </Card>
        <Card className="bg-card border-amber-500/20 border">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center space-y-1">
            <span className="text-xs uppercase tracking-wider text-amber-500 font-semibold">Suspicious</span>
            <span className="text-2xl font-bold text-amber-500">{stats.suspicious}</span>
          </CardContent>
        </Card>
        <Card className="bg-card border-border col-span-2 md:col-span-1">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center space-y-1">
            <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Avg Latency</span>
            <span className="text-2xl font-bold font-mono">{stats.avgInference}ms</span>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border bg-card shadow-xl flex flex-col min-h-[600px]">
        <div className="p-4 border-b flex items-center justify-between bg-secondary/30">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-accent animate-pulse" />
            <h2 className="font-bold">Real-time Traffic Stream</h2>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIsPaused(!isPaused)}
            className={cn(isPaused ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "")}
          >
            {isPaused ? <Play className="h-4 w-4 mr-2" /> : <Pause className="h-4 w-4 mr-2" />}
            {isPaused ? "Resume Feed" : "Pause Feed"}
          </Button>
        </div>
        <div className="flex-1 overflow-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-card z-10 shadow-sm">
              <TableRow className="border-b border-border/50 hover:bg-transparent">
                <TableHead className="w-[100px]">Timestamp</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>Endpoint</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Attack Type</TableHead>
                <TableHead className="text-right">Score</TableHead>
                <TableHead className="text-center">Decision</TableHead>
                <TableHead className="text-right">Lat</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-96 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center space-y-4">
                      <Clock className="h-12 w-12 opacity-20" />
                      <p>Waiting for incoming traffic...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                requests.map((req) => (
                  <TableRow 
                    key={req.id} 
                    className={cn(
                      "transition-colors animate-slide-down border-b border-border/30",
                      getDecisionStyles(req.decision)
                    )}
                  >
                    <TableCell className="font-mono text-xs">{formatTime(req.timestamp)}</TableCell>
                    <TableCell className="font-medium">{req.ip}</TableCell>
                    <TableCell className="text-xs font-mono">{req.endpoint}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px] font-bold">{req.method}</Badge>
                    </TableCell>
                    <TableCell>
                      <span className={cn(
                        "text-xs font-semibold",
                        req.decision === 'BLOCKED' ? "text-destructive" : 
                        req.decision === 'SUSPICIOUS' ? "text-amber-500" : "text-muted-foreground"
                      )}>
                        {req.attackType}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs">{Math.round(req.score * 100)}%</TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center">
                        {req.decision === 'BLOCKED' ? <ShieldAlert className="h-4 w-4 text-destructive" /> : 
                         req.decision === 'SAFE' ? <ShieldCheck className="h-4 w-4 text-emerald-500" /> : 
                         <AlertTriangle className="h-4 w-4 text-amber-500" />}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs">{req.inferenceTime}ms</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}