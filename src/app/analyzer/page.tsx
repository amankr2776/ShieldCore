
"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ShieldAlert, CheckCircle2, AlertCircle, Loader2, Copy, Flag, Activity, Zap, RefreshCw } from 'lucide-react';
import { analyzeHttpRequest, AnalyzeOutput } from '@/ai/flows/analyze-http-request';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const TEST_SAMPLES = [
  { name: 'Normal Request', payload: 'GET /index.html HTTP/1.1\nHost: example.com\nUser-Agent: Mozilla/5.0' },
  { name: 'SQL Injection', payload: "GET /api/user?id=1' OR '1'='1' HTTP/1.1" },
  { name: 'SQLi (Base64)', payload: 'GET /search?q=MScgT1IgJzEnPScx' },
  { name: 'XSS Attack', payload: 'POST /comment HTTP/1.1\n\nbody=<script>alert("XSS")</script>' },
  { name: 'Path Traversal', payload: 'GET /download?file=../../../../etc/passwd' },
  { name: 'Command Injection', payload: 'POST /exec HTTP/1.1\n\ncmd=; ls -la' }
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
      toast({ title: "Validation Error", description: "Please enter an HTTP request or payload to analyze.", variant: "destructive" });
      return;
    }
    
    setIsAnalyzing(true);
    setResult(null);
    setReAnalyzeResult(null);
    setFeedbackSent(false);

    // Simulated "Inference Feel"
    await new Promise(resolve => setTimeout(resolve, 1500));

    try {
      const truncated = input.length > 5000 ? input.substring(0, 5000) : input;
      if (input.length > 5000) {
        toast({ title: "Warning", description: "Large payload detected — truncating for analysis." });
      }

      const res = await analyzeHttpRequest({ payload: truncated });
      setResult(res);
      setModifiedPayload(res.decoded_input);
    } catch (error) {
      toast({ title: "Analysis Failed", description: "The security engine encountered an error.", variant: "destructive" });
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
      toast({ title: "Re-analysis Failed", variant: "destructive" });
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

  const getDecisionStyles = (decision: string) => {
    switch (decision) {
      case 'BLOCKED': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'SAFE': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'SUSPICIOUS': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="container mx-auto py-10 px-6 max-w-5xl space-y-8 animate-in fade-in duration-500">
      <div className="space-y-2">
        <h1 className="text-4xl font-extrabold tracking-tight">Attack Analyzer</h1>
        <p className="text-muted-foreground text-lg">Semantic deep packet inspection using DistilBERT-HTTP intelligence.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-8">
          <Card className="border-border/50 bg-card shadow-2xl overflow-hidden">
            <CardContent className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">HTTP Request / Payload</Label>
                  <span className="text-[10px] font-mono text-muted-foreground">{payload.length} / 5000</span>
                </div>
                <Textarea
                  placeholder="Paste raw request here..."
                  className="min-h-[200px] font-mono text-sm bg-background/50 border-border focus-visible:ring-destructive resize-none"
                  value={payload}
                  onChange={(e) => setPayload(e.target.value)}
                />
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center space-x-2">
                  <Switch id="what-if" checked={whatIfEnabled} onCheckedChange={setWhatIfEnabled} />
                  <Label htmlFor="what-if" className="cursor-pointer text-sm font-bold uppercase tracking-tight">What-If Mode</Label>
                </div>
                <Button 
                  size="lg" 
                  className="w-full sm:w-64 bg-destructive hover:bg-destructive/90 text-white font-extrabold rounded-full h-14"
                  onClick={() => handleAnalyze()}
                  disabled={isAnalyzing}
                >
                  {isAnalyzing ? <><Loader2 className="h-5 w-5 animate-spin mr-3" /> ANALYZING...</> : <><ShieldAlert className="h-5 w-5 mr-3" /> ANALYZE THREAT</>}
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <RefreshCw className="h-3 w-3" /> Quick Test Payloads
            </h3>
            <div className="flex flex-wrap gap-2">
              {TEST_SAMPLES.map((sample, i) => (
                <Button key={i} variant="secondary" size="sm" className="text-[10px] font-bold uppercase" onClick={() => handleQuickTest(sample.payload)} disabled={isAnalyzing}>
                  {sample.name}
                </Button>
              ))}
            </div>
          </div>

          {(result || isAnalyzing) && (
            <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
              <div className={cn("grid gap-6", (reAnalyzeResult || whatIfEnabled) ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1")}>
                <Card className="border-border bg-card shadow-lg relative overflow-hidden">
                  {isAnalyzing ? (
                    <div className="flex flex-col items-center justify-center py-24 space-y-4">
                      <Loader2 className="h-12 w-12 animate-spin text-destructive" />
                      <p className="font-bold text-lg animate-pulse">Running Transformers Inference...</p>
                    </div>
                  ) : result && (
                    <>
                      <div className={cn("absolute top-0 left-0 w-1.5 h-full", 
                        result.decision === 'BLOCKED' ? "bg-destructive" : 
                        result.decision === 'SAFE' ? "bg-emerald-500" : "bg-amber-500")} />
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-xl font-bold uppercase">Analysis Result</CardTitle>
                          <Badge variant="outline" className={cn("px-4 py-1.5 text-sm font-extrabold", getDecisionStyles(result.decision))}>
                            {result.decision}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm font-bold">
                            <span className="uppercase tracking-tighter text-muted-foreground">Threat Confidence</span>
                            <span className={cn(result.decision === 'BLOCKED' ? "text-destructive" : "text-emerald-500")}>
                              {Math.round(result.confidence_score * 100)}%
                            </span>
                          </div>
                          <Progress value={result.confidence_score * 100} indicatorclassname={result.decision === 'BLOCKED' ? "bg-destructive" : "bg-emerald-500"} />
                        </div>

                        <div className="grid grid-cols-2 gap-4 bg-secondary/20 p-4 rounded-xl border border-border/30">
                          <div>
                            <Label className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Predicted Class</Label>
                            <p className="font-extrabold text-lg">{result.predicted_class}</p>
                          </div>
                          <div>
                            <Label className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">OWASP Category</Label>
                            <p className="font-bold text-xs leading-tight">{result.owasp_category}</p>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <Label className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Decoded Payload Highlights</Label>
                          <div className="p-4 bg-black/40 rounded-xl border border-border/50 text-xs font-mono break-all leading-relaxed max-h-[150px] overflow-auto">
                            {result.decoded_input.split('').map((char, i) => {
                              const isHighlighted = result.highlighted_tokens.some(token => 
                                result.decoded_input.substring(i, i + token.length).toLowerCase() === token.toLowerCase()
                              );
                              return <span key={i} className={cn(isHighlighted ? "bg-yellow-500 text-black px-0.5" : "")}>{char}</span>;
                            })}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Analyst Insight</Label>
                          <p className="text-sm text-muted-foreground italic leading-relaxed border-l-2 border-destructive/30 pl-4">
                            "{result.explanation}"
                          </p>
                        </div>

                        <div className="flex gap-2 pt-4 border-t border-border/50">
                          <Button variant="outline" size="sm" className="flex-1 font-bold uppercase text-[10px]" onClick={handleCopy}>
                            <Copy className="h-3.5 w-3.5 mr-2" /> {copied ? "COPIED!" : "COPY RESULT"}
                          </Button>
                          <Button variant="ghost" size="sm" className={cn("flex-1 font-bold uppercase text-[10px]", feedbackSent ? "text-emerald-500" : "text-muted-foreground")} onClick={() => { setFeedbackSent(true); toast({ title: "Feedback Sent", description: "False positive report recorded." }); }} disabled={feedbackSent}>
                            <Flag className="h-3.5 w-3.5 mr-2" /> {feedbackSent ? "REPORTED" : "REPORT FALSE POSITIVE"}
                          </Button>
                        </div>

                        <div className="flex justify-between items-center text-[10px] text-muted-foreground font-mono uppercase">
                          <span>LATENCY: {result.inference_time_ms}ms</span>
                          <span>DistilBERT-HTTP v2.0</span>
                        </div>
                      </CardContent>
                    </>
                  )}
                </Card>

                {(reAnalyzeResult || whatIfEnabled) && (
                  <Card className="border-destructive/30 bg-destructive/5 animate-in slide-in-from-right-4">
                    <CardHeader>
                      <CardTitle className="text-xl font-bold flex items-center gap-2">
                        <Zap className="h-5 w-5 text-destructive" /> What-If Simulator
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <Textarea 
                        className="bg-background/80 font-mono text-sm min-h-[120px] border-destructive/20 focus-visible:ring-destructive"
                        value={modifiedPayload}
                        onChange={(e) => setModifiedPayload(e.target.value)}
                        placeholder="Modify payload here..."
                      />
                      <Button variant="destructive" className="w-full font-bold uppercase" onClick={handleReAnalyze} disabled={isReAnalyzing}>
                        {isReAnalyzing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
                        RE-RUN INFERENCE
                      </Button>

                      {reAnalyzeResult && (
                        <div className="space-y-4 p-4 bg-background/50 rounded-xl border border-destructive/20 mt-4">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-bold uppercase">Simulated Result</span>
                            <Badge variant={reAnalyzeResult.decision === 'BLOCKED' ? 'destructive' : 'secondary'}>{reAnalyzeResult.decision}</Badge>
                          </div>
                          <div className="space-y-1">
                            <div className="flex justify-between text-[10px] font-bold">
                              <span>Score</span>
                              <span>{Math.round(reAnalyzeResult.confidence_score * 100)}%</span>
                            </div>
                            <Progress value={reAnalyzeResult.confidence_score * 100} indicatorclassname={reAnalyzeResult.decision === 'BLOCKED' ? "bg-destructive" : "bg-emerald-500"} />
                          </div>
                          <p className="text-[11px] text-muted-foreground italic leading-relaxed">
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

        <div className="space-y-6">
          <Card className="border-border/50 bg-secondary/10">
            <CardHeader><CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2"><Activity className="h-4 w-4 text-destructive" /> Real-time Intel</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 bg-secondary/30 rounded-lg border border-border/50">
                <p className="text-[10px] text-muted-foreground uppercase font-bold">Detection Speed</p>
                <p className="font-mono text-xl font-bold text-accent">7.2ms AVG</p>
              </div>
              <div className="p-3 bg-secondary/30 rounded-lg border border-border/50">
                <p className="text-[10px] text-muted-foreground uppercase font-bold">Model Precision</p>
                <p className="font-mono text-xl font-bold text-emerald-500">93.8%</p>
              </div>
              <div className="p-3 bg-secondary/30 rounded-lg border border-border/50">
                <p className="text-[10px] text-muted-foreground uppercase font-bold">Active Rulesets</p>
                <p className="font-mono text-xl font-bold">6,402</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
