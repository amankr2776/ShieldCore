
"use client";

import { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { 
  Database, Server, Cpu, Zap, Code2, Activity, 
  CheckCircle2, Globe, Terminal, Shield, 
  Search, Lock, Share2, Layers, X, Info, Box
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

// --- Types & Data ---

interface NodeData {
  id: string;
  name: string;
  tech: string;
  color: number;
  input: string;
  output: string;
  latency: number;
  desc: string;
  code: string;
  position: THREE.Vector3;
}

const NODES_CONFIG: NodeData[] = [
  { 
    id: 'frontend', name: "Frontend Core", tech: "Next.js 15", color: 0x00eaff, 
    input: "User Interaction", output: "HTTP Payload", latency: 0.2,
    desc: "React-based security analyst interface with real-time state management.",
    code: "const analyze = async (p) => await sdk.process(p);",
    position: new THREE.Vector3(-8, 4, 0)
  },
  { 
    id: 'backend', name: "Genkit Flow", tech: "Genkit Orchestrator", color: 0xef4444, 
    input: "Payload String", output: "Contextual Object", latency: 0.8,
    desc: "Server-side orchestration for AI model chain and data normalization.",
    code: "export const flow = ai.defineFlow('waf', async (i) => ...);",
    position: new THREE.Vector3(-4, 2, 2)
  },
  { 
    id: 'decode', name: "De-obfuscation", tech: "Recursive Sanitizer", color: 0xf59e0b, 
    input: "Encoded Text", output: "Normalized String", latency: 0.5,
    desc: "Layered decoding of URL, Base64, and Unicode obfuscation techniques.",
    code: "function decode(t) { return recursive(url(b64(t))); }",
    position: new THREE.Vector3(0, 3, -2)
  },
  { 
    id: 'groq', name: "Groq LPU Engine", tech: "Llama 3 8B", color: 0xef4444, 
    input: "Normalized Text", output: "Class Logits", latency: 4.2,
    desc: "Hardware-accelerated LLM inference using Groq's Language Processing Units.",
    code: "const res = await groq.chat.completions.create({ model: 'llama3-8b' });",
    position: new THREE.Vector3(4, 1, 3)
  },
  { 
    id: 'score', name: "Threat Analyzer", tech: "Neural Softmax", color: 0x10b981, 
    input: "Logits", output: "Confidence %", latency: 0.3,
    desc: "Probabilistic classification and decision logic for threat determination.",
    code: "const decision = score > 0.85 ? 'BLOCKED' : 'SAFE';",
    position: new THREE.Vector3(8, -1, 0)
  },
  { 
    id: 'firestore', name: "Audit Persistence", tech: "Firestore NoSQL", color: 0xf97316, 
    input: "Analysis Result", output: "Document ID", latency: 2.1,
    desc: "Distributed logging and long-term storage of security incidents.",
    code: "await addDoc(collection(db, 'attacks'), payload);",
    position: new THREE.Vector3(3, -4, -1)
  },
  { 
    id: 'ws', name: "Signal Uplink", tech: "WebSockets", color: 0x8b5cf6, 
    input: "Event Signal", output: "Real-time Telemetry", latency: 0.1,
    desc: "Bi-directional streaming of threat events to all connected clients.",
    code: "socket.emit('threat-detected', { id, type, score });",
    position: new THREE.Vector3(-2, -3, 2)
  },
  { 
    id: 'dashboard', name: "Forensic View", tech: "Live Observer", color: 0x3b82f6, 
    input: "Live Stream", output: "Analyst Alert", latency: 0.2,
    desc: "High-fidelity visualization of active threats and global signals.",
    code: "<IncidentMap data={liveThreats} />",
    position: new THREE.Vector3(-7, -2, -2)
  }
];

// --- Components ---

export default function ArchitecturePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeNode, setActiveNode] = useState<NodeData | null>(null);
  const [showTechModal, setShowTechModal] = useState(false);
  const [showDatasetModal, setShowDatasetModal] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);
  const [totalLatency, setTotalLatency] = useState(8.9);

  // --- Three.js Logic ---
  useEffect(() => {
    if (!canvasRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ 
      canvas: canvasRef.current, 
      antialias: true, 
      alpha: true 
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // --- Starfield (30,000 Particles) ---
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(30000 * 3);
    for (let i = 0; i < 30000 * 3; i++) starPos[i] = (Math.random() - 0.5) * 100;
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({ size: 0.05, color: 0x444466, transparent: true, opacity: 0.8 });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    // --- Nodes (Orbs) ---
    const nodeGroup = new THREE.Group();
    const nodeMeshes: Record<string, THREE.Mesh> = {};
    
    NODES_CONFIG.forEach(data => {
      const geo = new THREE.SphereGeometry(0.6, 32, 32);
      const mat = new THREE.MeshBasicMaterial({ color: data.color, transparent: true, opacity: 0.9 });
      const orb = new THREE.Mesh(geo, mat);
      orb.position.copy(data.position);
      orb.userData = { data };
      
      // Outer Glow Ring
      const ringGeo = new THREE.TorusGeometry(0.8, 0.02, 16, 100);
      const ringMat = new THREE.MeshBasicMaterial({ color: data.color, transparent: true, opacity: 0.3 });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      orb.add(ring);
      
      nodeMeshes[data.id] = orb;
      nodeGroup.add(orb);
    });
    scene.add(nodeGroup);

    // --- Connections & Data Packets ---
    const beams: THREE.Line[] = [];
    const packets: { mesh: THREE.Mesh, start: THREE.Vector3, end: THREE.Vector3, progress: number, speed: number }[] = [];
    
    const createConnection = (startId: string, endId: string) => {
      const start = nodeMeshes[startId].position;
      const end = nodeMeshes[endId].position;
      const geo = new THREE.BufferGeometry().setFromPoints([start, end]);
      const mat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.1 });
      const line = new THREE.Line(geo, mat);
      scene.add(line);
      beams.push(line);
    };

    const connections = [
      ['frontend', 'backend'], ['backend', 'decode'], ['decode', 'groq'], 
      ['groq', 'score'], ['score', 'firestore'], ['score', 'ws'], 
      ['ws', 'dashboard'], ['dashboard', 'frontend']
    ];
    connections.forEach(([s, e]) => createConnection(s, e));

    const spawnPacket = (startId: string, endId: string) => {
      const start = nodeMeshes[startId].position;
      const end = nodeMeshes[endId].position;
      const geo = new THREE.SphereGeometry(0.1, 8, 8);
      const mat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9 });
      const packet = new THREE.Mesh(geo, mat);
      scene.add(packet);
      packets.push({ mesh: packet, start, end, progress: 0, speed: Math.random() * 0.01 + 0.005 });
    };

    // --- Raycasting for Interaction ---
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onMouseClick = (event: MouseEvent) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(nodeGroup.children);
      
      if (intersects.length > 0) {
        const clickedNode = (intersects[0].object as any).userData.data as NodeData;
        setActiveNode(clickedNode);
      } else {
        setActiveNode(null);
      }
    };
    window.addEventListener('click', onMouseClick);

    // --- Animation State ---
    camera.position.z = 25;
    let frame = 0;
    let targetCameraPos = new THREE.Vector3(0, 0, 25);
    let currentCameraPos = new THREE.Vector3(0, 0, 25);
    let mouseX = 0, mouseY = 0;

    const onMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 5;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 5;
    };
    window.addEventListener('mousemove', onMouseMove);

    const animate = () => {
      frame = requestAnimationFrame(animate);
      
      // Node Breathing
      nodeGroup.children.forEach((node, i) => {
        const time = Date.now() * 0.001;
        node.position.y += Math.sin(time + i) * 0.005;
        node.rotation.y += 0.01;
      });

      // Packet Management
      if (Math.random() > 0.95) {
        const conn = connections[Math.floor(Math.random() * connections.length)];
        spawnPacket(conn[0], conn[1]);
      }

      packets.forEach((p, i) => {
        p.progress += p.speed;
        p.mesh.position.lerpVectors(p.start, p.end, p.progress);
        if (p.progress >= 1) {
          scene.remove(p.mesh);
          packets.splice(i, 1);
        }
      });

      // Camera Logic
      if (activeNode) {
        const offset = new THREE.Vector3().copy(activeNode.position).add(new THREE.Vector3(0, 0, 5));
        targetCameraPos.copy(offset);
      } else {
        targetCameraPos.set(mouseX, mouseY, 25);
      }
      currentCameraPos.lerp(targetCameraPos, 0.05);
      camera.position.copy(currentCameraPos);
      if (!activeNode) camera.lookAt(0, 0, 0);
      else camera.lookAt(activeNode.position);

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('click', onMouseClick);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', handleResize);
    };
  }, [activeNode]);

  // --- UI Telemetry simulation ---
  useEffect(() => {
    const interval = setInterval(() => {
      const randomNode = NODES_CONFIG[Math.floor(Math.random() * NODES_CONFIG.length)];
      const newLog = {
        id: Math.random(),
        node: randomNode.name,
        time: new Date().toLocaleTimeString(),
        latency: (randomNode.latency + Math.random() * 0.1).toFixed(2),
        size: Math.floor(Math.random() * 500) + 50
      };
      setLogs(prev => [newLog, ...prev].slice(0, 10));
      setTotalLatency(parseFloat((8.5 + Math.random() * 1.5).toFixed(1)));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative h-screen w-full bg-[#020408] overflow-hidden selection:bg-destructive/30 dashboard-cursor">
      {/* 3D Visual Engine Layer */}
      <canvas ref={canvasRef} className="absolute inset-0 z-0" />
      
      {/* Cinematic Overlays */}
      <div className="absolute inset-0 pointer-events-none z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.6)_100%)]" />
        <div className="absolute inset-0 opacity-[0.02] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(18,16,16,0) 50%,rgba(0,0,0,0.25) 50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))', backgroundSize: '100% 2px, 3px 100%' }} />
      </div>

      {/* Top Left: Navigation & Branding */}
      <div className="absolute top-10 left-10 z-50 space-y-4">
        <div className="flex items-center gap-4">
           <div className="p-3 bg-destructive/10 rounded-2xl border border-destructive/20 text-destructive animate-pulse">
              <Layers className="h-6 w-6" />
           </div>
           <div>
              <h1 className="text-3xl font-black tracking-tighter text-white uppercase">SYSTEM <span className="text-destructive">ENGINEERING</span></h1>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500 opacity-60">ShieldCore Infrastructure SC-92-LPU</p>
           </div>
        </div>
        <div className="flex gap-4">
           <Button variant="outline" size="sm" onClick={() => setShowTechModal(true)} className="glass-card border-white/10 text-white text-[9px] font-black uppercase tracking-widest rounded-xl px-6 h-10 hover:border-destructive/50">
              Tech Stack
           </Button>
           <Button variant="outline" size="sm" onClick={() => setShowDatasetModal(true)} className="glass-card border-white/10 text-white text-[9px] font-black uppercase tracking-widest rounded-xl px-6 h-10 hover:border-destructive/50">
              Training Datasets
           </Button>
        </div>
      </div>

      {/* Top Right: Real-time Metrics */}
      <div className="absolute top-10 right-10 z-50 text-right space-y-2">
         <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 opacity-60">End-to-End Latency</p>
         <div className={cn(
           "text-6xl font-black tracking-tighter transition-colors duration-1000",
           totalLatency > 9.5 ? "text-amber-500" : "text-emerald-500"
         )}>
           {totalLatency}<span className="text-2xl font-bold ml-2">ms</span>
         </div>
         <Badge variant="outline" className="border-destructive/20 text-destructive bg-destructive/5 text-[8px] uppercase font-black px-3">Uplink: Synchronized</Badge>
      </div>

      {/* Center UI: Holographic Panel (Conditional) */}
      {activeNode && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] z-[100] animate-in zoom-in-95 fade-in duration-500 pointer-events-none">
           <div className="glass-card p-10 rounded-[2.5rem] border-destructive shadow-[0_0_50px_rgba(239,68,68,0.2)] bg-[#0a0c14]/90 backdrop-blur-3xl ring-1 ring-white/10 relative pointer-events-auto">
             <button onClick={() => setActiveNode(null)} className="absolute top-6 right-6 p-2 hover:bg-white/5 rounded-full transition-colors">
               <X className="h-5 w-5 text-white/50" />
             </button>

             <div className="space-y-8">
                <div className="flex items-center gap-5">
                   <div className="p-4 rounded-2xl bg-white/5 border border-white/10" style={{ color: `#${activeNode.color.toString(16).padStart(6, '0')}` }}>
                      <Box className="h-8 w-8" />
                   </div>
                   <div>
                      <h2 className="text-3xl font-black tracking-tighter text-white uppercase">{activeNode.name}</h2>
                      <Badge variant="outline" className="text-[9px] font-black border-white/10 text-white/60">{activeNode.tech}</Badge>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                   <div className="space-y-1">
                      <p className="text-[8px] font-black text-white/30 uppercase tracking-widest">Input Pattern</p>
                      <p className="text-xs font-mono text-white/80">{activeNode.input}</p>
                   </div>
                   <div className="space-y-1">
                      <p className="text-[8px] font-black text-white/30 uppercase tracking-widest">Output Object</p>
                      <p className="text-xs font-mono text-white/80">{activeNode.output}</p>
                   </div>
                </div>

                <div className="space-y-3">
                   <p className="text-[8px] font-black text-white/30 uppercase tracking-widest">Component Analysis</p>
                   <p className="text-xs text-white/60 leading-relaxed italic">"{activeNode.desc}"</p>
                </div>

                <div className="space-y-3">
                   <p className="text-[8px] font-black text-white/30 uppercase tracking-widest">Execution Sample</p>
                   <div className="bg-black/40 p-4 rounded-xl border border-white/5 font-mono text-[10px] text-destructive overflow-x-auto whitespace-nowrap">
                      {activeNode.code}
                   </div>
                </div>

                <div className="pt-6 border-t border-white/5 flex justify-between items-center">
                   <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
                      <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Status: Operating</span>
                   </div>
                   <span className="text-sm font-black text-destructive">{activeNode.latency}ms DELAY</span>
                </div>
             </div>
           </div>
        </div>
      )}

      {/* Bottom: Live Telemetry Terminal */}
      <div className="absolute bottom-10 left-10 right-10 z-50">
        <div className="glass-card rounded-[2rem] p-8 border-white/5 bg-black/40 backdrop-blur-2xl">
           <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
              <div className="flex items-center gap-3">
                 <Terminal className="h-4 w-4 text-destructive" />
                 <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white">Live Pipeline Forensics</h3>
              </div>
              <Badge variant="outline" className="text-[8px] font-black text-white/30 border-white/10">Edge Node: 12.4.92</Badge>
           </div>
           
           <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
              {logs.map((log) => (
                <div key={log.id} className="space-y-1 animate-in slide-in-from-left-4 fade-in duration-500">
                   <div className="flex justify-between text-[8px] font-black text-white/20 uppercase tracking-tighter">
                      <span>{log.node}</span>
                      <span>{log.latency}ms</span>
                   </div>
                   <div className="text-[10px] font-mono text-white/70 truncate">
                      PKT_{log.size}B @ {log.time}
                   </div>
                   <div className="h-0.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-destructive/40 animate-[progress_1s_ease-in-out_infinite]" />
                   </div>
                </div>
              ))}
           </div>
        </div>
      </div>

      {/* Modals */}
      <Dialog open={showTechModal} onOpenChange={setShowTechModal}>
        <DialogContent className="max-w-4xl glass-card border-white/10 bg-[#020408]/95 p-0 overflow-hidden text-white">
          <div className="sr-only">
            <DialogHeader>
              <DialogTitle>Technology Stack Detail</DialogTitle>
            </DialogHeader>
          </div>
          <div className="p-12 space-y-10">
             <div className="flex items-center gap-6">
                <div className="p-4 bg-destructive/10 rounded-2xl border border-destructive/20 text-destructive">
                   <Code2 className="h-8 w-8" />
                </div>
                <div>
                   <h2 className="text-4xl font-black tracking-tighter uppercase">ShieldCore Ecosystem</h2>
                   <p className="text-[10px] font-black text-destructive uppercase tracking-[0.3em]">Full Stack Provenance</p>
                </div>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6">
                   <h3 className="text-xs font-black uppercase text-white/40 tracking-widest border-b border-white/5 pb-2">Core Runtime</h3>
                   {[
                     { l: "Frontend Core", t: "Next.js 15 / Tailwind / Three.js" },
                     { l: "AI Runtime", t: "Groq LPU / Genkit SDK" },
                     { l: "Security Model", t: "Llama 3 8B (Fine-tuned CSIC)" }
                   ].map((item, i) => (
                     <div key={i} className="flex justify-between items-center group">
                        <span className="text-sm font-bold text-white/60">{item.l}</span>
                        <span className="text-[11px] font-mono text-destructive">{item.t}</span>
                     </div>
                   ))}
                </div>
                <div className="space-y-6">
                   <h3 className="text-xs font-black uppercase text-white/40 tracking-widest border-b border-white/5 pb-2">Cloud Infrastructure</h3>
                   {[
                     { l: "Persistence", t: "Firebase Firestore NoSQL" },
                     { l: "Auth Gateway", t: "Firebase Auth (Analyst Nodes)" },
                     { l: "Edge Delivery", t: "Vercel Edge Network" }
                   ].map((item, i) => (
                     <div key={i} className="flex justify-between items-center group">
                        <span className="text-sm font-bold text-white/60">{item.l}</span>
                        <span className="text-[11px] font-mono text-destructive">{item.t}</span>
                     </div>
                   ))}
                </div>
             </div>
             <Button variant="outline" className="w-full h-14 border-white/10 hover:bg-white/5 uppercase font-black text-[10px] tracking-widest rounded-2xl" onClick={() => setShowTechModal(false)}>
                Return to Core View
             </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showDatasetModal} onOpenChange={setShowDatasetModal}>
        <DialogContent className="max-w-4xl glass-card border-white/10 bg-[#020408]/95 p-0 overflow-hidden text-white">
          <div className="sr-only">
            <DialogHeader>
              <DialogTitle>Training Dataset Forensics</DialogTitle>
            </DialogHeader>
          </div>
          <div className="p-12 space-y-12">
             <div className="flex items-center gap-6">
                <div className="p-4 bg-destructive/10 rounded-2xl border border-destructive/20 text-destructive">
                   <Database className="h-8 w-8" />
                </div>
                <div>
                   <h2 className="text-4xl font-black tracking-tighter uppercase">CSIC 2010 Benchmark</h2>
                   <p className="text-[10px] font-black text-destructive uppercase tracking-[0.3em]">Dataset Specifications</p>
                </div>
             </div>

             <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {[
                  { l: "Total Corpus", v: "61,000" },
                  { l: "Anomalous", v: "25,000" },
                  { l: "Normal", v: "36,000" },
                  { l: "Accuracy", v: "94.3%" }
                ].map((stat, i) => (
                  <div key={i} className="text-center space-y-1">
                     <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">{stat.l}</p>
                     <p className="text-2xl font-black text-white">{stat.v}</p>
                  </div>
                ))}
             </div>

             <div className="space-y-4">
                <h3 className="text-xs font-black uppercase text-white/40 tracking-widest border-b border-white/5 pb-2">Vulnerability Coverage</h3>
                <div className="flex flex-wrap gap-3">
                   {["SQLi", "XSS", "Path Traversal", "Command Injection", "SSRF", "Buffer Overflow"].map(v => (
                     <Badge key={v} variant="outline" className="px-4 py-2 border-white/10 bg-white/5 text-[10px] font-bold text-white uppercase">{v}</Badge>
                   ))}
                </div>
             </div>

             <Button variant="outline" className="w-full h-14 border-white/10 hover:bg-white/5 uppercase font-black text-[10px] tracking-widest rounded-2xl" onClick={() => setShowDatasetModal(false)}>
                Return to Core View
             </Button>
          </div>
        </DialogContent>
      </Dialog>

      <style jsx global>{`
        @keyframes progress {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .dashboard-cursor {
          cursor: crosshair;
        }
      `}</style>
    </div>
  );
}
