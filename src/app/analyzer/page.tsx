"use client";

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  ShieldAlert, Loader2, Copy, Flag, Activity, Zap, RefreshCw, 
  Terminal, CheckCircle2, AlertCircle,
  Fingerprint, Shield, Trash2,
  Syringe, Flame, Folder, Bomb, Globe
} from 'lucide-react';
import { analyzeHttpRequest, AnalyzeOutput } from '@/ai/flows/analyze-http-request';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { 
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, 
  Radar, ResponsiveContainer
} from 'recharts';
import { formatDistanceToNow } from 'date-fns';

const ATTACK_ICONS: Record<string, any> = {
  'SQL Injection': Syringe,
  'XSS': Flame,
  'Path Traversal': Folder,
  'Command Injection': Terminal,
  'Buffer Overflow': Bomb,
  'SSRF': Globe,
  'Safe': CheckCircle2,
  'Suspicious': AlertCircle
};

const TEST_SAMPLES = [
  { name: 'Normal Traffic', payload: 'GET /tienda1/imagenes/logo.gif HTTP/1.1\nHost: localhost:8080\nCookie: JSESSIONID=A53D159B0F23CDF15AF7AF825C939170' },
  { name: 'SQL Injection', payload: "GET /publico/caracteristicas.jsp?id=%27OR%27a%3D%27a HTTP/1.1\nHost: localhost:8080" },
  { name: 'XSS Attack', payload: 'GET /miembros/editar.jsp?modo=registro%3CSCRIPT%3Ealert%28%22Paros%22%29%3B%3C%2FSCRIPT%3E HTTP/1.1' },
  { name: 'OS Command', payload: 'POST /publico/pagar.jsp HTTP/1.1\n\nmodo=insertar&precio=88&B1=Confirmar%3C%21--%23EXEC+cmd%3D%22ls+%2F%22--%3E' },
  { name: 'Path Traversal', payload: 'GET /files?path=../../etc/passwd HTTP/1.1' },
  { name: 'SSRF Attack', payload: 'GET /api/proxy?url=http://169.254.169.254/latest/meta-data/ HTTP/1.1' }
];

const OWASP_INTEL: Record<string, any> = {
  'A03:2021': {
    name: 'Injection',
    desc: 'Injection flaws, such as SQL, NoSQL, OS, and LDAP injection, occur when untrusted data is sent to an interpreter as part of a command or query.',
    severity: 90,
    vectors: ['SQL Injection', 'Cross-site Scripting (XSS)', 'Command Injection'],
    mitigation: ['Use parameterized queries', 'Input validation', 'Least privilege principles']
  },
  'A01:2021': {
    name: 'Broken Access Control',
    desc: 'Restrictions on what authenticated users are allowed to do are often not properly enforced.',
    severity: 85,
    vectors: ['Path Traversal', 'Insecure Direct Object References (IDOR)'],
    mitigation: ['Deny by default', 'Centralized access control', 'Disable directory listing']
  },
  'A04:2021': {
    name: 'Insecure Design',
    desc: 'Focuses on risks related to design flaws and architectural vulnerabilities.',
    severity: 70,
    vectors: ['Buffer Overflow'],
    mitigation: ['Threat modeling', 'Secure design patterns']
  },
  'A10:2021': {
    name: 'Server-Side Request Forgery',
    desc: 'SSRF flaws occur whenever a web application is fetching a remote resource without validating the user-supplied URL.',
    severity: 80,
    vectors: ['SSRF'],
    mitigation: ['Sanitize and whitelist URLs', 'Network level blocking']
  }
};

