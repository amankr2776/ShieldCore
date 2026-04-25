"use client";

import { useState, useEffect, useMemo, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip as ReTooltip,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Area, AreaChart
} from 'recharts';
import { Shield, ShieldAlert, Zap, ArrowUpRight, Download, Loader2, Globe, Flame } from 'lucide-react';
import { getSeededData, FAKE_IPS, IP_TO_COUNTRY } from '@/lib/mock-data';
import { cn } from '@/lib/utils';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const COUNTRY_COORDS: Record<string, { x: number, y: number }> = {
  'US': { x: 200, y: 140 }, 'UK': { x: 470, y: 110 }, 'Russia': { x: 580, y: 90 },
  'China': { x: 720, y: 140 }, 'India': { x: 650, y: 170 }, 'Brazil': { x: 260, y: 240 },
  'Germany': { x: 490, y: 110 }, 'France': { x: 475, y: 120 }, 'Japan': { x: 760, y: 140 },
  'Australia': { x: 740, y: 260 }
};

// Simplified World Map Path Data
const WORLD_MAP_PATH = "M110,130 L130,120 L150,140 L170,120 L190,140 L210,130 L230,150 L250,140 L240,160 L220,170 L200,160 L180,180 L160,170 L140,190 L120,180 L100,200 L80,190 Z M460,90 L480,80 L500,100 L520,90 L540,110 L560,100 L580,120 L600,110 L620,130 L640,120 L660,140 L680,130 L700,150 L720,140 L740,160 L760,150 L780,170 L800,160 L800,300 L780,310 L760,290 L740,300 L720,280 L700,290 L680,270 L660,280 L640,260 L620,270 L600,250 L580,260 L560,240 L540,250 L520,230 L500,240 L480,220 L460,230 L440,210 L420,220 L400,200 L380,210 L360,190 L340,200 L320,180 L300,190 L280,170 L260,180 L240,160 L220,170 L200,150 L180,160 L160,140 L140,150 L120,130 L100,140 Z";

