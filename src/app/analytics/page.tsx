"use client";

import { useState, useEffect, useMemo, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip as ReTooltip 
} from 'recharts';
import { Shield, ShieldAlert, Zap, ArrowUpRight, Download, Loader2, Globe } from 'lucide-react';
import { getSeededData, FAKE_IPS, IP_TO_COUNTRY } from '@/lib/mock-data';
import { cn } from '@/lib/utils';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

// Approx coordinates for fake countries
const COUNTRY_COORDS: Record<string, { x: number, y: number }> = {
  'US': { x: 150, y: 130 }, 'UK': { x: 380, y: 100 }, 'DE': { x: 410, y: 110 },
  'FR': { x: 395, y: 125 }, 'RU': { x: 550, y: 100 }, 'BR': { x: 250, y: 280 },
  'CN': { x: 650, y: 160 }, 'IE': { x: 370, y: 105 }, 'SG': { x: 670, y: 250 },
  'NL': { x: 405, y: 105 }, 'JP': { x: 730, y: 155 }, 'AU': { x: 720, y: 320 }
};

export default function AnalyticsPage() {
  const [data, setData] = useState<any[]>([]);
  const [dateRange, setDateRange] = useState('24H');
  const [isExporting, setIsExporting] = useState(false);
  const [activeDots, setActiveDots] = useState<any[]>([]);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setData(getSeededData());
  }, []);

  // Simulate incoming blocked events for map
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        const ip = FAKE_IPS[Math.floor(Math.random() * FAKE_IPS.length)];
        const country = IP_TO_COUNTRY[ip];
        const coords = COUNTRY_COORDS[country] || { x: 400, y: 200 };
        const newDot = { id: Math.random(), ...coords };
        setActiveDots(prev => [newDot, ...prev].slice(0, 10));
        setTimeout(() => setActiveDots(prev => prev.filter(d => d.id !== newDot.id)), 5000);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const filteredData = useMemo(() => {
    const now = Date.now();
    const ranges: Record<string, number> = { '1H': 60 * 60 * 1000, '6H': 6 * 60 * 60 * 1000, '24H': 24 * 60 * 60 * 1000, 'ALL': Infinity };
    const limit = ranges[dateRange];
    return data.filter(r => now - new Date(r.timestamp).getTime() <= limit);
  }, [data, dateRange]);

  const stats = useMemo(() => {
    if (filteredData.length === 0) return { total: 0, blocked: 0, rate: 0, avgLat: 0, score: 0 };
    const blocked = filteredData.filter(r => r.decision === 'BLOCKED').length;
    const totalLat = filteredData.reduce((acc, r) => acc + r.inferenceTime, 0);
    const totalScore = filteredData.reduce((acc, r) => acc + r.score, 0);
    return { total: filteredData.length, blocked, rate: Math.round((blocked / filteredData.length) * 100), avgLat: parseFloat((totalLat / filteredData.length).toFixed(1)), score: Math.round((totalScore / filteredData.length) * 100) };
  }, [filteredData]);

  const trafficBreakdown = [
    { name: 'Safe', value: filteredData.filter(r => r.decision === 'SAFE').length, color: '#10b981' },
    { name: 'Blocked', value: filteredData.filter(r => r.decision === 'BLOCKED').length, color: '#ef4444' },
    { name: 'Suspicious', value: filteredData.filter(r => r.decision === 'SUSPICIOUS').length, color: '#f59e0b' }
  ];

  const handleExport = async () => {
    if (!reportRef.current) return;
    setIsExporting(true);
    try {
      const canvas = await html2canvas(reportRef.current, { backgroundColor: '#0f1117' });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`fusionx-waf-report-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (err) { console.error(err); } finally { setIsExporting(false); }
  };

  return (
    <div className="container mx-auto py-10 px-6 max-w-7xl space-y-10 animate-in fade-in duration-500" ref={reportRef}>
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-extrabold tracking-tight">Security Analytics</h1>
          <p className="text-muted-foreground">Comprehensive behavioral analysis and threat intelligence.</p>
        </div>
        <div className="flex items-center gap-2 bg-secondary/30 p-1.5 rounded-full border border-border/50">
          {['1H', '6H', '24H', 'ALL'].map(range => (
            <button key={range} onClick={() => setDateRange(range)} className={cn("px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all", dateRange === range ? "bg-destructive text-white shadow-lg" : "text-muted-foreground hover:text-foreground")}>
              {range}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Detection Rate', value: `${stats.rate}%`, icon: Shield, color: 'text-destructive', desc: 'Attack vs Safe traffic' },
          { label: 'Avg Latency', value: `${stats.avgLat}ms`, icon: Zap, color: 'text-accent', desc: 'Sub-packet inference' },
          { label: 'Total Threats', value: stats.blocked, icon: ShieldAlert, color: 'text-destructive', desc: 'Blocked malicious payloads' },
          { label: 'Conf. Score', value: `${stats.score}%`, icon: ArrowUpRight, color: 'text-emerald-500', desc: 'Model certainty average' }
        ].map((kpi, i) => (
          <Card key={i} className="border-border/50 bg-card backdrop-blur-sm overflow-hidden group">
            <CardContent className="p-6 flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{kpi.label}</p>
                <p className="text-3xl font-extrabold tracking-tighter">{kpi.value}</p>
                <p className="text-[10px] text-muted-foreground mt-1">{kpi.desc}</p>
              </div>
              <div className={`p-3 bg-secondary/50 rounded-xl group-hover:scale-110 transition-transform ${kpi.color}`}>
                <kpi.icon className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-border/50 bg-card overflow-hidden relative">
          <CardHeader>
            <CardTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-2"><Globe className="h-4 w-4 text-destructive" /> Live Threat Map</CardTitle>
          </CardHeader>
          <CardContent className="h-[400px] flex items-center justify-center p-0">
            <svg viewBox="0 0 800 400" className="w-full h-full opacity-60">
              <path d="M150,130 L160,135 L170,120 Z M380,100 L390,110 L370,115 Z M250,280 L260,290 L240,295 Z M650,160 L660,170 L640,175 Z" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-muted-foreground/30" />
              {/* Simplified world map outline */}
              <rect x="0" y="0" width="800" height="400" fill="transparent" />
              {activeDots.map(dot => (
                <g key={dot.id}>
                  <circle cx={dot.x} cy={dot.y} r="6" fill="red" className="animate-ping-red" />
                  <circle cx={dot.x} cy={dot.y} r="3" fill="red" />
                </g>
              ))}
            </svg>
            <div className="absolute bottom-4 left-4 p-3 bg-black/40 backdrop-blur-md rounded-lg border border-border/50 text-[10px] font-mono text-muted-foreground uppercase">
              Intercepted Edge Ingress: Active
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card">
          <CardHeader>
            <CardTitle className="text-sm font-bold uppercase tracking-widest">Traffic Classification</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={trafficBreakdown} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {trafficBreakdown.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <ReTooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="pt-4">
        <Button className="w-full bg-destructive hover:bg-destructive/90 text-white font-bold h-12 uppercase tracking-widest" onClick={handleExport} disabled={isExporting}>
          {isExporting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Download className="h-4 w-4 mr-2" />}
          Export Compliance Report (PDF)
        </Button>
      </div>
    </div>
  );
}