"use client";

import { useState, useEffect, useMemo, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { Shield, ShieldAlert, Zap, Users, ArrowUpRight, BarChart3, Download, Calendar, Loader2 } from 'lucide-react';
import { generateFakeRequest, FAKE_IPS, ATTACK_TYPES, getSeededData } from '@/lib/mock-data';
import { cn } from '@/lib/utils';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export default function AnalyticsPage() {
  const [data, setData] = useState<any[]>([]);
  const [dateRange, setDateRange] = useState('24H');
  const [isExporting, setIsExporting] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setData(getSeededData());
  }, []);

  const filteredData = useMemo(() => {
    const now = Date.now();
    const ranges: Record<string, number> = {
      '1H': 60 * 60 * 1000,
      '6H': 6 * 60 * 60 * 1000,
      '24H': 24 * 60 * 60 * 1000,
      'ALL': Infinity
    };
    const limit = ranges[dateRange];
    return data.filter(r => now - new Date(r.timestamp).getTime() <= limit);
  }, [data, dateRange]);

  const stats = useMemo(() => {
    if (filteredData.length === 0) return { total: 0, blocked: 0, rate: 0, avgLat: 0, score: 0 };
    const blocked = filteredData.filter(r => r.decision === 'BLOCKED').length;
    const totalLat = filteredData.reduce((acc, r) => acc + r.inferenceTime, 0);
    const totalScore = filteredData.reduce((acc, r) => acc + r.score, 0);
    return {
      total: filteredData.length,
      blocked,
      rate: Math.round((blocked / filteredData.length) * 100),
      avgLat: parseFloat((totalLat / filteredData.length).toFixed(1)),
      score: Math.round((totalScore / filteredData.length) * 100)
    };
  }, [filteredData]);

  const trafficBreakdown = useMemo(() => [
    { name: 'Safe', value: filteredData.filter(r => r.decision === 'SAFE').length, color: '#10b981' },
    { name: 'Blocked', value: filteredData.filter(r => r.decision === 'BLOCKED').length, color: '#ef4444' },
    { name: 'Suspicious', value: filteredData.filter(r => r.decision === 'SUSPICIOUS').length, color: '#f59e0b' }
  ], [filteredData]);

  const attackDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    ATTACK_TYPES.forEach(t => counts[t] = 0);
    filteredData.filter(r => r.decision === 'BLOCKED').forEach(r => {
      counts[r.attackType] = (counts[r.attackType] || 0) + 1;
    });
    return Object.entries(counts).map(([name, count]) => ({ name, count }));
  }, [filteredData]);

  const heatmapData = useMemo(() => {
    const matrix = Array.from({ length: 7 }, (_, day) => 
      Array.from({ length: 24 }, (_, hour) => ({ day, hour, count: 0 }))
    );
    filteredData.filter(r => r.decision === 'BLOCKED').forEach(r => {
      const d = new Date(r.timestamp);
      matrix[d.getDay()][d.getHours()].count++;
    });
    return matrix.flat();
  }, [filteredData]);

  const topIps = useMemo(() => {
    const ipStats: Record<string, any> = {};
    filteredData.forEach(r => {
      if (!ipStats[r.ip]) ipStats[r.ip] = { ip: r.ip, total: 0, blocked: 0, type: r.attackType };
      ipStats[r.ip].total++;
      if (r.decision === 'BLOCKED') ipStats[r.ip].blocked++;
    });
    return Object.values(ipStats).sort((a, b) => b.blocked - a.blocked).slice(0, 5);
  }, [filteredData]);

  const handleExport = async () => {
    if (!reportRef.current) return;
    setIsExporting(true);
    try {
      const canvas = await html2canvas(reportRef.current, { backgroundColor: '#0f1117' });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`fusionx-waf-report-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (err) {
      console.error(err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="container mx-auto py-10 px-6 max-w-7xl space-y-10 animate-in fade-in duration-500" ref={reportRef}>
      <div className="flex flex-col md:row items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-extrabold tracking-tight">Security Analytics</h1>
          <p className="text-muted-foreground">Comprehensive behavioral analysis and threat intelligence.</p>
        </div>
        <div className="flex items-center gap-4 bg-secondary/30 p-1.5 rounded-full border border-border/50">
          {['1H', '6H', '24H', 'ALL'].map(range => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              className={cn(
                "px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all",
                dateRange === range ? "bg-destructive text-white shadow-lg shadow-destructive/20" : "text-muted-foreground hover:text-white"
              )}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Detection Rate', value: `${stats.rate}%`, icon: Shield, color: 'text-destructive', desc: 'Attack vs Safe traffic' },
          { label: 'Avg Latency', value: `${stats.avgLat}ms`, icon: Zap, color: 'text-accent', desc: 'Sub-packet inference' },
          { label: 'Total Threats', value: stats.blocked, icon: ShieldAlert, color: 'text-destructive', desc: 'Blocked malicious payloads' },
          { label: 'Conf. Score', value: `${stats.score}%`, icon: ArrowUpRight, color: 'text-emerald-500', desc: 'Model certainty average' }
        ].map((kpi, i) => (
          <Card key={i} className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden group">
            <CardContent className="p-8 flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{kpi.label}</p>
                <p className="text-4xl font-extrabold tracking-tighter">{kpi.value}</p>
                <p className="text-[10px] text-muted-foreground mt-2">{kpi.desc}</p>
              </div>
              <div className={`p-4 bg-secondary/50 rounded-2xl group-hover:scale-110 transition-transform ${kpi.color}`}>
                <kpi.icon className="h-7 w-7" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Traffic breakdown */}
        <Card className="border-border/50 bg-card">
          <CardHeader>
            <CardTitle className="text-lg font-bold uppercase tracking-widest">Traffic Classification</CardTitle>
            <CardDescription>Semantic distribution of all ingress requests</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={trafficBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  animationDuration={1500}
                >
                  {trafficBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a1d2e', border: 'none', borderRadius: '12px', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Attack type bar */}
        <Card className="border-border/50 bg-card">
          <CardHeader>
            <CardTitle className="text-lg font-bold uppercase tracking-widest">Threat Vector Distribution</CardTitle>
            <CardDescription>Breakdown by semantic attack category</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attackDistribution} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#2a2d3e" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={10} width={100} axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ backgroundColor: '#1a1d2e', border: 'none', borderRadius: '12px' }}
                />
                <Bar dataKey="count" fill="#ef4444" radius={[0, 4, 4, 0]} barSize={20} animationDuration={1500} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Heatmap Section */}
      <Card className="border-border/50 bg-card">
        <CardHeader>
          <CardTitle className="text-lg font-bold uppercase tracking-widest">Attack Activity Heatmap</CardTitle>
          <CardDescription>Temporal intensity of blocked requests across 24h/7d cycle</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-[auto_1fr] gap-4">
            <div className="flex flex-col justify-between py-2 text-[10px] font-bold text-muted-foreground uppercase h-[200px]">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <span key={d}>{d}</span>)}
            </div>
            <div className="grid grid-cols-24 gap-1 h-[200px]">
              {heatmapData.map((cell, i) => {
                const intensity = Math.min(cell.count * 20, 100);
                return (
                  <div 
                    key={i} 
                    className="w-full rounded-sm transition-all hover:ring-2 hover:ring-white/20 cursor-help"
                    style={{ backgroundColor: cell.count === 0 ? 'rgba(255,255,255,0.05)' : `rgba(239, 68, 68, ${intensity/100})` }}
                    title={`${cell.count} blocks at Hour ${cell.hour}`}
                  />
                )
              })}
            </div>
          </div>
          <div className="flex justify-between mt-4 text-[10px] font-mono text-muted-foreground px-12 uppercase tracking-widest">
            <span>00:00</span>
            <span>06:00</span>
            <span>12:00</span>
            <span>18:00</span>
            <span>23:00</span>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Top Attacker IPs */}
        <Card className="lg:col-span-2 border-border/50 bg-card">
          <CardHeader>
            <CardTitle className="text-lg font-bold uppercase tracking-widest">High Risk Sources</CardTitle>
            <CardDescription>Top sources of verified malicious payloads</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-border/30">
                  <TableHead className="uppercase text-[10px] font-bold">IP Source</TableHead>
                  <TableHead className="text-right uppercase text-[10px] font-bold">Total</TableHead>
                  <TableHead className="text-right uppercase text-[10px] font-bold">Blocked</TableHead>
                  <TableHead className="uppercase text-[10px] font-bold">Primary Vector</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topIps.map((ip, i) => (
                  <TableRow key={i} className="border-border/20">
                    <TableCell className="font-mono text-sm font-bold text-accent">{ip.ip}</TableCell>
                    <TableCell className="text-right font-mono text-sm">{ip.total}</TableCell>
                    <TableCell className="text-right font-mono text-sm font-extrabold text-destructive">{ip.blocked}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-[9px] font-bold uppercase tracking-tighter bg-destructive/10 text-destructive border-destructive/20">
                        {ip.type}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Intelligence Card */}
        <Card className="border-border/50 bg-destructive/5 flex flex-col items-center justify-center text-center p-8 space-y-6">
          <div className="p-6 rounded-full bg-destructive/10 border border-destructive/20 text-destructive">
            <ShieldAlert className="h-12 w-12" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-extrabold tracking-tight">System Status: ALERT</h3>
            <p className="text-xs text-muted-foreground leading-relaxed uppercase tracking-widest">
              Peak attack activity detected on Tuesday between 14:00 - 16:00 UTC. Recommended firewall policy update.
            </p>
          </div>
          <Button 
            className="w-full bg-destructive hover:bg-destructive/90 text-white font-bold h-12 uppercase tracking-widest"
            onClick={handleExport}
            disabled={isExporting}
          >
            {isExporting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Download className="h-4 w-4 mr-2" />}
            Export Full Report (PDF)
          </Button>
        </Card>
      </div>
    </div>
  );
}
