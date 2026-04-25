
"use client";

import { useState, useEffect, useMemo, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip as ReTooltip,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Area, AreaChart,
  RadarChart, PolarGrid, PolarAngleAxis, Radar, BarChart, Bar
} from 'recharts';
import { 
  Shield, ShieldAlert, Zap, ArrowUpRight, Download, Loader2, 
  Globe, Flame, Activity, Clock, TrendingUp, AlertTriangle, Fingerprint,
  Map as MapIcon, Database, Terminal
} from 'lucide-react';
import { getSeededData, IP_TO_COUNTRY } from '@/lib/mock-data';
import { cn } from '@/lib/utils';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const COUNTRY_COORDS: Record<string, { x: number, y: number }> = {
  'US': { x: 200, y: 140 }, 'UK': { x: 470, y: 110 }, 'Russia': { x: 580, y: 90 },
  'China': { x: 720, y: 140 }, 'India': { x: 650, y: 170 }, 'Brazil': { x: 260, y: 240 },
  'Germany': { x: 490, y: 110 }, 'France': { x: 475, y: 120 }, 'Japan': { x: 760, y: 140 },
  'Australia': { x: 740, y: 260 }
};

const WORLD_MAP_PATH = "M110,130 L130,120 L150,140 L170,120 L190,140 L210,130 L230,150 L250,140 L240,160 L220,170 L200,160 L180,180 L160,170 L140,190 L120,180 L100,200 L80,190 Z M460,90 L480,80 L500,100 L520,90 L540,110 L560,100 L580,120 L600,110 L620,130 L640,120 L660,140 L680,130 L700,150 L720,140 L740,160 L760,150 L780,170 L800,160 L800,300 L780,310 L760,290 L740,300 L720,280 L700,290 L680,270 L660,280 L640,260 L620,270 L600,250 L580,260 L560,240 L540,250 L520,230 L500,240 L480,220 L460,230 L440,210 L420,220 L400,200 L380,210 L360,190 L340,200 L320,180 L300,190 L280,170 L260,180 L240,160 L220,170 L200,150 L180,160 L160,140 L140,150 L120,130 L100,140 Z";

