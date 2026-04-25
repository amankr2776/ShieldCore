
"use client";

import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { 
  Dna, Fingerprint, ShieldAlert, X, Database, 
  Zap, Info, Activity, AlertTriangle, Search,
  CheckCircle2, Globe, Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Genome {
  id: string;
  sequence: string;
  type: string;
  timestamp: string;
}

interface DNASequencerModalProps {
  attack: any;
  isOpen: boolean;
  onClose: () => void;
  genomeDatabase: Genome[];
  onSave: (genome: Genome) => void;
}

const GENOME_COLORS: Record<string, string> = {
  'SQLi': '#ef4444', // Red
  'XSS': '#d946ef',  // Magenta
  'PT': '#84cc16',   // Toxic Green
  'CMD': '#eab308',  // Yellow
  'BO': '#06b6d4',   // Cyan
  'SSRF': '#8b5cf6', // Violet
  'UNKNOWN': '#6366f1' // Indigo
};

const CATEGORY_LABELS = [
  { id: 'type', label: 'ATTACK_CLASS', desc: 'Primary threat classification' },
  { id: 'encoding', label: 'ENCODING_LYR', desc: 'Payload obfuscation method' },
  { id: 'evasion', label: 'EVASION_SIG', desc: 'WAF bypass technique signature' },
  { id: 'target', label: 'TARGET_PARAM', desc: 'Injection vector location' },
  { id: 'complexity', label: 'PAYLOAD_COMP', desc: 'Algorithmic complexity depth' },
  { id: 'obfuscation', label: 'OBFUS_DEPTH', desc: 'Nested layer recursive count' }
];

export function DNASequencerModal({ attack, isOpen, onClose, genomeDatabase, onSave }: DNASequencerModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isAssembled, setIsAssembled] = useState(false);
  const [typedSequence, setTypedSequence] = useState('');
  const [showSimilarity, setShowSimilarity] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Generate deterministic genome based on attack data
  const genomeData = useMemo(() => {
    if (!attack) return null;
    const typeShortMap: Record<string, string> = {
      'SQL Injection': 'SQLi',
      'XSS': 'XSS',
      'Path Traversal': 'PT',
      'Command Injection': 'CMD',
      'Buffer Overflow': 'BO',
      'SSRF': 'SSRF'
    };
    const type = typeShortMap[attack.attackType] || 'UNK';
    const encodings = ['B64', 'HEX', 'UTF8', 'NONE'];
    const evasions = ['EVA1', 'EVA2', 'EVA3', 'SIG0'];
    const targets = ['AUTH', 'QUERY', 'BODY', 'COOKIE'];
    const complexities = ['LOW', 'MED', 'HIGH', 'CRIT'];
    
    // Use character codes from ID for semi-deterministic randoms
    const seed = attack.id.charCodeAt(0) + attack.id.charCodeAt(1);
    
    const parts = [
      type,
      encodings[seed % 4],
      evasions[(seed + 1) % 4],
      targets[(seed + 2) % 4],
      complexities[(seed + 3) % 4],
      `OBF${(seed % 5) + 1}`
    ];
    
    return {
      sequence: parts.join('-'),
      parts: parts,
      hash: `SHIELD-${Math.random().toString(16).substring(2, 10).toUpperCase()}`
    };
  }, [attack]);

  // Calculate similarity
  const similarityStats = useMemo(() => {
    if (!genomeData || !genomeDatabase.length) return { matches: [], status: 'UNKNOWN' };
    
    const matches = genomeDatabase.map(g => {
      let score = 0;
      const currentParts = genomeData.sequence.split('-');
      const targetParts = g.sequence.split('-');
      
      currentParts.forEach((part, i) => {
        if (part === targetParts[i]) score += 1;
      });
      
      const percentage = (score / currentParts.length) * 100;
      return { ...g, percentage };
    }).sort((a, b) => b.percentage - a.percentage).slice(0, 3);

    const maxSim = matches[0]?.percentage || 0;
    let status = 'UNKNOWN';
    if (maxSim > 85) status = 'CRITICAL';
    else if (maxSim > 60) status = 'PROBABLE';
    else if (maxSim < 30) status = 'ZERO_DAY';

    return { matches, status };
  }, [genomeData, genomeDatabase]);

  // Three.js Helix Logic
  useEffect(() => {
    if (!isOpen || !canvasRef.current || !genomeData) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
    camera.position.z = 15;

    const renderer = new THREE.WebGLRenderer({ 
      canvas: canvasRef.current, 
      alpha: true, 
      antialias: true 
    });
    renderer.setSize(400, 500);

    const group = new THREE.Group();
    scene.add(group);

    const basePairs: THREE.Group[] = [];
    const totalPairs = 12;
    const helixHeight = 10;

    for (let i = 0; i < totalPairs; i++) {
      const pairGroup = new THREE.Group();
      const angle = (i / totalPairs) * Math.PI * 4;
      const y = (i / totalPairs) * helixHeight - helixHeight / 2;

      // Spheres
      const sphereGeo = new THREE.SphereGeometry(0.2, 16, 16);
      
      // Strand 1
      const sphere1 = new THREE.Mesh(sphereGeo, new THREE.MeshBasicMaterial({ color: 0x444444 }));
      sphere1.position.set(Math.cos(angle) * 2, y, Math.sin(angle) * 2);
      
      // Strand 2
      const sphere2 = new THREE.Mesh(sphereGeo, new THREE.MeshBasicMaterial({ color: 0x444444 }));
      sphere2.position.set(Math.cos(angle + Math.PI) * 2, y, Math.sin(angle + Math.PI) * 2);

      // Connector (The base pair rung)
      const cylinderGeo = new THREE.CylinderGeometry(0.05, 0.05, 4, 8);
      const cylinder = new THREE.Mesh(cylinderGeo, new THREE.MeshBasicMaterial({ 
        color: 0x222222,
        transparent: true,
        opacity: 0.3
      }));
      cylinder.rotation.z = Math.PI / 2;
      cylinder.position.y = y;
      cylinder.rotation.y = angle;

      pairGroup.add(sphere1, sphere2, cylinder);
      pairGroup.visible = false;
      group.add(pairGroup);
      basePairs.push(pairGroup);
    }

    // Sound Setup
    const playSequencingSound = (index: number) => {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440 + index * 50, ctx.currentTime);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    };

    // Animation loop
    let frame = 0;
    const animate = () => {
      frame = requestAnimationFrame(animate);
      group.rotation.y += 0.02;
      renderer.render(scene, camera);
    };
    animate();

    // Assembly sequence
    let currentStep = 0;
    const assemblyInterval = setInterval(() => {
      if (currentStep < totalPairs) {
        basePairs[currentStep].visible = true;
        // Apply color based on current index (mapped to genome parts)
        const partIdx = Math.floor(currentStep / 2) % 6;
        const partType = genomeData.parts[partIdx];
        const colorStr = GENOME_COLORS[partType] || GENOME_COLORS[genomeData.parts[0]] || '#ffffff';
        const colorHex = new THREE.Color(colorStr);
        
        basePairs[currentStep].children.forEach(child => {
          if (child instanceof THREE.Mesh) {
            (child.material as THREE.MeshBasicMaterial).color.set(colorHex);
            if (child.geometry instanceof THREE.CylinderGeometry) {
                (child.material as THREE.MeshBasicMaterial).opacity = 0.8;
            }
          }
        });

        playSequencingSound(currentStep);
        currentStep++;
        
        // Update sequence text
        const totalChars = genomeData.sequence.length;
        const progress = currentStep / totalPairs;
        setTypedSequence(genomeData.sequence.substring(0, Math.floor(progress * totalChars)));
      } else {
        clearInterval(assemblyInterval);
        setIsAssembled(true);
        setTypedSequence(genomeData.sequence);
        setTimeout(() => setShowSimilarity(true), 500);
      }
    }, 150);

    return () => {
      cancelAnimationFrame(frame);
      clearInterval(assemblyInterval);
      renderer.dispose();
    };
  }, [isOpen, genomeData]);

  if (!isOpen || !attack || !genomeData) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/95 backdrop-blur-2xl animate-in fade-in duration-500 overflow-hidden">
      <div className="absolute inset-0 matrix-grid opacity-10 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(239,68,68,0.1)_0%,transparent_70%)] pointer-events-none" />
      
      <div className="container relative max-w-7xl h-full flex flex-col p-12">
        {/* Top Header */}
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <div className="flex items-center gap-3 text-destructive animate-pulse">
               <Fingerprint className="h-5 w-5" />
               <span className="text-[10px] font-black uppercase tracking-[0.5em]">Classified Intelligence Output</span>
            </div>
            <h2 className="text-4xl font-black font-mono tracking-tighter text-white glow-text-red">
               GENOME_ID: <span className="text-destructive">{genomeData.hash}</span>
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="p-3 bg-white/5 border border-white/10 rounded-full hover:bg-destructive/20 hover:text-destructive transition-all group"
          >
            <X className="h-6 w-6 text-white/50 group-hover:text-destructive" />
          </button>
        </div>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-12 mt-12 items-center">
          {/* Left Panel: Legend */}
          <div className="space-y-8 animate-in slide-in-from-left-8 duration-1000 delay-300">
            <h3 className="section-label">Genome Legend</h3>
            <div className="space-y-6">
              {CATEGORY_LABELS.map((item, idx) => (
                <div key={idx} className="flex gap-4 group">
                  <div className="mt-1">
                    <div className="h-2 w-2 rounded-full bg-destructive shadow-[0_0_10px_#ef4444]" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-white/80 uppercase tracking-widest group-hover:text-destructive transition-colors">
                      {item.label}
                    </p>
                    <p className="text-[11px] text-muted-foreground italic leading-tight">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Center: DNA Helix */}
          <div className="lg:col-span-2 flex flex-col items-center justify-center relative">
            <canvas ref={canvasRef} className="z-10" />
            
            {/* Sequence Text Display */}
            <div className="absolute bottom-[-2rem] w-full text-center">
               <div className="inline-block bg-black/40 border border-white/5 px-8 py-4 rounded-2xl backdrop-blur-xl">
                 <p className="font-mono text-2xl font-black tracking-[0.3em] text-destructive">
                    {typedSequence}<span className="animate-blink">_</span>
                 </p>
               </div>
            </div>

            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-destructive/5 rounded-full blur-[100px] -z-10" />
          </div>

          {/* Right Panel: Similarity */}
          <div className="space-y-10 animate-in slide-in-from-right-8 duration-1000 delay-500">
            <h3 className="section-label">Threat Comparison</h3>
            
            <div className="space-y-8">
               {/* Match Status Badge */}
               <div className={cn(
                 "p-6 rounded-2xl border flex items-center justify-center text-center transition-all duration-1000",
                 similarityStats.status === 'CRITICAL' ? "bg-destructive/20 border-destructive animate-blocked-shimmer" : 
                 similarityStats.status === 'PROBABLE' ? "bg-amber-500/20 border-amber-500" :
                 "bg-indigo-500/10 border-indigo-500/30"
               )}>
                  {similarityStats.status === 'CRITICAL' && (
                    <div className="space-y-2">
                       <ShieldAlert className="h-10 w-10 text-destructive mx-auto animate-pulse" />
                       <p className="text-xl font-black text-destructive uppercase tracking-tighter">Returning Attacker Identified</p>
                       <p className="text-[10px] font-bold text-destructive/70">GENOME_COLLISION_DETECTED: 92.4% MATCH</p>
                    </div>
                  )}
                  {similarityStats.status === 'PROBABLE' && (
                    <div className="space-y-2">
                       <AlertTriangle className="h-10 w-10 text-amber-500 mx-auto" />
                       <p className="text-xl font-black text-amber-500 uppercase tracking-tighter">Probable Threat Recurrence</p>
                    </div>
                  )}
                  {similarityStats.status === 'ZERO_DAY' && (
                    <div className="space-y-2">
                       <Zap className="h-10 w-10 text-indigo-400 mx-auto animate-pulse" />
                       <p className="text-xl font-black text-indigo-400 uppercase tracking-tighter">Zero Day Pattern Detected</p>
                       <p className="text-[10px] font-bold text-indigo-400/70">NO KNOWN GENOME MATCH FOUND</p>
                    </div>
                  )}
                  {!similarityStats.matches.length && similarityStats.status === 'UNKNOWN' && (
                    <div className="space-y-2 opacity-50">
                       <Globe className="h-10 w-10 mx-auto" />
                       <p className="text-lg font-black uppercase tracking-widest">Awaiting Database Context</p>
                    </div>
                  )}
               </div>

               {/* Matches List */}
               <div className="space-y-6">
                 <p className="text-[9px] font-black text-white/40 uppercase tracking-[0.3em] border-b border-white/5 pb-2">Top Session Parity</p>
                 {similarityStats.matches.length > 0 ? similarityStats.matches.map((match, i) => (
                   <div key={i} className="space-y-3">
                      <div className="flex justify-between text-[10px] font-mono">
                         <span className="text-white/60">{match.id}</span>
                         <span className="text-destructive font-black">{Math.round(match.percentage)}% MATCH</span>
                      </div>
                      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                         <div 
                           className="h-full bg-destructive transition-all duration-1000" 
                           style={{ width: showSimilarity ? `${match.percentage}%` : '0%' }} 
                         />
                      </div>
                   </div>
                 )) : (
                   <p className="text-xs text-muted-foreground italic text-center py-4">Generating neural context...</p>
                 )}
               </div>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="mt-auto flex gap-6 pt-12 border-t border-white/5 animate-in slide-in-from-bottom-8 duration-1000">
           <Button 
             onClick={() => {
                onSave({
                  id: genomeData.hash,
                  sequence: genomeData.sequence,
                  type: attack.attackType,
                  timestamp: new Date().toISOString()
                });
             }}
             className="flex-1 bg-destructive hover:bg-destructive/90 text-white font-black h-16 rounded-2xl uppercase tracking-widest text-xs glow-btn"
           >
             <Database className="h-4 w-4 mr-3" /> Save to Genome Database
           </Button>
           <Button 
             variant="outline" 
             onClick={onClose}
             className="flex-1 border-white/10 bg-white/5 text-white hover:bg-white/10 font-black h-16 rounded-2xl uppercase tracking-widest text-xs"
           >
             Dismiss Analysis
           </Button>
        </div>
      </div>

      <style jsx global>{`
        .glow-text-red {
          text-shadow: 0 0 20px rgba(239, 68, 68, 0.5);
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        .animate-blink {
          animation: blink 1s infinite;
        }
      `}</style>
    </div>
  );
}