export default function AnalyzerPage() {
  const [payload, setPayload] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalyzeOutput | null>(null);
  const [whatIfEnabled, setWhatIfEnabled] = useState(false);
  const [historical, setHistorical] = useState<any[]>([]);
  const [typewriterText, setTypewriterText] = useState('');
  const { toast } = useToast();

  async function handleAnalyze(customPayload?: string) {
    const input = customPayload || payload;
    if (!input.trim()) return;
    
    setIsAnalyzing(true);
    setResult(null);
    setTypewriterText('');

    await new Promise(resolve => setTimeout(resolve, 1500));

    try {
      const res = await analyzeHttpRequest({ payload: input.substring(0, 5000) });
      setResult(res);
      
      let i = 0;
      const explanation = res.explanation || "";
      const timer = setInterval(() => {
        setTypewriterText(explanation.substring(0, i));
        i++;
        if (i > explanation.length) clearInterval(timer);
      }, 20);

      const mockHistory = [
        { id: '1', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), payload: 'GET /users/1?id=1%27 OR %271%27=%271', score: 0.94, decision: 'BLOCKED' },
        { id: '2', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), payload: 'POST /api/v1/auth?user=admin-- ', score: 0.88, decision: 'BLOCKED' },
      ];
      setHistorical(mockHistory);

    } catch (error) {
      toast({ title: "Inference Error", description: "neural system disconnect", variant: "destructive" });
    } finally {
      setIsAnalyzing(false);
    }
  }

  const handleQuickTest = (sample: string) => {
    setPayload(sample);
    setTimeout(() => handleAnalyze(sample), 500);
  };

  const radarData = result ? [
    { subject: 'SQLi', A: result.predicted_class === 'SQL Injection' ? 95 : Math.random() * 20 },
    { subject: 'XSS', A: result.predicted_class === 'XSS' ? 95 : Math.random() * 20 },
    { subject: 'Traversal', A: result.predicted_class === 'Path Traversal' ? 95 : Math.random() * 20 },
    { subject: 'OS Cmd', A: result.predicted_class === 'Command Injection' ? 95 : Math.random() * 20 },
    { subject: 'SSRF', A: result.predicted_class === 'SSRF' ? 95 : Math.random() * 20 },
    { subject: 'Overflow', A: result.predicted_class === 'Buffer Overflow' ? 95 : Math.random() * 20 },
  ] : [];

  const getStatusColor = (decision: string) => {
    if (decision === 'BLOCKED') return 'from-destructive/40 to-destructive/10 border-destructive';
    if (decision === 'SAFE') return 'from-emerald-500/40 to-emerald-500/10 border-emerald-500';
    return 'from-amber-500/40 to-amber-500/10 border-amber-500';
  };

  const getOWASPInfo = (cat: string) => {
    const key = Object.keys(OWASP_INTEL).find(k => cat.includes(k));
    return key ? OWASP_INTEL[key] : null;
  };

  const intel = result ? getOWASPInfo(result.owasp_category) : null;
  const AttackIcon = result ? (ATTACK_ICONS[result.predicted_class] || Shield) : Shield;

  return (
    <div className="container mx-auto py-12 px-6 max-w-6xl space-y-12 dashboard-cursor animate-in fade-in duration-1000">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-destructive font-mono text-[9px] tracking-[0.4em] uppercase animate-pulse">
            <Fingerprint className="h-3 w-3" /> Ingress Forensics
          </div>
          <h1 className="text-5xl font-black tracking-tighter text-gray-900 dark:text-white">SEMANTIC <span className="text-destructive">ENGINE</span></h1>
          <p className="text-gray-500 dark:text-muted-foreground font-medium text-lg italic opacity-70">LPU-accelerated neural packet inspection.</p>
        </div>
        <div className="flex items-center gap-4 bg-black/5 dark:bg-white/5 p-2 rounded-2xl border border-black/5 dark:border-white/5 backdrop-blur-xl">
           <div className="flex items-center space-x-3 px-4">
              <Switch id="what-if" checked={whatIfEnabled} onCheckedChange={setWhatIfEnabled} />
              <Label htmlFor="what-if" className="cursor-pointer text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-white opacity-60">Deep Simulation</Label>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        <div className="lg:col-span-3 space-y-12">
          {/* Input Section */}
          <div className="relative group">
            <div className="absolute inset-0 bg-destructive/5 blur-3xl opacity-20 -z-10" />
            <Card className="glass-card border-none overflow-hidden relative">
              {isAnalyzing && <div className="absolute top-0 left-0 w-full h-1 bg-destructive/50 z-50 animate-pulse overflow-hidden"><div className="h-full bg-destructive w-1/3 animate-[scan_2s_linear_infinite]" /></div>}
              <CardContent className="p-8 space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <div className="section-label mb-0">Payload Ingress</div>
                    <span className="text-[10px] font-mono text-gray-400 dark:text-muted-foreground opacity-40 uppercase">{payload.length} / 5000 OCTETS</span>
                  </div>
                  <Textarea
                    placeholder="DROP TABLE ingress; --"
                    className="min-h-[250px] font-mono text-xs bg-gray-50 dark:bg-black/40 border-black/5 dark:border-white/5 focus-visible:ring-destructive resize-none placeholder:text-gray-300 dark:placeholder:text-muted-foreground/20 leading-relaxed rounded-xl transition-all duration-500 focus:bg-white dark:focus:bg-black/60 shadow-inner"
                    value={payload}
                    onChange={(e) => setPayload(e.target.value)}
                  />
                  {!payload.trim() && !isAnalyzing && <p className="text-[10px] text-destructive/50 font-bold uppercase animate-pulse">Input required for neural activation</p>}
                </div>

                <div className="flex justify-end gap-4">
                  <Button variant="ghost" className="font-black uppercase text-[10px] tracking-widest text-gray-400 dark:text-muted-foreground hover:text-gray-900 dark:hover:text-white" onClick={() => setPayload('')} disabled={isAnalyzing}>
                    <Trash2 className="h-3.5 w-3.5 mr-2" /> Purge
                  </Button>
                  <Button 
                    className="w-full sm:w-80 bg-destructive hover:bg-destructive/90 text-white font-black rounded-xl h-14 glow-btn text-sm uppercase tracking-widest"
                    onClick={() => handleAnalyze()}
                    disabled={isAnalyzing || !payload.trim()}
                  >
                    {isAnalyzing ? <><Loader2 className="h-4 w-4 animate-spin mr-3" /> Activated...</> : <><ShieldAlert className="h-4 w-4 mr-3" /> ANALYZE INGRESS</>}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Payloads */}
          <div className="space-y-6">
            <div className="section-label">Reference Signatures</div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {TEST_SAMPLES.map((sample, i) => (
                <button 
                  key={i} 
                  onClick={() => handleQuickTest(sample.payload)}
                  disabled={isAnalyzing}
                  className="group relative flex flex-col items-start p-4 bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5 rounded-2xl hover:border-destructive/30 hover:bg-black/[0.05] dark:hover:bg-white/[0.05] transition-all duration-300 text-left"
                >
                  <div className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-muted-foreground group-hover:text-destructive transition-colors">{sample.name}</div>
                  <div className="text-[9px] font-mono truncate w-full mt-1 opacity-20 text-gray-400 dark:text-white">SIG_REF_{i+102}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Result Intelligence Report */}
          {(result || isAnalyzing) && (
            <div className="space-y-10 animate-in slide-in-from-bottom-12 duration-1000 fill-mode-forwards">
              {isAnalyzing ? (
                <div className="py-40 flex flex-col items-center justify-center space-y-6">
                  <div className="relative">
                    <div className="absolute inset-0 radar-sweep opacity-20 scale-150" />
                    <Loader2 className="h-20 w-20 animate-spin text-destructive relative z-10" />
                  </div>
                  <p className="font-black text-[10px] uppercase tracking-[0.5em] text-destructive animate-pulse">Running Neural Inference Engine</p>
                </div>
              ) : result && (
                <>
                  {/* Threat Intelligence Header */}
                  <div className={cn("relative p-10 rounded-3xl border-2 flex flex-col md:flex-row items-center justify-between gap-8 bg-gradient-to-br overflow-hidden shadow-2xl transition-all duration-1000", getStatusColor(result.decision))}>
                    <div className="absolute top-4 right-6 flex gap-4">
                       <Badge variant="outline" className="bg-black/20 dark:bg-black/40 border-white/10 text-[9px] font-mono py-1 uppercase text-white">{result.inference_time_ms}ms INF</Badge>
                       <Badge variant="outline" className="bg-black/20 dark:bg-black/40 border-white/10 text-[9px] font-mono py-1 uppercase text-white">1.2.4 NODE</Badge>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-4">
                        <div className="p-4 bg-black/40 dark:bg-black/60 rounded-2xl border border-white/10">
                          <AttackIcon className="h-8 w-8 text-white" />
                        </div>
                        <div>
                          <h2 className="text-5xl font-black tracking-tighter text-white uppercase">{result.decision}</h2>
                          <p className="text-[10px] font-bold text-white/70 uppercase tracking-[0.2em]">{result.predicted_class} DETECTED</p>
                        </div>
                      </div>
                    </div>
                    <div className="relative h-32 w-32 flex items-center justify-center">
                       <svg className="w-full h-full transform -rotate-90">
                         <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/10" />
                         <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={364} strokeDashoffset={364 - (result.confidence_score * 364)} className="text-white transition-all duration-1000" />
                       </svg>
                       <div className="absolute inset-0 flex flex-col items-center justify-center">
                         <span className="text-2xl font-black text-white">{Math.round(result.confidence_score * 100)}%</span>
                         <span className="text-[8px] font-black uppercase text-white/70">Match</span>
                       </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    <div className="space-y-6">
                      <div className="section-label">Payload Forensics</div>
                      <div className="grid grid-cols-1 gap-6">
                        <div className="space-y-3">
                          <p className="text-[9px] font-black text-gray-500 dark:text-muted-foreground uppercase tracking-widest pl-2">Raw Ingress Source</p>
                          <div className="p-6 bg-gray-50 dark:bg-[#0a0c14] rounded-2xl border border-black/5 dark:border-white/5 font-mono text-[11px] h-48 overflow-auto relative custom-scrollbar">
                            <div className="absolute left-2 top-6 bottom-6 w-[1px] bg-black/5 dark:bg-white/5" />
                            {result.raw_input?.split('\n').map((line, i) => (
                              <div key={i} className="flex gap-4 group">
                                <span className="w-4 text-gray-300 dark:text-white/10 text-right group-hover:text-destructive transition-colors">{i + 1}</span>
                                <span className="text-gray-600 dark:text-muted-foreground truncate">{line}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="space-y-3">
                          <p className="text-[9px] font-black text-gray-500 dark:text-muted-foreground uppercase tracking-widest pl-2">Normalized Output</p>
                          <div className="p-6 bg-gray-50 dark:bg-[#0a0c14] rounded-2xl border border-black/5 dark:border-white/5 font-mono text-[11px] h-48 overflow-auto custom-scrollbar">
                             <div className="break-all text-gray-800 dark:text-white/80 leading-relaxed">
                               {result.decoded_input?.split('').map((char, i) => {
                                 const isMalicious = result.highlighted_tokens.some(t => result.decoded_input?.substring(i, i + t.length).toLowerCase() === t.toLowerCase());
                                 return <span key={i} className={cn(isMalicious ? "bg-destructive text-white px-0.5 rounded-sm font-bold shadow-[0_0_10px_rgba(239,68,68,0.5)]" : "")}>{char}</span>;
                               })}
                             </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="section-label">Neural Vulnerability Radar</div>
                      <div className="glass-card p-6 h-full min-h-[300px] flex items-center justify-center rounded-3xl">
                        <ResponsiveContainer width="100%" height={280}>
                          <RadarChart data={radarData}>
                            <PolarGrid stroke="#e2e8f0" className="dark:stroke-[#2a2d3e]" />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                            <Radar
                              name="Threat Level"
                              dataKey="A"
                              stroke="#ef4444"
                              fill="#ef4444"
                              fillOpacity={0.4}
                            />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="section-label">Token Intelligence Map</div>
                    <div className="flex flex-wrap gap-3">
                      {result.token_scores?.map((ts, i) => (
                        <div key={i} className={cn("px-4 py-2 rounded-xl border flex flex-col items-center gap-1 transition-all hover:scale-110", ts.score > 0.8 ? "bg-destructive/10 border-destructive/30 text-destructive animate-in zoom-in-50" : "bg-gray-50 dark:bg-white/5 border-black/5 dark:border-white/10 text-gray-500 dark:text-muted-foreground")} style={{ animationDelay: `${i * 50}ms` }}>
                          <span className="font-mono text-xs font-black uppercase">{ts.token}</span>
                          <span className="text-[9px] font-bold opacity-60">{Math.round(ts.score * 100)}%</span>
                        </div>
                      )) || <p className="text-[10px] text-gray-400 dark:text-muted-foreground uppercase italic opacity-50">Deep analysis: safe packet structure</p>}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="section-label">De-obfuscation Pipeline</div>
                    <div className="relative flex items-center justify-between gap-6 py-4 overflow-x-auto custom-scrollbar no-scrollbar">
                       <div className="absolute top-1/2 left-0 w-full h-[2px] timeline-dash -translate-y-1/2 -z-10" />
                       {result.decode_steps?.map((step, idx) => (
                         <div key={idx} className="flex-shrink-0 w-64 glass-card p-5 rounded-2xl relative animate-in slide-in-from-left-4" style={{ animationDelay: `${idx * 300}ms` }}>
                           <div className="flex justify-between items-center mb-3">
                             <span className="text-[8px] font-black text-destructive px-2 py-0.5 rounded-full bg-destructive/10 border border-destructive/20">{idx + 1}</span>
                             <span className="text-[9px] font-black uppercase text-gray-500 dark:text-muted-foreground tracking-widest">{step.step_name}</span>
                           </div>
                           <p className="text-[10px] font-mono text-gray-600 dark:text-white/50 truncate bg-gray-50 dark:bg-black/40 p-2 rounded-lg border border-black/5 dark:border-white/5">
                             {step.output}
                           </p>
                         </div>
                       ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    <div className="space-y-6">
                      <div className="section-label">OWASP Threat Profile</div>
                      <Card className="glass-card rounded-3xl overflow-hidden group">
                        <div className="bg-destructive/5 p-6 border-b border-black/5 dark:border-white/5 flex items-center justify-between">
                           <div className="flex items-center gap-4">
                             <Badge variant="destructive" className="px-4 py-1 text-xs font-black rounded-lg badge-glow-red">{result.owasp_category}</Badge>
                             <span className="text-lg font-black text-gray-900 dark:text-white">{intel?.name || 'Classified Threat'}</span>
                           </div>
                           <AlertCircle className="h-5 w-5 text-destructive animate-pulse" />
                        </div>
                        <CardContent className="p-8 space-y-6">
                          <p className="text-sm text-gray-500 dark:text-muted-foreground leading-relaxed">{intel?.desc || 'Deep semantic detection confirmed anomalous request pattern.'}</p>
                          <div className="space-y-4">
                            <Label className="text-[10px] uppercase font-black text-gray-400 dark:text-muted-foreground opacity-50">Impact Mitigation</Label>
                            <div className="grid grid-cols-1 gap-2">
                              {intel?.mitigation.map((m: string, i: number) => (
                                <div key={i} className="flex items-center gap-3 text-xs font-medium text-gray-700 dark:text-white/80">
                                  <div className="h-1.5 w-1.5 rounded-full bg-destructive" /> {m}
                                </div>
                              ))}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="space-y-6">
                      <div className="section-label">AI Forensic Analysis</div>
                      <Card className="glass-card rounded-3xl p-8 space-y-6 border-l-4 border-l-destructive relative">
                         <div className="absolute top-4 right-6 flex items-center gap-2">
                           <Badge variant="outline" className="text-[8px] font-black border-destructive/30 text-destructive bg-destructive/5">GROQ ENGINE</Badge>
                           <span className="text-[8px] font-bold text-gray-400 dark:text-muted-foreground opacity-30">Llama 3 8B</span>
                         </div>
                         <div className="min-h-[120px]">
                           <p className="text-sm font-medium text-gray-800 dark:text-white/90 italic leading-relaxed">
                             "{typewriterText || result.explanation}"<span className="animate-pulse inline-block w-1.5 h-4 bg-destructive ml-1" />
                           </p>
                         </div>
                         <div className="pt-6 border-t border-black/5 dark:border-white/5 space-y-4">
                            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 dark:text-muted-foreground">
                              <span>Inference Confidence</span>
                              <span className="text-destructive">{Math.round(result.confidence_score * 100)}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
                               <div className="h-full bg-destructive transition-all duration-1000 shadow-[0_0_15px_#ef4444]" style={{ width: `${result.confidence_score * 100}%` }} />
                            </div>
                         </div>
                      </Card>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="section-label">Correlated Activity</div>
                    <div className="glass-card overflow-hidden rounded-3xl">
                      <table className="w-full text-left">
                        <thead className="bg-black/[0.02] dark:bg-white/[0.02] border-b border-black/5 dark:border-white/5">
                           <tr className="text-[9px] uppercase font-black text-gray-400 dark:text-muted-foreground">
                             <th className="px-8 py-4">Time Observed</th>
                             <th className="px-8 py-4">Payload Signature</th>
                             <th className="px-8 py-4 text-right">Match Score</th>
                           </tr>
                        </thead>
                        <tbody className="text-[11px] font-medium">
                          {historical.map((h) => (
                            <tr key={h.id} className="border-b border-black/5 dark:border-white/5 last:border-0 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors group">
                              <td className="px-8 py-4 text-gray-500 dark:text-muted-foreground font-mono">{formatDistanceToNow(new Date(h.timestamp))} ago</td>
                              <td className="px-8 py-4 font-mono opacity-60 text-gray-700 dark:text-white group-hover:opacity-100 transition-opacity truncate max-w-md">{h.payload}</td>
                              <td className="px-8 py-4 text-right font-black text-destructive">{Math.round(h.score * 100)}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-10 border-t border-black/5 dark:border-white/5">
                    <Button variant="outline" className="flex-1 font-black uppercase text-xs h-14 rounded-2xl border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5" onClick={() => { navigator.clipboard.writeText(JSON.stringify(result, null, 2)); toast({ title: "Intelligence Copied" }); }}>
                      <Copy className="h-4 w-4 mr-3" /> Export Intelligence (JSON)
                    </Button>
                    <Button variant="ghost" className="flex-1 font-black uppercase text-xs h-14 rounded-2xl text-gray-400 dark:text-muted-foreground hover:text-gray-900 dark:hover:text-white" onClick={() => toast({ title: "Feedback Recorded", description: "Signal corrected for training loop" })}>
                      <Flag className="h-4 w-4 mr-3" /> Report False Positive
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        <div className="space-y-8">
          <Card className="glass-card bg-black/[0.01] dark:bg-white/[0.03] rounded-3xl p-2 sticky top-28">
            <CardHeader className="p-6">
              <CardTitle className="text-xs font-black uppercase tracking-[0.3em] text-gray-400 dark:text-muted-foreground flex items-center gap-2">
                <Activity className="h-4 w-4 text-destructive" /> REAL-TIME SPECS
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0 space-y-6">
              {[
                { label: 'LPU Latency', val: '5.2ms AVG', color: 'text-destructive', bg: 'bg-destructive/10' },
                { label: 'Neural Depth', val: '12-Layer', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                { label: 'Context Size', val: '5,000 OCTETS', color: 'text-gray-900 dark:text-white', bg: 'bg-black/5 dark:bg-white/5' }
              ].map((item, idx) => (
                <div key={idx} className={cn("p-5 rounded-2xl border border-black/5 dark:border-white/5 transition-all duration-300 hover:bg-black/5 dark:hover:bg-white/5", item.bg)}>
                  <p className="text-[9px] text-gray-500 dark:text-muted-foreground uppercase font-black tracking-widest mb-2 opacity-50">{item.label}</p>
                  <p className={cn("font-mono text-xl font-black tracking-tighter", item.color)}>{item.val}</p>
                </div>
              ))}
              <div className="pt-4 space-y-4">
                 <div className="section-label mb-4 pl-0 border-none">Analysis Status</div>
                 <div className="flex items-center gap-3">
                   <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#22c55e]" />
                   <span className="text-[10px] font-black uppercase tracking-widest opacity-60 text-gray-500 dark:text-white">Engine Operational</span>
                 </div>
                 <div className="flex items-center gap-3">
                   <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#22c55e]" />
                   <span className="text-[10px] font-black uppercase tracking-widest opacity-60 text-gray-500 dark:text-white">Llama Uplink Active</span>
                 </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}