export default function AnalyticsPage() {
  const [data, setData] = useState<any[]>([]);
  const [dateRange, setDateRange] = useState('24H');
  const [isExporting, setIsExporting] = useState(false);
  const [activeDots, setActiveDots] = useState<any[]>([]);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setData(getSeededData());
    setActiveDots([{ id: 'd1', ...COUNTRY_COORDS['US'] }, { id: 'd2', ...COUNTRY_COORDS['China'] }]);
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

  const radarData = [
    { subject: 'SQLi', A: 85, B: 20 },
    { subject: 'XSS', A: 70, B: 40 },
    { subject: 'Traversal', A: 90, B: 15 },
    { subject: 'Command', A: 65, B: 30 },
    { subject: 'SSRF', A: 80, B: 25 },
    { subject: 'Overflow', A: 75, B: 20 },
  ];

  const heatmapData = useMemo(() => {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return { days, hours };
  }, []);

  const topIps = [
    { ip: '192.168.1.1', country: 'US', total: 450, blocked: 42, type: 'SQLi' },
    { ip: '8.8.8.8', country: 'US', total: 380, blocked: 5, type: 'XSS' },
    { ip: '212.58.244.70', country: 'UK', total: 310, blocked: 28, type: 'Traversal' },
    { ip: '201.12.33.44', country: 'BR', total: 290, blocked: 12, type: 'SSRF' },
    { ip: '1.1.1.1', country: 'AU', total: 250, blocked: 2, type: 'Safe' },
  ];

  const handleExport = async () => {
    if (!reportRef.current) return;
    setIsExporting(true);
    try {
      const canvas = await html2canvas(reportRef.current, { backgroundColor: '#020408', scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`fusionx-soc-report-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (err) { console.error(err); } finally { setIsExporting(false); }
  };

  return (
    <div className="container mx-auto py-12 px-6 max-w-7xl space-y-12 dashboard-cursor animate-in fade-in duration-1000" ref={reportRef}>
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-destructive font-mono text-[9px] tracking-[0.4em] uppercase animate-pulse">
            <Activity className="h-3 w-3" /> SOC Operational Console
          </div>
          <h1 className="text-5xl font-black tracking-tighter">THREAT <span className="text-destructive">INTELLIGENCE</span></h1>
          <p className="text-muted-foreground font-medium text-lg italic opacity-70">Behavioral risk assessment and global signal mapping.</p>
        </div>
        <div className="flex items-center gap-2 bg-white/5 p-1.5 rounded-2xl border border-white/5 backdrop-blur-xl">
          {['1H', '6H', '24H', 'ALL'].map(range => (
            <button key={range} onClick={() => setDateRange(range)} className={cn("px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", dateRange === range ? "bg-destructive text-white shadow-lg" : "text-muted-foreground hover:text-white")}>
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Top Row: KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {[
          { label: 'Ingress Node', value: stats.total, icon: Activity, trend: '+12.4%', color: 'text-white' },
          { label: 'Blocked Ingress', value: stats.blocked, icon: ShieldAlert, trend: '+2.1%', color: 'text-destructive' },
          { label: 'FP Ratio', value: '2.3%', icon: AlertTriangle, trend: '-0.4%', color: 'text-amber-500' },
          { label: 'Latency (Avg)', value: `${stats.avgLat}ms`, icon: Zap, trend: '-1.2ms', color: 'text-emerald-500' },
          { label: 'Peak Hour', value: '14:00', icon: Clock, trend: 'STATIC', color: 'text-white' },
        ].map((kpi, i) => (
          <Card key={i} className="glass-card rounded-3xl p-6 group">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div className={`p-2 rounded-xl bg-white/5 border border-white/5 ${kpi.color}`}>
                  <kpi.icon className="h-4 w-4" />
                </div>
                <div className="text-[10px] font-bold text-emerald-500">{kpi.trend}</div>
              </div>
              <div className="space-y-1">
                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-40">{kpi.label}</p>
                <p className={cn("text-2xl font-black tracking-tighter", kpi.color)}>{kpi.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Second Row: Map */}
      <div className="section-label">Global Signal Mapping</div>
      <Card className="glass-card rounded-[2rem] overflow-hidden relative min-h-[500px]">
        <div className="absolute top-8 left-10 z-20 space-y-2">
           <h3 className="text-xl font-black tracking-tighter text-white uppercase">Live Threat Vector Map</h3>
           <p className="text-[10px] font-mono text-muted-foreground opacity-50 uppercase tracking-widest">Active Ingress Monitoring</p>
        </div>
        <CardContent className="h-[450px] flex items-center justify-center p-0">
          <svg viewBox="0 0 800 400" className="w-full h-full opacity-60">
            <path d={WORLD_MAP_PATH} fill="#0d101a" stroke="#2a2d3e" strokeWidth="1" />
            {activeDots.map(dot => (
              <g key={dot.id}>
                <circle cx={dot.x} cy={dot.y} r="12" fill="#ef4444" className="animate-pulse" opacity="0.2" />
                <circle cx={dot.x} cy={dot.y} r="4" fill="#ef4444" />
              </g>
            ))}
          </svg>
          <div className="absolute bottom-8 right-10 flex gap-4">
             <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-4 py-2 rounded-xl border border-white/5 text-[9px] font-mono font-black text-muted-foreground">
               <div className="h-1.5 w-1.5 rounded-full bg-destructive" /> ATTACK DETECTED
             </div>
             <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-4 py-2 rounded-xl border border-white/5 text-[9px] font-mono font-black text-muted-foreground">
               <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> NODE SECURE
             </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Third Row: Charts */}
        <div className="space-y-6">
           <div className="section-label">Ingress Distribution</div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="glass-card p-6 rounded-3xl h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={trafficBreakdown} innerRadius={60} outerRadius={80} paddingAngle={8} dataKey="value">
                      {trafficBreakdown.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                    </Pie>
                    <ReTooltip contentStyle={{ background: '#0a0c14', border: '1px solid #2a2d3e', borderRadius: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
              <Card className="glass-card p-6 rounded-3xl h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#2a2d3e" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 700 }} />
                    <Radar dataKey="A" stroke="#ef4444" fill="#ef4444" fillOpacity={0.5} />
                  </RadarChart>
                </ResponsiveContainer>
              </Card>
           </div>
        </div>

        {/* Top Attackers */}
        <div className="space-y-6">
          <div className="section-label">Top Threat Origins</div>
          <div className="glass-card rounded-3xl overflow-hidden h-[350px]">
             <table className="w-full text-left">
                <thead className="bg-white/[0.02] border-b border-white/5">
                   <tr className="text-[9px] uppercase font-black text-muted-foreground">
                     <th className="px-6 py-4">Origin Node</th>
                     <th className="px-6 py-4">Blocked</th>
                     <th className="px-6 py-4 text-right">Primary Vector</th>
                   </tr>
                </thead>
                <tbody className="text-[11px] font-medium">
                  {topIps.map((row, i) => (
                    <tr key={i} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4">
                         <div className="flex items-center gap-2 font-mono">
                           <span>[{row.country}]</span>
                           <span className="text-white">{row.ip}</span>
                         </div>
                      </td>
                      <td className="px-6 py-4 font-black text-destructive">{row.blocked}</td>
                      <td className="px-6 py-4 text-right"><Badge variant="outline" className="text-[8px] font-black">{row.type}</Badge></td>
                    </tr>
                  ))}
                </tbody>
             </table>
          </div>
        </div>
      </div>

      {/* Fourth Row: Timeline */}
      <div className="section-label">Temporal Threat Frequency</div>
      <Card className="glass-card rounded-[2rem] p-10 h-[400px]">
         <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={Array.from({ length: 30 }, (_, i) => ({ time: i, val: Math.random() * 50 }))}>
               <defs>
                 <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                   <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                   <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                 </linearGradient>
               </defs>
               <CartesianGrid strokeDasharray="3 3" stroke="#1a1d2e" vertical={false} />
               <XAxis hide />
               <YAxis axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 10 }} />
               <ReTooltip />
               <Area type="monotone" dataKey="val" stroke="#ef4444" fillOpacity={1} fill="url(#colorVal)" strokeWidth={3} />
            </AreaChart>
         </ResponsiveContainer>
      </Card>

      {/* Fifth Row: Heatmap */}
      <div className="section-label">Security Activity Heatmap</div>
      <Card className="glass-card rounded-[2rem] p-10 overflow-auto no-scrollbar">
         <div className="grid grid-cols-24 gap-1 min-w-[1000px]">
            {heatmapData.hours.map(h => (
              <div key={h} className="text-[8px] font-black text-center opacity-30 uppercase">{h}h</div>
            ))}
            {heatmapData.days.map(d => (
              <>
                {heatmapData.hours.map(h => (
                  <div key={`${d}-${h}`} className="h-4 rounded-sm transition-all hover:scale-125" style={{ background: `rgba(239, 68, 68, ${Math.random()})`, border: '1px solid rgba(255,255,255,0.02)' }} />
                ))}
              </>
            ))}
         </div>
      </Card>

      <div className="pt-10">
        <Button className="w-full bg-destructive hover:bg-destructive/90 text-white font-black h-16 uppercase tracking-[0.2em] text-sm rounded-2xl glow-btn shadow-2xl" onClick={handleExport} disabled={isExporting}>
          {isExporting ? <Loader2 className="h-5 w-5 animate-spin mr-3" /> : <Download className="h-5 w-5 mr-3" />}
          Generate Forensic Intelligence Report (PDF)
        </Button>
      </div>
    </div>
  );
}
