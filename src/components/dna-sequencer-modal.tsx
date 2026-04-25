
"use client";

import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { 
  Dna, Fingerprint, ShieldAlert, X, Database, 
  Zap, Info, Activity, AlertTriangle, Search,
  CheckCircle2, Globe, Shield, Download,
  TrendingUp, User, Target, ShieldCheck, Share2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Genome {
  id: string;
  sequence: string;
  type: string;
  timestamp: string;
  attributes?: Record<string, any>;
}

interface DNASequencerModalProps {
  attack: any;
  isOpen: boolean;
  onClose: () => void;
  genomeDatabase: Genome[];
  onSave: (genome: Genome) => void;
}

const ATTRIBUTE_METADATA = [
  { id: 'attack_class', label: 'Attack Class', short: 'CLS', color: '#ef4444' },
  { id: 'encoding_count', label: 'Encoding Layers', short: 'ENC', color: '#84cc16' },
  { id: 'obfuscation_depth', label: 'Obfuscation Depth', short: 'OBF', color: '#d946ef' },
  { id: 'payload_length', label: 'Payload Length', short: 'LEN', color: '#3b82f6' },
  { id: 'target_param', label: 'Target Param Type', short: 'TRG', color: '#06b6d4' },
  { id: 'injection_point', label: 'Injection Point', short: 'INJ', color: '#f59e0b' },
  { id: 'evasion_technique', label: 'Evasion Technique', short: 'EVA', color: '#8b5cf6' },
  { id: 'tool_signature', label: 'Tool Signature', short: 'SIG', color: '#f97316' },
  { id: 'request_method', label: 'Request Method', short: 'MET', color: '#10b981' },
  { id: 'header_anomalies', label: 'Header Anomalies', short: 'HDR', color: '#6366f1' },
  { id: 'cookie_manip', label: 'Cookie Manipulation', short: 'COK', color: '#ec4899' },
  { id: 'unicode_usage', label: 'Unicode Usage', short: 'UNI', color: '#14b8a6' },
  { id: 'double_encoding', label: 'Double Encoding', short: 'DBL', color: '#a855f7' },
  { id: 'case_variation', label: 'Case Variation', short: 'CAS', color: '#f43f5e' },
  { id: 'comment_injection', label: 'Comment Injection', short: 'CMT', color: '#fbbf24' },
  { id: 'whitespace_manip', label: 'Whitespace Manip', short: 'WHT', color: '#2dd4bf' },
  { id: 'keyword_splitting', label: 'Keyword Splitting', short: 'SPL', color: '#60a5fa' },
  { id: 'hex_encoding', label: 'Hex Encoding', short: 'HEX', color: '#fb7185' },
  { id: 'null_byte', label: 'Null Byte Injection', short: 'NUL', color: '#c084fc' },
  { id: 'time_delay', label: 'Time Delay Pattern', short: 'DLY', color: '#fb923c' },
  { id: 'boolean_logic', label: 'Boolean Logic Type', short: 'LOG', color: '#4ade80' },
  { id: 'union_clause', label: 'Union Clause', short: 'UNI', color: '#22d3ee' },
  { id: 'stacked_queries', label: 'Stacked Queries', short: 'STK', color: '#818cf8' },
  { id: 'oob_technique', label: 'Out-of-Band Tech', short: 'OOB', color: '#f472b6' },
];

export function DNASequencerModal({ attack, isOpen, onClose, genomeDatabase, onSave }: DNASequencerModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const [isAssembled, setIsAssembled] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [showSimilarity, setShowSimilarity] = useState(false);
  const [showPhylogeny, setShowPhylogeny] = useState(false);

  // Generate deterministic 24-point genome
  const genomeData = useMemo(() => {
    if (!attack) return null;
    const seed = attack.id.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
    
    const attributes: Record<string, any> = {};
    const sequenceParts: string[] = [];

    ATTRIBUTE_METADATA.forEach((meta, idx) => {
      const valSeed = (seed + idx) % 5;
      let val = '';
      switch(meta.id) {
        case 'attack_class': val = attack.attackType.substring(0, 3).toUpperCase(); break;
        case 'encoding_count': val = `${(valSeed % 3) + 1}L`; break;
        case 'obfuscation_depth': val = valSeed > 3 ? 'HIGH' : 'LOW'; break;
        case 'payload_length': val = attack.payload.length > 50 ? 'LG' : 'SM'; break;
        default: val = `${meta.short}${(valSeed % 9) + 1}`;
      }
      attributes[meta.id] = val;
      sequenceParts.push(val);
    });

    const sequence = sequenceParts.join('-');
    const hash = `SHIELD-${seed.toString(16).toUpperCase()}-${Math.random().toString(16).substring(2, 6).toUpperCase()}`;

    return { attributes, sequence, sequenceParts, hash };
  }, [attack]);

  // Mutation and Similarity Logic
  const analysis = useMemo(() => {
    if (!genomeData || !genomeDatabase.length) return { matches: [], status: 'ZERO_DAY', mutations: [] };
    
    const matches = genomeDatabase.map(g => {
      let diffs = 0;
      const currentParts = genomeData.sequenceParts;
      const targetParts = g.sequence.split('-');
      currentParts.forEach((part, i) => { if (part !== targetParts[i]) diffs++; });
      const percentage = ((currentParts.length - diffs) / currentParts.length) * 100;
      return { ...g, percentage, diffs };
    }).sort((a, b) => b.percentage - a.percentage);

    const bestMatch = matches[0];
    const mutations = [];
    if (bestMatch && bestMatch.percentage < 100) {
      const targetParts = bestMatch.sequence.split('-');
      genomeData.sequenceParts.forEach((part, i) => {
        if (part !== targetParts[i]) {
          mutations.push({
            attribute: ATTRIBUTE_METADATA[i].label,
            from: targetParts[i],
            to: part,
            idx: i
          });
        }
      });
    }

    let status = 'ZERO_DAY';
    if (bestMatch?.percentage > 85) status = 'CRITICAL';
    else if (bestMatch?.percentage > 60) status = 'PROBABLE';

    return { matches: matches.slice(0, 3), status, mutations, bestMatch };
  }, [genomeData, genomeDatabase]);

  // Intelligence Conclusions
  const intelligence = useMemo(() => {
    if (!genomeData) return null;
    const seed = attack.id.charCodeAt(0);
    const sophistication = Math.min(100, (seed % 40) + 50 + (analysis.mutations.length * 5));
    const novelty = Math.round(100 - (analysis.matches[0]?.percentage || 0));
    const experience = Math.floor(sophistication / 15) + 1;
    
    const objectives = ['Data Exfiltration', 'Credential Harvesting', 'System Sabotage', 'Privilege Escalation', 'Botnet Recruitment'];
    const objective = objectives[seed % objectives.length];
    
    const responses = ['Immediate IP Blacklist', 'Deploy Honeytoken', 'Enhanced Header Validation', 'Deep Packet Inspection Enable', 'Neural Behavioral Lock'];
    const response = responses[seed % responses.length];

    return { sophistication, novelty, experience, objective, response };
  }, [genomeData, analysis, attack]);

  // Three.js Helix Implementation
  useEffect(() => {
    if (!isOpen || !canvasRef.current || !genomeData) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
    camera.position.z = 22;

    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, alpha: true, antialias: true });
    renderer.setSize(400, 600);

    const group = new THREE.Group();
    scene.add(group);

    const basePairs: THREE.Group[] = [];
    const totalPairs = 24;
    const helixHeight = 16;

    for (let i = 0; i < totalPairs; i++) {
      const pairGroup = new THREE.Group();
      const angle = (i / totalPairs) * Math.PI * 6;
      const y = (i / totalPairs) * helixHeight - helixHeight / 2;
      const color = new THREE.Color(ATTRIBUTE_METADATA[i].color);

      // Varying geometries for base pairs
      const sphereGeo = new THREE.SphereGeometry(0.25, 16, 16);
      const boxGeo = new THREE.BoxGeometry(0.3, 0.3, 0.3);
      const torusGeo = new THREE.TorusGeometry(0.15, 0.05, 8, 16);
      
      const getGeo = (idx: number) => {
        if (idx % 3 === 0) return torusGeo;
        if (idx % 3 === 1) return boxGeo;
        return sphereGeo;
      };

      const m1 = new THREE.Mesh(getGeo(i), new THREE.MeshBasicMaterial({ color }));
      m1.position.set(Math.cos(angle) * 3, y, Math.sin(angle) * 3);
      
      const m2 = new THREE.Mesh(getGeo(i), new THREE.MeshBasicMaterial({ color }));
      m2.position.set(Math.cos(angle + Math.PI) * 3, y, Math.sin(angle + Math.PI) * 3);

      const rungGeo = new THREE.CylinderGeometry(0.06, 0.06, 6, 8);
      const rung = new THREE.Mesh(rungGeo, new THREE.MeshBasicMaterial({ 
        color, 
        transparent: true, 
        opacity: 0.2 
      }));
      rung.rotation.z = Math.PI / 2;
      rung.rotation.y = angle;
      rung.position.y = y;

      pairGroup.add(m1, m2, rung);
      pairGroup.visible = false;
      group.add(pairGroup);
      basePairs.push(pairGroup);
    }

    const playNote = (step: number) => {
      if (!audioContextRef.current) audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      const ctx = audioContextRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(220 + (step * 20), ctx.currentTime);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    };

    let frame = 0;
    const animate = () => {
      frame = requestAnimationFrame(animate);
      group.rotation.y += 0.015;
      
      // Mutation Pulse
      if (isAssembled && analysis.mutations.length > 0) {
        const time = Date.now() * 0.005;
        analysis.mutations.forEach(m => {
          const rung = basePairs[m.idx];
          const scale = 1 + Math.sin(time) * 0.2;
          rung.scale.set(scale, scale, scale);
          rung.children.forEach((c: any) => {
             if (c.material) c.material.opacity = 0.5 + Math.sin(time) * 0.5;
          });
        });
      }
      
      renderer.render(scene, camera);
    };
    animate();

    let step = 0;
    const interval = setInterval(() => {
      if (step < totalPairs) {
        basePairs[step].visible = true;
        playNote(step);
        step++;
        setCurrentStep(step);
      } else {
        clearInterval(interval);
        setIsAssembled(true);
        setTimeout(() => setShowSimilarity(true), 400);
      }
    }, 120);

    return () => {
      cancelAnimationFrame(frame);
      clearInterval(interval);
      renderer.dispose();
    };
  }, [isOpen, genomeData, isAssembled, analysis]);

  const handleExport = () => {
    const report = {
      attack_id: attack.id,
      genome_hash: genomeData?.hash,
      timestamp: new Date().toISOString(),
      attributes: genomeData?.attributes,
      intelligence: intelligence,
      similarity_matches: analysis.matches,
      mutations: analysis.mutations
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shieldcore-genome-${genomeData?.hash}.json`;
    a.click();
  };

  if (!isOpen || !attack || !genomeData) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/95 backdrop-blur-3xl animate-in fade-in duration-500 overflow-hidden">
      {/* Background DNA Waterfall */}
      <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden">
        {Array.from({ length: 15 }).map((_, i) => (
          <div key={i} className="absolute text-[10px] font-mono text-destructive animate-dna-rain whitespace-nowrap" style={{ left: `${i * 7}%`, animationDelay: `${i * 0.5}s`, animationDuration: `${10 + Math.random() * 5}s` }}>
            {Array.from({ length: 50 }).map(() => 'ATCG').join('')}
          </div>
        ))}
      </div>
      <div className="absolute inset-0 matrix-grid opacity-5 pointer-events-none" />
      
      <div className="container relative max-w-7xl h-full flex flex-col p-10">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div className="space-y-2">
            <div className="flex items-center gap-3 text-destructive animate-pulse">
               <Fingerprint className="h-5 w-5" />
               <span className="text-[10px] font-black uppercase tracking-[0.5em]">Neural Intelligence Core</span>
            </div>
            <h2 className="text-4xl font-black font-mono tracking-tighter text-white glow-text-red">
               GENOME_HASH: <span className="text-destructive">{genomeData.hash}</span>
            </h2>
          </div>
          <button onClick={onClose} className="p-3 bg-white/5 border border-white/10 rounded-full hover:bg-destructive/20 hover:text-destructive transition-all">
            <X className="h-6 w-6 text-white/50" />
          </button>
        </div>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-8 overflow-hidden">
          {/* Left Panel: Legend & Attributes */}
          <div className="flex flex-col space-y-4">
            <h3 className="section-label">Genome Deciphering</h3>
            <ScrollArea className="h-full pr-4 custom-scrollbar">
              <div className="space-y-3">
                {ATTRIBUTE_METADATA.map((attr, i) => (
                  <div key={attr.id} className={cn(
                    "flex flex-col p-3 rounded-xl border border-white/5 bg-white/[0.02] transition-all duration-500",
                    i >= currentStep ? "opacity-0 translate-x-[-10px]" : "opacity-100 translate-x-0"
                  )} style={{ transitionDelay: `${i * 50}ms` }}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                         <div className="h-2 w-2 rounded-full" style={{ backgroundColor: attr.color, boxShadow: `0 0 8px ${attr.color}` }} />
                         <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">{attr.label}</span>
                      </div>
                      <Badge variant="outline" className="text-[8px] border-white/10 text-white/60">{attr.short}</Badge>
                    </div>
                    <div className="text-xs font-mono font-bold text-white uppercase tracking-tighter">
                      {genomeData.attributes[attr.id]}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Center: Helix & Sequence */}
          <div className="lg:col-span-2 flex flex-col items-center justify-center relative">
            <canvas ref={canvasRef} className="mb-12" />
            
            <div className="w-full space-y-4 text-center">
              {/* Raw Sequence */}
              <div className="bg-black/60 border border-white/5 p-4 rounded-2xl backdrop-blur-xl inline-block max-w-full">
                <div className="flex flex-wrap justify-center gap-1">
                  {genomeData.sequenceParts.map((part, i) => (
                    <span 
                      key={i} 
                      className={cn(
                        "font-mono text-xl font-black transition-all",
                        i >= currentStep ? "opacity-0" : "opacity-100",
                        analysis.mutations.some(m => m.idx === i) && "animate-pulse text-white underline decoration-white"
                      )}
                      style={{ color: i < currentStep ? ATTRIBUTE_METADATA[i].color : 'transparent' }}
                    >
                      {part[0]}
                    </span>
                  ))}
                </div>
                <div className="mt-2 text-[9px] font-mono text-white/20 uppercase tracking-[0.4em]">Raw Genome Sequence</div>
              </div>

              {/* Decoded Sequence */}
              <div className="flex items-center justify-center gap-2 overflow-x-auto no-scrollbar py-2">
                {genomeData.sequenceParts.map((part, i) => (
                  <React.Fragment key={i}>
                    <span className={cn(
                      "text-[9px] font-black uppercase whitespace-nowrap px-2 py-1 rounded bg-white/5 border border-white/5",
                      i >= currentStep ? "opacity-0" : "opacity-100",
                      analysis.mutations.some(m => m.idx === i) && "bg-destructive/20 border-destructive/50 text-destructive"
                    )} style={{ color: i < currentStep ? ATTRIBUTE_METADATA[i].color : 'transparent' }}>
                      {part}
                    </span>
                    {i < currentStep - 1 && <span className="text-white/10 text-[8px]">→</span>}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>

          {/* Right Panel: Intelligence & Similarity */}
          <div className="flex flex-col space-y-8 overflow-y-auto no-scrollbar">
            <div className="space-y-4">
              <h3 className="section-label">Forensic Intelligence</h3>
              <div className="grid grid-cols-1 gap-4">
                {[
                   { label: 'Sophistication', val: intelligence?.sophistication + '%', icon: TrendingUp, color: 'text-amber-500' },
                   { label: 'Novelty Rating', val: intelligence?.novelty + '%', icon: Shield, color: 'text-indigo-400' },
                   { label: 'Attacker Experience', val: intelligence?.experience + ' YR+', icon: User, color: 'text-destructive' },
                ].map((item, i) => (
                  <div key={i} className="bg-white/5 p-4 rounded-2xl border border-white/5 group hover:border-destructive/30 transition-all">
                    <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-1">{item.label}</p>
                    <div className="flex items-center gap-3">
                      <item.icon className={cn("h-4 w-4", item.color)} />
                      <span className="text-2xl font-black tracking-tighter text-white">{item.val}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="bg-destructive/10 p-4 rounded-2xl border border-destructive/20 space-y-3">
                 <div>
                    <p className="text-[9px] font-black text-destructive/60 uppercase tracking-widest mb-1">Primary Objective</p>
                    <p className="text-sm font-bold text-white uppercase">{intelligence?.objective}</p>
                 </div>
                 <div>
                    <p className="text-[9px] font-black text-destructive/60 uppercase tracking-widest mb-1">Recommended Response</p>
                    <p className="text-sm font-bold text-emerald-500 uppercase">{intelligence?.response}</p>
                 </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="section-label">Parity Comparison</h3>
              <div className={cn(
                "p-4 rounded-2xl border text-center transition-all duration-1000",
                analysis.status === 'CRITICAL' ? "bg-destructive/20 border-destructive animate-blocked-shimmer" : 
                analysis.status === 'PROBABLE' ? "bg-amber-500/20 border-amber-500" :
                "bg-indigo-500/10 border-indigo-500/30"
              )}>
                 {analysis.status === 'CRITICAL' && (
                   <div className="space-y-1">
                      <ShieldAlert className="h-6 w-6 text-destructive mx-auto" />
                      <p className="text-sm font-black text-white uppercase tracking-tighter">RETURNING ATTACKER IDENTIFIED</p>
                      <p className="text-[8px] font-bold text-destructive/70 uppercase">High Session Parity Detected</p>
                   </div>
                 )}
                 {analysis.status === 'ZERO_DAY' && (
                   <div className="space-y-1">
                      <Zap className="h-6 w-6 text-indigo-400 mx-auto animate-pulse" />
                      <p className="text-sm font-black text-white uppercase tracking-tighter">ZERO DAY PATTERN DETECTED</p>
                      <p className="text-[8px] font-bold text-indigo-400/70 uppercase">NO KNOWN GENOME MATCH</p>
                   </div>
                 )}
              </div>
              
              <div className="space-y-4 mt-4">
                {analysis.matches.map((match, i) => (
                  <div key={i} className="space-y-2">
                     <div className="flex justify-between text-[10px] font-mono">
                        <span className="text-white/40 uppercase">{match.id}</span>
                        <span className="text-destructive font-black">{Math.round(match.percentage)}% MATCH</span>
                     </div>
                     <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-destructive transition-all duration-1000" style={{ width: showSimilarity ? `${match.percentage}%` : '0%' }} />
                     </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Mutation Detector & Phylogenetic Tree */}
        {isAssembled && (
          <div className="mt-8 space-y-6 animate-in slide-in-from-bottom-8 duration-700">
            <div className="flex gap-8">
               <div className="flex-1 space-y-3">
                 <h3 className="section-label">Mutation Report</h3>
                 {analysis.mutations.length > 0 ? (
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                     {analysis.mutations.map((m, i) => (
                       <div key={i} className="bg-destructive/5 border border-destructive/20 p-2 rounded-lg flex flex-col">
                         <span className="text-[8px] font-black text-destructive uppercase mb-1">{m.attribute}</span>
                         <span className="text-[10px] font-mono text-white/40 line-through truncate">{m.from}</span>
                         <span className="text-xs font-mono font-bold text-white truncate">→ {m.to}</span>
                       </div>
                     ))}
                   </div>
                 ) : (
                   <div className="text-xs text-muted-foreground italic bg-white/5 p-4 rounded-xl border border-white/5 text-center">
                     Stable Tech DNA. No behavioral drift detected against closest profile.
                   </div>
                 )}
               </div>

               <div className="w-80 space-y-3">
                  <div className="flex justify-between items-center">
                    <h3 className="section-label mb-0">Phylogenetic Lineage</h3>
                    <Button variant="ghost" size="sm" onClick={() => setShowPhylogeny(!showPhylogeny)} className="h-6 text-[8px] uppercase tracking-widest font-black">
                      {showPhylogeny ? 'Hide Tree' : 'Show Tree'}
                    </Button>
                  </div>
                  {showPhylogeny && (
                    <div className="bg-white/5 border border-white/5 rounded-xl p-4 h-32 flex items-center justify-center relative">
                       {/* Simplified SVG Tree */}
                       <svg className="w-full h-full" viewBox="0 0 100 40">
                          <line x1="10" y1="20" x2="40" y2="20" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                          <line x1="40" y1="10" x2="40" y2="30" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                          <line x1="40" y1="10" x2="70" y2="10" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                          <line x1="40" y1="30" x2="70" y2="30" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                          {/* Current node */}
                          <circle cx="70" cy="10" r="2" fill="#ef4444" className="animate-pulse" />
                          <text x="74" y="11" fontSize="4" fill="#ef4444" fontWeight="bold">CURRENT</text>
                          {/* Hist nodes */}
                          <circle cx="70" cy="30" r="1.5" fill="rgba(255,255,255,0.2)" />
                          <text x="74" y="31" fontSize="3" fill="rgba(255,255,255,0.2)">LEGACY_A</text>
                       </svg>
                    </div>
                  )}
               </div>
            </div>

            <div className="flex gap-4 border-t border-white/5 pt-8">
              <Button onClick={() => onSave({
                id: genomeData.hash,
                sequence: genomeData.sequence,
                type: attack.attackType,
                timestamp: new Date().toISOString(),
                attributes: genomeData.attributes
              })} className="flex-1 bg-destructive hover:bg-destructive/90 text-white font-black h-14 rounded-2xl uppercase tracking-widest text-xs glow-btn">
                <Database className="h-4 w-4 mr-3" /> Commit to Intelligence Database
              </Button>
              <Button variant="outline" onClick={handleExport} className="flex-1 border-white/10 bg-white/5 text-white h-14 rounded-2xl uppercase tracking-widest text-xs">
                <Download className="h-4 w-4 mr-3" /> Export Forensic Report
              </Button>
              <Button variant="ghost" onClick={onClose} className="h-14 px-8 text-white/50 hover:text-white font-black uppercase text-[10px] tracking-[0.2em]">
                Dismiss
              </Button>
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        .glow-text-red { text-shadow: 0 0 20px rgba(239, 68, 68, 0.5); }
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
        .animate-blink { animation: blink 1s infinite; }
        
        @keyframes dna-rain {
          0% { transform: translateY(-100%); opacity: 0; }
          10% { opacity: 0.8; }
          90% { opacity: 0.8; }
          100% { transform: translateY(100vh); opacity: 0; }
        }
        .animate-dna-rain {
          writing-mode: vertical-rl;
          text-orientation: upright;
          animation: dna-rain linear infinite;
        }

        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
