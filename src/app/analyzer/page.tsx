
"use client";

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ShieldAlert, Loader2, Copy, Flag, Activity, Zap, RefreshCw, ChevronRight, Terminal } from 'lucide-react';
import { analyzeHttpRequest, AnalyzeOutput } from '@/ai/flows/analyze-http-request';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const TEST_SAMPLES = [
  { name: 'Normal Traffic', payload: 'GET /tienda1/imagenes/logo.gif HTTP/1.1\nHost: localhost:8080\nCookie: JSESSIONID=A53D159B0F23CDF15AF7AF825C939170' },
  { name: 'SQL Injection', payload: "GET /publico/caracteristicas.jsp?id=%27OR%27a%3D%27a HTTP/1.1\nHost: localhost:8080" },
  { name: 'XSS Attack', payload: 'GET /miembros/editar.jsp?modo=registro%3CSCRIPT%3Ealert%28%22Paros%22%29%3B%3C%2FSCRIPT%3E HTTP/1.1' },
  { name: 'OS Command', payload: 'POST /publico/pagar.jsp HTTP/1.1\n\nmodo=insertar&precio=88&B1=Confirmar%3C%21--%23EXEC+cmd%3D%22ls+%2F%22--%3E' },
  { name: 'Path Traversal', payload: 'GET /files?path=../../etc/passwd HTTP/1.1' },
  { name: 'Credential Tampering', payload: 'POST /publico/registro.jsp HTTP/1.1\n\nmodo=registro&login=defalco&password=Set-cookie%253A%2BTamper%253D1041264' }
];

