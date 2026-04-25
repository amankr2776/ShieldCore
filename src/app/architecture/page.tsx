
"use client";

import { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { 
  Database, Server, Cpu, Zap, Code2, Activity, 
  CheckCircle2, Globe, Terminal, Shield, 
  Search, Lock, Share2, Layers, X, Info, Box,
  Clock, AlertTriangle, Fingerprint, BarChart3
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

// --- Types & Data ---

interface NodeData {
  id: string;
  name: string;
  tech: string;
  color: string; // Hex string for CSS
  colorHex: number; // Numeric for Three.js
  input: string;
  output: string;
  latency: number;
  desc: string;
  code: string;
  shape: 'icosahedron' | 'octahedron' | 'torusHelix' | 'gyro' | 'dodecahedron' | 'diamond' | 'infinity' | 'cube';
  position: THREE.Vector3;
}

const NODES_CONFIG: NodeData[] = [
  { 
    id: 'frontend', name: "Frontend Core", tech: "Next.js 15", color: "#00eaff", colorHex: 0x00eaff,
    input: "User Interaction", output: "HTTP Payload", latency: 0.2,
    desc: "React-based security analyst interface with real-time state management.",
    code: "const analyze = async (p) => await sdk.process(p);",
    shape: 'icosahedron', position: new THREE.Vector3(-12, 6, 0)
  },
  { 
    id: 'backend', name: "Genkit Flow", tech: "Genkit Orchestrator", color: "#ef4444", colorHex: 0xef4444,
    input: "Payload String", output: "Contextual Object", latency: 0.8,
    desc: "Server-side orchestration for AI model chain and data normalization.",
    code: "export const flow = ai.defineFlow('waf', async (i) => ...);",
    shape: 'octahedron', position: new THREE.Vector3(-6, 3, 5)
  },
  { 
    id: 'decode', name: "De-obfuscation", tech: "Recursive Sanitizer", color: "#a3e635", colorHex: 0xa3e635,
    input: "Encoded Text", output: "Normalized String", latency: 0.5,
    desc: "Layered decoding of URL, Base64, and Unicode obfuscation techniques.",
    code: "function decode(t) { return recursive(url(b64(t))); }",
    shape: 'torusHelix', position: new THREE.Vector3(0, 5, -3)
  },
  { 
    id: 'groq', name: "Groq LPU Engine", tech: "Llama 3 8B", color: "#ec4899", colorHex: 0xec4899,
    input: "Normalized Text", output: "Class Logits", latency: 4.2,
    desc: "Hardware-accelerated LLM inference using Groq's Language Processing Units.",
    code: "const res = await groq.chat.completions.create({ model: 'llama3-8b' });",
    shape: 'gyro', position: new THREE.Vector3(7, 2, 4)
  },
  { 
    id: 'score', name: "Threat Analyzer", tech: "Neural Softmax", color: "#eab308", colorHex: 0xeab308,
    input: "Logits", output: "Confidence %", latency: 0.3,
    desc: "Probabilistic classification and decision logic for threat determination.",
    code: "const decision = score > 0.85 ? 'BLOCKED' : 'SAFE';",
    shape: 'dodecahedron', position: new THREE.Vector3(12, -2, 0)
  },
  { 
    id: 'firestore', name: "Audit Persistence", tech: "Firestore NoSQL", color: "#60a5fa", colorHex: 0x60a5fa,
    input: "Analysis Result", output: "Document ID", latency: 2.1,
    desc: "Distributed logging and long-term storage of security incidents.",
    code: "await addDoc(collection(db, 'attacks'), payload);",
    shape: 'diamond', position: new THREE.Vector3(5, -6, -2)
  },
  { 
    id: 'ws', name: "Signal Uplink", tech: "WebSockets", color: "#a855f7", colorHex: 0xa855f7,
    input: "Event Signal", output: "Real-time Telemetry", latency: 0.1,
    desc: "Bi-directional streaming of threat events to all connected clients.",
    code: "socket.emit('threat-detected', { id, type, score });",
    shape: 'infinity', position: new THREE.Vector3(-3, -5, 3)
  },
  { 
    id: 'dashboard', name: "Forensic View", tech: "Live Observer", color: "#ffffff", colorHex: 0xffffff,
    input: "Live Stream", output: "Analyst Alert", latency: 0.2,
    desc: "High-fidelity visualization of active threats and global signals.",
    code: "<IncidentMap data={liveThreats} />",
    shape: 'cube', position: new THREE.Vector3(-10, -3, -4)
  }
];

// --- Sub-components for Docked UI ---

function Sparkline({ data, color }: { data: number[], color: string }) {
  const max = Math.max(...data) || 1;
  return (
    <div className="flex items-end gap-[1px] h-6 w-full">
      {data.map((v, i) => (
        <div 
          key={i} 
          className="flex-1 rounded-t-[1px]" 
          style={{ height: `${(v / max) * 100}%`, backgroundColor: color, opacity: 0.3 + (i / data.length) * 0.7 }}
        />
      ))}
    </div>
  );
}

// --- Main Page Component ---

export default function ArchitecturePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loadingStep, setLoadingStep] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeNode, setActiveNode] = useState<NodeData | null>(null);
  const [vitals, setVitals] = useState({
    requests: 124902,
    rps: 42,
    threats: 384,
    latency: 7.2,
    history: { rps: [30, 35, 45, 40, 42], threats: [2, 5, 3, 8, 4], latency: [6.8, 7.5, 7.2, 7.0, 7.2] }
  });
  const [activity, setActivity] = useState<any[]>([]);

  // --- Loading Logic ---
  const loadingText = [
    "INITIALIZING SHIELDCORE ARCHITECTURE...",
    "LOADING NEURAL PIPELINE...",
    "CALIBRATING THREAT NODES...",
    "SYSTEM ONLINE"
  ];

  useEffect(() => {
    if (loadingStep < loadingText.length) {
      const timer = setTimeout(() => setLoadingStep(s => s + 1), 800);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => setIsLoaded(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [loadingStep]);

  // --- Live Data Simulation ---
  useEffect(() => {
    const interval = setInterval(() => {
      setVitals(v => {
        const nextRps = Math.max(20, Math.min(60, v.rps + (Math.random() - 0.5) * 10));
        const nextThreat = Math.random() > 0.8 ? v.threats + 1 : v.threats;
        return {
          ...v,
          requests: v.requests + Math.floor(nextRps / 2),
          rps: nextRps,
          threats: nextThreat,
          latency: parseFloat((7 + (Math.random() - 0.5) * 1.5).toFixed(1)),
          history: {
            rps: [...v.history.rps.slice(1), nextRps],
            threats: [...v.history.threats.slice(1), nextThreat - v.threats],
            latency: [...v.history.latency.slice(1), v.latency]
          }
        };
      });

      if (Math.random() > 0.4) {
        const newEvent = {
          id: Math.random().toString(36).substring(7).toUpperCase(),
          city: ["New York", "London", "Tokyo", "Berlin", "São Paulo", "Beijing"][Math.floor(Math.random() * 6)],
          country: ["US", "UK", "JP", "DE", "BR", "CN"][Math.floor(Math.random() * 6)],
          attack: ["SQLi", "XSS", "Safe", "Travers", "SSRF"][Math.floor(Math.random() * 5)],
          stage: ["Groq", "Decode", "Score"][Math.floor(Math.random() * 3)],
          progress: Math.floor(Math.random() * 100)
        };
        setActivity(a => [newEvent, ...a].slice(0, 15));
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // --- Three.js Engine ---
  useEffect(() => {
    if (!canvasRef.current || !isLoaded) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    // Starfield (80,000 Particles)
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(80000 * 3);
    for (let i = 0; i < 80000 * 3; i++) starPos[i] = (Math.random() - 0.5) * 600;
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({ size: 0.1, color: 0xffffff, transparent: true, opacity: 0.6 });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    // Floor Grid (Tron style)
    const gridHelper = new THREE.GridHelper(400, 40, 0x00eaff, 0x002233);
    gridHelper.position.y = -20;
    scene.add(gridHelper);

    // Nodes and Shapes
    const nodeGroup = new THREE.Group();
    const shapes: Record<string, THREE.Object3D> = {};
    const beams: { mesh: THREE.Line, start: string, end: string, progress: number }[] = [];
    const packets: { mesh: THREE.Mesh, curve: THREE.QuadraticBezierCurve3, t: number, speed: number }[] = [];

    const createShape = (config: NodeData) => {
      let geo;
      switch (config.shape) {
        case 'icosahedron': geo = new THREE.IcosahedronGeometry(1.2, 0); break;
        case 'octahedron': geo = new THREE.OctahedronGeometry(1.2, 0); break;
        case 'torusHelix': geo = new THREE.TorusKnotGeometry(0.8, 0.3, 100, 16); break;
        case 'gyro': geo = new THREE.TorusGeometry(0.7, 0.05, 16, 100); break;
        case 'dodecahedron': geo = new THREE.DodecahedronGeometry(1.2, 0); break;
        case 'diamond': geo = new THREE.OctahedronGeometry(1.4, 0); break;
        case 'infinity': geo = new THREE.TorusKnotGeometry(0.8, 0.2, 100, 16, 2, 3); break;
        case 'cube': geo = new THREE.BoxGeometry(1.4, 1.4, 1.4); break;
        default: geo = new THREE.SphereGeometry(1.2);
      }

      const container = new THREE.Group();
      const coreMat = new THREE.MeshBasicMaterial({ color: config.colorHex, transparent: true, opacity: 0.3 });
      const core = new THREE.Mesh(geo, coreMat);
      
      const wireMat = new THREE.MeshBasicMaterial({ color: config.colorHex, wireframe: true, transparent: true, opacity: 0.6 });
      const wire = new THREE.Mesh(geo, wireMat);
      
      container.add(core, wire);
      
      // Orbiting Electrons
      const orbitGroup = new THREE.Group();
      for (let i = 0; i < 12; i++) {
        const dotGeo = new THREE.SphereGeometry(0.05, 8, 8);
        const dotMat = new THREE.MeshBasicMaterial({ color: config.colorHex });
        const dot = new THREE.Mesh(dotGeo, dotMat);
        const angle = (i / 12) * Math.PI * 2;
        dot.position.set(Math.cos(angle) * 2, Math.sin(angle) * 2, (Math.random() - 0.5) * 1);
        orbitGroup.add(dot);
      }
      container.add(orbitGroup);
      
      container.position.copy(config.position);
      container.userData = { data: config, orbitGroup };
      shapes[config.id] = container;
      nodeGroup.add(container);
    };

    NODES_CONFIG.forEach(createShape);
    scene.add(nodeGroup);

    // Beams and Packet Logic
    const connections = [
      ['frontend', 'backend'], ['backend', 'decode'], ['decode', 'groq'], 
      ['groq', 'score'], ['score', 'firestore'], ['score', 'ws'], 
      ['ws', 'dashboard'], ['dashboard', 'frontend']
    ];

    const createBeam = (sId: string, eId: string) => {
      const start = shapes[sId].position;
      const end = shapes[eId].position;
      const mid = new THREE.Vector3().lerpVectors(start, end, 0.5).add(new THREE.Vector3(0, 3, 0));
      const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
      
      const points = curve.getPoints(50);
      const geo = new THREE.BufferGeometry().setFromPoints(points);
      const mat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.1 });
      const line = new THREE.Line(geo, mat);
      
      scene.add(line);
      return { curve, sId, eId };
    };

    const activeConnections = connections.map(([s, e]) => createBeam(s, e));

    const spawnPacket = (curve: THREE.QuadraticBezierCurve3, color: number) => {
      const geo = new THREE.CapsuleGeometry(0.1, 0.3, 4, 8);
      const mat = new THREE.MeshBasicMaterial({ color: color, transparent: true, opacity: 0.9 });
      const packet = new THREE.Mesh(geo, mat);
      scene.add(packet);
      packets.push({ mesh: packet, curve, t: 0, speed: 0.005 + Math.random() * 0.01 });
    };

    // Camera Start Animation
    camera.position.set(-15, 10, 5);
    camera.lookAt(shapes.frontend.position);
    let initialPullBack = 0;

    // Mouse Parallax
    let mouseX = 0, mouseY = 0;
    const onMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 4;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 4;
    };
    window.addEventListener('mousemove', onMouseMove);

    const onMouseClick = (e: MouseEvent) => {
      const raycaster = new THREE.Raycaster();
      const mouse = new THREE.Vector2(
        (e.clientX / window.innerWidth) * 2 - 1,
        -(e.clientY / window.innerHeight) * 2 + 1
      );
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(nodeGroup.children, true);
      
      if (intersects.length > 0) {
        let obj = intersects[0].object;
        while (obj.parent && !obj.userData.data) obj = obj.parent;
        if (obj.userData.data) setActiveNode(obj.userData.data);
      } else {
        setActiveNode(null);
      }
    };
    window.addEventListener('click', onMouseClick);

    const animate = () => {
      requestAnimationFrame(animate);
      
      // Node Breathing and Orbit
      nodeGroup.children.forEach((container, i) => {
        const time = Date.now() * 0.001;
        container.rotation.y += 0.01;
        container.rotation.z += 0.005;
        container.position.y += Math.sin(time + i) * 0.005;
        
        const orbit = container.userData.orbitGroup;
        if (orbit) orbit.rotation.y += 0.02;

        // Hover Effect Reactivity (Simulated via global state activeNode)
        if (activeNode && container.userData.data.id === activeNode.id) {
           container.scale.lerp(new THREE.Vector3(1.4, 1.4, 1.4), 0.1);
        } else {
           container.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
        }
      });

      // Packet Spawning
      if (Math.random() > 0.9) {
        const conn = activeConnections[Math.floor(Math.random() * activeConnections.length)];
        const node = NODES_CONFIG.find(n => n.id === conn.sId);
        spawnPacket(conn.curve, node?.colorHex || 0xffffff);
      }

      // Packet Movement
      packets.forEach((p, i) => {
        p.t += p.speed;
        p.mesh.position.copy(p.curve.getPointAt(p.t));
        const tangent = p.curve.getTangentAt(p.t);
        p.mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), tangent);
        
        if (p.t >= 1) {
          scene.remove(p.mesh);
          packets.splice(i, 1);
        }
      });

      // Camera Handling
      if (initialPullBack < 1) {
        initialPullBack += 0.01;
        const target = new THREE.Vector3(0, 10, 30);
        camera.position.lerp(target, 0.02);
      } else if (activeNode) {
        const target = new THREE.Vector3().copy(activeNode.position).add(new THREE.Vector3(0, 0, 8));
        camera.position.lerp(target, 0.05);
        camera.lookAt(activeNode.position);
      } else {
        const target = new THREE.Vector3(mouseX, mouseY + 10, 30);
        camera.position.lerp(target, 0.02);
        camera.lookAt(0, 0, 0);
      }

      // Stars Drift
      stars.rotation.y += 0.0001;

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('click', onMouseClick);
    };
  }, [isLoaded, activeNode]);

  return (
    <div className="relative h-screen w-full bg-[#020408] overflow-hidden dashboard-cursor selection:bg-destructive/30">
      
      {/* --- Cinematic Loading Screen --- */}
      {!isLoaded && (
        <div className="fixed inset-0 z-[10000] bg-[#020408] flex flex-col items-center justify-center">
           <div className="relative mb-8">
              <div className="absolute inset-0 radar-sweep opacity-20 scale-150" />
              <Shield className="h-16 w-16 text-destructive animate-pulse relative z-10" />
           </div>
           <div className="space-y-2 text-center font-mono">
              {loadingText.slice(0, loadingStep + 1).map((t, i) => (
                <p key={i} className={cn("text-[10px] uppercase tracking-[0.4em] transition-all duration-500", i === loadingStep ? "text-destructive animate-pulse" : "text-gray-600")}>
                  {t}
                </p>
              ))}
           </div>
           <div className="absolute bottom-12 w-64 h-[1px] bg-white/5 overflow-hidden">
              <div className="h-full bg-destructive animate-[progress_3s_ease-in-out_infinite]" />
           </div>
        </div>
      )}

      {/* --- 3D Visualization Layer --- */}
      <canvas ref={canvasRef} className={cn("absolute inset-0 z-0 transition-opacity duration-2000", isLoaded ? "opacity-100" : "opacity-0")} />

      {/* --- Cinematic Overlays --- */}
      <div className="absolute inset-0 pointer-events-none z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)]" />
        <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
        <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'linear-gradient(rgba(18,16,16,0) 50%,rgba(0,0,0,0.25) 50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))', backgroundSize: '100% 2px, 3px 100%' }} />
      </div>

      {/* --- Left Dock: LIVE SYSTEM VITALS --- */}
      <div className="absolute top-24 left-10 z-50 w-64 space-y-4 animate-in slide-in-from-left-12 duration-1000">
        <Card className="glass-card border-white/5 bg-black/40 p-6 rounded-[2rem] space-y-6">
           <div className="flex items-center gap-3 border-b border-white/5 pb-4">
              <Activity className="h-4 w-4 text-destructive" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Live System Vitals</h3>
           </div>
           
           <div className="space-y-6">
              <div className="space-y-2">
                 <div className="flex justify-between text-[9px] font-black uppercase text-white/40 tracking-widest">
                    <span>Requests Processed</span>
                    <span className="text-destructive">LIVE</span>
                 </div>
                 <p className="text-2xl font-black text-white tracking-tighter tabular-nums">{vitals.requests.toLocaleString()}</p>
              </div>

              <div className="space-y-3">
                 <div className="flex justify-between text-[9px] font-black uppercase text-white/40 tracking-widest">
                    <span>Requests / Sec</span>
                    <span className="text-white">{Math.round(vitals.rps)} RPS</span>
                 </div>
                 <Sparkline data={vitals.history.rps} color="#ef4444" />
              </div>

              <div className="space-y-3">
                 <div className="flex justify-between text-[9px] font-black uppercase text-white/40 tracking-widest">
                    <span>Threats Blocked</span>
                    <span className="text-destructive font-bold">{vitals.threats}</span>
                 </div>
                 <Sparkline data={vitals.history.threats} color="#ef4444" />
              </div>

              <div className="pt-4 space-y-2">
                 <div className="flex justify-between text-[9px] font-black uppercase text-white/40 tracking-widest">
                    <span>End-to-End Latency</span>
                    <span className={cn("font-bold", vitals.latency > 8 ? "text-amber-500" : "text-emerald-500")}>{vitals.latency}ms</span>
                 </div>
                 <Progress value={(vitals.latency / 12) * 100} className="h-1 bg-white/5" indicatorClassName={vitals.latency > 8 ? "bg-amber-500" : "bg-emerald-500"} />
              </div>
           </div>
           
           <div className="pt-4 flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
              <span className="text-[9px] font-black uppercase text-white/30 tracking-widest">Neural Link: Active</span>
           </div>
        </Card>
      </div>

      {/* --- Top Right: PERFORMANCE HUB --- */}
      <div className="absolute top-10 right-10 z-50 flex flex-col items-end gap-4 animate-in slide-in-from-right-12 duration-1000">
         <div className="flex items-center gap-6 glass-card bg-black/40 p-6 rounded-3xl border-white/5">
            <div className="relative h-16 w-16">
               <svg className="h-full w-full transform -rotate-90">
                  <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-white/5" />
                  <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="transparent" strokeDasharray={176} strokeDashoffset={176 - (98/100 * 176)} className="text-emerald-500" />
               </svg>
               <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-white">98%</div>
            </div>
            <div className="space-y-1">
               <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Global System Health</p>
               <p className="text-xl font-black text-white uppercase tracking-tighter">Operational</p>
            </div>
         </div>
      </div>

      {/* --- Bottom Strip: LIVE PIPELINE ACTIVITY --- */}
      <div className="absolute bottom-10 left-10 right-10 z-50">
        <div className="glass-card bg-black/40 backdrop-blur-2xl p-6 rounded-[2.5rem] border-white/5 overflow-hidden">
           <div className="flex items-center gap-4 mb-4 border-b border-white/5 pb-2">
              <Activity className="h-3 w-3 text-destructive" />
              <h3 className="text-[9px] font-black uppercase tracking-[0.4em] text-white/60">Live Pipeline Activity</h3>
           </div>
           <div className="flex gap-6 overflow-x-auto no-scrollbar py-2">
              {activity.map((event, i) => (
                <div key={event.id} className="flex-shrink-0 w-64 glass-card bg-white/[0.02] p-4 rounded-2xl border-white/5 space-y-3 animate-in slide-in-from-right-4">
                   <div className="flex justify-between items-start">
                      <span className="text-[8px] font-mono text-white/30">PKT_{event.id}</span>
                      <Badge variant={event.attack === 'Safe' ? 'secondary' : 'destructive'} className="text-[7px] py-0 px-1.5 uppercase font-bold">{event.attack}</Badge>
                   </div>
                   <div className="flex justify-between text-[10px] font-black uppercase tracking-tighter text-white/80">
                      <span>{event.city}, {event.country}</span>
                      <span className="text-destructive">{event.stage}</span>
                   </div>
                   <div className="h-0.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-destructive transition-all duration-1000" style={{ width: `${event.progress}%` }} />
                   </div>
                </div>
              ))}
           </div>
        </div>
      </div>

      {/* --- Active Node Modal (Holographic Panel) --- */}
      {activeNode && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center pointer-events-none">
           <div className="w-[550px] glass-card bg-[#0a0c14]/90 backdrop-blur-3xl p-12 rounded-[3rem] border-destructive shadow-[0_0_80px_rgba(239,68,68,0.2)] ring-1 ring-white/10 relative pointer-events-auto animate-in zoom-in-95 fade-in duration-500">
              <button onClick={() => setActiveNode(null)} className="absolute top-8 right-8 p-2 hover:bg-white/5 rounded-full transition-colors group">
                 <X className="h-6 w-6 text-white/50 group-hover:text-white transition-colors" />
              </button>

              <div className="space-y-10">
                 <div className="flex items-center gap-6">
                    <div className="p-5 rounded-3xl bg-white/5 border border-white/10" style={{ color: activeNode.color }}>
                       <Box className="h-10 w-10" />
                    </div>
                    <div className="space-y-1">
                       <h2 className="text-4xl font-black tracking-tighter text-white uppercase">{activeNode.name}</h2>
                       <Badge variant="outline" className="text-[10px] font-black border-white/10 text-white/50 uppercase tracking-widest">{activeNode.tech}</Badge>
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-2">
                       <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">Ingress Flow</p>
                       <p className="text-xs font-mono text-white/80 border-l-2 border-destructive pl-3">{activeNode.input}</p>
                    </div>
                    <div className="space-y-2">
                       <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">Egress Flow</p>
                       <p className="text-xs font-mono text-white/80 border-l-2 border-white/20 pl-3">{activeNode.output}</p>
                    </div>
                 </div>

                 <div className="space-y-4">
                    <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">Operational Logic</p>
                    <p className="text-sm text-white/60 leading-relaxed italic border-b border-white/5 pb-6">"{activeNode.desc}"</p>
                 </div>

                 <div className="space-y-6">
                    <div className="flex justify-between text-[10px] font-black uppercase text-white/40 tracking-widest">
                       <span>Real-time Execution</span>
                       <span className="text-destructive font-mono">LAT: {activeNode.latency}ms</span>
                    </div>
                    <div className="bg-black/60 p-6 rounded-2xl border border-white/5 relative overflow-hidden group">
                       <div className="absolute top-0 left-0 w-full h-[1px] bg-destructive/20 animate-pulse" />
                       <pre className="font-mono text-[10px] text-destructive overflow-x-auto">
                          <code>{activeNode.code}</code>
                       </pre>
                       <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/40 to-transparent" />
                    </div>
                 </div>

                 <div className="flex gap-4">
                    <Button variant="outline" className="flex-1 h-14 rounded-2xl border-white/10 hover:bg-white/5 uppercase font-black text-[10px] tracking-widest">
                       Deep Trace Log
                    </Button>
                    <Button className="flex-1 h-14 rounded-2xl bg-destructive hover:bg-destructive/90 text-white uppercase font-black text-[10px] tracking-widest glow-btn">
                       Isolate Component
                    </Button>
                 </div>
              </div>

              {/* Decorative Corner Elements */}
              <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-destructive/30 rounded-tl-[3rem] -translate-x-2 -translate-y-2" />
              <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-destructive/30 rounded-br-[3rem] translate-x-2 translate-y-2" />
           </div>
        </div>
      )}

      {/* --- Global Cinematic Styles --- */}
      <style jsx global>{`
        @keyframes progress {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .dashboard-cursor {
          cursor: crosshair;
        }
        .radar-sweep {
          background: conic-gradient(from 0deg, transparent 0deg, rgba(239, 68, 68, 0.4) 360deg);
          animation: spin 4s linear infinite;
          border-radius: 50%;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
