
"use client";

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import * as THREE from 'three';
import { Shield, Zap, BarChart3, ArrowRight, Lock, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function LandingPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mounted, setVisible] = useState(false);

  useEffect(() => {
    if (!canvasRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Particle Field
    const particlesCount = 3000;
    const posArray = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 10;
    }
    const particlesGeometry = new THREE.BufferGeometry();
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.005,
      color: 0xef4444,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });
    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    // 3D Shield Wireframe
    const shieldGeometry = new THREE.OctahedronGeometry(1, 2);
    const shieldMaterial = new THREE.MeshBasicMaterial({
      color: 0xef4444,
      wireframe: true,
      transparent: true,
      opacity: 0.3
    });
    const shieldMesh = new THREE.Mesh(shieldGeometry, shieldMaterial);
    shieldMesh.scale.set(1.5, 1.8, 0.5);
    scene.add(shieldMesh);

    camera.position.z = 3;

    // Mouse Parallax
    let mouseX = 0;
    let mouseY = 0;
    const onMouseMove = (event: MouseEvent) => {
      mouseX = (event.clientX / window.innerWidth - 0.5);
      mouseY = (event.clientY / window.innerHeight - 0.5);
    };
    window.addEventListener('mousemove', onMouseMove);

    const animate = () => {
      requestAnimationFrame(animate);
      particlesMesh.rotation.y += 0.001;
      particlesMesh.rotation.x += 0.0005;
      
      shieldMesh.rotation.y += 0.01;
      
      // Parallax smooth
      camera.position.x += (mouseX * 0.5 - camera.position.x) * 0.05;
      camera.position.y += (-mouseY * 0.5 - camera.position.y) * 0.05;
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
    <div className="flex flex-col min-h-screen bg-[#020408] overflow-hidden selection:bg-destructive/30">
      <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none opacity-60" />

      {/* Hero Section */}
      <section className="relative z-10 container mx-auto px-6 pt-32 pb-24 flex flex-col items-center text-center space-y-12">
        <div className="space-y-4 animate-in fade-in slide-in-from-top-8 duration-1000">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-destructive/10 border border-destructive/30 text-destructive text-[10px] font-bold tracking-[0.3em] uppercase">
            <Activity className="h-3 w-3" />
            Neural Engine Active
          </div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white glow-text-red leading-[0.9]">
            AI-POWERED <br />
            <span className="text-destructive">SECURITY</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-medium leading-relaxed">
            Real-time semantic threat detection using fine-tuned DistilBERT intelligence. 
            Intercept obfuscated attacks that traditional firewalls ignore.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-6 pt-4 animate-in fade-in zoom-in-95 duration-1000 delay-300">
          <Button asChild size="lg" className="bg-destructive hover:bg-destructive/90 text-white font-bold h-16 px-10 text-lg rounded-xl glow-btn transition-all duration-300">
            <Link href="/login">Launch Command <ArrowRight className="ml-2 h-5 w-5" /></Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="h-16 px-10 text-lg rounded-xl border-white/10 bg-white/5 backdrop-blur-xl hover:bg-white/10 transition-all duration-300">
            <Link href="/architecture">System Specs</Link>
          </Button>
        </div>

        {/* Stats Strip */}
        <div className="w-full max-w-5xl grid grid-cols-2 md:grid-cols-4 gap-8 py-12 border-y border-white/5 bg-white/[0.02] backdrop-blur-md rounded-3xl animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500">
           <CounterStat label="Training Samples" value={61000} suffix="" />
           <CounterStat label="Model Accuracy" value={94.3} suffix="%" />
           <CounterStat label="Attack Vectors" value={6} suffix="" />
           <CounterStat label="Inference" value={7} suffix="ms" />
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 container mx-auto px-6 py-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { 
              icon: Shield, 
              title: "Semantic Analysis", 
              desc: "Deep packet inspection powered by Transformers. We detect intent, not just string patterns.",
              color: "text-destructive"
            },
            { 
              icon: Zap, 
              title: "Extreme Latency", 
              desc: "Edge-optimized inference pipeline ensures security never bottlenecks your performance.",
              color: "text-amber-500"
            },
            { 
              icon: BarChart3, 
              title: "Live Forensics", 
              desc: "Step-by-step decode replay and geographic telemetry for full incident transparency.",
              color: "text-emerald-500"
            }
          ].map((feature, i) => (
            <div key={i} className="glass-card group p-10 rounded-3xl border border-white/5 hover:border-destructive/30 transition-all duration-500 flex flex-col items-center text-center">
              <div className={`p-5 rounded-2xl bg-secondary/50 mb-8 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500 ${feature.color}`}>
                <feature.icon className="h-10 w-10" />
              </div>
              <h3 className="text-2xl font-bold mb-4 tracking-tight">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed text-sm">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 container mx-auto px-6 py-12 mt-auto border-t border-white/5">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3 font-bold text-2xl tracking-tighter">
            <Shield className="h-8 w-8 text-destructive" />
            <span>FUSIONX <span className="text-destructive">WAF</span></span>
          </div>
          <div className="text-xs text-muted-foreground font-mono uppercase tracking-widest text-center">
            Dataset: CSIC 2010 | Built for Hackathon 2026
          </div>
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
            <Lock className="h-3 w-3" /> Encrypted Transmission
          </div>
        </div>
      </footer>
    </div>
  );
}

function CounterStat({ label, value, suffix }: { label: string, value: number, suffix: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        let start = 0;
        const end = value;
        const duration = 2000;
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
    <div ref={ref} className="text-center space-y-1">
      <p className="text-3xl font-black tracking-tighter text-white">
        {value % 1 === 0 ? Math.floor(count).toLocaleString() : count.toFixed(1)}{suffix}
      </p>
      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">{label}</p>
    </div>
  );
}
