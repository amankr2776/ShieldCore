"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { Shield, ShieldAlert, Zap, Users, ArrowUpRight, BarChart3 } from 'lucide-react';
import { generateFakeRequest, FAKE_IPS, ATTACK_TYPES } from '@/lib/mock-data';

export default function AnalyticsPage() {
  const [trafficData, setTrafficData] = useState<any[]>([]);
  const [attackDistData, setAttackDistData] = useState<any[]>([]);
  const [timelineData, setTimelineData] = useState<any[]>([]);
  const [topIps, setTopIps] = useState<any[]>([]);
  const [kpis, setKpis] = useState({
    total: 0,
    blocked: 0,
    rate: 0,
    avgInference: 0
  });

  // Initialize data
  useEffect(() => {
    // Generate some seed data
    const initialTraffic = [
      { name: 'Safe', value: 70, color: '#22c55e' },
      { name: 'Blocked', value: 20, color: '#ef4444' },
      { name: 'Suspicious', value: 10, color: '#f59e0b' }
    ];
    setTrafficData(initialTraffic);

    const initialAttackDist = ATTACK_TYPES.map(type => ({
      name: type,
      count: Math.floor(Math.random() * 50) + 10
    }));
    setAttackDistData(initialAttackDist);

    const initialTimeline = Array.from({ length: 60 }, (_, i) => ({
      time: `${i}m`,
      blocked: Math.floor(Math.random() * 5)
    }));
    setTimelineData(initialTimeline);

    const initialTopIps = FAKE_IPS.slice(0, 5).map(ip => ({
      ip,
      total: Math.floor(Math.random() * 100) + 50,
      blocked: Math.floor(Math.random() * 40) + 5,
      mostCommon: ATTACK_TYPES[Math.floor(Math.random() * ATTACK_TYPES.length)]
    })).sort((a, b) => b.blocked - a.blocked);
    setTopIps(initialTopIps);
  }, []);

  // Update loop
  useEffect(() => {
    const interval = setInterval(() => {
      const req = generateFakeRequest();
      
      setKpis(prev => {
        const newTotal = prev.total + 1;
        const newBlocked = prev.blocked + (req.decision === 'BLOCKED' ? 1 : 0);
        return {
          total: newTotal,
          blocked: newBlocked,
          rate: Math.round((newBlocked / newTotal) * 100),
          avgInference: parseFloat(((prev.avgInference * prev.total + req.inferenceTime) / newTotal).toFixed(2)) || req.inferenceTime
        };
      });

      setTrafficData(prev => prev.map(item => {
        if (item.name === 'Safe' && req.decision === 'SAFE') return { ...item, value: item.value + 1 };
        if (item.name === 'Blocked' && req.decision === 'BLOCKED') return { ...item, value: item.value + 1 };
        if (item.name === 'Suspicious' && req.decision === 'SUSPICIOUS') return { ...item, value: item.value + 1 };
        return item;
      }));

      if (req.decision === 'BLOCKED') {
        setAttackDistData(prev => prev.map(item => 
          item.name === req.attackType ? { ...item, count: item.count + 1 } : item
        ));
        
        setTimelineData(prev => {
          const newData = [...prev];
          newData[newData.length - 1].blocked += 1;
          return newData;
        });
      }
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="container mx-auto py-6 px-6 max-w-7xl space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Comprehensive overview of traffic patterns and security metrics.</p>
        </div>
        <div className="hidden md:flex items-center gap-2 bg-accent/10 px-4 py-2 rounded-full border border-accent/20">
          <Zap className="h-4 w-4 text-accent" />
          <span className="text-xs font-bold text-accent uppercase tracking-tighter">Real-time Analysis Active</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Requests', value: kpis.total || '0', icon: BarChart3, color: 'text-primary' },
          { label: 'Total Blocked', value: kpis.blocked || '0', icon: ShieldAlert, color: 'text-destructive' },
          { label: 'Detection Rate', value: `${kpis.rate}%` || '0%', icon: Shield, color: 'text-accent' },
          { label: 'Avg Latency', value: `${kpis.avgInference}ms` || '0ms', icon: ArrowUpRight, color: 'text-emerald-500' }
        ].map((kpi, i) => (
          <Card key={i} className="border-border bg-card">
            <CardContent className="p-6 flex justify-between items-center">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase">{kpi.label}</p>
                <p className="text-2xl font-bold">{kpi.value}</p>
              </div>
              <div className={`p-3 bg-secondary rounded-lg ${kpi.color}`}>
                <kpi.icon className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Row 1: Traffic & Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Traffic Breakdown</CardTitle>
            <CardDescription>Security classification of all incoming requests</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={trafficData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {trafficData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a1d2e', borderColor: '#2a2d3e', borderRadius: '8px' }}
                />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Attack Type Distribution</CardTitle>
            <CardDescription>Detected vulnerabilities by category</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attackDistData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#2a2d3e" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{ fill: '#2a2d3e' }}
                  contentStyle={{ backgroundColor: '#1a1d2e', borderColor: '#2a2d3e', borderRadius: '8px' }}
                />
                <Bar dataKey="count" fill="#3962AC" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Row 2: Timeline */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Blocked Requests Per Minute</CardTitle>
          <CardDescription>Temporal analysis of active security threats</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={timelineData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#2a2d3e" />
              <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} hide />
              <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1a1d2e', borderColor: '#2a2d3e', borderRadius: '8px' }}
              />
              <Line type="monotone" dataKey="blocked" stroke="#ef4444" strokeWidth={2} dot={false} animationDuration={300} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Row 3: Top IPs */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-accent" />
            <CardTitle>Top Attacker IPs</CardTitle>
          </div>
          <CardDescription>Identifying persistent sources of malicious activity</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-border/50">
                <TableHead>IP Address</TableHead>
                <TableHead className="text-right">Total Requests</TableHead>
                <TableHead className="text-right">Blocked</TableHead>
                <TableHead>Primary Attack Vector</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topIps.map((ipData, i) => (
                <TableRow key={i} className="border-border/30">
                  <TableCell className="font-mono font-bold text-accent">{ipData.ip}</TableCell>
                  <TableCell className="text-right font-mono">{ipData.total}</TableCell>
                  <TableCell className="text-right font-mono font-bold text-destructive">{ipData.blocked}</TableCell>
                  <TableCell>
                    <span className="px-2 py-0.5 rounded-full bg-secondary text-[10px] font-bold uppercase tracking-wider">
                      {ipData.mostCommon}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}