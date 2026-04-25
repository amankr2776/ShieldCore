
"use client";

import { useState, useEffect, useMemo, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, RadialBarChart, RadialBar, Legend, LineChart, Line, Cell
} from 'recharts';
import { 
  Activity, ShieldAlert, Zap, Globe, Target, Search, Filter, 
  RotateCcw, Play, Pause, AlertTriangle, Clock, MousePointer2,
  TrendingUp, Fingerprint, Shield
} from 'lucide-react';
import { cn } from '@/lib/utils';

// --- DATA CONSTANTS ---

const ATTACK_COLORS: Record<string, string> = {
  'SQLi': '#ef4444',
  'XSS': '#d946ef',
  'DDoS': '#eab308',
  'Malware': '#22c55e',
  'Phishing': '#06b6d4',
  'APT': '#a855f7',
  'Botnet': '#f97316'
};

const SKILL_COLORS: Record<string, string> = {
  'Script Kiddie': '#f97316',
  'Intermediate': '#ef4444',
  'Advanced': '#7e22ce',
  'Nation State': '#1e1b4b'
};

const ATTACKER_DATA = [
  { city: 'Moscow', country: 'Russia', lat: 55.7558, lng: 37.6173, type: 'SQLi', skill: 'Nation State', attacks: 1450, flag: '🇷🇺' },
  { city: 'Beijing', country: 'China', lat: 39.9042, lng: 116.4074, type: 'XSS', skill: 'Advanced', attacks: 1200, flag: '🇨🇳' },
  { city: 'Tehran', country: 'Iran', lat: 35.6892, lng: 51.3890, type: 'DDoS', skill: 'Nation State', attacks: 980, flag: '🇮🇷' },
  { city: 'Pyongyang', country: 'North Korea', lat: 39.0194, lng: 125.7381, type: 'Malware', skill: 'Nation State', attacks: 850, flag: '🇰🇵' },
  { city: 'Lagos', country: 'Nigeria', lat: 6.5244, lng: 3.3792, type: 'Phishing', skill: 'Intermediate', attacks: 410, flag: '🇳🇬' },
  { city: 'São Paulo', country: 'Brazil', lat: -23.5505, lng: -46.6333, type: 'SQLi', skill: 'Advanced', attacks: 380, flag: '🇧🇷' },
  { city: 'Mumbai', country: 'India', lat: 19.0760, lng: 72.8777, type: 'XSS', skill: 'Intermediate', attacks: 550, flag: '🇮🇳' },
  { city: 'Jakarta', country: 'Indonesia', lat: -6.2088, lng: 106.8456, type: 'DDoS', skill: 'Intermediate', attacks: 290, flag: '🇮🇩' },
  { city: 'Cairo', country: 'Egypt', lat: 30.0444, lng: 31.2357, type: 'SQLi', skill: 'Intermediate', attacks: 210, flag: '🇪🇬' },
  { city: 'Bucharest', country: 'Romania', lat: 44.4268, lng: 26.1025, type: 'Malware', skill: 'Advanced', attacks: 440, flag: '🇷🇴' },
  { city: 'Kiev', country: 'Ukraine', lat: 50.4501, lng: 30.5234, type: 'SQLi', skill: 'Advanced', attacks: 320, flag: '🇺🇦' },
  { city: 'Istanbul', country: 'Turkey', lat: 41.0082, lng: 28.9784, type: 'XSS', skill: 'Intermediate', attacks: 305, flag: '🇹🇷' },
  { city: 'Berlin', country: 'Germany', lat: 52.5200, lng: 13.4050, type: 'APT', skill: 'Advanced', attacks: 180, flag: '🇩🇪' },
  { city: 'Amsterdam', country: 'Netherlands', lat: 52.3676, lng: 4.9041, type: 'Botnet', skill: 'Advanced', attacks: 220, flag: '🇳🇱' },
  { city: 'New York', country: 'USA', lat: 40.7128, lng: -74.0060, type: 'SQLi', skill: 'Intermediate', attacks: 150, flag: '🇺🇸' },
  { city: 'Los Angeles', country: 'USA', lat: 34.0522, lng: -118.2437, type: 'XSS', skill: 'Script Kiddie', attacks: 140, flag: '🇺🇸' },
  { city: 'Toronto', country: 'Canada', lat: 43.6532, lng: -79.3832, type: 'Phishing', skill: 'Intermediate', attacks: 90, flag: '🇨🇦' },
  { city: 'Mexico City', country: 'Mexico', lat: 19.4326, lng: -99.1332, type: 'SQLi', skill: 'Script Kiddie', attacks: 280, flag: '🇲🇽' },
  { city: 'Buenos Aires', country: 'Argentina', lat: -34.6037, lng: -58.3816, type: 'DDoS', skill: 'Intermediate', attacks: 190, flag: '🇦🇷' },
  { city: 'Johannesburg', country: 'South Africa', lat: -26.2041, lng: 28.0473, type: 'Malware', skill: 'Intermediate', attacks: 120, flag: '🇿🇦' },
  { city: 'Nairobi', country: 'Kenya', lat: -1.2921, lng: 36.8219, type: 'Phishing', skill: 'Script Kiddie', attacks: 80, flag: '🇰🇪' },
  { city: 'Riyadh', country: 'Saudi Arabia', lat: 24.7136, lng: 46.6753, type: 'SQLi', skill: 'Intermediate', attacks: 340, flag: '🇸🇦' },
  { city: 'Karachi', country: 'Pakistan', lat: 24.8607, lng: 67.0011, type: 'XSS', skill: 'Script Kiddie', attacks: 210, flag: '🇵🇰' },
  { city: 'Dhaka', country: 'Bangladesh', lat: 23.8103, lng: 90.4125, type: 'DDoS', skill: 'Script Kiddie', attacks: 160, flag: '🇧🇩' },
  { city: 'Manila', country: 'Philippines', lat: 14.5995, lng: 120.9842, type: 'SQLi', skill: 'Script Kiddie', attacks: 145, flag: '🇵🇭' },
  { city: 'Ho Chi Minh', country: 'Vietnam', lat: 10.8231, lng: 106.6297, type: 'XSS', skill: 'Intermediate', attacks: 230, flag: '🇻🇳' },
  { city: 'Bangkok', country: 'Thailand', lat: 13.7563, lng: 100.5018, type: 'Malware', skill: 'Intermediate', attacks: 195, flag: '🇹🇭' },
  { city: 'Sydney', country: 'Australia', lat: -33.8688, lng: 151.2093, type: 'SQLi', skill: 'Advanced', attacks: 65, flag: '🇦🇺' },
  { city: 'Tokyo', country: 'Japan', lat: 35.6762, lng: 139.6503, type: 'APT', skill: 'Advanced', attacks: 110, flag: '🇯🇵' },
  { city: 'Seoul', country: 'South Korea', lat: 37.5665, lng: 126.9780, type: 'DDoS', skill: 'Intermediate', attacks: 95, flag: '🇰🇷' },
  { city: 'Paris', country: 'France', lat: 48.8566, lng: 2.3522, type: 'SQLi', skill: 'Advanced', attacks: 125, flag: '🇫🇷' },
  { city: 'London', country: 'UK', lat: 51.5074, lng: -0.1278, type: 'XSS', skill: 'Advanced', attacks: 130, flag: '🇬🇧' },
  { city: 'Madrid', country: 'Spain', lat: 40.4168, lng: -3.7038, type: 'Phishing', skill: 'Intermediate', attacks: 85, flag: '🇪🇸' },
  { city: 'Rome', country: 'Italy', lat: 41.9028, lng: 12.4964, type: 'SQLi', skill: 'Intermediate', attacks: 70, flag: '🇮🇹' },
  { city: 'Warsaw', country: 'Poland', lat: 52.2297, lng: 21.0122, type: 'Malware', skill: 'Advanced', attacks: 210, flag: '🇵🇱' },
  { city: 'Prague', country: 'Czech Rep', lat: 50.0755, lng: 14.4378, type: 'Botnet', skill: 'Intermediate', attacks: 155, flag: '🇨🇿' },
  { city: 'Stockholm', country: 'Sweden', lat: 59.3293, lng: 18.0686, type: 'APT', skill: 'Advanced', attacks: 90, flag: '🇸🇪' },
  { city: 'Helsinki', country: 'Finland', lat: 60.1699, lng: 24.9384, type: 'SQLi', skill: 'Intermediate', attacks: 45, flag: '🇫🇮' },
  { city: 'Athens', country: 'Greece', lat: 37.9838, lng: 23.7275, type: 'XSS', skill: 'Script Kiddie', attacks: 110, flag: '🇬🇷' },
  { city: 'Lisbon', country: 'Portugal', lat: 38.7223, lng: -9.1393, type: 'DDoS', skill: 'Script Kiddie', attacks: 60, flag: '🇵🇹' },
  { city: 'Dubai', country: 'UAE', lat: 25.2048, lng: 55.2708, type: 'SQLi', skill: 'Advanced', attacks: 400, flag: '🇦🇪' },
  { city: 'Bangalore', country: 'India', lat: 12.9716, lng: 77.5946, type: 'XSS', skill: 'Intermediate', attacks: 520, flag: '🇮🇳' },
  { city: 'Kuala Lumpur', country: 'Malaysia', lat: 3.1390, lng: 101.6869, type: 'Malware', skill: 'Intermediate', attacks: 155, flag: '🇲🇾' },
  { city: 'Singapore', country: 'Singapore', lat: 1.3521, lng: 103.8198, type: 'APT', skill: 'Advanced', attacks: 480, flag: '🇸🇬' },
  { city: 'Taipei', country: 'Taiwan', lat: 25.0330, lng: 121.5654, type: 'SQLi', skill: 'Advanced', attacks: 180, flag: '🇹🇼' },
  { city: 'Hanoi', country: 'Vietnam', lat: 21.0285, lng: 105.8542, type: 'DDoS', skill: 'Intermediate', attacks: 115, flag: '🇻🇳' },
  { city: 'Colombo', country: 'Sri Lanka', lat: 6.9271, lng: 79.8612, type: 'Phishing', skill: 'Script Kiddie', attacks: 40, flag: '🇱🇰' },
  { city: 'Kathmandu', country: 'Nepal', lat: 27.7172, lng: 85.3240, type: 'SQLi', skill: 'Script Kiddie', attacks: 25, flag: '🇳🇵' },
  { city: 'Kabul', country: 'Afghanistan', lat: 34.5553, lng: 69.2075, type: 'Malware', skill: 'Intermediate', attacks: 130, flag: '🇦🇫' },
  { city: 'Baghdad', country: 'Iraq', lat: 33.3152, lng: 44.3661, type: 'DDoS', skill: 'Advanced', attacks: 185, flag: '🇮🇶' },
  { city: 'Accra', country: 'Ghana', lat: 5.6037, lng: -0.1870, type: 'Phishing', skill: 'Script Kiddie', attacks: 55, flag: '🇬🇭' },
  { city: 'Casablanca', country: 'Morocco', lat: 33.5731, lng: -7.5898, type: 'SQLi', skill: 'Script Kiddie', attacks: 90, flag: '🇲🇦' },
  { city: 'Algiers', country: 'Algeria', lat: 36.7372, lng: 3.0865, type: 'XSS', skill: 'Intermediate', attacks: 75, flag: '🇩🇿' },
  { city: 'Tunis', country: 'Tunisia', lat: 36.8065, lng: 10.1815, type: 'DDoS', skill: 'Script Kiddie', attacks: 45, flag: '🇹🇳' },
  { city: 'Kinshasa', country: 'Congo', lat: -4.3217, lng: 15.3222, type: 'Malware', skill: 'Script Kiddie', attacks: 35, flag: '🇨🇩' },
  { city: 'Addis Ababa', country: 'Ethiopia', lat: 9.0320, lng: 38.7469, type: 'Phishing', skill: 'Script Kiddie', attacks: 30, flag: '🇪🇹' },
  { city: 'Yangon', country: 'Myanmar', lat: 16.8661, lng: 96.1951, type: 'SQLi', skill: 'Intermediate', attacks: 110, flag: '🇲🇲' },
  { city: 'Tashkent', country: 'Uzbekistan', lat: 41.2995, lng: 69.2401, type: 'Malware', skill: 'Advanced', attacks: 85, flag: '🇺🇿' },
  { city: 'Baku', country: 'Azerbaijan', lat: 40.4093, lng: 49.8671, type: 'SQLi', skill: 'Intermediate', attacks: 95, flag: '🇦🇿' },
  { city: 'Minsk', country: 'Belarus', lat: 53.9045, lng: 27.5615, type: 'APT', skill: 'Nation State', attacks: 320, flag: '🇧🇾' }
];