export default function AnalyticsPage() {
  const [data, setData] = useState<any[]>([]);
  const [dateRange, setDateRange] = useState('24H');
  const [isExporting, setIsExporting] = useState(false);
  const [activeDots, setActiveDots] = useState<any[]>([]);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const seeded = getSeededData();
    setData(seeded);
    
    // Initial demo dots
    const demoDots = [
      { id: 'd1', ...COUNTRY_COORDS['US'] },
      { id: 'd2', ...COUNTRY_COORDS['China'] },
      { id: 'd3', ...COUNTRY_COORDS['Brazil'] }
    ];
    setActiveDots(demoDots);
    setTimeout(() => setActiveDots([]), 5000);
  }, []);

  // Simulate incoming blocked events for map and trends
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.6) {
        const countries = Object.keys(COUNTRY_COORDS);
        const country = countries[Math.floor(Math.random() * countries.length)];
        const coords = COUNTRY_COORDS[country];
        const newDot = { id: Math.random().toString(), ...coords };
        
        setActiveDots(prev => [...prev, newDot].slice(-15));
        setTimeout(() => setActiveDots(prev => prev.filter(d => d.id !== newDot.id)), 5000);
        
        // Update trend data
        setData(prev => {
          const newEvent = {
            timestamp: new Date().toISOString(),
            decision: Math.random() > 0.3 ? 'BLOCKED' : 'SAFE',
            score: Math.random(),
            inferenceTime: Math.floor(Math.random() * 10) + 5
          };
          return [newEvent, ...prev];
        });
      }
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const stats = useMemo(() => {
    if (data.length === 0) return { total: 0, blocked: 0, safe: 0, suspicious: 0, rate: 0, avgLat: 0 };
    const blocked = data.filter(r => r.decision === 'BLOCKED').length;
    const safe = data.filter(r => r.decision === 'SAFE').length;
    const suspicious = data.filter(r => r.decision === 'SUSPICIOUS').length;
    const totalLat = data.reduce((acc, r) => acc + (r.inferenceTime || 0), 0);
    return { total: data.length, blocked, safe, suspicious, rate: Math.round((blocked / data.length) * 100), avgLat: parseFloat((totalLat / data.length).toFixed(1)) };
  }, [data]);

  const trafficBreakdown = [
    { name: 'Safe', value: stats.safe, color: '#22c55e' },
    { name: 'Blocked', value: stats.blocked, color: '#ef4444' },
    { name: 'Suspicious', value: stats.suspicious, color: '#f59e0b' }
  ];

  const trendData = useMemo(() => {
    const now = new Date();
    const minutes = Array.from({ length: 60 }, (_, i) => {
      const time = new Date(now.getTime() - (59 - i) * 60000);
      return {
        time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
        count: data.filter(r => {
          const d = new Date(r.timestamp);
          return d.getMinutes() === time.getMinutes() && d.getHours() === time.getHours() && r.decision === 'BLOCKED';
        }).length
      };
    });
    return minutes;
  }, [data]);

  const handleExport = async () => {
    if (!reportRef.current) return;
    setIsExporting(true);
    try {
      const canvas = await html2canvas(reportRef.current, { backgroundColor: '#0f1117', scale: 2 });
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
          <h1 className="text-4xl font-extrabold tracking-tight">Security Intelligence</h1>
          <p className="text-muted-foreground">Comprehensive behavioral analysis and global threat telemetry.</p>
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
          { label: 'Detection Rate', value: `${stats.rate}%`, icon: Shield, color: 'text-destructive', desc: 'Attack vs Safe ratio' },
          { label: 'False Positives', value: '2.3%', icon: ShieldAlert, color: 'text-amber-500', desc: 'Verified analyst feedback' },
          { label: 'Avg Latency', value: `${stats.avgLat}ms`, icon: Zap, color: 'text-accent', desc: 'Model inference speed' },
          { label: 'Peak Hour', value: '14:00', icon: Flame, color: 'text-destructive', desc: 'Highest attack volume' }
        ].map((kpi, i) => (
          <Card key={i} className="border-border/50 bg-card/50 backdrop-blur-sm group">
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
        <Card className="lg:col-span-2 border-border/50 bg-card overflow-hidden relative min-h-[450px]">
          <CardHeader>
            <CardTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-2"><Globe className="h-4 w-4 text-destructive" /> Live Global Threat Map</CardTitle>
            <CardDescription className="text-xs">Real-time geographic distribution of blocked ingress.</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px] flex items-center justify-center p-0">
            <svg viewBox="0 0 800 400" className="w-full h-full">
              <path d={WORLD_MAP_PATH} fill="#1a1d2e" stroke="#2a2d3e" strokeWidth="1" />
              {activeDots.map(dot => (
                <g key={dot.id}>
                  <circle cx={dot.x} cy={dot.y} r="8" fill="#ef4444" className="animate-pulse-dot" />
                  <circle cx={dot.x} cy={dot.y} r="4" fill="#ef4444" />
                </g>
              ))}
            </svg>
            <div className="absolute bottom-4 left-4 p-3 bg-black/60 backdrop-blur-md rounded-lg border border-border/50 text-[10px] font-mono text-muted-foreground">
              EDGE INGRESS: MONITORING ACTIVE
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card flex flex-col">
          <CardHeader>
            <CardTitle className="text-sm font-bold uppercase tracking-widest">Traffic Breakdown</CardTitle>
            <CardDescription className="text-xs">Distribution of ingress classifications.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 min-h-[300px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={trafficBreakdown} cx="50%" cy="50%" innerRadius={70} outerRadius={90} paddingAngle={8} dataKey="value">
                  {trafficBreakdown.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <ReTooltip contentStyle={{ backgroundColor: '#1a1d2e', border: '1px solid #2a2d3e', borderRadius: '8px' }} itemStyle={{ color: '#94a3b8' }} />
                <Legend verticalAlign="bottom" height={36} wrapperStyle={{ color: '#94a3b8', fontSize: '10px', textTransform: 'uppercase', fontWeight: 'bold' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
              <p className="text-2xl font-black">{stats.total}</p>
              <p className="text-[8px] font-bold text-muted-foreground uppercase">Requests</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/50 bg-card overflow-hidden">
        <CardHeader>
          <CardTitle className="text-sm font-bold uppercase tracking-widest">Blocked Requests Over Time</CardTitle>
          <CardDescription className="text-xs">Real-time attack frequency trend (per minute).</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2d3e" vertical={false} />
              <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
              <ReTooltip contentStyle={{ backgroundColor: '#1a1d2e', border: '1px solid #2a2d3e', borderRadius: '8px' }} />
              <Area type="monotone" dataKey="count" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" tension={0.4} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="pt-4 pb-10">
        <Button className="w-full bg-destructive hover:bg-destructive/90 text-white font-bold h-14 uppercase tracking-widest text-sm rounded-xl" onClick={handleExport} disabled={isExporting}>
          {isExporting ? <Loader2 className="h-5 w-5 animate-spin mr-3" /> : <Download className="h-5 w-5 mr-3" />}
          Generate Compliance Intelligence Report (PDF)
        </Button>
      </div>
    </div>
  );
}
