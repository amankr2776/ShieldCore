"use client";

import { useState, useEffect, useMemo, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as ReTooltip,
  RadarChart, PolarGrid, PolarAngleAxis, Radar, Area, AreaChart,
  CartesianGrid, XAxis, YAxis
} from 'recharts';
import { 
  ShieldAlert, Zap, Download, Loader2, 
  Activity, Clock, AlertTriangle, Fingerprint,
  Globe, MapPin, X, Shield, Server, MousePointer2
} from 'lucide-react';
import { getSeededData } from '@/lib/mock-data';
import { cn } from '@/lib/utils';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const CITY_COORDS: Record<string, { city: string, x: number, y: number }[]> = {
  'US': [{ city: 'New York', x: 220, y: 130 }, { city: 'San Francisco', x: 140, y: 150 }, { city: 'Chicago', x: 195, y: 140 }],
  'UK': [{ city: 'London', x: 470, y: 100 }],
  'RU': [{ city: 'Moscow', x: 580, y: 80 }],
  'CN': [{ city: 'Beijing', x: 710, y: 130 }, { city: 'Shanghai', x: 730, y: 155 }],
  'IN': [{ city: 'Mumbai', x: 640, y: 170 }, { city: 'Delhi', x: 655, y: 145 }],
  'BR': [{ city: 'São Paulo', x: 280, y: 260 }],
  'DE': [{ city: 'Berlin', x: 490, y: 100 }],
  'FR': [{ city: 'Paris', x: 475, y: 110 }],
  'JP': [{ city: 'Tokyo', x: 760, y: 130 }],
  'AU': [{ city: 'Sydney', x: 740, y: 290 }],
  'ES': [{ city: 'Madrid', x: 460, y: 130 }]
};

const CENTRAL_SERVER = { x: 400, y: 150 };

const WORLD_MAP_PATH = "M110,130 L130,120 L150,140 L170,120 L190,140 L210,130 L230,150 L250,140 L240,160 L220,170 L200,160 L180,180 L160,170 L140,190 L120,180 L100,200 L80,190 Z M460,90 L480,80 L500,100 L520,90 L540,110 L560,100 L580,120 L600,110 L620,130 L640,120 L660,140 L680,130 L700,150 L720,140 L740,160 L760,150 L780,170 L800,160 L800,300 L780,310 L760,290 L740,300 L720,280 L700,290 L680,270 L660,280 L640,260 L620,270 L600,250 L580,260 L560,240 L540,250 L520,230 L500,240 L480,220 L460,230 L440,210 L420,220 L400,200 L380,210 L360,190 L340,200 L320,180 L300,190 L280,170 L260,180 L240,160 L220,170 L200,150 L180,160 L160,140 L140,150 L120,130 L100,140 Z";