const TARGET_COORDS: [number, number] = [20, 0];

export default function AnalyticsPage() {
  const [map, setMap] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [skillFilter, setSkillLevel] = useState('ALL');
  const [isSimulating, setIsSimulating] = useState(true);
  const [totalAttacks, setTotalAttacks] = useState(124500);
  const [liveRateData, setLiveRateData] = useState<any[]>(Array.from({ length: 20 }, (_, i) => ({ time: i, value: 40 + Math.random() * 20 })));
  const mapRef = useRef<any>(null);
  const markerGroupRef = useRef<any>(null);
  const arcGroupRef = useRef<any>(null);

  // --- LEAFLET INITIALIZATION ---

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Load Leaflet Assets
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);

    const clusterLink = document.createElement('link');
    clusterLink.rel = 'stylesheet';
    clusterLink.href = 'https://unpkg.com/leaflet.markercluster@1.4.1/dist/MarkerCluster.css';
    document.head.appendChild(clusterLink);

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = () => {
      const clusterScript = document.createElement('script');
      clusterScript.src = 'https://unpkg.com/leaflet.markercluster@1.4.1/dist/leaflet.markercluster.js';
      clusterScript.onload = () => initMap();
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
      maxZoom: 18,
      zoomControl: false,
      attributionControl: false
    });

    L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}.png').addTo(mapRef.current);
    
    // Custom Zoom Controls
    L.control.zoom({ position: 'topright' }).addTo(mapRef.current);

    markerGroupRef.current = L.markerClusterGroup({
      showCoverageOnHover: false,
      iconCreateFunction: (cluster: any) => {
        return L.divIcon({
          html: `<div class="custom-cluster">${cluster.getChildCount()}</div>`,
          className: 'cluster-wrapper',
          iconSize: L.point(40, 40)
        });
      }
    });

    arcGroupRef.current = L.layerGroup().addTo(mapRef.current);
    mapRef.current.addLayer(markerGroupRef.current);

    updateMap();
    setMap(mapRef.current);
  };

  const updateMap = () => {
    const L = (window as any).L;
    if (!L || !mapRef.current) return;

    markerGroupRef.current.clearLayers();
    arcGroupRef.current.clearLayers();

    const filtered = ATTACKER_DATA.filter(node => {
      const matchesSearch = node.city.toLowerCase().includes(search.toLowerCase()) || node.country.toLowerCase().includes(search.toLowerCase());
      const matchesType = activeFilters.length === 0 || activeFilters.includes(node.type);
      const matchesSkill = skillFilter === 'ALL' || node.skill === skillFilter;
      return matchesSearch && matchesType && matchesSkill;
    });

    filtered.forEach(node => {
      const color = ATTACK_COLORS[node.type];
      const size = Math.max(10, Math.min(30, 8 + (node.attacks / 100)));

      // Pulsing Marker
      const icon = L.divIcon({
        className: 'custom-ping-marker',
        html: `
          <div class="marker-dot" style="background: ${color}; width: ${size}px; height: ${size}px; box-shadow: 0 0 15px ${color};"></div>
          <div class="marker-pulse" style="border-color: ${color}"></div>
          <div class="marker-pulse pulse-delay" style="border-color: ${color}"></div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20]
      });

      const marker = L.marker([node.lat, node.lng], { icon });

      const popupHtml = `
        <div class="dark-popup">
          <div class="popup-header" style="border-bottom: 2px solid ${color}">
            <p class="city">${node.flag} ${node.city}</p>
            <p class="country">${node.country}</p>
          </div>
          <div class="popup-body">
            <div class="stat-row"><span>Type:</span> <span style="color: ${color}">${node.type}</span></div>
            <div class="stat-row"><span>Skill:</span> <span style="color: ${SKILL_COLORS[node.skill]}">${node.skill}</span></div>
            <div class="stat-row"><span>Threat:</span> <span class="threat-num">${Math.floor(Math.random() * 20) + 75}%</span></div>
            <div class="stat-row"><span>Volume:</span> <span>${node.attacks.toLocaleString()}</span></div>
            <div class="coords">LOC: ${node.lat.toFixed(2)}, ${node.lng.toFixed(2)}</div>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml, { className: 'custom-leaflet-popup' });
      markerGroupRef.current.addLayer(marker);

      // Arc Paths
      const path = getArcPath([node.lat, node.lng], TARGET_COORDS);
      const arc = L.polyline(path, {
        color: color,
        weight: 1.5,
        opacity: 0.7,
        dashArray: '10, 10',
        className: 'animated-arc'
      });
      arcGroupRef.current.addLayer(arc);
    });

    // Country Heat Overlay (Simplified logic)
    const hotZones = ['Russia', 'China', 'North Korea', 'Iran'];
    ATTACKER_DATA.filter(n => hotZones.includes(n.country)).forEach(n => {
      L.circleMarker([n.lat, n.lng], {
        radius: 40,
        fillColor: '#ef4444',
        fillOpacity: 0.05,
        stroke: false
      }).addTo(arcGroupRef.current);
    });
  };

  const getArcPath = (start: [number, number], end: [number, number]) => {
    const points = [];
    const segments = 30;
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const lat = start[0] + (end[0] - start[0]) * t;
      const lng = start[1] + (end[1] - start[1]) * t;
      // Add "altitude" for curve
      const offset = Math.sin(t * Math.PI) * 10;
      points.push([lat + offset, lng]);
    }
    return points;
  };

  useEffect(() => {
    if (map) updateMap();
  }, [search, activeFilters, skillFilter]);

  // --- SIMULATION & KPI LOGIC ---

  useEffect(() => {
    if (!isSimulating) return;
    const interval = setInterval(() => {
      setTotalAttacks(prev => prev + Math.floor(Math.random() * 5) + 1);
      setLiveRateData(prev => {
        const next = [...prev.slice(1), { time: prev[prev.length - 1].time + 1, value: 40 + Math.random() * 30 }];
        return next;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, [isSimulating]);

  const stats = useMemo(() => ({
    requests: 2845920 + (totalAttacks * 20),
    blocks: totalAttacks,
    fpRate: '0.04%',
    latency: '5.2ms'
  }), [totalAttacks]);

  // --- RECHARTS DATA ---

  const timelineData = Array.from({ length: 24 }, (_, i) => ({
    hour: `${i}:00`,
    attacks: 400 + Math.random() * 600,
    sqli: 100 + Math.random() * 200,
    xss: 80 + Math.random() * 150
  }));

  const typeDistribution = Object.entries(ATTACK_COLORS).map(([name, fill]) => ({
    name, fill, value: 1000 + Math.random() * 5000
  }));

  const countryData = ATTACKER_DATA.sort((a, b) => b.attacks - a.attacks).slice(0, 15).map(c => ({
    name: `${c.flag} ${c.country}`,
    attacks: c.attacks,
    fill: ATTACK_COLORS[c.type]
  }));

  const skillData = [
    { name: 'Script Kiddie', value: 45, fill: '#f97316' },
    { name: 'Intermediate', value: 25, fill: '#ef4444' },
    { name: 'Advanced', value: 20, fill: '#7e22ce' },
    { name: 'Nation State', value: 10, fill: '#1e1b4b' },
  ];

  const successData = Array.from({ length: 12 }, (_, i) => ({
    time: `${i * 2}:00`,
    blocked: 80 + Math.random() * 20,
    suspicious: 10 + Math.random() * 10,
    safe: 5 + Math.random() * 5
  }));

  // --- UI ACTIONS ---

  const handleSearch = (val: string) => {
    setSearch(val);
    if (!map) return;
    const match = ATTACKER_DATA.find(n => n.city.toLowerCase() === val.toLowerCase() || n.country.toLowerCase() === val.toLowerCase());
    if (match) {
      map.flyTo([match.lat, match.lng], 6, { duration: 2 });
    }
  };

  const toggleFilter = (type: string) => {
    setActiveFilters(prev => prev.includes(type) ? prev.filter(f => f !== type) : [...prev, type]);
  };

  const resetAll = () => {
    setSearch('');
    setActiveFilters([]);
    setSkillLevel('ALL');
    if (map) map.flyTo([20, 0], 2, { duration: 1.5 });
  };

  return (
    <div className="container mx-auto py-12 px-6 max-w-7xl space-y-12 animate-in fade-in duration-1000 bg-[#020408] min-h-screen">
      
      {/* Header: KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Requests Processed', val: stats.requests.toLocaleString(), icon: Globe, color: 'text-cyan-500', bg: 'bg-cyan-500/5' },
          { label: 'Threats Neutralized', val: stats.blocks.toLocaleString(), icon: ShieldAlert, color: 'text-destructive', bg: 'bg-destructive/5' },
          { label: 'False Positive rate', val: stats.fpRate, icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-500/5' },
          { label: 'Avg Inference Time', val: stats.latency, icon: Clock, color: 'text-emerald-500', bg: 'bg-emerald-500/5' },
        ].map((kpi, i) => (
          <Card key={i} className="glass-card rounded-[2rem] border-white/5 p-6 overflow-hidden relative group">
            <div className={`absolute top-0 left-0 w-1 h-full ${kpi.color.replace('text-', 'bg-')}`} />
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-2xl ${kpi.bg} ${kpi.color}`}>
                <kpi.icon className="h-5 w-5" />
              </div>
              <div className="w-16 h-8 opacity-40 group-hover:opacity-100 transition-opacity">
                 <ResponsiveContainer width="100%" height="100%">
                   <LineChart data={Array.from({ length: 10 }, () => ({ v: Math.random() }))}>
                      <Line type="monotone" dataKey="v" stroke="currentColor" className={kpi.color} strokeWidth={2} dot={false} />
                   </LineChart>
                 </ResponsiveContainer>
              </div>
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60">{kpi.label}</p>
            <p className={cn("text-2xl font-black tracking-tighter mt-1", kpi.color)}>{kpi.val}</p>
          </Card>
        ))}
      </div>

      {/* Map Control Panel */}
      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row justify-between items-center gap-6 p-6 bg-white/[0.02] border border-white/5 rounded-[2.5rem] backdrop-blur-xl">
          <div className="relative w-full lg:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground opacity-40" />
            <Input 
              placeholder="Search Host Origin..." 
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="h-12 pl-12 bg-black/40 border-white/10 rounded-xl focus-visible:ring-destructive font-mono text-xs text-white"
            />
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-2">
            {Object.keys(ATTACK_COLORS).map(type => (
              <button 
                key={type}
                onClick={() => toggleFilter(type)}
                className={cn(
                  "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border",
                  activeFilters.includes(type) 
                    ? `bg-black/60 border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.1)]` 
                    : "bg-white/5 border-white/5 text-muted-foreground hover:bg-white/10"
                )}
                style={activeFilters.includes(type) ? { color: ATTACK_COLORS[type], borderColor: ATTACK_COLORS[type] } : {}}
              >
                {type}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4">
             <select 
              value={skillFilter} 
              onChange={(e) => setSkillLevel(e.target.value)}
              className="h-12 px-6 bg-black/40 border border-white/10 rounded-xl text-[10px] font-black uppercase text-white outline-none focus:border-destructive"
             >
                <option value="ALL">ALL SKILL LEVELS</option>
                {Object.keys(SKILL_COLORS).map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
             </select>
             <Button variant="ghost" size="icon" onClick={resetAll} className="h-12 w-12 rounded-xl border border-white/10 hover:bg-destructive/10 hover:text-destructive">
                <RotateCcw className="h-5 w-5" />
             </Button>
          </div>
        </div>

        {/* Map Container */}
        <Card className="glass-card rounded-[3rem] border-white/5 overflow-hidden relative shadow-2xl">
          <div className="absolute top-8 left-10 z-[1000] pointer-events-none space-y-2">
             <div className="flex items-center gap-3">
                <div className="h-3 w-3 rounded-full bg-destructive animate-ping" />
                <h2 className="text-xl font-black uppercase tracking-tighter text-white">Global Neural Ingress</h2>
             </div>
             <Badge variant="outline" className="bg-destructive/10 border-destructive/30 text-destructive font-mono text-[9px] px-3 py-1">
                EDGE_NODE_ALPHA_92 ACTIVE
             </Badge>
          </div>

          <div className="absolute top-8 right-10 z-[1000] flex gap-3">
             <Button 
                variant="outline" 
                onClick={() => setIsSimulating(!isSimulating)}
                className={cn("h-12 px-8 rounded-xl font-black uppercase text-[10px] tracking-widest backdrop-blur-xl border-white/10", isSimulating ? "bg-emerald-500/10 text-emerald-500" : "bg-destructive/10 text-destructive")}
             >
               {isSimulating ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
               {isSimulating ? "Simulation Live" : "Feed Static"}
             </Button>
          </div>

          <div id="threat-map" className="w-full h-[550px] bg-[#050505]"></div>

          {/* Map Footer Stats */}
          <div className="bg-black/60 backdrop-blur-3xl border-t border-white/5 px-10 py-6 grid grid-cols-2 md:grid-cols-5 gap-8">
             <div className="space-y-1">
                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-50">Total Attacks</p>
                <p className="text-2xl font-black text-destructive tracking-tighter tabular-nums glow-text-red">{totalAttacks.toLocaleString()}</p>
             </div>
             <div className="space-y-1">
                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-50">Affected Regions</p>
                <p className="text-2xl font-black text-white tracking-tighter">42</p>
             </div>
             <div className="space-y-1 md:col-span-1">
                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-50">Most Active Threat</p>
                <p className="text-sm font-black text-amber-500 uppercase tracking-tighter truncate">Moscow / SQL Injection</p>
             </div>
             <div className="space-y-1">
                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-50">Threat Level</p>
                <Badge variant="destructive" className="bg-destructive/20 border-destructive/40 text-destructive text-[10px] font-black px-3">CRITICAL</Badge>
             </div>
             <div className="space-y-1">
                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-50">Packets/Min</p>
                <p className="text-2xl font-black text-emerald-500 tracking-tighter tabular-nums">482.4k</p>
             </div>
          </div>
        </Card>
      </div>

      {/* Analytics Graphs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pt-10">
        
        {/* Graph 1: Timeline */}
        <Card className="lg:col-span-2 glass-card p-10 rounded-[3rem] border-white/5 space-y-8">
          <div className="flex justify-between items-center">
            <h3 className="section-label mb-0 pl-0 border-none">Global Attack Timeline — Last 24 Hours</h3>
            <div className="flex items-center gap-3">
               <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
               <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Live Telemetry</span>
            </div>
          </div>
          <div className="h-[400px]">
             <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timelineData}>
                  <defs>
                    <linearGradient id="areaGlow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                  <XAxis dataKey="hour" stroke="#ffffff30" fontSize={10} axisLine={false} tickLine={false} />
                  <YAxis stroke="#ffffff30" fontSize={10} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ background: '#0a0c14', border: '1px solid #ffffff10', borderRadius: '12px' }}
                    itemStyle={{ fontSize: '10px', fontWeight: 'bold' }}
                  />
                  <Area type="monotone" dataKey="attacks" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#areaGlow)" animationDuration={2000} />
                </AreaChart>
             </ResponsiveContainer>
          </div>
        </Card>

        {/* Graph 2: Distribution */}
        <Card className="glass-card p-10 rounded-[3rem] border-white/5 space-y-8">
           <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-4">Attack Vector Distribution</h3>
           <div className="h-[350px] relative">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart cx="50%" cy="50%" innerRadius="10%" outerRadius="100%" barSize={15} data={typeDistribution}>
                  <RadialBar background dataKey="value" cornerRadius={10} />
                  <Tooltip 
                    contentStyle={{ background: '#0a0c14', border: '1px solid #ffffff10', borderRadius: '12px' }}
                  />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                 <p className="text-3xl font-black text-white tracking-tighter">124k</p>
                 <p className="text-[8px] font-bold uppercase text-muted-foreground tracking-widest">Total Samples</p>
              </div>
           </div>
        </Card>

        {/* Graph 3: Country Bar */}
        <Card className="glass-card p-10 rounded-[3rem] border-white/5 space-y-8">
           <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-4">Threat Intensity by Country</h3>
           <div className="h-[350px]">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={countryData} layout="vertical">
                 <XAxis type="number" hide />
                 <YAxis dataKey="name" type="category" stroke="#ffffff30" fontSize={10} width={100} axisLine={false} tickLine={false} />
                 <Tooltip 
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{ background: '#0a0c14', border: '1px solid #ffffff10', borderRadius: '12px' }}
                 />
                 <Bar dataKey="attacks" radius={[0, 10, 10, 0]} animationBegin={500}>
                    {countryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} fillOpacity={0.8} />
                    ))}
                 </Bar>
               </BarChart>
             </ResponsiveContainer>
           </div>
        </Card>

        {/* Graph 4: Skill Donut */}
        <Card className="glass-card p-10 rounded-[3rem] border-white/5 space-y-8">
           <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-4">Attacker Sophistication Profile</h3>
           <div className="h-[300px] relative">
              <ResponsiveContainer width="100%" height="100%">
                 <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%" barSize={25} data={skillData}>
                    <RadialBar background dataKey="value" cornerRadius={15} />
                    <Legend iconSize={10} layout="vertical" verticalAlign="middle" align="right" />
                 </RadialBarChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pr-32">
                 <p className="text-xl font-black text-white tracking-tighter uppercase italic">Script Kiddie</p>
                 <p className="text-[8px] font-bold uppercase text-muted-foreground tracking-widest">Dominant Layer</p>
              </div>
           </div>
        </Card>

        {/* Graph 5: Live Feed */}
        <Card className="glass-card p-10 rounded-[3rem] border-white/5 space-y-8">
           <div className="flex justify-between items-center">
             <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Real-Time Ingress Velocity</h3>
             <Badge variant="outline" className="text-emerald-500 border-emerald-500/20 font-mono text-[9px]">482.4 kbps</Badge>
           </div>
           <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={liveRateData}>
                    <defs>
                       <linearGradient id="liveRed" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                       </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                    <Area type="stepAfter" dataKey="value" stroke="#ef4444" strokeWidth={2} fill="url(#liveRed)" isAnimationActive={false} />
                 </AreaChart>
              </ResponsiveContainer>
           </div>
        </Card>

        {/* Graph 6: Success vs Block */}
        <Card className="lg:col-span-2 glass-card p-10 rounded-[3rem] border-white/5 space-y-8">
           <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Neutralization Efficacy — System-Wide</h3>
           <div className="h-[350px]">
             <ResponsiveContainer width="100%" height="100%">
                <BarChart data={successData}>
                   <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                   <XAxis dataKey="time" stroke="#ffffff30" fontSize={10} axisLine={false} tickLine={false} />
                   <YAxis stroke="#ffffff30" fontSize={10} axisLine={false} tickLine={false} />
                   <Tooltip contentStyle={{ background: '#0a0c14', border: '1px solid #ffffff10', borderRadius: '12px' }} />
                   <Bar dataKey="blocked" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} />
                   <Bar dataKey="suspicious" stackId="a" fill="#d946ef" />
                   <Bar dataKey="safe" stackId="a" fill="#22c55e" radius={[0, 0, 4, 4]} />
                </BarChart>
             </ResponsiveContainer>
           </div>
        </Card>

      </div>

      <style jsx global>{`
        .glass-card { background: rgba(15, 17, 30, 0.85); backdrop-filter: blur(20px); transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
        .glass-card:hover { border-color: rgba(239, 68, 68, 0.2); box-shadow: 0 0 40px rgba(239, 68, 68, 0.05); }
        .glow-text-red { text-shadow: 0 0 15px rgba(239, 68, 68, 0.6); }
        
        /* Map Styles */
        .leaflet-container { background: #020408 !important; }
        .custom-ping-marker { display: flex; align-items: center; justify-content: center; }
        .marker-dot { border-radius: 50%; z-index: 2; position: relative; }
        .marker-pulse { position: absolute; border: 2px solid; border-radius: 50%; width: 100%; height: 100%; animation: marker-ping 3s infinite cubic-bezier(0, 0, 0.2, 1); opacity: 0; }
        .pulse-delay { animation-delay: 1s; }
        @keyframes marker-ping { 0% { transform: scale(0.5); opacity: 0.8; } 100% { transform: scale(3.5); opacity: 0; } }
        
        .animated-arc { stroke-dasharray: 8, 8; animation: arc-flow 30s linear infinite; }
        @keyframes arc-flow { to { stroke-dashoffset: -1000; } }

        /* Cluster Styles */
        .custom-cluster { width: 40px; height: 40px; background: rgba(239, 68, 68, 0.1); border: 2px solid #ef4444; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #ef4444; font-weight: 900; font-family: 'JetBrains Mono', monospace; backdrop-filter: blur(8px); box-shadow: 0 0 15px rgba(239, 68, 68, 0.3); }

        /* Popup Overrides */
        .custom-leaflet-popup .leaflet-popup-content-wrapper { background: #0a0c14 !important; color: #fff !important; border: 1px solid rgba(255,255,255,0.1) !important; border-radius: 16px !important; padding: 0 !important; }
        .custom-leaflet-popup .leaflet-popup-tip { background: #0a0c14 !important; }
        .dark-popup { padding: 16px; min-width: 200px; }
        .popup-header { padding-bottom: 8px; margin-bottom: 12px; }
        .popup-header .city { font-weight: 900; font-size: 16px; margin: 0; }
        .popup-header .country { font-size: 10px; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 2px; }
        .popup-body .stat-row { display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 6px; }
        .popup-body .stat-row span:first-child { color: rgba(255,255,255,0.3); font-weight: bold; text-transform: uppercase; }
        .popup-body .threat-num { font-weight: 900; font-family: 'JetBrains Mono', monospace; }
        .popup-body .coords { font-size: 9px; font-family: 'JetBrains Mono', monospace; color: rgba(255,255,255,0.1); margin-top: 10px; text-align: center; }

        /* Scrollbars */
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(239, 68, 68, 0.3); border-radius: 10px; }
      `}</style>
    </div>
  );
}

