
"use client";

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import * as THREE from 'three';
import { Shield, ArrowRight, Activity, Zap, BarChart3, Lock, Cpu, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function LandingPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mounted, setVisible] = useState(false);

  useEffect(() => {
    if (!canvasRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ 
      canvas: canvasRef.current, 
      antialias: true, 
      alpha: true 
    });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // --- 1. Starfield Particle System ---
    const particlesCount = 10000;
    const posArray = new Float32Array(particlesCount * 3);
    const speedArray = new Float32Array(particlesCount);

    for (let i = 0; i < particlesCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 20;
    }
    for (let i = 0; i < particlesCount; i++) {
      speedArray[i] = Math.random() * 0.005 + 0.002;
    }

    const particlesGeometry = new THREE.BufferGeometry();
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    
    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.015,
      color: 0x00ffff,
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending,
    });
    
    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    // --- 2. Holographic Globe ---
    const globeGroup = new THREE.Group();
    
    // Grid Lines (Holographic Earth)
    const globeGeo = new THREE.SphereGeometry(2, 64, 64);
    const globeMat = new THREE.MeshBasicMaterial({
      color: 0x00eaff,
      wireframe: true,
      transparent: true,
      opacity: 0.15,
      blending: THREE.AdditiveBlending
    });
    const globe = new THREE.Mesh(globeGeo, globeMat);
    globeGroup.add(globe);

    // Inner Glow
    const innerGlobeGeo = new THREE.SphereGeometry(1.95, 32, 32);
    const innerGlobeMat = new THREE.MeshBasicMaterial({
      color: 0x0055ff,
      transparent: true,
      opacity: 0.05
    });
    const innerGlobe = new THREE.Mesh(innerGlobeGeo, innerGlobeMat);
    globeGroup.add(innerGlobe);

    // City Origin Dots
    const cities = [
      { lat: 40.7128, lon: -74.0060 }, // New York
      { lat: 35.6762, lon: 139.6503 }, // Tokyo
      { lat: 51.5074, lon: -0.1278 },  // London
      { lat: -33.8688, lon: 151.2093 }, // Sydney
      { lat: 31.2304, lon: 121.4737 }, // Shanghai
      { lat: -23.5505, lon: -46.6333 }, // Sao Paulo
      { lat: 55.7558, lon: 37.6173 },   // Moscow
    ];

    const dotGeo = new THREE.SphereGeometry(0.04, 8, 8);
    const dotMat = new THREE.MeshBasicMaterial({ color: 0xff0000, transparent: true, opacity: 0.8 });
    
    const cityDots: THREE.Mesh[] = [];

    cities.forEach(city => {
      const phi = (90 - city.lat) * (Math.PI / 180);
      const theta = (city.lon + 180) * (Math.PI / 180);
      
      const dot = new THREE.Mesh(dotGeo, dotMat);
      dot.position.x = 2 * Math.sin(phi) * Math.cos(theta);
      dot.position.y = 2 * Math.cos(phi);
      dot.position.z = 2 * Math.sin(phi) * Math.sin(theta);
      
      globeGroup.add(dot);
      cityDots.push(dot);
    });

    scene.add(globeGroup);

    // --- 3. Attack Trajectory Arcs ---
    const arcsGroup = new THREE.Group();
    scene.add(arcsGroup);

    const createArc = (start: THREE.Vector3) => {
      const end = new THREE.Vector3(
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10,
        Math.random() * 5 + 5
      );
      
      const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
      mid.y += 2; // Curve height
      
      const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
      const points = curve.getPoints(50);
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      
      const material = new THREE.LineBasicMaterial({ 
        color: 0xff3333, 
        transparent: true, 
        opacity: 0.4,
        blending: THREE.AdditiveBlending 
      });
      
      const line = new THREE.Line(geometry, material);
      (line as any).life = 1.0;
      (line as any).speed = Math.random() * 0.01 + 0.005;
      return line;
    };

    let activeArcs: THREE.Line[] = [];

    // --- 4. Lighting ---
    const mainLight = new THREE.PointLight(0x00ffff, 2, 50);
    mainLight.position.set(5, 5, 5);
    scene.add(mainLight);

    camera.position.z = 6;

    let mouseX = 0;
    let mouseY = 0;
    const onMouseMove = (event: MouseEvent) => {
      mouseX = (event.clientX / window.innerWidth - 0.5);
      mouseY = (event.clientY / window.innerHeight - 0.5);
    };
    window.addEventListener('mousemove', onMouseMove);

    const animate = () => {
      requestAnimationFrame(animate);

      // Globe Rotation
      globeGroup.rotation.y += 0.002;
      globeGroup.rotation.x += 0.0005;

      // Particle Drift
      const positions = particlesGeometry.attributes.position.array as Float32Array;
      for (let i = 0; i < particlesCount; i++) {
        const i3 = i * 3;
        positions[i3 + 2] += speedArray[i];
        if (positions[i3 + 2] > 10) positions[i3 + 2] = -10;
      }
      particlesGeometry.attributes.position.needsUpdate = true;

      // Manage Arcs
      if (Math.random() > 0.95 && activeArcs.length < 15) {
        const randomDot = cityDots[Math.floor(Math.random() * cityDots.length)];
        const worldPos = new THREE.Vector3();
        randomDot.getWorldPosition(worldPos);
        const arc = createArc(worldPos);
        arcsGroup.add(arc);
        activeArcs.push(arc);
      }

      activeArcs.forEach((arc, index) => {
        (arc as any).life -= (arc as any).speed;
        (arc.material as THREE.LineBasicMaterial).opacity = (arc as any).life * 0.4;
        if ((arc as any).life <= 0) {
          arcsGroup.remove(arc);
          activeArcs.splice(index, 1);
        }
      });

      // Parallax
      camera.position.x += (mouseX * 2 - camera.position.x) * 0.05;
      camera.position.y += (-mouseY * 2 - camera.position.y) * 0.05;
      camera.lookAt(scene.position);

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    setVisible(true);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-[#020408] transition-colors duration-300 overflow-hidden selection:bg-destructive/30">
      {/* 3D Cinematic Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <canvas ref={canvasRef} className="w-full h-full opacity-80" />
        
        {/* Nebula Fog Effect */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(88,28,135,0.15)_0%,transparent_70%)] animate-pulse" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(30,58,138,0.1)_0%,transparent_50%)]" />
        
        {/* Hexagonal Matrix Overlay */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M30 0l25.98 15v30L30 60 4.02 45V15z\' fill-opacity=\'0.4\' fill=\'%2300ffff\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")', backgroundSize: '60px' }} />
      </div>
      
      {/* Scanline Overlay */}
      <div className="fixed inset-0 z-[5] pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] bg-[length:100%_2px,3px_100%] opacity-20" />

      <section className="relative z-10 container mx-auto px-6 pt-32 pb-24 flex flex-col items-center text-center space-y-12 min-h-screen justify-center">
        <div className="space-y-6 animate-in fade-in slide-in-from-top-12 duration-1000">
          <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-destructive/10 border border-destructive/30 text-destructive text-[10px] font-black tracking-[0.4em] uppercase shadow-[0_0_20px_rgba(239,68,68,0.2)]">
            <Activity className="h-3.5 w-3.5 animate-pulse" />
            ShieldCore Neural Cluster Active
          </div>
          
          <div className="relative">
            <h1 className="text-7xl md:text-[10rem] font-black tracking-tighter text-gray-900 dark:text-white leading-[0.85] uppercase">
              SHIELD<span className="text-destructive dark:glow-text-red">CORE</span>
            </h1>
            <div className="absolute -bottom-4 left-0 right-0 h-px bg-gradient-to-r from-transparent via-destructive to-transparent opacity-50" />
          </div>

          <h2 className="text-3xl md:text-5xl font-black text-gray-800 dark:text-gray-200 tracking-tight opacity-90">
            AI-POWERED <span className="text-destructive italic">SECURITY</span>
          </h2>
          
          <p className="text-lg md:text-xl text-gray-500 dark:text-muted-foreground max-w-2xl mx-auto font-medium leading-relaxed italic opacity-80">
            LPU-accelerated neural packet inspection. <br />
            Deep semantic detection. Global edge protection.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-8 pt-8 animate-in fade-in zoom-in-95 duration-1000 delay-300">
          <Button asChild size="lg" className="bg-destructive hover:bg-destructive/90 text-white font-black h-20 px-14 text-xl rounded-2xl glow-btn transition-all duration-500 hover:scale-105 active:scale-95 uppercase tracking-widest shadow-[0_0_30px_rgba(239,68,68,0.4)]">
            <Link href="/login">Launch Console <ArrowRight className="ml-3 h-6 w-6" /></Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="h-20 px-14 text-xl rounded-2xl border-gray-200 dark:border-white/10 bg-white/5 dark:bg-white/5 backdrop-blur-2xl hover:bg-white/10 transition-all duration-500 text-gray-900 dark:text-white font-black uppercase tracking-widest">
            <Link href="/architecture">System Specs</Link>
          </Button>
        </div>

        {/* Real-time Stats Bar */}
        <div className="w-full max-w-6xl grid grid-cols-2 md:grid-cols-4 gap-12 py-16 border-y border-gray-100 dark:border-white/5 bg-gray-50/10 dark:bg-white/[0.02] backdrop-blur-3xl rounded-[3rem] animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500 mt-20">
           <CounterStat label="Training Samples" value={61000} suffix="" icon={Globe} />
           <CounterStat label="Model Accuracy" value={94.3} suffix="%" icon={Cpu} />
           <CounterStat label="Attack Vectors" value={6} suffix="" icon={Shield} />
           <CounterStat label="LPU Latency" value={7} suffix="ms" icon={Zap} />
        </div>
      </section>

      {/* Feature Section with Cinematic Cards */}
      <section className="relative z-10 container mx-auto px-6 py-32 space-y-20">
        <div className="text-center space-y-4">
          <div className="section-label mx-auto inline-block border-none pl-0">Strategic Advantages</div>
          <h3 className="text-5xl font-black tracking-tighter dark:text-white uppercase">Beyond Pattern Matching</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {[
            { 
              icon: Shield, 
              title: "Semantic Analysis", 
              desc: "Deep packet inspection powered by fine-tuned Llama-3. We detect the underlying intent of obfuscated payloads.",
              color: "text-destructive"
            },
            { 
              icon: Zap, 
              title: "Extreme Throughput", 
              desc: "Groq LPU hardware ensures sub-10ms inference. Security is no longer a bottleneck for your edge performance.",
              color: "text-amber-500"
            },
            { 
              icon: BarChart3, 
              title: "Live Forensics", 
              desc: "Complete transparency with step-by-step de-obfuscation replay and geographic signal mapping.",
              color: "text-emerald-500"
            }
          ].map((feature, i) => (
            <div key={i} className="glass-card group p-12 rounded-[2.5rem] border border-gray-100 dark:border-white/5 hover:border-destructive/30 transition-all duration-700 flex flex-col items-center text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-destructive/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <div className={`p-6 rounded-[2rem] bg-gray-100 dark:bg-secondary/50 mb-10 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-700 shadow-xl ${feature.color}`}>
                <feature.icon className="h-12 w-12" />
              </div>
              <h3 className="text-2xl font-black mb-4 tracking-tight text-gray-900 dark:text-white uppercase">{feature.title}</h3>
              <p className="text-gray-500 dark:text-muted-foreground leading-relaxed text-sm font-medium italic opacity-80">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="relative z-10 container mx-auto px-6 py-16 mt-auto border-t border-gray-100 dark:border-white/5">
        <div className="flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="flex items-center gap-4 font-black text-3xl tracking-tighter text-gray-900 dark:text-white">
            <Shield className="h-10 w-10 text-destructive animate-pulse" />
            <span>SHIELDCORE <span className="text-destructive">WAF</span></span>
          </div>
          <div className="text-[10px] text-gray-400 dark:text-muted-foreground font-mono uppercase tracking-[0.4em] text-center opacity-50">
            System: SC-Neural-92 | LPU Hardware Uplink: Active
          </div>
          <div className="flex items-center gap-3 text-[10px] text-gray-500 dark:text-muted-foreground font-black uppercase tracking-widest bg-white/5 px-6 py-2 rounded-full border border-white/5">
            <Lock className="h-3.5 w-3.5 text-destructive" /> Encrypted Command Channel
          </div>
        </div>
      </footer>
    </div>
  );
}

function CounterStat({ label, value, suffix, icon: Icon }: { label: string, value: number, suffix: string, icon: any }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        let start = 0;
        const end = value;
        const duration = 2500;
        const increment = end / (duration / 16);
        
        const timer = setInterval(() => {
          start += increment;
          if (start >= end) {
            setCount(end);
            clearInterval(timer);
          } else {
            setCount(start);
          }
        }, 16);
      }
    }, { threshold: 0.5 });

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value]);

  return (
    <div ref={ref} className="text-center space-y-3 group">
      <div className="mx-auto w-10 h-10 flex items-center justify-center rounded-xl bg-destructive/5 text-destructive group-hover:scale-125 transition-transform duration-500">
        <Icon className="h-5 w-5" />
      </div>
      <div className="space-y-1">
        <p className="text-4xl font-black tracking-tighter text-gray-900 dark:text-white">
          {value % 1 === 0 ? Math.floor(count).toLocaleString() : count.toFixed(1)}{suffix}
        </p>
        <p className="text-[10px] text-gray-400 dark:text-muted-foreground uppercase font-black tracking-[0.2em] opacity-40">{label}</p>
      </div>
    </div>
  );
}
