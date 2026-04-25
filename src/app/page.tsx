
"use client";

import { useEffect, useRef, useState, useMemo } from 'react';
import Link from 'next/link';
import * as THREE from 'three';
import { 
  Shield, 
  ArrowRight, 
  Activity, 
  Zap, 
  BarChart3, 
  Lock, 
  Cpu, 
  Globe, 
  Volume2, 
  VolumeX,
  Target,
  Terminal,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// --- SHADERS ---

const ATMOSPHERE_VERTEX = `
  varying vec3 vNormal;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const ATMOSPHERE_FRAGMENT = `
  varying vec3 vNormal;
  void main() {
    float intensity = pow(0.6 - dot(vNormal, vec3(0, 0, 1.0)), 2.0);
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
    float noise = sin(vUv.x * 12.0 + time * 0.5) * cos(vUv.y * 8.0 + time * 0.3);
    vec3 color = mix(vec3(0.0, 1.0, 0.4), vec3(0.5, 0.0, 1.0), vUv.y);
    gl_FragColor = vec4(color, abs(noise) * (1.0 - vUv.y) * 0.6);
  }
`;

// --- DATA ---

const CITIES = [
  { name: "New York", lat: 40.7128, lon: -74.0060, country: "US" },
  { name: "London", lat: 51.5074, lon: -0.1278, country: "UK" },
  { name: "Tokyo", lat: 35.6762, lon: 139.6503, country: "JP" },
  { name: "Beijing", lat: 39.9042, lon: 116.4074, country: "CN" },
  { name: "Moscow", lat: 55.7558, lon: 37.6173, country: "RU" },
  { name: "Tehran", lat: 35.6892, lon: 51.3890, country: "IR" },
  { name: "Pyongyang", lat: 39.0392, lon: 125.7625, country: "KP" },
  { name: "Lagos", lat: 6.5244, lon: 3.3792, country: "NG" },
  { name: "São Paulo", lat: -23.5505, lon: -46.6333, country: "BR" },
  { name: "Mumbai", lat: 19.0760, lon: 72.8777, country: "IN" },
  { name: "Sydney", lat: -33.8688, lon: 151.2093, country: "AU" },
  { name: "Berlin", lat: 52.5200, lon: 13.4050, country: "DE" },
  { name: "Paris", lat: 48.8566, lon: 2.3522, country: "FR" },
  { name: "Dubai", lat: 25.2048, lon: 55.2708, country: "AE" },
  { name: "Singapore", lat: 1.3521, lon: 103.8198, country: "SG" },
  { name: "Seoul", lat: 37.5665, lon: 126.9780, country: "KR" },
  { name: "Cairo", lat: 30.0444, lon: 31.2357, country: "EG" },
  { name: "Jakarta", lat: -6.2088, lon: 106.8456, country: "ID" },
  { name: "Mexico City", lat: 19.4326, lon: -99.1332, country: "MX" },
  { name: "Istanbul", lat: 41.0082, lon: 28.9784, country: "TR" },
  { name: "Bangkok", lat: 13.7563, lon: 100.5018, country: "TH" },
  { name: "Johannesburg", lat: -26.2041, lon: 28.0473, country: "ZA" },
  { name: "Hong Kong", lat: 22.3193, lon: 114.1694, country: "HK" },
  { name: "Tel Aviv", lat: 32.0853, lon: 34.7818, country: "IL" },
  { name: "Madrid", lat: 40.4168, lon: -3.7038, country: "ES" },
  { name: "Toronto", lat: 43.6532, lon: -79.3832, country: "CA" },
  { name: "Rome", lat: 41.9028, lon: 12.4964, country: "IT" },
  { name: "Warsaw", lat: 52.2297, lon: 21.0122, country: "PL" },
  { name: "Kiev", lat: 50.4501, lon: 30.5234, country: "UA" },
  { name: "Athens", lat: 37.9838, lon: 23.7275, country: "GR" },
  { name: "Lisbon", lat: 38.7223, lon: -9.1393, country: "PT" },
  { name: "Stockholm", lat: 59.3293, lon: 18.0686, country: "SE" },
  { name: "Oslo", lat: 59.9139, lon: 10.7522, country: "NO" },
  { name: "Helsinki", lat: 60.1699, lon: 24.9384, country: "FI" },
  { name: "Copenhagen", lat: 55.6761, lon: 12.5683, country: "DK" },
  { name: "Vienna", lat: 48.2082, lon: 16.3738, country: "AT" },
  { name: "Prague", lat: 50.0755, lon: 14.4378, country: "CZ" },
  { name: "Budapest", lat: 47.4979, lon: 19.0402, country: "HU" },
  { name: "Dublin", lat: 53.3498, lon: -6.2603, country: "IE" },
  { name: "Brussels", lat: 50.8503, lon: 4.3517, country: "BE" },
  { name: "Amsterdam", lat: 52.3676, lon: 4.9041, country: "NL" },
  { name: "Zurich", lat: 47.3769, lon: 8.5417, country: "CH" },
  { name: "Montreal", lat: 45.5017, lon: -73.5673, country: "CA" },
  { name: "Chicago", lat: 41.8781, lon: -87.6298, country: "US" },
  { name: "San Francisco", lat: 37.7749, lon: -122.4194, country: "US" },
  { name: "Los Angeles", lat: 34.0522, lon: -118.2437, country: "US" },
  { name: "Washington DC", lat: 38.9072, lon: -77.0369, country: "US" }
];

const ATTACK_TYPES = [
  { name: "SQL Injection", color: 0xef4444, glow: "#ef4444" },
  { name: "XSS", color: 0xff00ff, glow: "#ff00ff" },
  { name: "DDoS", color: 0xfff200, glow: "#fff200" },
  { name: "Malware", color: 0x00ff00, glow: "#00ff00" }
];

export default function LandingPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [introFinished, setIntroFinished] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [stats, setStats] = useState({ blocked: 124902, analyzed: 2845920 });
  const [scrollP, setScrollP] = useState(0);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  // --- Real-time Stats Generator ---
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        blocked: prev.blocked + Math.floor(Math.random() * 5),
        analyzed: prev.analyzed + Math.floor(Math.random() * 20)
      }));
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  // --- THREE.JS ENGINE ---
  useEffect(() => {
    if (!canvasRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 2000);
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

    // --- EARTH LAYERS ---
    
    // 1. Surface (Night Lights)
    const earthGeo = new THREE.SphereGeometry(4, 128, 128);
    const earthMat = new THREE.MeshStandardMaterial({
      color: 0x050505,
      roughness: 0.8,
      metalness: 0.2,
      emissive: 0x050a15,
      emissiveIntensity: 0.5
    });
    const earthMesh = new THREE.Mesh(earthGeo, earthMat);
    globeGroup.add(earthMesh);

    // 2. City Dots (Instanced)
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

    // 3. Clouds
    const cloudGeo = new THREE.SphereGeometry(4.05, 64, 64);
    const cloudMat = new THREE.MeshStandardMaterial({
      transparent: true,
      opacity: 0.15,
      color: 0xffffff,
    });
    const cloudMesh = new THREE.Mesh(cloudGeo, cloudMat);
    globeGroup.add(cloudMesh);

    // 4. Atmosphere Halo
    const atmosGeo = new THREE.SphereGeometry(4.2, 64, 64);
    const atmosMat = new THREE.ShaderMaterial({
      vertexShader: ATMOSPHERE_VERTEX,
      fragmentShader: ATMOSPHERE_FRAGMENT,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true
    });
    const atmosMesh = new THREE.Mesh(atmosGeo, atmosMat);
    globeGroup.add(atmosMesh);

    // 5. Magnetosphere Shell
    const magGeo = new THREE.IcosahedronGeometry(4.8, 4);
    const magMat = new THREE.MeshBasicMaterial({
      color: 0x3b82f6,
      wireframe: true,
      transparent: true,
      opacity: 0.03
    });
    const magMesh = new THREE.Mesh(magGeo, magMat);
    globeGroup.add(magMesh);

    // --- ENVIRONMENT ---

    // Starfield (100k points)
    const starsCount = 100000;
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(starsCount * 3);
    const starColors = new Float32Array(starsCount * 3);
    for (let i = 0; i < starsCount; i++) {
      starPos[i * 3] = (Math.random() - 0.5) * 1000;
      starPos[i * 3 + 1] = (Math.random() - 0.5) * 1000;
      starPos[i * 3 + 2] = (Math.random() - 0.5) * 1000;
      
      const r = Math.random();
      if (r < 0.6) { starColors[i * 3] = 1; starColors[i * 3 + 1] = 1; starColors[i * 3 + 2] = 1; }
      else if (r < 0.8) { starColors[i * 3] = 0.8; starColors[i * 3 + 1] = 0.9; starColors[i * 3 + 2] = 1; }
      else { starColors[i * 3] = 1; starColors[i * 3 + 1] = 0.9; starColors[i * 3 + 2] = 0.8; }
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));
    const starMat = new THREE.PointsMaterial({ size: 0.5, vertexColors: true, transparent: true, opacity: 0.8 });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    // --- ATTACK ARCS ---
    const arcsGroup = new THREE.Group();
    globeGroup.add(arcsGroup);
    let activeArcs: any[] = [];

    const createArc = () => {
      const startIdx = Math.floor(Math.random() * CITIES.length);
      const endIdx = Math.floor(Math.random() * CITIES.length);
      if (startIdx === endIdx) return;

      const start = cityPositions[startIdx];
      const end = cityPositions[endIdx];
      
      // Calculate mid height for ballistic curve
      const distance = start.distanceTo(end);
      const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5).normalize().multiplyScalar(4 + distance * 0.5);
      
      const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
      const points = curve.getPoints(100);
      const geo = new THREE.BufferGeometry().setFromPoints(points);
      
      const attack = ATTACK_TYPES[Math.floor(Math.random() * ATTACK_TYPES.length)];
      const mat = new THREE.LineBasicMaterial({ color: attack.color, transparent: true, opacity: 0 });
      const line = new THREE.Line(geo, mat);
      
      (line as any).progress = 0;
      (line as any).speed = 0.005 + Math.random() * 0.01;
      (line as any).targetCity = end;
      
      arcsGroup.add(line);
      activeArcs.push(line);
    };

    // Impact explosion system
    const impactPartsCount = 2000;
    const impactGeo = new THREE.BufferGeometry();
    const impactPos = new Float32Array(impactPartsCount * 3);
    const impactVel = new Float32Array(impactPartsCount * 3);
    const impactLife = new Float32Array(impactPartsCount);
    impactLife.fill(-1);

    impactGeo.setAttribute('position', new THREE.BufferAttribute(impactPos, 3));
    const impactMat = new THREE.PointsMaterial({ size: 0.05, color: 0xffffff, transparent: true, opacity: 0.8 });
    const impactPoints = new THREE.Points(impactGeo, impactMat);
    globeGroup.add(impactPoints);

    const triggerImpact = (pos: THREE.Vector3) => {
      let triggered = 0;
      for (let i = 0; i < impactPartsCount; i++) {
        if (impactLife[i] < 0) {
          impactLife[i] = 1.0;
          impactPos[i * 3] = pos.x;
          impactPos[i * 3 + 1] = pos.y;
          impactPos[i * 3 + 2] = pos.z;
          
          impactVel[i * 3] = (Math.random() - 0.5) * 0.1;
          impactVel[i * 3 + 1] = (Math.random() - 0.5) * 0.1;
          impactVel[i * 3 + 2] = (Math.random() - 0.5) * 0.1;
          
          triggered++;
          if (triggered > 40) break;
        }
      }
    };

    // --- SATELLITES ---
    const sats: THREE.Mesh[] = [];
    for (let i = 0; i < 12; i++) {
      const satGeo = new THREE.BoxGeometry(0.1, 0.05, 0.05);
      const satMat = new THREE.MeshBasicMaterial({ color: 0x00eaff });
      const sat = new THREE.Mesh(satGeo, satMat);
      sat.position.set(
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20
      ).normalize().multiplyScalar(6);
      globeGroup.add(sat);
      sats.push(sat);
    }

    // --- ANIMATION LOOP ---
    
    let introStartTime = 0;
    const handleIntro = () => {
      if (!introStartTime) introStartTime = Date.now() + 800;
      const now = Date.now();
      if (now < introStartTime) {
        renderer.setClearColor(0x000000, 1);
        return false;
      }
      
      const elapsed = (now - introStartTime) / 3000;
      if (elapsed < 1) {
        setIntroFinished(true);
        camera.position.z = THREE.MathUtils.lerp(100, 12, elapsed);
        renderer.setClearColor(0x000000, Math.max(0, 1 - elapsed * 2));
      } else {
        camera.position.z = 12 + scrollP * 5;
      }
      return true;
    };

    const animate = () => {
      requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      if (!handleIntro()) {
        renderer.render(scene, camera);
        return;
      }

      // Globe continuous rotation
      globeGroup.rotation.y += 0.0005;
      cloudMesh.rotation.y += 0.0007;
      magMesh.rotation.y -= 0.001;
      
      // Update Satellites
      sats.forEach((s, i) => {
        s.position.applyAxisAngle(new THREE.Vector3(0, 1, 0), 0.001 * (i + 1));
      });

      // Update Arcs
      activeArcs.forEach((arc, i) => {
        arc.progress += arc.speed;
        const mat = arc.material as THREE.LineBasicMaterial;
        mat.opacity = arc.progress < 0.5 ? arc.progress * 4 : (1 - arc.progress) * 4;
        
        if (arc.progress >= 1) {
          triggerImpact(arc.targetCity);
          arcsGroup.remove(arc);
          activeArcs.splice(i, 1);
        }
      });

      if (Math.random() > 0.9 && activeArcs.length < 200) {
        createArc();
      }

      // Update Impact Particles
      const positions = impactGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < impactPartsCount; i++) {
        if (impactLife[i] > 0) {
          impactLife[i] -= delta * 1.5;
          positions[i * 3] += impactVel[i * 3];
          positions[i * 3 + 1] += impactVel[i * 3 + 1];
          positions[i * 3 + 2] += impactVel[i * 3 + 2];
        } else {
          positions[i * 3] = -1000;
        }
      }
      impactGeo.attributes.position.needsUpdate = true;

      // Mouse Parallax
      const targetRotX = mouse.y * 0.1;
      const targetRotY = mouse.x * 0.1;
      scene.rotation.x += (targetRotX - scene.rotation.x) * 0.05;
      scene.rotation.y += (targetRotY - scene.rotation.y) * 0.05;

      // Star Parallax
      stars.position.x = -mouse.x * 2;
      stars.position.y = mouse.y * 2;

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    const handleScroll = () => {
      setScrollP(window.scrollY / window.innerHeight);
    };

    const handleMouseMove = (e: MouseEvent) => {
      setMouse({
        x: (e.clientX / window.innerWidth - 0.5) * 2,
        y: (e.clientY / window.innerHeight - 0.5) * 2
      });
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [scrollP, mouse]);

  return (
    <div className="relative min-h-screen bg-black overflow-hidden font-body text-white selection:bg-destructive/40">
      
      {/* --- CINEMATIC OVERLAYS --- */}
      
      {/* 2.39:1 Letterbox Bars */}
      <div className="fixed top-0 left-0 w-full h-[8vh] bg-black z-[200] pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-full h-[8vh] bg-black z-[200] pointer-events-none" />
      
      {/* 3D Canvas */}
      <canvas 
        ref={canvasRef} 
        className={cn(
          "fixed inset-0 z-0 transition-opacity duration-1000",
          introFinished ? "opacity-100" : "opacity-0"
        )} 
      />

      {/* Intro Flash Overlay */}
      <div className={cn(
        "fixed inset-0 z-[300] bg-white transition-opacity duration-1000 pointer-events-none",
        introFinished ? "opacity-0" : "opacity-0"
      )} />

      {/* HUD Reticle */}
      <div className="fixed inset-0 pointer-events-none z-10 flex items-center justify-center opacity-20">
        <div className="relative w-[600px] h-[600px] border border-cyan-500/30 rounded-full animate-[spin_20s_linear_infinite]">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 h-8 w-px bg-cyan-500" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-8 w-px bg-cyan-500" />
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-8 h-px bg-cyan-500" />
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-8 h-px bg-cyan-500" />
        </div>
      </div>

      {/* --- HOLOGRAPHIC DASHBOARDS --- */}
      
      <div className={cn(
        "fixed inset-0 z-20 pointer-events-none transition-all duration-1000 delay-500",
        introFinished ? "opacity-100" : "opacity-0"
      )}>
        {/* Top Left: LIVE VITALS */}
        <div className="absolute top-20 left-12 w-64 glass-card p-6 border-white/10 rounded-2xl bg-black/40 backdrop-blur-md">
           <div className="flex items-center gap-3 mb-4">
              <Activity className="h-4 w-4 text-destructive animate-pulse" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Neural Telemetry</h3>
           </div>
           <div className="space-y-4">
              <div>
                 <p className="text-[8px] uppercase font-black text-white/40 mb-1">Threats Blocked</p>
                 <p className="text-2xl font-black text-destructive tracking-tighter">{stats.blocked.toLocaleString()}</p>
              </div>
              <div>
                 <p className="text-[8px] uppercase font-black text-white/40 mb-1">Ingress Vectors</p>
                 <p className="text-2xl font-black text-cyan-400 tracking-tighter">{stats.analyzed.toLocaleString()}</p>
              </div>
           </div>
           <div className="mt-6 pt-4 border-t border-white/5">
              <div className="flex justify-between items-center text-[8px] font-black uppercase text-white/30">
                 <span>Sync: 0.2ms</span>
                 <span>LPU Node: 92</span>
              </div>
           </div>
        </div>

        {/* Bottom Right: SYSTEM STATUS */}
        <div className="absolute bottom-20 right-12 w-64 glass-card p-6 border-white/10 rounded-2xl bg-black/40 backdrop-blur-md">
           <div className="flex items-center gap-3 mb-4">
              <Cpu className="h-4 w-4 text-emerald-500" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white">System Integrity</h3>
           </div>
           <div className="space-y-3">
              {['WAF Engine', 'Llama-3 Uplink', 'Groq LPU', 'Event Stream'].map((node, i) => (
                <div key={i} className="flex items-center justify-between">
                   <span className="text-[9px] font-bold text-white/60 uppercase">{node}</span>
                   <div className="flex items-center gap-2">
                      <span className="text-[8px] font-mono text-emerald-500/80">ACTIVE</span>
                      <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                   </div>
                </div>
              ))}
           </div>
        </div>
      </div>

      {/* --- HERO CONTENT --- */}
      
      <section className="relative z-50 flex flex-col items-center justify-center min-h-screen text-center px-6">
        <div className={cn(
          "max-w-4xl space-y-12 transition-all duration-1000",
          introFinished ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
        )}>
          <div className="space-y-4">
            <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-destructive/10 border border-destructive/30 text-destructive text-[10px] font-black tracking-[0.5em] uppercase shadow-[0_0_30px_rgba(239,68,68,0.3)] backdrop-blur-xl">
              <Target className="h-4 w-4 animate-pulse" />
              Strategic Defense Protocol Active
            </div>
            
            <h1 className="text-7xl md:text-[10rem] font-black tracking-tighter text-white leading-[0.85] uppercase">
              SHIELD<span className="text-destructive glow-text-red">CORE</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-white/60 max-w-2xl mx-auto font-medium leading-relaxed italic opacity-80 mt-6">
              LPU-accelerated neural packet inspection. <br />
              Deep semantic detection. Global edge protection.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-8 pt-8 items-center justify-center">
            <Button asChild size="lg" className="bg-destructive hover:bg-destructive/90 text-white font-black h-20 px-14 text-xl rounded-2xl glow-btn transition-all duration-500 hover:scale-105 active:scale-95 uppercase tracking-widest shadow-[0_0_50px_rgba(239,68,68,0.4)]">
              <Link href="/login">Launch Console <ArrowRight className="ml-3 h-6 w-6" /></Link>
            </Button>
            
            <Button variant="outline" size="lg" className="border-white/20 bg-white/5 hover:bg-white/10 text-white font-black h-20 px-14 text-xl rounded-2xl transition-all duration-500 uppercase tracking-widest backdrop-blur-xl">
               Learn Specs
            </Button>
          </div>
        </div>
      </section>

      {/* --- MUTE TOGGLE --- */}
      <button 
        onClick={() => setIsMuted(!isMuted)} 
        className="fixed bottom-12 left-12 z-[500] h-12 w-12 rounded-full border border-white/10 bg-black/40 backdrop-blur-xl flex items-center justify-center text-white/40 hover:text-white transition-all"
      >
        {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
      </button>

      {/* --- GLOBAL VERSION FOOTER --- */}
      <div className="fixed bottom-12 right-12 z-[500] text-[8px] font-mono text-white/30 uppercase tracking-[0.4em] pointer-events-none">
         ShieldCore Neural Cluster v1.0.0 // LPU Node Active
      </div>

      <style jsx global>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
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

