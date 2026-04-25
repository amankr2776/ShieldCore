"use client";

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import * as THREE from 'three';
import { 
  Shield, 
  ArrowRight, 
  Target,
  Volume2,
  VolumeX,
  Activity,
  Cpu
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// --- CINEMATIC BACKGROUND COMPONENT ---

const CinematicBackground = () => {
  const threeCanvasRef = useRef<HTMLCanvasElement>(null);
  const dataCanvasRef = useRef<HTMLCanvasElement>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    if (!threeCanvasRef.current) return;
    
    // LAYER 1 & 2: THREE.JS
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ 
      canvas: threeCanvasRef.current, 
      alpha: true, 
      antialias: true 
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Shield (Layer 1)
    const shieldShape = new THREE.Shape();
    shieldShape.moveTo(0, 2);
    shieldShape.lineTo(1.5, 1);
    shieldShape.lineTo(1.5, -1);
    shieldShape.lineTo(0, -2.5);
    shieldShape.lineTo(-1.5, -1);
    shieldShape.lineTo(-1.5, 1);
    shieldShape.closePath();
    
    const shieldGeo = new THREE.ShapeGeometry(shieldShape);
    const shieldEdges = new THREE.EdgesGeometry(shieldGeo);
    const shieldMat = new THREE.LineBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0.4 });
    const shield = new THREE.LineSegments(shieldEdges, shieldMat);
    shield.position.set(3, 0, -8);
    shield.scale.set(2, 2, 2);
    scene.add(shield);

    // Particles (Layer 2)
    const particleCount = 200;
    const particlesGeo = new THREE.BufferGeometry();
    const posArray = new Float32Array(particleCount * 3);
    const colorArray = new Float32Array(particleCount * 3);
    const velocities: { x: number; y: number; z: number }[] = [];

    for (let i = 0; i < particleCount; i++) {
      posArray[i * 3] = (Math.random() - 0.5) * 30;
      posArray[i * 3 + 1] = (Math.random() - 0.5) * 20;
      posArray[i * 3 + 2] = (Math.random() - 0.5) * 10;
      
      const isRed = Math.random() > 0.5;
      colorArray[i * 3] = isRed ? 0.93 : 1;
      colorArray[i * 3 + 1] = isRed ? 0.26 : 1;
      colorArray[i * 3 + 2] = isRed ? 0.26 : 1;

      velocities.push({
        x: (Math.random() - 0.5) * 0.02,
        y: (Math.random() - 0.5) * 0.02,
        z: (Math.random() - 0.5) * 0.02
      });
    }

    particlesGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    particlesGeo.setAttribute('color', new THREE.BufferAttribute(colorArray, 3));
    const pMat = new THREE.PointsMaterial({ size: 0.1, vertexColors: true, transparent: true, opacity: 0.6 });
    const pPoints = new THREE.Points(particlesGeo, pMat);
    scene.add(pPoints);

    // Network Lines
    const lineGeo = new THREE.BufferGeometry();
    const lineMat = new THREE.LineBasicMaterial({ transparent: true, opacity: 0.15, vertexColors: true });
    const lineMesh = new THREE.LineSegments(lineGeo, lineMat);
    scene.add(lineMesh);

    camera.position.z = 12;

    let frameId: number;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      if (reducedMotion) {
        renderer.render(scene, camera);
        return;
      }

      // Shield animation
      shield.rotation.y += 0.003;
      shieldMat.opacity = 0.3 + 0.3 * Math.abs(Math.sin(Date.now() * 0.0005));

      // Particles movement
      const positions = particlesGeo.attributes.position.array as Float32Array;
      const networkPos = [];
      const networkColors = [];

      for (let i = 0; i < particleCount; i++) {
        positions[i * 3] += velocities[i].x;
        positions[i * 3 + 1] += velocities[i].y;
        positions[i * 3 + 2] += velocities[i].z;

        if (Math.abs(positions[i * 3]) > 20) velocities[i].x *= -1;
        if (Math.abs(positions[i * 3 + 1]) > 15) velocities[i].y *= -1;
        if (Math.abs(positions[i * 3 + 2]) > 10) velocities[i].z *= -1;

        // Line threshold check
        for (let j = i + 1; j < particleCount; j++) {
          const dx = positions[i * 3] - positions[j * 3];
          const dy = positions[i * 3 + 1] - positions[j * 3 + 1];
          const dz = positions[i * 3 + 2] - positions[j * 3 + 2];
          const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
          
          if (dist < 4) {
            networkPos.push(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]);
            networkPos.push(positions[j * 3], positions[j * 3 + 1], positions[j * 3 + 2]);
            networkColors.push(colorArray[i * 3], colorArray[i * 3 + 1], colorArray[i * 3 + 2]);
            networkColors.push(colorArray[i * 3], colorArray[i * 3 + 1], colorArray[i * 3 + 2]);
          }
        }
      }
      particlesGeo.attributes.position.needsUpdate = true;
      lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(networkPos, 3));
      lineGeo.setAttribute('color', new THREE.Float32BufferAttribute(networkColors, 3));

      renderer.render(scene, camera);
    };
    animate();

    const resize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', resize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', resize);
      shieldGeo.dispose();
      shieldEdges.dispose();
      shieldMat.dispose();
      particlesGeo.dispose();
      pMat.dispose();
      lineGeo.dispose();
      lineMat.dispose();
      renderer.dispose();
    };
  }, [reducedMotion]);

  useEffect(() => {
    if (!dataCanvasRef.current) return;
    
    const canvas = dataCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Data Streams setup
    const columnsCount = 15;
    const chars = '01ABCDEF<>/={}';
    const columns = Array.from({ length: columnsCount }).map((_, i) => ({
      x: (canvas.width / columnsCount) * i + (canvas.width / columnsCount / 2),
      y: Math.random() * canvas.height,
      speed: 0.3 + Math.random() * 0.5
    }));

    let gridOffset = 0;
    let frameId: number;

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const isStatic = reducedMotion;

      // Layer 4: Grid Floor
      ctx.globalAlpha = 0.25;
      ctx.strokeStyle = '#7f1d1d';
      ctx.lineWidth = 1;
      const horizon = canvas.height * 0.65;
      const startY = canvas.height;
      const gridCount = 20;

      // Vertical lines
      for (let i = -10; i <= 30; i++) {
        const x = (canvas.width / 20) * i;
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2 + (x - canvas.width / 2) * 0.05, horizon);
        ctx.lineTo(x, startY);
        ctx.stroke();
      }

      // Horizontal lines
      if (!isStatic) gridOffset = (gridOffset + 0.5) % 50;
      for (let i = 0; i < gridCount; i++) {
        const p = (i + gridOffset / 50) / gridCount;
        const yPos = horizon + (startY - horizon) * Math.pow(p, 2);
        ctx.beginPath();
        ctx.moveTo(0, yPos);
        ctx.lineTo(canvas.width, yPos);
        ctx.stroke();
      }

      // Layer 3: Matrix Rain
      ctx.font = '12px monospace';
      ctx.textAlign = 'center';
      ctx.globalAlpha = 0.2;
      columns.forEach(col => {
        const grad = ctx.createLinearGradient(col.x, col.y - 150, col.x, col.y);
        grad.addColorStop(0, 'transparent');
        grad.addColorStop(1, '#ef4444');
        ctx.fillStyle = grad;

        for (let i = 0; i < 12; i++) {
          const char = chars[Math.floor(Math.random() * chars.length)];
          ctx.fillText(char, col.x, col.y - (i * 15));
        }

        if (!isStatic) col.y += col.speed;
        if (col.y > canvas.height + 150) col.y = -20;
      });
    };

    animate();

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', resize);
    };
  }, [reducedMotion]);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-background">
      {/* Layer 5: Ambient Orbs */}
      <div className="absolute inset-0 opacity-60">
        <div className="orb orb-red" />
        <div className="orb orb-blue" />
        <div className="orb orb-purple" />
      </div>
      
      {/* WebGL Layer (1 & 2) */}
      <canvas ref={threeCanvasRef} className="absolute inset-0" />
      
      {/* 2D Layer (3 & 4) */}
      <canvas ref={dataCanvasRef} className="absolute inset-0" />
      
      {/* Film Grain & Depth Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)] dark:bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)]" />
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }} />

      <style jsx>{`
        .orb { position: absolute; border-radius: 50%; filter: blur(80px); }
        .orb-red { width: 600px; height: 600px; background: radial-gradient(circle, #991b1b 0%, transparent 70%); top: -100px; left: -100px; opacity: 0.15; animation: orbOrbit 20s linear infinite; }
        .orb-blue { width: 800px; height: 800px; background: radial-gradient(circle, #1e3a5f 0%, transparent 70%); bottom: -200px; right: -200px; opacity: 0.12; animation: orbOrbit 25s linear reverse infinite; }
        .orb-purple { width: 500px; height: 500px; background: radial-gradient(circle, #3b0764 0%, transparent 70%); top: 50%; left: 50%; transform: translate(-50%, -50%); opacity: 0.08; animation: orbPulse 15s ease-in-out infinite; }
        @keyframes orbOrbit { 0% { transform: translate(0, 0); } 25% { transform: translate(100px, 50px); } 50% { transform: translate(50px, 100px); } 75% { transform: translate(-50px, 50px); } 100% { transform: translate(0, 0); } }
        @keyframes orbPulse { 0%, 100% { opacity: 0.05; transform: translate(-50%, -50%) scale(1); } 50% { opacity: 0.1; transform: translate(-50%, -50%) scale(1.1); } }
      `}</style>
    </div>
  );
};

// --- MAIN PAGE ---

export default function LandingPage() {
  const [stats, setStats] = useState({ blocked: 124902, analyzed: 2845920 });
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        blocked: prev.blocked + Math.floor(Math.random() * 5),
        analyzed: prev.analyzed + Math.floor(Math.random() * 20)
      }));
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden font-body text-foreground selection:bg-destructive/40">
      
      <CinematicBackground />

      {/* Cinematic Letterbox */}
      <div className="fixed top-0 left-0 w-full h-[8vh] bg-black z-[200] pointer-events-none opacity-60 dark:opacity-80" />
      <div className="fixed bottom-0 left-0 w-full h-[8vh] bg-black z-[200] pointer-events-none opacity-60 dark:opacity-80" />
      
      {/* Telemetry Docks */}
      <div className="fixed inset-0 z-20 pointer-events-none">
        <div className="absolute top-24 left-12 w-64 glass-card p-6 rounded-2xl border-white/10 dark:border-white/5 bg-background/40 backdrop-blur-md">
           <div className="flex items-center gap-3 mb-4">
              <Activity className="h-4 w-4 text-destructive animate-pulse" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em]">Live Ingress Forensics</h3>
           </div>
           <div className="space-y-4">
              <div>
                 <p className="text-[8px] uppercase font-black opacity-40 mb-1">Total Blocks</p>
                 <p className="text-2xl font-black text-destructive tracking-tighter">{stats.blocked.toLocaleString()}</p>
              </div>
              <div>
                 <p className="text-[8px] uppercase font-black opacity-40 mb-1">Packets Inspected</p>
                 <p className="text-2xl font-black text-cyan-500 dark:text-cyan-400 tracking-tighter">{stats.analyzed.toLocaleString()}</p>
              </div>
           </div>
        </div>

        <div className="absolute bottom-24 right-12 w-64 glass-card p-6 rounded-2xl border-white/10 dark:border-white/5 bg-background/40 backdrop-blur-md">
           <div className="flex items-center gap-3 mb-4">
              <Cpu className="h-4 w-4 text-emerald-500" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em]">Neural Integrity</h3>
           </div>
           <div className="space-y-3">
              {['WAF Node 92', 'LPU Uplink', 'DDoS Mitigator'].map((node, i) => (
                <div key={i} className="flex items-center justify-between">
                   <span className="text-[9px] font-bold opacity-60 uppercase">{node}</span>
                   <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                </div>
              ))}
           </div>
        </div>
      </div>

      {/* Hero Content */}
      <section className="relative z-50 flex flex-col items-center justify-center min-h-screen text-center px-6">
        <div className="max-w-4xl space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-destructive/10 border border-destructive/30 text-destructive text-[10px] font-black tracking-[0.5em] uppercase shadow-[0_0_30px_rgba(239,68,68,0.2)]">
              <Target className="h-4 w-4 animate-pulse" />
              Strategic Defense Node Active
            </div>
            
            <h1 className="text-7xl md:text-[9rem] font-black tracking-tighter leading-[0.85] uppercase">
              SHIELD<span className="text-destructive glow-text-red">CORE</span>
            </h1>
            
            <p className="text-xl md:text-2xl opacity-80 max-w-2xl mx-auto font-medium leading-relaxed italic mt-6">
              LPU-accelerated neural packet inspection. <br />
              Global edge protection for the modern internet.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-8 pt-8 items-center justify-center">
            <Button asChild size="lg" className="bg-destructive hover:bg-destructive/90 text-white font-black h-20 px-14 text-xl rounded-2xl glow-btn transition-all duration-500 hover:scale-105 active:scale-95 uppercase tracking-widest shadow-[0_0_50px_rgba(239,68,68,0.3)]">
              <Link href="/login">Launch Console <ArrowRight className="ml-3 h-6 w-6" /></Link>
            </Button>
            
            <Button variant="outline" size="lg" className="border-border/40 bg-secondary/10 hover:bg-secondary/20 font-black h-20 px-14 text-xl rounded-2xl transition-all duration-500 uppercase tracking-widest backdrop-blur-xl">
               Learn Specs
            </Button>
          </div>
        </div>
      </section>

      <button 
        onClick={() => setIsMuted(!isMuted)} 
        className="fixed bottom-12 left-12 z-[500] h-12 w-12 rounded-full border border-border/20 bg-background/40 backdrop-blur-xl flex items-center justify-center opacity-40 hover:opacity-100 transition-all"
      >
        {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
      </button>

      <div className="fixed bottom-12 right-12 z-[500] text-[8px] font-mono opacity-30 uppercase tracking-[0.4em]">
         ShieldCore Neural Cluster v1.0.0 // LPU Node Active
      </div>

      <style jsx global>{`
        .glow-text-red {
          text-shadow: 0 0 20px rgba(239, 68, 68, 0.8), 0 0 40px rgba(239, 68, 68, 0.4);
        }
        .glow-btn {
          box-shadow: 0 0 30px rgba(239, 68, 68, 0.3);
        }
      `}</style>
    </div>
  );
}
