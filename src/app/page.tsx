
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

// --- ADVANCED SHADERS ---

const EARTH_VERTEX = `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;
  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const EARTH_FRAGMENT = `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;
  uniform float time;
  
  float noise(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  void main() {
    float nightLights = pow(noise(vUv * 50.0), 10.0) * 2.0;
    vec3 color = vec3(0.01, 0.02, 0.05); // Deep space blue
    
    // Simulate city clusters
    float clusters = smoothstep(0.4, 0.5, noise(vUv * 10.0));
    vec3 cityColor = vec3(1.0, 0.7, 0.3) * nightLights * clusters;
    
    // Atmosphere rim glow
    float intensity = pow(0.7 - dot(vNormal, vec3(0, 0, 1.0)), 4.0);
    vec3 glow = vec3(0.1, 0.4, 1.0) * intensity;
    
    gl_FragColor = vec4(color + cityColor + glow, 1.0);
  }
`;

const ATMOSPHERE_VERTEX = `
  varying vec3 vNormal;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.1);
  }
`;

const ATMOSPHERE_FRAGMENT = `
  varying vec3 vNormal;
  void main() {
    float intensity = pow(0.6 - dot(vNormal, vec3(0, 0, 1.0)), 2.0);
    gl_FragColor = vec4(0.3, 0.6, 1.0, intensity * 0.6);
  }
`;

const NEBULA_VERTEX = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const NEBULA_FRAGMENT = `
  uniform float time;
  uniform vec3 color;
  varying vec2 vUv;

  float noise(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
  }

  void main() {
    float n = noise(vUv + time * 0.02);
    float alpha = smoothstep(0.2, 0.8, n) * (1.0 - length(vUv - 0.5) * 2.0);
    gl_FragColor = vec4(color, alpha * 0.15);
  }
