"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Shield, Zap, Database, Server, Cpu, Globe, ArrowRight, MessageSquare, Code2, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ArchitecturePage() {
  const steps = [
    { name: "User / Browser", tech: "HTTP Request", icon: Globe, desc: "Source of incoming traffic payloads" },
    { name: "React Dashboard", tech: "Next.js + Tailwind", icon: Zap, desc: "Real-time visualization and control" },
    { name: "Analysis Engine", tech: "Genkit Flow", icon: Server, desc: "Multi-stage decoding & model orchestration" },
    { name: "Decode Layer", tech: "URL + B64 + Unicode", icon: Code2, desc: "Normalization and de-obfuscation" },
    { name: "Inference Model", tech: "DistilBERT (Mocked)", icon: Cpu, desc: "Semantic threat classification" },
    { name: "Data Persistence", tech: "SQLite", icon: Database, desc: "Storage of security logs and stats" },
    { name: "Event Stream", tech: "Simulated WebSockets", icon: MessageSquare, desc: "Live dashboard synchronization" }
  ];

  const stack = [
    { layer: "Frontend", tech: "Next.js, Tailwind CSS, Shadcn UI", purpose: "Modern UI and real-time interactive dashboard" },
    { layer: "Charting", tech: "Recharts", purpose: "Data-driven analytics visualizations" },
    { layer: "Real-time", tech: "React Hooks / Interval Simulator", purpose: "Live WebSocket-like traffic feed simulation" },
    { layer: "Backend Logic", tech: "Next.js Server Actions + Genkit", purpose: "Secure API endpoints and ML pipeline integration" },
    { layer: "ML Model", tech: "DistilBERT (Simulated Logic)", purpose: "High-performance semantic classification" },
    { layer: "Preprocessing", tech: "URL/Base64/Unicode Pipeline", purpose: "Normalization for accurate threat detection" },
    { layer: "Database", tech: "SQLite (Mocked Context)", purpose: "Long-term attack log storage" },
    { layer: "Security", tech: "OWASP Mapping", purpose: "Standardized threat categorization" }
  ];

  return (
    <div className="container mx-auto py-10 px-6 max-w-7xl space-y-12 animate-in fade-in duration-500">
      <div className="text-center space-y-2 max-w-2xl mx-auto">
        <h1 className="text-4xl font-extrabold tracking-tight">System Architecture</h1>
        <p className="text-muted-foreground">The FusionX WAF pipeline processes requests through several advanced layers to ensure robust protection against web-based attacks.</p>
      </div>

      {/* Pipeline Diagram */}
      <div className="relative">
        <div className="hidden lg:flex absolute top-1/2 left-0 w-full h-0.5 bg-accent/20 -translate-y-1/2 -z-10" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4 lg:gap-2">
          {steps.map((step, i) => (
            <div key={i} className="flex flex-col items-center">
              <Card className="w-full border-accent/20 hover:border-accent transition-colors bg-card shadow-lg flex flex-col items-center p-4 text-center h-full">
                <div className="p-3 bg-accent/10 rounded-full mb-3">
                  <step.icon className="h-6 w-6 text-accent" />
                </div>
                <h3 className="font-bold text-sm mb-1">{step.name}</h3>
                <p className="text-[10px] font-mono text-accent mb-2">{step.tech}</p>
                <p className="text-[10px] text-muted-foreground leading-relaxed">{step.desc}</p>
              </Card>
              {i < steps.length - 1 && (
                <div className="lg:hidden flex justify-center py-2">
                  <ArrowRight className="h-4 w-4 text-muted-foreground rotate-90 lg:rotate-0" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Tech Stack Table */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 border-l-4 border-accent pl-4">
          <Search className="h-6 w-6 text-accent" />
          <h2 className="text-2xl font-bold">Technology Stack Details</h2>
        </div>
        
        <Card className="border-border bg-card overflow-hidden">
          <Table>
            <TableHeader className="bg-secondary/30">
              <TableRow className="border-border/50">
                <TableHead className="w-[200px] uppercase text-xs font-bold tracking-widest">Layer</TableHead>
                <TableHead className="w-[300px] uppercase text-xs font-bold tracking-widest">Technology</TableHead>
                <TableHead className="uppercase text-xs font-bold tracking-widest">Purpose</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stack.map((item, i) => (
                <TableRow key={i} className="border-border/30 hover:bg-secondary/10 transition-colors">
                  <TableCell className="font-bold text-accent">{item.layer}</TableCell>
                  <TableCell className="font-mono text-sm">{item.tech}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{item.purpose}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>

      {/* Security Principles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-card border-border">
          <CardHeader>
            <Shield className="h-8 w-8 text-destructive mb-2" />
            <CardTitle>Semantic Analysis</CardTitle>
            <CardDescription>Beyond simple regex, our engine understands the context of characters within code-like payloads.</CardDescription>
          </CardHeader>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader>
            <Zap className="h-8 w-8 text-accent mb-2" />
            <CardTitle>Zero Latency</CardTitle>
            <CardDescription>Optimized preprocessing and quantized model weights ensure sub-15ms decision times.</CardDescription>
          </CardHeader>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader>
            <ArrowRight className="h-8 w-8 text-emerald-500 mb-2" />
            <CardTitle>Transparent Explainability</CardTitle>
            <CardDescription>Every block is accompanied by an AI-generated explanation and OWASP mapping.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}