export default function AnalyticsPage() {
  const [data, setData] = useState<any[]>([]);
  const [dateRange, setDateRange] = useState('24H');
  const [isExporting, setIsExporting] = useState(false);
  const [threatMarkers, setThreatMarkers] = useState<any[]>([]);
  const [selectedThreat, setSelectedThreat] = useState<any | null>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const seeded = getSeededData();
    setData(seeded);
    
    const blockedEvents = seeded.filter(r => r.decision === 'BLOCKED').slice(0, 20);
    const markers = blockedEvents.map((event, idx) => {
      const countryCode = event.country;
      const cityList = CITY_COORDS[countryCode] || CITY_COORDS['US'];
      const cityData = cityList[idx % cityList.length];
      return {
        ...event,
        ...cityData,
        id: `marker-${idx}-${event.id}`
      };
    });
    setThreatMarkers(markers);
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
      pdf.save(`shieldcore-soc-report-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (err) { console.error(err); } finally { setIsExporting(false); }
  };

  return (
    <div className="container mx-auto py-12 px-6 max-w-7xl space-y-12 dashboard-cursor animate-in fade-in duration-1000" ref={reportRef}>
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-destructive font-mono text-[9px] tracking-[0.4em] uppercase animate-pulse">
            <Activity className="h-3 w-3" /> SOC Operational Console
          </div>
          <h1 className="text-5xl font-black tracking-tighter text-gray-900 dark:text-white">THREAT <span className="text-destructive">INTELLIGENCE</span></h1>
          <p className="text-gray-500 dark:text-muted-foreground font-medium text-lg italic opacity-70">Behavioral risk assessment and global signal mapping.</p>
        </div>
        <div className="flex items-center gap-2 bg-black/5 dark:bg-white/5 p-1.5 rounded-2xl border border-black/5 dark:border-white/5 backdrop-blur-xl">
          {['1H', '6H', '24H', 'ALL'].map(range => (
            <button key={range} onClick={() => setDateRange(range)} className={cn("px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", dateRange === range ? "bg-destructive text-white shadow-lg" : "text-gray-400 dark:text-muted-foreground hover:text-gray-900 dark:hover:text-white")}>
              {range}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {[
          { label: 'Ingress Node', value: stats.total, icon: Activity, trend: '+12.4%', color: 'text-gray-900 dark:text-white' },
          { label: 'Blocked Ingress', value: stats.blocked, icon: ShieldAlert, trend: '+2.1%', color: 'text-destructive' },
          { label: 'FP Ratio', value: '2.3%', icon: AlertTriangle, trend: '-0.4%', color: 'text-amber-500' },
          { label: 'Latency (Avg)', value: `${stats.avgLat}ms`, icon: Zap, trend: '-1.2ms', color: 'text-emerald-500' },
          { label: 'Peak Hour', value: '14:00', icon: Clock, trend: 'STATIC', color: 'text-gray-900 dark:text-white' },
        ].map((kpi, i) => (
          <Card key={i} className="glass-card rounded-3xl p-6 group">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div className={`p-2 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 ${kpi.color}`}>
                  <kpi.icon className="h-4 w-4" />
                </div>
                <div className="text-[10px] font-bold text-emerald-500">{kpi.trend}</div>
              </div>
              <div className="space-y-1">
                <p className="text-[9px] font-black text-gray-400 dark:text-muted-foreground uppercase tracking-widest opacity-40">{kpi.label}</p>
                <p className={cn("text-2xl font-black tracking-tighter", kpi.color)}>{kpi.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="section-label">Global Signal Mapping</div>
      <Card className="glass-card rounded-[2rem] overflow-visible relative min-h-[600px] border border-destructive/20 shadow-2xl">
        <div className="absolute top-8 left-10 z-20 space-y-2 pointer-events-none">
           <div className="flex items-center gap-3">
             <div className="h-4 w-4 rounded-full bg-destructive animate-ping" />
             <h3 className="text-2xl font-black tracking-tighter text-gray-900 dark:text-white uppercase">Live Ingress Forensics</h3>
           </div>
           <div className="flex items-center gap-4">
              <Badge variant="outline" className="bg-destructive/10 border-destructive/30 text-destructive text-[10px] font-mono px-3 py-1 uppercase tracking-widest">
                {threatMarkers.length} ACTIVE THREATS DETECTED
              </Badge>
              <span className="text-[10px] font-mono text-gray-400 dark:text-muted-foreground opacity-50 uppercase tracking-[0.3em]">Edge Node: 12.4.92</span>
           </div>
        </div>

        <div className="absolute bottom-8 right-10 z-20 glass-card bg-black/40 p-4 rounded-2xl border border-white/5 space-y-3 min-w-[200px] pointer-events-none">
           <p className="text-[10px] font-black text-white/40 uppercase tracking-widest border-b border-white/5 pb-2">Intelligence Legend</p>
           <div className="space-y-2">
              <div className="flex items-center gap-3">
                 <div className="h-2 w-2 rounded-full bg-destructive shadow-[0_0_10px_#ef4444]" />
                 <span className="text-[9px] font-black text-gray-300 uppercase tracking-tighter">Attack Origin (Pulse)</span>
              </div>
              <div className="flex items-center gap-3">
                 <div className="h-0.5 w-6 bg-gradient-to-r from-destructive to-transparent rounded-full" />
                 <span className="text-[9px] font-black text-gray-300 uppercase tracking-tighter">Vector Path (Arc)</span>
              </div>
              <div className="flex items-center gap-3">
                 <Server className="h-3 w-3 text-emerald-500" />
                 <span className="text-[9px] font-black text-gray-300 uppercase tracking-tighter">Protected HQ Node</span>
              </div>
           </div>
        </div>
        
        <CardContent className="h-[550px] w-full flex items-center justify-center p-0 relative bg-[#020408] rounded-[2rem] overflow-visible">
          <svg viewBox="0 0 800 400" className="w-full h-full max-w-full max-h-full opacity-80" preserveAspectRatio="xMidYMid meet">
            <path 
              d={WORLD_MAP_PATH} 
              fill="#111827" 
              stroke="#1f2937" 
              strokeWidth="0.5"
            />
            
            <g transform={`translate(${CENTRAL_SERVER.x - 10}, ${CENTRAL_SERVER.y - 10})`}>
               <circle cx="10" cy="10" r="15" fill="#10b981" opacity="0.1" className="animate-pulse" />
               <circle cx="10" cy="10" r="4" fill="#10b981" />
               <text x="20" y="14" fill="#10b981" fontSize="8" fontWeight="black" className="uppercase font-mono tracking-widest">Global HQ</text>
            </g>

            {threatMarkers.map((marker, i) => {
              const midX = (marker.x + CENTRAL_SERVER.x) / 2;
              const midY = (marker.y + CENTRAL_SERVER.y) / 2 - 40;
              const arcPath = `M ${marker.x} ${marker.y} Q ${midX} ${midY} ${CENTRAL_SERVER.x} ${CENTRAL_SERVER.y}`;

              return (
                <g key={marker.id} className="cursor-pointer group/threat" onClick={() => setSelectedThreat(marker)}>
                  <path 
                    d={arcPath} 
                    fill="none" 
                    stroke="url(#attackGradient)" 
                    strokeWidth="1.5" 
                    strokeDasharray="1000" 
                    strokeDashoffset="1000"
                    className="animate-[dash_3s_linear_infinite]"
                    style={{ animationDelay: `${i * 0.5}s` }}
                    opacity="0.6"
                  />
                  
                  <circle cx={marker.x} cy={marker.y} r="1" fill="none" stroke="#ef4444" strokeWidth="1" className="animate-ping" style={{ animationDuration: '3s' }} />
                  <circle cx={marker.x} cy={marker.y} r="12" fill="#ef4444" opacity="0.1" className="animate-pulse" />
                  <circle cx={marker.x} cy={marker.y} r="4" fill="#ef4444" className="hover:scale-150 transition-transform cursor-pointer" />
                </g>
              );
            })}

            <defs>
              <linearGradient id="attackGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ef4444" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>

          {selectedThreat && (
            <div className="absolute z-[100] animate-in zoom-in-95 fade-in duration-300" style={{ left: `${(selectedThreat.x / 800) * 100}%`, top: `${(selectedThreat.y / 400) * 100}%` }}>
               <Card className="w-80 glass-card p-6 translate-y-[-110%] translate-x-[-50%] border-destructive shadow-[0_0_50px_rgba(239,68,68,0.3)] bg-[#0a0c14]/95 backdrop-blur-3xl ring-1 ring-white/10">
                 <div className="flex justify-between items-start mb-5">
                    <Badge variant="destructive" className="text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1 border-destructive/40 shadow-[0_0_15px_rgba(239,68,68,0.3)]">Critical Ingress</Badge>
                    <button onClick={() => setSelectedThreat(null)} className="p-1.5 hover:bg-white/5 rounded-full transition-colors">
                      <X className="h-4 w-4 text-white/50" />
                    </button>
                 </div>
                 <div className="space-y-4 text-white">
                    <div className="flex items-center gap-4">
                       <div className="p-3 bg-destructive/10 rounded-xl border border-destructive/20">
                          <ShieldAlert className="h-6 w-6 text-destructive" />
                       </div>
                       <div>
                          <p className="text-sm font-black text-white uppercase tracking-tighter">{selectedThreat.city}, {selectedThreat.country}</p>
                          <p className="text-[10px] font-mono text-muted-foreground opacity-60">Source IP: {selectedThreat.ip}</p>
                       </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                       <div className="space-y-1">
                          <p className="text-[8px] font-black text-white/40 uppercase tracking-widest">Vector Class</p>
                          <p className="text-[11px] font-bold text-destructive uppercase">{selectedThreat.attackType}</p>
                       </div>
                       <div className="space-y-1">
                          <p className="text-[8px] font-black text-white/40 uppercase tracking-widest">Match Score</p>
                          <p className="text-[11px] font-bold text-emerald-500">{Math.round(selectedThreat.score * 100)}%</p>
                       </div>
                    </div>

                    <div className="space-y-2 pt-4">
                       <div className="flex justify-between text-[8px] font-black text-white/40 uppercase tracking-widest">
                          <span>Payload Risk</span>
                          <span className="text-destructive">MALICIOUS</span>
                       </div>
                       <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-destructive w-[94%] animate-pulse shadow-[0_0_8px_#ef4444]" />
                       </div>
                    </div>

                    <div className="flex gap-2 pt-4">
                       <Button size="sm" className="flex-1 bg-destructive hover:bg-destructive/90 text-white text-[9px] font-black uppercase tracking-widest h-9 rounded-xl shadow-lg shadow-destructive/20">
                         Isolate Source
                       </Button>
                       <Button size="sm" variant="outline" className="flex-1 border-white/20 bg-white/5 text-white hover:bg-white/10 text-[9px] font-black uppercase tracking-widest h-9 rounded-xl transition-all">
                         View Logs
                       </Button>
                    </div>
                 </div>
                 <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#0a0c14] border-r border-b border-destructive rotate-45" />
               </Card>
            </div>
          )}
        </CardContent>

        <style jsx global>{`
          @keyframes dash {
            from { stroke-dashoffset: 1000; }
            to { stroke-dashoffset: 0; }
          }
          @keyframes dash-reverse {
            from { stroke-dashoffset: 0; }
            to { stroke-dashoffset: 1000; }
          }
          .animate-dash {
            animation: dash 3s linear infinite;
          }
        `}</style>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-6">
           <div className="section-label">Ingress Distribution</div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="glass-card p-6 rounded-3xl h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={trafficBreakdown} innerRadius={60} outerRadius={80} paddingAngle={8} dataKey="value">
                      {trafficBreakdown.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                    </Pie>
                    <ReTooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
              <Card className="glass-card p-6 rounded-3xl h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="currentColor" className="text-gray-100 dark:text-[#2a2d3e]" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 700 }} />
                    <Radar dataKey="A" stroke="#ef4444" fill="#ef4444" fillOpacity={0.5} />
                  </RadarChart>
                </ResponsiveContainer>
              </Card>
           </div>
        </div>

        <div className="space-y-6">
          <div className="section-label">Top Threat Origins</div>
          <div className="glass-card rounded-3xl overflow-hidden h-[350px]">
             <table className="w-full text-left">
                <thead className="bg-black/5 dark:bg-white/[0.02] border-b border-black/5 dark:border-white/5">
                   <tr className="text-[9px] uppercase font-black text-gray-400 dark:text-muted-foreground">
                     <th className="px-6 py-4">Origin Node</th>
                     <th className="px-6 py-4">Blocked</th>
                     <th className="px-6 py-4 text-right">Primary Vector</th>
                   </tr>
                </thead>
                <tbody className="text-[11px] font-medium">
                  {topIps.map((row, i) => (
                    <tr key={i} className="border-b border-black/5 dark:border-white/5 last:border-0 hover:bg-black/5 dark:hover:bg-white/[0.02] transition-colors text-gray-700 dark:text-foreground">
                      <td className="px-6 py-4">
                         <div className="flex items-center gap-2 font-mono">
                           <span className="text-gray-500 dark:text-muted-foreground">[{row.country}]</span>
                           <span className="text-gray-900 dark:text-white">{row.ip}</span>
                         </div>
                      </td>
                      <td className="px-6 py-4 font-black text-destructive">{row.blocked}</td>
                      <td className="px-6 py-4 text-right">
                        <Badge variant="secondary" className="text-[9px] font-bold uppercase tracking-tighter bg-destructive/10 text-destructive border-destructive/20">
                          {row.type}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
             </table>
          </div>
        </div>
      </div>

      <div className="section-label">Temporal Threat Frequency</div>
      <Card className="glass-card rounded-[2rem] p-10 h-[400px]">
         <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={Array.from({ length: 30 }, (_, i) => ({ time: i, val: Math.random() * 50 }))}>
               <defs>
                 <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                   <stop offset="5%" stopColor="#ef4444" stopOpacity="0.3"/>
                   <stop offset="95%" stopColor="#ef4444" stopOpacity="0"/>
                 </linearGradient>
               </defs>
               <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-gray-100 dark:text-[#1a1d2e]" vertical={false} />
               <XAxis hide />
               <YAxis axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 10 }} />
               <ReTooltip />
               <Area type="monotone" dataKey="val" stroke="#ef4444" fillOpacity={1} fill="url(#colorVal)" strokeWidth={3} />
            </AreaChart>
         </ResponsiveContainer>
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