`;

// --- DATA & COORDINATES ---

const CITIES = [
  { name: "New York", lat: 40.7128, lon: -74.0060 },
  { name: "London", lat: 51.5074, lon: -0.1278 },
  { name: "Tokyo", lat: 35.6762, lon: 139.6503 },
  { name: "Beijing", lat: 39.9042, lon: 116.4074 },
  { name: "Moscow", lat: 55.7558, lon: 37.6173 },
  { name: "Tehran", lat: 35.6892, lon: 51.3890 },
  { name: "Pyongyang", lat: 39.0392, lon: 125.7625 },
  { name: "São Paulo", lat: -23.5505, lon: -46.6333 },
  { name: "Mumbai", lat: 19.0760, lon: 72.8777 },
  { name: "Sydney", lat: -33.8688, lon: 151.2093 },
  { name: "Berlin", lat: 52.5200, lon: 13.4050 },
  { name: "Paris", lat: 48.8566, lon: 2.3522 },
  { name: "Dubai", lat: 25.2048, lon: 55.2708 },
  { name: "Singapore", lat: 1.3521, lon: 103.8198 },
  { name: "Seoul", lat: 37.5665, lon: 126.9780 },
  { name: "Johannesburg", lat: -26.2041, lon: 28.0473 }
];

const ATTACK_COLORS = [0xef4444, 0xf97316, 0x06b6d4]; // Red, Orange, Cyan

export default function LandingPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [introFinished, setIntroFinished] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [stats, setStats] = useState({ blocked: 124902, analyzed: 2845920 });
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        blocked: prev.blocked + Math.floor(Math.random() * 5),
        analyzed: prev.analyzed + Math.floor(Math.random() * 20)
      }));
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!canvasRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 2000);
    const renderer = new THREE.WebGLRenderer({ 
      canvas: canvasRef.current, 
      antialias: true, 
      alpha: true 
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const clock = new THREE.Clock();
    const globeGroup = new THREE.Group();
    globeGroup.rotation.y = -Math.PI / 2;
    globeGroup.rotation.z = THREE.MathUtils.degToRad(23.5);
    scene.add(globeGroup);

    // --- EARTH & ATMOSPHERE ---
    const earthGeo = new THREE.SphereGeometry(4, 128, 128);
    const earthMat = new THREE.ShaderMaterial({
      vertexShader: EARTH_VERTEX,
      fragmentShader: EARTH_FRAGMENT,
      uniforms: { time: { value: 0 } }
    });
    const earthMesh = new THREE.Mesh(earthGeo, earthMat);
    globeGroup.add(earthMesh);

    const atmosGeo = new THREE.SphereGeometry(4.15, 64, 64);
    const atmosMat = new THREE.ShaderMaterial({
      vertexShader: ATMOSPHERE_VERTEX,
      fragmentShader: ATMOSPHERE_FRAGMENT,
      side: THREE.BackSide,
      transparent: true,
      blending: THREE.AdditiveBlending
    });
    const atmosMesh = new THREE.Mesh(atmosGeo, atmosMat);
    globeGroup.add(atmosMesh);

    // --- STARFIELD (50,000 Particles) ---
    const starsCount = 50000;
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(starsCount * 3);
    for (let i = 0; i < starsCount; i++) {
      starPos[i * 3] = (Math.random() - 0.5) * 1500;
      starPos[i * 3 + 1] = (Math.random() - 0.5) * 1500;
      starPos[i * 3 + 2] = (Math.random() - 0.5) * 1500;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({ size: 0.7, color: 0xffffff, transparent: true, opacity: 0.8 });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    // --- NEBULAE ---
    const createNebula = (color: number, x: number) => {
      const geo = new THREE.PlaneGeometry(30, 30);
      const mat = new THREE.ShaderMaterial({
        vertexShader: NEBULA_VERTEX,
        fragmentShader: NEBULA_FRAGMENT,
        uniforms: {
          time: { value: 0 },
          color: { value: new THREE.Color(color) }
        },
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
      const nebula = new THREE.Mesh(geo, mat);
      nebula.position.set(x, 0, -50);
      scene.add(nebula);
      return mat;
    };
    const nebulaLeft = createNebula(0x4c1d95, -40); // Purple
    const nebulaRight = createNebula(0x1e1b4b, 40); // Indigo

    // --- ATTACK ARCS & PARTICLES ---
    const arcsGroup = new THREE.Group();
    globeGroup.add(arcsGroup);
    let activeArcs: any[] = [];
    
    const cityPositions = CITIES.map(city => {
      const phi = (90 - city.lat) * (Math.PI / 180);
      const theta = (city.lon + 180) * (Math.PI / 180);
      return new THREE.Vector3(
        4 * Math.sin(phi) * Math.cos(theta),
        4 * Math.cos(phi),
        4 * Math.sin(phi) * Math.sin(theta)
      );
    });

    const createArc = () => {
      const start = cityPositions[Math.floor(Math.random() * cityPositions.length)];
      const end = cityPositions[Math.floor(Math.random() * cityPositions.length)];
      if (start.distanceTo(end) < 1) return;

      const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5).normalize().multiplyScalar(5.5);
      const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
      const points = curve.getPoints(50);
      const geo = new THREE.BufferGeometry().setFromPoints(points);
      const mat = new THREE.LineBasicMaterial({ 
        color: ATTACK_COLORS[Math.floor(Math.random() * ATTACK_COLORS.length)],
        transparent: true,
        opacity: 0
      });
      const arc = new THREE.Line(geo, mat);
      (arc as any).progress = 0;
      (arc as any).speed = 0.01 + Math.random() * 0.02;
      arcsGroup.add(arc);
      activeArcs.push(arc);
    };

    // --- DATA RINGS ---
    const hexRing = new THREE.Group();
    const hexGeo = new THREE.RingGeometry(6.5, 6.7, 6);
    const hexMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4, transparent: true, opacity: 0.1, side: THREE.DoubleSide });
    for (let i = 0; i < 12; i++) {
      const hex = new THREE.Mesh(hexGeo, hexMat);
      hex.rotation.x = Math.PI / 2;
      hex.rotation.y = (i / 12) * Math.PI * 2;
      hexRing.add(hex);
    }
    globeGroup.add(hexRing);

    // --- ANIMATION LOOP ---
    camera.position.z = 12;
    setIntroFinished(true);

    const animate = () => {
      requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      earthMat.uniforms.time.value = time;
      nebulaLeft.uniforms.time.value = time;
      nebulaRight.uniforms.time.value = time;

      globeGroup.rotation.y += 0.0005;
      hexRing.rotation.z -= 0.001;

      // Update Arcs
      activeArcs.forEach((arc, i) => {
        arc.progress += arc.speed;
        arc.material.opacity = arc.progress < 0.5 ? arc.progress * 2 : (1 - arc.progress) * 2;
        if (arc.progress >= 1) {
          arcsGroup.remove(arc);
          activeArcs.splice(i, 1);
        }
      });

      if (Math.random() > 0.95 && activeArcs.length < 100) createArc();

      // Mouse Parallax
      const targetX = mouse.x * 0.2;
      const targetY = mouse.y * 0.2;
      scene.rotation.y += (targetX - scene.rotation.y) * 0.05;
      scene.rotation.x += (targetY - scene.rotation.x) * 0.05;

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    const handleMouseMove = (e: MouseEvent) => {
      setMouse({
        x: (e.clientX / window.innerWidth - 0.5) * 2,
        y: (e.clientY / window.innerHeight - 0.5) * 2
      });
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [mouse]);

  return (
    <div className="relative min-h-screen bg-[#020408] overflow-hidden font-body text-white selection:bg-destructive/40">
      
      {/* Cinematic Letterbox */}
      <div className="fixed top-0 left-0 w-full h-[8vh] bg-black z-[200] pointer-events-none opacity-80" />
      <div className="fixed bottom-0 left-0 w-full h-[8vh] bg-black z-[200] pointer-events-none opacity-80" />
      
      <canvas 
        ref={canvasRef} 
        className={cn(
          "fixed inset-0 z-0 transition-opacity duration-1000",
          introFinished ? "opacity-100" : "opacity-0"
        )} 
      />

      {/* HUD Reticle */}
      <div className="fixed inset-0 pointer-events-none z-10 flex items-center justify-center opacity-10">
        <div className="relative w-[600px] h-[600px] border border-cyan-500/20 rounded-full animate-[spin_30s_linear_infinite]" />
      </div>

      {/* Telemetry Docks */}
      <div className={cn(
        "fixed inset-0 z-20 pointer-events-none transition-all duration-1000 delay-500",
        introFinished ? "opacity-100" : "opacity-0"
      )}>
        <div className="absolute top-24 left-12 w-64 glass-card p-6 border-white/5 rounded-2xl bg-black/40 backdrop-blur-md">
           <div className="flex items-center gap-3 mb-4">
              <Activity className="h-4 w-4 text-destructive animate-pulse" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Live Ingress Forensics</h3>
           </div>
           <div className="space-y-4">
              <div>
                 <p className="text-[8px] uppercase font-black text-white/40 mb-1">Total Blocks</p>
                 <p className="text-2xl font-black text-destructive tracking-tighter">{stats.blocked.toLocaleString()}</p>
              </div>
              <div>
                 <p className="text-[8px] uppercase font-black text-white/40 mb-1">Packets Inspected</p>
                 <p className="text-2xl font-black text-cyan-400 tracking-tighter">{stats.analyzed.toLocaleString()}</p>
              </div>
           </div>
        </div>

        <div className="absolute bottom-24 right-12 w-64 glass-card p-6 border-white/5 rounded-2xl bg-black/40 backdrop-blur-md">
           <div className="flex items-center gap-3 mb-4">
              <Cpu className="h-4 w-4 text-emerald-500" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Neural Integrity</h3>
           </div>
           <div className="space-y-3">
              {['WAF Node 92', 'LPU Uplink', 'DDoS Mitigator'].map((node, i) => (
                <div key={i} className="flex items-center justify-between">
                   <span className="text-[9px] font-bold text-white/60 uppercase">{node}</span>
                   <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                </div>
              ))}
           </div>
        </div>
      </div>

      {/* Hero Content */}
      <section className="relative z-50 flex flex-col items-center justify-center min-h-screen text-center px-6">
        <div className={cn(
          "max-w-4xl space-y-12 transition-all duration-1000",
          introFinished ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
        )}>
          <div className="space-y-4">
            <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-destructive/10 border border-destructive/30 text-destructive text-[10px] font-black tracking-[0.5em] uppercase shadow-[0_0_30px_rgba(239,68,68,0.2)]">
              <Target className="h-4 w-4 animate-pulse" />
              Strategic Defense Node Active
            </div>
            
            <h1 className="text-7xl md:text-[9rem] font-black tracking-tighter text-white leading-[0.85] uppercase">
              SHIELD<span className="text-destructive glow-text-red">CORE</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-white/60 max-w-2xl mx-auto font-medium leading-relaxed italic opacity-80 mt-6">
              LPU-accelerated neural packet inspection. <br />
              Global edge protection for the modern internet.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-8 pt-8 items-center justify-center">
            <Button asChild size="lg" className="bg-destructive hover:bg-destructive/90 text-white font-black h-20 px-14 text-xl rounded-2xl glow-btn transition-all duration-500 hover:scale-105 active:scale-95 uppercase tracking-widest shadow-[0_0_50px_rgba(239,68,68,0.3)]">
              <Link href="/login">Launch Console <ArrowRight className="ml-3 h-6 w-6" /></Link>
            </Button>
            
            <Button variant="outline" size="lg" className="border-white/20 bg-white/5 hover:bg-white/10 text-white font-black h-20 px-14 text-xl rounded-2xl transition-all duration-500 uppercase tracking-widest backdrop-blur-xl">
               Learn Specs
            </Button>
          </div>
        </div>
      </section>

      <button 
        onClick={() => setIsMuted(!isMuted)} 
        className="fixed bottom-12 left-12 z-[500] h-12 w-12 rounded-full border border-white/10 bg-black/40 backdrop-blur-xl flex items-center justify-center text-white/40 hover:text-white transition-all"
      >
        {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
      </button>

      <div className="fixed bottom-12 right-12 z-[500] text-[8px] font-mono text-white/30 uppercase tracking-[0.4em]">
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

