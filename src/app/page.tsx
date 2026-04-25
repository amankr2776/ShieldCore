
"use client";

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import * as THREE from 'three';
import { Shield, ArrowRight, Activity, Zap, BarChart3, Lock, Cpu, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// --- Shader Constants ---
const ATMOSPHERE_VERTEX = `
  varying vec3 vNormal;
  varying vec3 vEyeVector;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vEyeVector = -vec3(mvPosition.xyz);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const ATMOSPHERE_FRAGMENT = `
  varying vec3 vNormal;
  varying vec3 vEyeVector;
  void main() {
    float intensity = pow(0.6 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
    gl_FragColor = vec4(0.3, 0.6, 1.0, 1.0) * intensity;
  }
`;

const AURORA_VERTEX = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const AURORA_FRAGMENT = `
  uniform float time;
  varying vec2 vUv;
  void main() {
    float noise = sin(vUv.x * 20.0 + time) * cos(vUv.y * 10.0 + time * 0.5);
    vec3 color = mix(vec3(0.0, 1.0, 0.4), vec3(0.5, 0.0, 1.0), vUv.y);
    gl_FragColor = vec4(color, abs(noise) * (1.0 - vUv.y) * 0.4);
  }
`;

// --- Global City Data (47 Cities) ---
const CITIES = [
  { name: "New York", lat: 40.7128, lon: -74.0060 },
  { name: "London", lat: 51.5074, lon: -0.1278 },
  { name: "Tokyo", lat: 35.6762, lon: 139.6503 },
  { name: "Beijing", lat: 39.9042, lon: 116.4074 },
  { name: "Moscow", lat: 55.7558, lon: 37.6173 },
  { name: "Sydney", lat: -33.8688, lon: 151.2093 },
  { name: "Rio", lat: -22.9068, lon: -43.1729 },
  { name: "Cape Town", lat: -33.9249, lon: 18.4241 },
  { name: "Dubai", lat: 25.2048, lon: 55.2708 },
  { name: "Mumbai", lat: 19.0760, lon: 72.8777 },
  { name: "Paris", lat: 48.8566, lon: 2.3522 },
  { name: "Berlin", lat: 52.5200, lon: 13.4050 },
  { name: "Los Angeles", lat: 34.0522, lon: -118.2437 },
  { name: "Chicago", lat: 41.8781, lon: -87.6298 },
  { name: "Sao Paulo", lat: -23.5505, lon: -46.6333 },
  { name: "Mexico City", lat: 19.4326, lon: -99.1332 },
  { name: "Cairo", lat: 30.0444, lon: 31.2357 },
  { name: "Istanbul", lat: 41.0082, lon: 28.9784 },
  { name: "Seoul", lat: 37.5665, lon: 126.9780 },
  { name: "Jakarta", lat: -6.2088, lon: 106.8456 },
  { name: "Lagos", lat: 6.5244, lon: 3.3792 },
  { name: "Lima", lat: -12.0464, lon: -77.0428 },
  { name: "Bangkok", lat: 13.7563, lon: 100.5018 },
  { name: "Hong Kong", lat: 22.3193, lon: 114.1694 },
  { name: "Singapore", lat: 1.3521, lon: 103.8198 },
  { name: "Toronto", lat: 43.6532, lon: -79.3832 },
  { name: "Madrid", lat: 40.4168, lon: -3.7038 },
  { name: "Rome", lat: 41.9028, lon: 12.4964 },
  { name: "Amsterdam", lat: 52.3676, lon: 4.9041 },
  { name: "Stockholm", lat: 59.3293, lon: 18.0686 },
  { name: "Oslo", lat: 59.9139, lon: 10.7522 },
  { name: "Helsinki", lat: 60.1699, lon: 24.9384 },
  { name: "Warsaw", lat: 52.2297, lon: 21.0122 },
  { name: "Vienna", lat: 48.2082, lon: 16.3738 },
  { name: "Prague", lat: 50.0755, lon: 14.4378 },
  { name: "Budapest", lat: 47.4979, lon: 19.0402 },
  { name: "Athens", lat: 37.9838, lon: 23.7275 },
  { name: "Lisbon", lat: 38.7223, lon: -9.1393 },
  { name: "Dublin", lat: 53.3498, lon: -6.2603 },
  { name: "Tel Aviv", lat: 32.0853, lon: 34.7818 },
  { name: "Riyadh", lat: 24.7136, lon: 46.6753 },
  { name: "Tehran", lat: 35.6892, lon: 51.3890 },
  { name: "Karachi", lat: 24.8607, lon: 67.0011 },
  { name: "Delhi", lat: 28.6139, lon: 77.2090 },
  { name: "Dhaka", lat: 23.8103, lon: 90.4125 },
  { name: "Melbourne", lat: -37.8136, lon: 144.9631 },
  { name: "Auckland", lat: -36.8485, lon: 174.7633 },
];

const ATTACK_COLORS = {
  SQL: 0xef4444,
  XSS: 0xf97316,
  CMD: 0x22c55e,
  SSRF: 0x8b5cf6,
  ZERO: 0xffffff
};

export default function LandingPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [introFinished, setIntroFinished] = useState(false);
  const [bootText, setBootText] = useState("");

  useEffect(() => {
    if (!canvasRef.current) return;

    // --- 1. Core Scene Setup ---
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 2000);
    const renderer = new THREE.WebGLRenderer({ 
      canvas: canvasRef.current, 
      antialias: true, 
      alpha: true 
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // --- 2. Globe Layers ---
    const globeGroup = new THREE.Group();
    globeGroup.rotation.y = -Math.PI / 2;
    globeGroup.rotation.z = THREE.MathUtils.degToRad(23.5);
    scene.add(globeGroup);

    // Texture surface (Procedural Night Lights)
    const globeGeo = new THREE.SphereGeometry(4, 128, 128);
    const globeMat = new THREE.MeshStandardMaterial({
      color: 0x010204,
      roughness: 0.8,
      metalness: 0.2,
      emissive: 0x050a15,
      emissiveIntensity: 0.5
    });
    const globeMesh = new THREE.Mesh(globeGeo, globeMat);
    globeGroup.add(globeMesh);

    // City Dots Instanced
    const cityDotGeo = new THREE.SphereGeometry(0.015, 12, 12);
    const cityDotMat = new THREE.MeshBasicMaterial({ color: 0x00eaff });
    const cityDots = new THREE.InstancedMesh(cityDotGeo, cityDotMat, CITIES.length);
    const dummy = new THREE.Object3D();

    const cityPositions: THREE.Vector3[] = [];
    CITIES.forEach((city, i) => {
      const phi = (90 - city.lat) * (Math.PI / 180);
      const theta = (city.lon + 180) * (Math.PI / 180);
      const pos = new THREE.Vector3(
        4 * Math.sin(phi) * Math.cos(theta),
        4 * Math.cos(phi),
        4 * Math.sin(phi) * Math.sin(theta)
      );
      dummy.position.copy(pos);
      dummy.updateMatrix();
      cityDots.setMatrixAt(i, dummy.matrix);
      cityPositions.push(pos);
    });
    globeGroup.add(cityDots);

    // Atmosphere Halo
    const atmosGeo = new THREE.SphereGeometry(4.2, 128, 128);
    const atmosMat = new THREE.ShaderMaterial({
      vertexShader: ATMOSPHERE_VERTEX,
      fragmentShader: ATMOSPHERE_FRAGMENT,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true
    });
    const atmosMesh = new THREE.Mesh(atmosGeo, atmosMat);
    globeGroup.add(atmosMesh);

    // Clouds
    const cloudGeo = new THREE.SphereGeometry(4.05, 64, 64);
    const cloudMat = new THREE.MeshStandardMaterial({
      transparent: true,
      opacity: 0.2,
      color: 0xffffff,
      alphaTest: 0.01
    });
    const cloudMesh = new THREE.Mesh(cloudGeo, cloudMat);
    globeGroup.add(cloudMesh);

    // --- 3. Attack Arc Management ---
    const arcsGroup = new THREE.Group();
    globeGroup.add(arcsGroup);
    let activeArcs: any[] = [];

    const createArc = () => {
      const startIdx = Math.floor(Math.random() * CITIES.length);
      const endIdx = Math.floor(Math.random() * CITIES.length);
      if (startIdx === endIdx) return null;

      const start = cityPositions[startIdx];
      const end = cityPositions[endIdx];
      const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5).normalize().multiplyScalar(5.5);
      
      const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
      const points = curve.getPoints(100);
      const geo = new THREE.BufferGeometry().setFromPoints(points);
      
      const types = Object.keys(ATTACK_COLORS);
      const type = types[Math.floor(Math.random() * types.length)] as keyof typeof ATTACK_COLORS;
      const color = ATTACK_COLORS[type];

      const mat = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0 });
      const line = new THREE.Line(geo, mat);
      
      (line as any).progress = 0;
      (line as any).speed = 0.01 + Math.random() * 0.01;
      (line as any).type = type;
      return line;
    };

    // --- 4. Starfield & Nebulae ---
    const starsCount = 100000;
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(starsCount * 3);
    for (let i = 0; i < starsCount * 3; i++) starPos[i] = (Math.random() - 0.5) * 40;
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({ size: 0.01, color: 0xffffff, transparent: true, opacity: 0.5 });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    // --- 5. Data Rings ---
    const ringGroup = new THREE.Group();
    scene.add(ringGroup);
    const createRing = (radius: number, count: number, color: number) => {
      const g = new THREE.Group();
      const geo = new THREE.PlaneGeometry(0.1, 0.05);
      const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.3, side: THREE.DoubleSide });
      for(let i=0; i<count; i++) {
        const m = new THREE.Mesh(geo, mat);
        const a = (i/count) * Math.PI * 2;
        m.position.set(Math.cos(a)*radius, 0, Math.sin(a)*radius);
        m.lookAt(0,0,0);
        g.add(m);
      }
      return g;
    };
    const ring1 = createRing(5.5, 60, 0x22c55e);
    const ring2 = createRing(6.5, 40, 0x00eaff);
    ring2.rotation.x = Math.PI / 4;
    ringGroup.add(ring1, ring2);

    // --- 6. Intro Sequence Logic ---
    let introStartTime = Date.now();
    const INTRO_DURATION = 4000;
    camera.position.z = 15;

    // --- 7. Animation Loop ---
    const clock = new THREE.Clock();
    let mouseX = 0, mouseY = 0;
    window.addEventListener('mousemove', (e) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    });

    const animate = () => {
      requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = Date.now() - introStartTime;

      // Handle Intro Sequence
      if (elapsed < INTRO_DURATION) {
        const p = elapsed / INTRO_DURATION;
        if (p < 0.25) {
          // Supernova Shockwave (handled by CSS/Overlay)
        } else {
          setIntroFinished(true);
          const assemblyP = (p - 0.25) / 0.75;
          camera.position.z = THREE.MathUtils.lerp(30, 10, assemblyP);
          globeMesh.scale.setScalar(assemblyP);
        }
      }

      // Continuous Animations
      globeGroup.rotation.y += 0.0005;
      ring1.rotation.y += 0.002;
      ring2.rotation.y -= 0.001;
      stars.rotation.y += 0.0001;

      // Attack Arcs
      if (introFinished && Math.random() > 0.9 && activeArcs.length < 80) {
        const arc = createArc();
        if (arc) {
          arcsGroup.add(arc);
          activeArcs.push(arc);
        }
      }

      activeArcs.forEach((arc, i) => {
        arc.progress += arc.speed;
        const mat = arc.material as THREE.LineBasicMaterial;
        mat.opacity = arc.progress < 0.5 ? arc.progress * 2 : (1 - arc.progress) * 2;
        if (arc.progress >= 1) {
          arcsGroup.remove(arc);
          activeArcs.splice(i, 1);
        }
      });

      // Camera Parallax
      camera.position.x += (mouseX * 2 - camera.position.x) * 0.02;
      camera.position.y += (-mouseY * 2 - camera.position.y) * 0.02;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };
    animate();

    // Intro Text Sequence
    const textSteps = [
      { text: "BOOTING THREAT INTELLIGENCE CORE...", time: 500 },
      { text: "CALIBRATING NEURAL NODES...", time: 1500 },
      { text: "SHIELDCORE ONLINE.", time: 2500 },
    ];
    textSteps.forEach(step => {
      setTimeout(() => setBootText(step.text), step.time);
    });
    setTimeout(() => setBootText(""), 3800);

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-[#020408] transition-colors duration-300 overflow-hidden selection:bg-destructive/30">
      {/* 3D Cinematic Background Layer */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <canvas ref={canvasRef} className="w-full h-full opacity-90" />
        
        {/* Postprocessing Overlays */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(88,28,135,0.1)_0%,transparent_80%)] pointer-events-none" />
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
        
        {/* Intro Shockwave Effect */}
        {!introFinished && (
          <div className="absolute inset-0 flex items-center justify-center bg-black z-[100]">
             <div className="w-1 h-1 bg-white rounded-full animate-[supernova_2s_ease-out_forwards]" />
             <div className="absolute font-mono text-destructive text-[10px] tracking-[0.5em] animate-pulse">
               {bootText}
             </div>
          </div>
        )}
      </div>
      
      <section className="relative z-10 container mx-auto px-6 pt-32 pb-24 flex flex-col items-center text-center space-y-12 min-h-screen justify-center">
        <div className="space-y-6 animate-in fade-in slide-in-from-top-12 duration-1000">
          <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-destructive/10 border border-destructive/30 text-destructive text-[10px] font-black tracking-[0.4em] uppercase shadow-[0_0_30px_rgba(239,68,68,0.3)]">
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
          <Button asChild size="lg" className="bg-destructive hover:bg-destructive/90 text-white font-black h-20 px-14 text-xl rounded-2xl glow-btn transition-all duration-500 hover:scale-105 active:scale-95 uppercase tracking-widest shadow-[0_0_40px_rgba(239,68,68,0.5)]">
            <Link href="/login">Launch Console <ArrowRight className="ml-3 h-6 w-6" /></Link>
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

      <style jsx global>{`
        @keyframes supernova {
          0% { transform: scale(0); opacity: 1; filter: blur(0px); }
          50% { transform: scale(50); opacity: 0.5; filter: blur(20px); }
          100% { transform: scale(100); opacity: 0; filter: blur(50px); }
        }
      `}</style>
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