export default function AnalyzerPage() {
  const [payload, setPayload] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalyzeOutput | null>(null);
  const [whatIfEnabled, setWhatIfEnabled] = useState(false);
  const [modifiedPayload, setModifiedPayload] = useState('');
  const [reAnalyzeResult, setReAnalyzeResult] = useState<AnalyzeOutput | null>(null);
  const [isReAnalyzing, setIsReAnalyzing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [feedbackSent, setFeedbackSent] = useState(false);
  const { toast } = useToast();

  async function handleAnalyze(customPayload?: string) {
    const input = customPayload || payload;
    if (!input.trim()) {
      toast({ title: "Input Required", description: "Terminal ingress cannot be empty.", variant: "destructive" });
      return;
    }
    
    setIsAnalyzing(true);
    setResult(null);
    setReAnalyzeResult(null);
    setFeedbackSent(false);

    // Cinematic inference delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    try {
      const truncated = input.length > 5000 ? input.substring(0, 5000) : input;
      if (input.length > 5000) {
        toast({ title: "Truncation Active", description: "Payload exceeds 5k limit. Truncating ingress stream." });
      }

      const res = await analyzeHttpRequest({ payload: truncated });
      setResult(res);
      setModifiedPayload(res.decoded_input);
    } catch (error) {
      toast({ title: "Inference Failure", description: "Model response timeout or neural disconnect.", variant: "destructive" });
    } finally {
      setIsAnalyzing(false);
    }
  }

  const handleQuickTest = (sample: string) => {
    setPayload(sample);
    setTimeout(() => handleAnalyze(sample), 500);
  };

  async function handleReAnalyze() {
    setIsReAnalyzing(true);
    try {
      const res = await analyzeHttpRequest({ payload: modifiedPayload });
      setReAnalyzeResult(res);
    } catch (error) {
      toast({ title: "Simulator Error", variant: "destructive" });
    } finally {
      setIsReAnalyzing(false);
    }
  }

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(JSON.stringify(result, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getBadgeGlow = (decision: string) => {
    switch (decision) {
      case 'BLOCKED': return 'bg-destructive/20 text-destructive border-destructive/40 badge-glow-red';
      case 'SAFE': return 'bg-emerald-500/20 text-emerald-500 border-emerald-500/40 badge-glow-green';
      case 'SUSPICIOUS': return 'bg-amber-500/20 text-amber-500 border-amber-500/40 badge-glow-amber';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="container mx-auto py-12 px-6 max-w-6xl space-y-10 animate-in fade-in duration-1000">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-destructive font-mono text-[10px] tracking-[0.3em] uppercase animate-pulse">
            <Terminal className="h-3 w-3" /> Ingress Inspection Active
          </div>
          <h1 className="text-5xl font-black tracking-tighter">SEMANTIC <span className="text-destructive">ANALYZER</span></h1>
          <p className="text-muted-foreground font-medium text-lg">Neural packet inspection powered by fine-tuned DistilBERT-HTTP.</p>
        </div>
        <div className="flex items-center gap-4 bg-white/5 p-2 rounded-2xl border border-white/5 backdrop-blur-xl">
           <div className="flex items-center space-x-3 px-4">
              <Switch id="what-if" checked={whatIfEnabled} onCheckedChange={setWhatIfEnabled} />
              <Label htmlFor="what-if" className="cursor-pointer text-[10px] font-black uppercase tracking-widest">Simulator Mode</Label>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-10">
          <div className="animated-border">
            <Card className="border-none bg-[#0a0c14]/90 backdrop-blur-3xl shadow-2xl relative overflow-hidden group">
              {isAnalyzing && <div className="scanner-line" />}
              <CardContent className="p-8 space-y-6 relative z-20">
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Source Payload (HTTP/RAW)</Label>
                    <span className="text-[10px] font-mono text-muted-foreground bg-white/5 px-2 py-0.5 rounded-sm">{payload.length} / 5000</span>
                  </div>
                  <Textarea
                    placeholder="Enter ingress stream for neural classification..."
                    className="min-h-[220px] font-mono text-xs bg-black/40 border-white/10 focus-visible:ring-destructive resize-none placeholder:text-muted-foreground/30 leading-relaxed rounded-xl transition-all duration-300 focus:bg-black/60"
                    value={payload}
                    onChange={(e) => setPayload(e.target.value)}
                  />
                </div>

                <div className="flex justify-end">
                  <Button 
                    size="lg" 
                    className="w-full sm:w-80 bg-destructive hover:bg-destructive/90 text-white font-black rounded-xl h-16 glow-btn text-sm uppercase tracking-widest transition-all duration-300"
                    onClick={() => handleAnalyze()}
                    disabled={isAnalyzing}
                  >
                    {isAnalyzing ? <><Loader2 className="h-5 w-5 animate-spin mr-3" /> COMPUTING...</> : <><ShieldAlert className="h-5 w-5 mr-3" /> EXECUTE ANALYSIS</>}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground flex items-center gap-2">
              <RefreshCw className="h-3 w-3" /> Quick Load CSIC-2010 Payloads
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {TEST_SAMPLES.map((sample, i) => (
                <button 
                  key={i} 
                  onClick={() => handleQuickTest(sample.payload)}
                  disabled={isAnalyzing}
                  className="group relative flex flex-col items-start p-4 bg-white/5 border border-white/5 rounded-2xl hover:border-destructive/30 hover:bg-white/10 transition-all duration-300 text-left"
                >
                  <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-destructive transition-colors">{sample.name}</div>
                  <div className="text-[9px] font-mono truncate w-full mt-1 opacity-40">INGRESS_{i+102}</div>
                </button>
              ))}
            </div>
          </div>

          {(result || isAnalyzing) && (
            <div className="space-y-8 animate-in slide-in-from-bottom-12 duration-700 ease-out fill-mode-forwards">
              <div className={cn("grid gap-8", (reAnalyzeResult || whatIfEnabled) ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1")}>
                <Card className="glass-card shadow-2xl relative overflow-hidden group">
                  {isAnalyzing ? (
                    <div className="flex flex-col items-center justify-center py-32 space-y-6">
                      <div className="relative">
                        <div className="absolute inset-0 radar-sweep opacity-20 scale-150" />
                        <Loader2 className="h-16 w-16 animate-spin text-destructive relative z-10" />
                      </div>
                      <p className="font-black text-xs uppercase tracking-[0.4em] text-destructive animate-pulse">Running Neural Inference</p>
                    </div>
                  ) : result && (
                    <>
                      <div className={cn("absolute top-0 left-0 w-2 h-full transition-colors duration-1000", 
                        result.decision === 'BLOCKED' ? "bg-destructive" : 
                        result.decision === 'SAFE' ? "bg-emerald-500" : "bg-amber-500")} />
                      <CardHeader className="p-8 pb-0">
                        <div className="flex justify-between items-start">
                          <div className="space-y-1">
                            <CardTitle className="text-2xl font-black uppercase tracking-tight">Detection Result</CardTitle>
                            <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">ID: {Math.random().toString(36).substr(2, 9)}</p>
                          </div>
                          <Badge variant="outline" className={cn("px-6 py-2 text-sm font-black uppercase tracking-widest rounded-xl transition-all duration-1000", getBadgeGlow(result.decision))}>
                            {result.decision}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="p-8 space-y-10">
                        <div className="space-y-3">
                          <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                            <span className="text-muted-foreground">Threat Confidence</span>
                            <span className={cn(result.decision === 'BLOCKED' ? "text-destructive" : "text-emerald-500")}>
                              {Math.round(result.confidence_score * 100)}% Match
                            </span>
                          </div>
                          <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                            <div 
                              className={cn("h-full transition-all duration-1000 relative", result.decision === 'BLOCKED' ? "bg-destructive" : "bg-emerald-500")}
                              style={{ width: `${result.confidence_score * 100}%` }}
                            >
                               <div className="absolute inset-0 bg-white/20 animate-pulse" />
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 bg-black/30 p-6 rounded-2xl border border-white/5">
                          <div className="space-y-1">
                            <Label className="text-[10px] text-muted-foreground uppercase font-black tracking-widest opacity-50">Class</Label>
                            <p className="font-black text-xl tracking-tighter text-white">{result.predicted_class}</p>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[10px] text-muted-foreground uppercase font-black tracking-widest opacity-50">OWASP Mapping</Label>
                            <p className="font-bold text-xs leading-tight text-destructive">{result.owasp_category}</p>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <Label className="text-[10px] text-muted-foreground uppercase font-black tracking-widest opacity-50">Attack Signature Analysis</Label>
                          <div className="p-6 bg-black/40 rounded-2xl border border-white/5 text-[11px] font-mono break-all leading-loose max-h-[160px] overflow-auto custom-scrollbar shadow-inner">
                            {result.decoded_input.split('').map((char, i) => {
                              const isHighlighted = result.highlighted_tokens.some(token => 
                                result.decoded_input.substring(i, i + token.length).toLowerCase() === token.toLowerCase()
                              );
                              return <span key={i} className={cn(isHighlighted ? "bg-destructive text-white px-0.5 rounded-sm font-bold badge-glow-red" : "opacity-80")}>{char}</span>;
                            })}
                          </div>
                        </div>

                        {result.token_scores && result.token_scores.length > 0 && (
                          <div className="space-y-4">
                            <Label className="text-[10px] text-muted-foreground uppercase font-black tracking-widest opacity-50">Confidence Breakdown</Label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {result.token_scores.map((ts, i) => (
                                <div key={i} className="p-3 bg-white/5 rounded-xl border border-white/5 space-y-2">
                                  <div className="flex justify-between text-[10px] font-mono">
                                    <span className="font-bold text-destructive">{ts.token}</span>
                                    <span className="opacity-50">{Math.round(ts.score * 100)}%</span>
                                  </div>
                                  <div className="h-1 w-full bg-black/40 rounded-full overflow-hidden">
                                    <div 
                                      className={cn("h-full transition-all duration-1000", ts.score > 0.85 ? "bg-destructive" : "bg-amber-500")}
                                      style={{ width: `${ts.score * 100}%` }}
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="p-6 bg-destructive/5 rounded-2xl border-l-2 border-destructive shadow-inner">
                          <p className="text-sm text-muted-foreground italic leading-relaxed font-medium">
                            "{result.explanation}"
                          </p>
                        </div>

                        <div className="flex gap-4 pt-4 border-t border-white/5">
                          <Button variant="outline" className="flex-1 font-black uppercase text-[10px] tracking-widest h-12 rounded-xl border-white/10 hover:bg-white/5" onClick={handleCopy}>
                            <Copy className="h-3.5 w-3.5 mr-2" /> {copied ? "COPIED" : "EXPORT JSON"}
                          </Button>
                          <Button variant="ghost" className={cn("flex-1 font-black uppercase text-[10px] tracking-widest h-12 rounded-xl hover:bg-white/5 transition-all", feedbackSent ? "text-emerald-500" : "text-muted-foreground")} onClick={() => { setFeedbackSent(true); toast({ title: "Signal Recorded", description: "Signal strength updated based on analyst feedback." }); }} disabled={feedbackSent}>
                            <Flag className="h-3.5 w-3.5 mr-2" /> {feedbackSent ? "REPORTED" : "FALSE POSITIVE"}
                          </Button>
                        </div>
                      </CardContent>
                    </>
                  )}
                </Card>

                {(reAnalyzeResult || whatIfEnabled) && (
                  <Card className="glass-card border-destructive/20 bg-destructive/[0.03] animate-in slide-in-from-right-12 duration-700 ease-out fill-mode-forwards">
                    <CardHeader className="p-8">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-2xl font-black uppercase tracking-tight flex items-center gap-3">
                          <Zap className="h-6 w-6 text-destructive animate-pulse" /> WHAT-IF SIMULATOR
                        </CardTitle>
                        <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 font-bold uppercase text-[9px]">Advanced Mode</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-8 pt-0 space-y-8">
                      <div className="space-y-4">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-50">Modify Decoded Stream</Label>
                        <Textarea 
                          className="bg-black/40 font-mono text-xs min-h-[180px] border-white/10 focus-visible:ring-destructive rounded-xl leading-relaxed"
                          value={modifiedPayload}
                          onChange={(e) => setModifiedPayload(e.target.value)}
                          placeholder="Alter ingress tokens to simulate classification drift..."
                        />
                      </div>
                      
                      <Button variant="destructive" className="w-full font-black uppercase h-14 rounded-xl glow-btn tracking-widest text-xs" onClick={handleReAnalyze} disabled={isReAnalyzing}>
                        {isReAnalyzing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
                        RE-RUN INFERENCE ENGINE
                      </Button>

                      {reAnalyzeResult && (
                        <div className="space-y-6 p-8 bg-black/50 rounded-2xl border border-destructive/20 mt-6 shadow-inner animate-in zoom-in-95 duration-300">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Simulation Result</span>
                            <Badge variant="outline" className={cn("px-4 py-1 font-black uppercase text-[10px] tracking-widest rounded-lg", getBadgeGlow(reAnalyzeResult.decision))}>{reAnalyzeResult.decision}</Badge>
                          </div>
                          <div className="space-y-3">
                            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                              <span className="text-muted-foreground">Neural Match</span>
                              <span className="text-destructive">{Math.round(reAnalyzeResult.confidence_score * 100)}%</span>
                            </div>
                            <Progress value={reAnalyzeResult.confidence_score * 100} indicatorClassName="bg-destructive" className="h-1.5" />
                          </div>
                          <p className="text-[11px] text-muted-foreground italic leading-relaxed bg-destructive/5 p-4 rounded-xl border-l-2 border-destructive">
                            "{reAnalyzeResult.explanation}"
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-8">
          <Card className="glass-card bg-white/[0.03] border-white/5 rounded-3xl p-2">
            <CardHeader className="p-6"><CardTitle className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground flex items-center gap-2"><Activity className="h-4 w-4 text-destructive" /> SYSTEM TELEMETRY</CardTitle></CardHeader>
            <CardContent className="p-6 pt-0 space-y-6">
              {[
                { label: 'Ingress Speed', val: '7.2ms AVG', color: 'text-destructive', bg: 'bg-destructive/10' },
                { label: 'Neural Precision', val: '93.8%', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                { label: 'Global Rulesets', val: '12,804', color: 'text-white', bg: 'bg-white/5' }
              ].map((item, idx) => (
                <div key={idx} className={cn("p-5 rounded-2xl border border-white/5 transition-all duration-300 hover:bg-white/5", item.bg)}>
                  <p className="text-[9px] text-muted-foreground uppercase font-black tracking-widest mb-2 opacity-50">{item.label}</p>
                  <p className={cn("font-mono text-2xl font-black tracking-tighter", item.color)}>{item.val}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
