
"use client";

import { useState, useEffect, useMemo, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as ReTooltip,
  RadarChart, PolarGrid, PolarAngleAxis, Radar
} from 'recharts';
import { 
  ShieldAlert, Zap, Download, Loader2, 
  Activity, Clock, AlertTriangle,
  Globe, Server, Maximize, Target, Search, Filter, X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

// --- CONSTANTS ---

const ATTACKER_CITIES = [
  { id: 1, city: 'Moscow', country: 'Russia', lat: 55.7558, lng: 37.6173, attacks: 1240, skill: 'Nation State', type: 'SQL Injection' },
  { id: 2, city: 'Beijing', country: 'China', lat: 39.9042, lng: 116.4074, attacks: 980, skill: 'Nation State', type: 'DDoS' },
  { id: 3, city: 'Tehran', country: 'Iran', lat: 35.6892, lng: 51.3890, attacks: 750, skill: 'Advanced', type: 'XSS' },
  { id: 4, city: 'Pyongyang', country: 'North Korea', lat: 39.0392, lng: 125.7625, attacks: 620, skill: 'Nation State', type: 'Malware' },
  { id: 5, city: 'Lagos', country: 'Nigeria', lat: 6.5244, lng: 3.3792, attacks: 410, skill: 'Script Kiddie', type: 'Path Traversal' },
  { id: 6, city: 'São Paulo', country: 'Brazil', lat: -23.5505, lng: -46.6333, attacks: 380, skill: 'Intermediate', type: 'SQL Injection' },
  { id: 7, city: 'Mumbai', country: 'India', lat: 19.0760, lng: 72.8777, attacks: 550, skill: 'Intermediate', type: 'XSS' },
  { id: 8, city: 'Jakarta', country: 'Indonesia', lat: -6.2088, lng: 106.8456, attacks: 290, skill: 'Script Kiddie', type: 'DDoS' },
  { id: 9, city: 'Cairo', country: 'Egypt', lat: 30.0444, lng: 31.2357, attacks: 210, skill: 'Script Kiddie', type: 'Malware' },
  { id: 10, city: 'Bucharest', country: 'Romania', lat: 44.4268, lng: 26.1025, attacks: 440, skill: 'Advanced', type: 'Path Traversal' },
  { id: 11, city: 'Kiev', country: 'Ukraine', lat: 50.4501, lng: 30.5234, attacks: 320, skill: 'Advanced', type: 'SQL Injection' },
  { id: 12, city: 'Istanbul', country: 'Turkey', lat: 41.0082, lng: 28.9784, attacks: 305, skill: 'Intermediate', type: 'XSS' },
  { id: 13, city: 'Berlin', country: 'Germany', lat: 52.5200, lng: 13.4050, attacks: 180, skill: 'Advanced', type: 'DDoS' },
  { id: 14, city: 'Amsterdam', country: 'Netherlands', lat: 52.3676, lng: 4.9041, attacks: 220, skill: 'Advanced', type: 'Malware' },
  { id: 15, city: 'New York', country: 'USA', lat: 40.7128, lng: -74.0060, attacks: 150, skill: 'Intermediate', type: 'Path Traversal' },
  { id: 16, city: 'Los Angeles', country: 'USA', lat: 34.0522, lng: -118.2437, attacks: 140, skill: 'Script Kiddie', type: 'SQL Injection' },
  { id: 17, city: 'Toronto', country: 'Canada', lat: 43.6532, lng: -79.3832, attacks: 90, skill: 'Intermediate', type: 'XSS' },
  { id: 18, city: 'Mexico City', country: 'Mexico', lat: 19.4326, lng: -99.1332, attacks: 280, skill: 'Intermediate', type: 'DDoS' },
  { id: 19, city: 'Buenos Aires', country: 'Argentina', lat: -34.6037, lng: -58.3816, attacks: 190, skill: 'Script Kiddie', type: 'Malware' },
  { id: 20, city: 'Johannesburg', country: 'South Africa', lat: -26.2041, lng: 28.0473, attacks: 120, skill: 'Intermediate', type: 'Path Traversal' },
  { id: 21, city: 'Nairobi', country: 'Kenya', lat: -1.2921, lng: 36.8219, attacks: 80, skill: 'Script Kiddie', type: 'SQL Injection' },
  { id: 22, city: 'Riyadh', country: 'Saudi Arabia', lat: 24.7136, lng: 46.6753, attacks: 340, skill: 'Advanced', type: 'XSS' },
  { id: 23, city: 'Karachi', country: 'Pakistan', lat: 24.8607, lng: 67.0011, attacks: 210, skill: 'Script Kiddie', type: 'DDoS' },
  { id: 24, city: 'Dhaka', country: 'Bangladesh', lat: 23.8103, lng: 90.4125, attacks: 160, skill: 'Script Kiddie', type: 'Malware' },
  { id: 25, city: 'Manila', country: 'Philippines', lat: 14.5995, lng: 120.9842, attacks: 145, skill: 'Intermediate', type: 'Path Traversal' },
  { id: 26, city: 'Ho Chi Minh City', country: 'Vietnam', lat: 10.7769, lng: 106.7009, attacks: 230, skill: 'Intermediate', type: 'SQL Injection' },
  { id: 27, city: 'Bangkok', country: 'Thailand', lat: 13.7563, lng: 100.5018, attacks: 195, skill: 'Script Kiddie', type: 'XSS' },
  { id: 28, city: 'Sydney', country: 'Australia', lat: -33.8688, lng: 151.2093, attacks: 65, skill: 'Advanced', type: 'DDoS' },
  { id: 29, city: 'Tokyo', country: 'Japan', lat: 35.6762, lng: 139.6503, attacks: 110, skill: 'Nation State', type: 'Malware' },
  { id: 30, city: 'Seoul', country: 'South Korea', lat: 37.5665, lng: 126.9780, attacks: 95, skill: 'Nation State', type: 'Path Traversal' },
  { id: 31, city: 'Madrid', country: 'Spain', lat: 40.4168, lng: -3.7038, attacks: 85, skill: 'Intermediate', type: 'SQL Injection' },
  { id: 32, city: 'Rome', country: 'Italy', lat: 41.9028, lng: 12.4964, attacks: 70, skill: 'Intermediate', type: 'XSS' },
  { id: 33, city: 'London', country: 'UK', lat: 51.5074, lng: -0.1278, attacks: 130, skill: 'Advanced', type: 'DDoS' },
  { id: 34, city: 'Paris', country: 'France', lat: 48.8566, lng: 2.3522, attacks: 125, skill: 'Advanced', type: 'Malware' },
  { id: 35, city: 'Singapore', country: 'Singapore', lat: 1.3521, lng: 103.8198, attacks: 400, skill: 'Nation State', type: 'Path Traversal' },
  { id: 36, city: 'Hong Kong', country: 'China', lat: 22.3193, lng: 114.1694, attacks: 520, skill: 'Advanced', type: 'SQL Injection' },
  { id: 37, city: 'Dubai', country: 'UAE', lat: 25.2048, lng: 55.2708, attacks: 260, skill: 'Advanced', type: 'XSS' },
  { id: 38, city: 'Taipei', country: 'Taiwan', lat: 25.0330, lng: 121.5654, attacks: 180, skill: 'Advanced', type: 'DDoS' },
  { id: 39, city: 'Kuala Lumpur', country: 'Malaysia', lat: 3.1390, lng: 101.6869, attacks: 155, skill: 'Intermediate', type: 'Malware' },
  { id: 40, city: 'New Delhi', country: 'India', lat: 28.6139, lng: 77.2090, attacks: 480, skill: 'Nation State', type: 'Path Traversal' }
];

const ATTACK_COLORS: Record<string, string> = {
  'SQL Injection': '#ef4444', // Red
  'XSS': '#d946ef',           // Magenta
  'DDoS': '#eab308',          // Yellow
  'Malware': '#22c55e',       // Green
  'Path Traversal': '#06b6d4' // Cyan
};

const SKILL_COLORS: Record<string, string> = {
  'Script Kiddie': '#f97316',
  'Intermediate': '#ef4444',
  'Advanced': '#7e22ce',
  'Nation State': '#1e1b4b'
};

const CENTRAL_SERVER = { lat: 20, lng: 0 }; // Global HQ Center

export default function AnalyticsPage() {
  const [isExporting, setIsExporting] = useState(false);
  const [dateRange, setDateRange] = useState('24H');
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [filterSkill, setFilterSkill] = useState('ALL');
  const [simulatedStats, setSimulatedStats] = useState({ total: 12450, countries: 32, maxCity: 'Moscow', threat: 'CRITICAL' });
  const [isMapFullscreen, setIsMapFullscreen] = useState(false);

  const mapRef = useRef<any>(null);
  const layerGroupRef = useRef<any>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  // --- MAP INITIALIZATION ---

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Load Leaflet Assets from CDN
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);

    const clusterLink = document.createElement('link');
    clusterLink.rel = 'stylesheet';
    clusterLink.href = 'https://unpkg.com/leaflet.markercluster@1.4.1/dist/MarkerCluster.css';
    document.head.appendChild(clusterLink);

    const clusterDefaultLink = document.createElement('link');
    clusterDefaultLink.rel = 'stylesheet';
    clusterDefaultLink.href = 'https://unpkg.com/leaflet.markercluster@1.4.1/dist/MarkerCluster.Default.css';
    document.head.appendChild(clusterDefaultLink);

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = () => {
      const clusterScript = document.createElement('script');
      clusterScript.src = 'https://unpkg.com/leaflet.markercluster@1.4.1/dist/leaflet.markercluster.js';
      clusterScript.onload = () => {
        initMap();
      };
      document.head.appendChild(clusterScript);
    };
    document.head.appendChild(script);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  const initMap = () => {
    const L = (window as any).L;
    if (!L || mapRef.current) return;

    mapRef.current = L.map('threat-map', {
      center: [20, 0],
      zoom: 2,
      minZoom: 2,
      maxZoom: 10,
      zoomControl: false,
      attributionControl: false
    });

    L.tileLayer('https://cartodb-basemaps-a.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png').addTo(mapRef.current);

    layerGroupRef.current = L.markerClusterGroup({
      showCoverageOnHover: false,
      iconCreateFunction: (cluster: any) => {
        return L.divIcon({
          html: `<div class="cluster-bubble">${cluster.getChildCount()}</div>`,
          className: 'custom-cluster-icon',
          iconSize: L.point(40, 40)
        });
      }
    });

    mapRef.current.addLayer(layerGroupRef.current);
    updateMarkers();

    // Simulated real-time attack stream
    const interval = setInterval(() => {
      const randomAttacker = ATTACKER_CITIES[Math.floor(Math.random() * ATTACKER_CITIES.length)];
      triggerSimulatedAttack(randomAttacker);
    }, 3000);

    return () => clearInterval(interval);
  };

  const updateMarkers = () => {
    const L = (window as any).L;
    if (!L || !mapRef.current || !layerGroupRef.current) return;

    layerGroupRef.current.clearLayers();

    const filtered = ATTACKER_CITIES.filter(a => {
      const matchesSearch = a.city.toLowerCase().includes(search.toLowerCase()) || a.country.toLowerCase().includes(search.toLowerCase());
      const matchesType = filterType === 'ALL' || a.type === filterType;
      const matchesSkill = filterSkill === 'ALL' || a.skill === filterSkill;
      return matchesSearch && matchesType && matchesSkill;
    });

    filtered.forEach(a => {
      const color = ATTACK_COLORS[a.type];
      const markerSize = Math.max(8, Math.min(24, 8 + (a.attacks / 100)));

      const pulseIcon = L.divIcon({
        className: 'custom-pulse-marker',
        html: `
          <div class="marker-container">
            <div class="marker-dot" style="background-color: ${color}; width: ${markerSize}px; height: ${markerSize}px;"></div>
            <div class="marker-pulse" style="border-color: ${color};"></div>
            <div class="marker-pulse" style="border-color: ${color}; animation-delay: 1s;"></div>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20]
      });

      const marker = L.marker([a.lat, a.lng], { icon: pulseIcon });
      
      const popupContent = `
        <div class="map-popup-card">
          <div class="popup-header" style="border-left: 4px solid ${color}">
            <p class="popup-title">${a.city}, ${a.country}</p>
            <span class="popup-badge" style="background-color: ${color}20; color: ${color}; border-color: ${color}40">${a.type}</span>
          </div>
          <div class="popup-body">
            <div class="popup-stat">
              <span class="stat-label">Attacks</span>
              <span class="stat-value text-destructive">${a.attacks}</span>
            </div>
            <div class="popup-stat">
              <span class="stat-label">Threat Score</span>
              <span class="stat-value text-emerald-500">${Math.floor(Math.random() * 20) + 75}%</span>
            </div>
            <div class="popup-stat">
              <span class="stat-label">Skill Level</span>
              <span class="stat-badge" style="background-color: ${SKILL_COLORS[a.skill]}">${a.skill}</span>
            </div>
            <div class="popup-coords">LOC: ${a.lat.toFixed(4)}, ${a.lng.toFixed(4)}</div>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent, {
        className: 'custom-map-popup',
        maxWidth: 260
      });

      layerGroupRef.current.addLayer(marker);

      // Draw Arcs
      const arcPoints = getArcPoints([a.lat, a.lng], [CENTRAL_SERVER.lat, CENTRAL_SERVER.lng]);
      const arc = L.polyline(arcPoints, {
        color: color,
        weight: 1.5,
        opacity: 0.4,
        dashArray: '10, 10',
        className: 'animated-attack-arc'
      }).addTo(mapRef.current);

      // Store arc ref to remove if filter changes (simplified for now)
    });
  };

  const getArcPoints = (start: [number, number], end: [number, number], segments = 50) => {
    const points = [];
    const midLat = (start[0] + end[0]) / 2;
    const midLng = (start[1] + end[1]) / 2;
    const dist = Math.sqrt(Math.pow(end[0] - start[0], 2) + Math.pow(end[1] - start[1], 2));
    const lift = dist * 0.3; 
    const control = [midLat + lift, midLng];

    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const lat = (1 - t) * (1 - t) * start[0] + 2 * (1 - t) * t * control[0] + t * t * end[0];
      const lng = (1 - t) * (1 - t) * start[1] + 2 * (1 - t) * t * control[1] + t * t * end[1];
      points.push([lat, lng]);
    }
    return points;
  };

  const triggerSimulatedAttack = (attacker: any) => {
    const L = (window as any).L;
    if (!L || !mapRef.current) return;

    setSimulatedStats(prev => ({
      ...prev,
      total: prev.total + 1,
      threat: Math.random() > 0.8 ? 'CRITICAL' : 'HIGH'
    }));

    // Temporary flash marker for live event
    const color = ATTACK_COLORS[attacker.type];
    const flashIcon = L.divIcon({
      className: 'live-impact-marker',
      html: `<div class="impact-ring" style="border-color: ${color}"></div>`,
      iconSize: [60, 60]
    });
    const impact = L.marker([attacker.lat, attacker.lng], { icon: flashIcon }).addTo(mapRef.current);
    setTimeout(() => impact.remove(), 2000);
  };

  useEffect(() => {
    updateMarkers();
  }, [search, filterType, filterSkill]);

  // --- KPI LOGIC ---

  const stats = useMemo(() => {
    return { 
      total: simulatedStats.total, 
      blocked: Math.floor(simulatedStats.total * 0.94), 
      rate: '94.2%', 
      avgLat: '7.4ms' 
    };
  }, [simulatedStats]);

  const trafficBreakdown = [
    { name: 'Safe', value: 450, color: '#22c55e' },
    { name: 'Blocked', value: stats.blocked, color: '#ef4444' },
    { name: 'Suspicious', value: 120, color: '#f59e0b' }
  ];

  const radarData = [
    { subject: 'SQLi', A: 85 },
    { subject: 'XSS', A: 70 },
    { subject: 'Traversal', A: 90 },
    { subject: 'Command', A: 65 },
    { subject: 'SSRF', A: 80 },
    { subject: 'Overflow', A: 75 },
  ];

  const handleExport = async () => {
    if (!reportRef.current) return;
    setIsExporting(true);
    try {
      const canvas = await html2canvas(reportRef.current, { backgroundColor: '#020408', scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      pdf.addImage(imgData, 'PNG', 0, 0, 210, (canvas.height * 210) / canvas.width);
      pdf.save(`shieldcore-soc-report.pdf`);
    } catch (err) { console.error(err); } finally { setIsExporting(false); }
  };

  const toggleFullscreen = () => {
    setIsMapFullscreen(!isMapFullscreen);
  };

  const locateServer = () => {
    if (mapRef.current) {
      mapRef.current.flyTo([20, 0], 5, { duration: 2 });
    }
  };

  return (
    <div className="container mx-auto py-12 px-6 max-w-7xl space-y-12 animate-in fade-in duration-1000" ref={reportRef}>
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-destructive font-mono text-[9px] tracking-[0.4em] uppercase animate-pulse">
            <Activity className="h-3 w-3" /> SOC Operational Console
          </div>
          <h1 className="text-5xl font-black tracking-tighter text-gray-900 dark:text-white">THREAT <span className="text-destructive">INTELLIGENCE</span></h1>
          <p className="text-gray-500 dark:text-muted-foreground font-medium text-lg italic opacity-70">Behavioral risk assessment and global signal mapping.</p>
        </div>
        <div className="flex items-center gap-2 bg-black/5 dark:bg-white/5 p-1.5 rounded-2xl border border-black/5 dark:border-white/5 backdrop-blur-xl">
          {['1H', '6H', '24H', '7D'].map(range => (
            <button key={range} onClick={() => setDateRange(range)} className={cn("px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", dateRange === range ? "bg-destructive text-white shadow-lg" : "text-gray-400 dark:text-muted-foreground hover:text-gray-900 dark:hover:text-white")}>
              {range}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Ingress', value: stats.total.toLocaleString(), icon: Activity, trend: '+12.4%', color: 'text-gray-900 dark:text-white' },
          { label: 'Blocked Packets', value: stats.blocked.toLocaleString(), icon: ShieldAlert, trend: '+2.1%', color: 'text-destructive' },
          { label: 'Mitigation Rate', value: stats.rate, icon: Zap, trend: '+0.5%', color: 'text-emerald-500' },
          { label: 'Latency (Avg)', value: stats.avgLat, icon: Clock, trend: '-1.2ms', color: 'text-amber-500' },
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

      <div className="section-label">Global Threat Geography</div>
      
      {/* Search & Filter Controls */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground opacity-40" />
          <input 
            type="text" 
            placeholder="Search Origin Node (City or Country)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-14 pl-12 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl text-xs font-black uppercase tracking-widest placeholder:opacity-30 focus:outline-none focus:border-destructive transition-all"
          />
        </div>
        <div className="flex gap-4">
          <select 
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="h-14 px-6 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest focus:outline-none focus:border-destructive"
          >
            <option value="ALL">ALL TYPES</option>
            {Object.keys(ATTACK_COLORS).map(t => <option key={t} value={t}>{t.toUpperCase()}</option>)}
          </select>
          <select 
            value={filterSkill}
            onChange={(e) => setFilterSkill(e.target.value)}
            className="h-14 px-6 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest focus:outline-none focus:border-destructive"
          >
            <option value="ALL">ALL SKILL LEVELS</option>
            {Object.keys(SKILL_COLORS).map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
          </select>
          <Button 
            variant="ghost" 
            onClick={() => { setSearch(''); setFilterType('ALL'); setFilterSkill('ALL'); }}
            className="h-14 px-8 border border-black/10 dark:border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest"
          >
            Reset
          </Button>
        </div>
      </div>

      <Card className={cn(
        "glass-card rounded-[2.5rem] overflow-hidden relative border border-destructive/20 shadow-2xl transition-all duration-700",
        isMapFullscreen ? "fixed inset-0 z-[10000] rounded-none border-0" : "h-[600px]"
      )}>
        {/* Map Header Overlay */}
        <div className="absolute top-8 left-10 z-[1000] space-y-2 pointer-events-none">
           <div className="flex items-center gap-3">
             <div className="h-4 w-4 rounded-full bg-destructive animate-ping" />
             <h3 className="text-2xl font-black tracking-tighter text-gray-900 dark:text-white uppercase">Neural Ingress Command</h3>
           </div>
           <div className="flex items-center gap-4">
              <Badge variant="outline" className="bg-destructive/10 border-destructive/30 text-destructive text-[10px] font-mono px-3 py-1 uppercase tracking-widest">
                {simulatedStats.countries} Countries Under Ingress
              </Badge>
              <span className="text-[10px] font-mono text-gray-400 dark:text-muted-foreground opacity-50 uppercase tracking-[0.3em]">Sector: Global Alpha</span>
           </div>
        </div>

        {/* Action Buttons Overlay */}
        <div className="absolute top-8 right-10 z-[1000] flex gap-3">
           <Button variant="outline" size="icon" onClick={locateServer} className="h-12 w-12 rounded-xl bg-black/40 backdrop-blur-xl border-white/10 hover:bg-white/10 text-white">
              <Target className="h-5 w-5" />
           </Button>
           <Button variant="outline" size="icon" onClick={toggleFullscreen} className="h-12 w-12 rounded-xl bg-black/40 backdrop-blur-xl border-white/10 hover:bg-white/10 text-white">
              {isMapFullscreen ? <X className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
           </Button>
        </div>

        {/* Legend Overlay */}
        <div className="absolute bottom-10 left-10 z-[1000] glass-card bg-black/60 p-5 rounded-3xl border border-white/10 min-w-[220px]">
           <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-4 border-b border-white/5 pb-2">Threat Vector Legend</p>
           <div className="space-y-3">
              {Object.entries(ATTACK_COLORS).map(([type, color]) => (
                <div key={type} className="flex items-center gap-3">
                  <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color, boxShadow: `0 0 10px ${color}` }} />
                  <span className="text-[9px] font-black text-white uppercase tracking-tighter">{type}</span>
                </div>
              ))}
              <div className="flex items-center gap-3 pt-2 mt-2 border-t border-white/5">
                 <div className="flex gap-1">
                   <div className="h-1 w-1 rounded-full bg-white opacity-40"></div>
                   <div className="h-1 w-2 rounded-full bg-white opacity-60"></div>
                   <div className="h-1 w-4 rounded-full bg-white opacity-100"></div>
                 </div>
                 <span className="text-[9px] font-black text-white/40 uppercase">Attack Density</span>
              </div>
           </div>
        </div>

        <div id="threat-map" className="w-full h-full bg-[#020408]"></div>
      </Card>

      {/* Live Statistics Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         <Card className="glass-card p-6 rounded-2xl flex flex-col items-center justify-center text-center border-l-4 border-l-destructive">
            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">Total Attacks Observed</p>
            <p className="text-3xl font-black text-destructive tracking-tighter animate-pulse">{simulatedStats.total.toLocaleString()}</p>
         </Card>
         <Card className="glass-card p-6 rounded-2xl flex flex-col items-center justify-center text-center border-l-4 border-l-emerald-500">
            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">Countries Affected</p>
            <p className="text-3xl font-black text-white tracking-tighter">{simulatedStats.countries}</p>
         </Card>
         <Card className="glass-card p-6 rounded-2xl flex flex-col items-center justify-center text-center border-l-4 border-l-amber-500">
            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">Max Ingress Origin</p>
            <p className="text-xl font-black text-amber-500 tracking-tighter uppercase">{simulatedStats.maxCity}</p>
         </Card>
         <Card className="glass-card p-6 rounded-2xl flex flex-col items-center justify-center text-center border-l-4 border-l-destructive">
            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">System Risk Profile</p>
            <Badge variant="destructive" className="mt-1 px-4 py-1 text-[10px] font-black uppercase tracking-widest bg-destructive/20 border-destructive/40 text-destructive">{simulatedStats.threat}</Badge>
         </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-6">
           <div className="section-label">Vector Distribution</div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="glass-card p-6 rounded-3xl h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={trafficBreakdown} innerRadius={60} outerRadius={80} paddingAngle={8} dataKey="value">
                      {trafficBreakdown.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                    </Pie>
                    <ReTooltip contentStyle={{ background: '#0a0c14', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '10px' }} />
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

        <div className="space-y-6">
          <div className="section-label">Top Forensic Origins</div>
          <div className="glass-card rounded-3xl overflow-hidden h-[350px]">
             <table className="w-full text-left">
                <thead className="bg-black/20 border-b border-white/5">
                   <tr className="text-[9px] uppercase font-black text-muted-foreground">
                     <th className="px-6 py-4">Node Origin</th>
                     <th className="px-6 py-4">Attacks</th>
                     <th className="px-6 py-4 text-right">Primary Vector</th>
                   </tr>
                </thead>
                <tbody className="text-[11px] font-medium">
                  {ATTACKER_CITIES.slice(0, 5).map((row, i) => (
                    <tr key={i} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4">
                         <div className="flex items-center gap-2 font-mono">
                           <span className="text-muted-foreground">[{row.country}]</span>
                           <span className="text-white">{row.city}</span>
                         </div>
                      </td>
                      <td className="px-6 py-4 font-black text-destructive">{row.attacks}</td>
                      <td className="px-6 py-4 text-right">
                        <Badge variant="secondary" className="text-[9px] font-bold uppercase bg-destructive/10 text-destructive border-destructive/20">
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

      <div className="pt-10">
        <Button className="w-full bg-destructive hover:bg-destructive/90 text-white font-black h-16 uppercase tracking-[0.2em] text-sm rounded-2xl shadow-2xl" onClick={handleExport} disabled={isExporting}>
          {isExporting ? <Loader2 className="h-5 w-5 animate-spin mr-3" /> : <Download className="h-5 w-5 mr-3" />}
          Generate Forensic Intelligence Report (PDF)
        </Button>
      </div>

      <style jsx global>{`
        /* Map Custom Styling */
        #threat-map {
          z-index: 10;
        }
        .leaflet-container {
          background: #020408 !important;
        }
        
        /* Custom Cluster Bubble */
        .custom-cluster-icon {
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .cluster-bubble {
          width: 40px;
          height: 40px;
          background: rgba(239, 68, 68, 0.2);
          border: 2px solid #ef4444;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ef4444;
          font-family: 'JetBrains Mono', monospace;
          font-weight: 900;
          font-size: 14px;
          backdrop-filter: blur(8px);
          box-shadow: 0 0 15px rgba(239, 68, 68, 0.3);
        }

        /* Pulsing Marker */
        .custom-pulse-marker {
          position: relative;
        }
        .marker-container {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
        }
        .marker-dot {
          border-radius: 50%;
          z-index: 2;
          box-shadow: 0 0 10px currentColor;
        }
        .marker-pulse {
          position: absolute;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 1px solid;
          opacity: 0;
          animation: map-ping 3s infinite;
          z-index: 1;
        }

        @keyframes map-ping {
          0% { transform: scale(0.5); opacity: 0.8; }
          100% { transform: scale(3); opacity: 0; }
        }

        /* Live Impact Marker */
        .live-impact-marker {
          pointer-events: none;
        }
        .impact-ring {
          width: 60px;
          height: 60px;
          border: 4px solid;
          border-radius: 50%;
          animation: impact-ring-out 1.5s ease-out forwards;
        }
        @keyframes impact-ring-out {
          0% { transform: scale(0.1); opacity: 1; border-width: 10px; }
          100% { transform: scale(2); opacity: 0; border-width: 1px; }
        }

        /* Animated Attack Arcs */
        .animated-attack-arc {
          stroke-dasharray: 10, 10;
          animation: dash-flow 20s linear infinite;
        }
        @keyframes dash-flow {
          to { stroke-dashoffset: -1000; }
        }

        /* Custom Popup Styling */
        .custom-map-popup .leaflet-popup-content-wrapper {
          background: rgba(10, 12, 20, 0.9) !important;
          color: #fff !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          border-radius: 20px !important;
          backdrop-filter: blur(16px) !important;
          padding: 0 !important;
          overflow: hidden !important;
        }
        .custom-map-popup .leaflet-popup-content {
          margin: 0 !important;
          width: auto !important;
        }
        .custom-map-popup .leaflet-popup-tip {
          background: rgba(10, 12, 20, 0.9) !important;
        }
        .map-popup-card {
          padding: 16px;
          font-family: 'Inter', sans-serif;
        }
        .popup-header {
          padding-left: 12px;
          margin-bottom: 12px;
        }
        .popup-title {
          font-size: 14px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: -0.02em;
        }
        .popup-badge {
          font-size: 8px;
          font-weight: 900;
          text-transform: uppercase;
          padding: 2px 8px;
          border-radius: 6px;
          border: 1px solid;
        }
        .popup-body {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .popup-stat {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: rgba(255,255,255,0.03);
          padding: 6px 10px;
          border-radius: 10px;
        }
        .stat-label {
          font-size: 9px;
          color: rgba(255,255,255,0.4);
          text-transform: uppercase;
          font-weight: 800;
        }
        .stat-value {
          font-size: 11px;
          font-weight: 900;
          font-family: 'JetBrains Mono', monospace;
        }
        .stat-badge {
          font-size: 8px;
          padding: 2px 6px;
          border-radius: 4px;
          color: #fff;
          font-weight: 800;
        }
        .popup-coords {
          font-size: 8px;
          font-family: 'JetBrains Mono', monospace;
          color: rgba(255,255,255,0.2);
          text-align: center;
          margin-top: 4px;
        }
      `}</style>
    </div>
  );
}
