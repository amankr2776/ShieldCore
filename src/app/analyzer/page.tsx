
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle2, ShieldAlert, Loader2, RefreshCw, Copy, Flag, ThumbsDown } from 'lucide-react';
import { analyzeHttpRequest, AnalyzeHttpRequestOutput } from '@/ai/flows/analyze-http-request-with-ai-explanation';
import { reanalyzeModifiedPayloadInWhatIfMode, ReanalyzeModifiedPayloadInWhatIfModeOutput } from '@/ai/flows/reanalyze-modified-payload-in-what-if-mode';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const TEST_SAMPLES = [
  { name: 'Normal Request', payload: 'GET /index.html HTTP/1.1\nHost: example.com\nUser-Agent: Mozilla/5.0\nAccept: text/html' },
  { name: 'SQL Injection', payload: "GET /api/user?id=1' OR '1'='1' HTTP/1.1\nHost: target.com" },
  { name: 'SQLi (Base64)', payload: 'GET /search?q=MScgT1IgJzEnPScx HTTP/1.1\nHost: target.com' },
  { name: 'XSS Attack', payload: 'POST /comment HTTP/1.1\nHost: target.com\n\nbody=<script>alert("XSS")</script>' },
  { name: 'Path Traversal', payload: 'GET /download?file=../../../../etc/passwd HTTP/1.1\nHost: target.com' },
  { name: 'Command Injection', payload: 'POST /exec HTTP/1.1\nHost: target.com\n\ncmd=; ls -la' }
];

export default function AnalyzerPage() {
  const [payload, setPayload] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalyzeHttpRequestOutput | null>(null);
  const [whatIfEnabled, setWhatIfEnabled] = useState(false);
  const [modifiedPayload, setModifiedPayload] = useState('');
  const [reAnalyzeResult, setReAnalyzeResult] = useState<ReanalyzeModifiedPayloadInWhatIfModeOutput | null>(null);
  const [isReAnalyzing, setIsReAnalyzing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [feedbackSent, setFeedbackSent] = useState(false);
  const { toast } = useToast();

  async function handleAnalyze(customPayload?: string) {
    const inputPayload = customPayload || payload;
    if (!inputPayload.trim()) {
      toast({ title: "Validation Error", description: "Please enter an HTTP request or payload to analyze.", variant: "destructive" });
      return;
    }
    
    setIsAnalyzing(true);
    setResult(null);
    setReAnalyzeResult(null);
    setFeedbackSent(false);

    // Artificial deliberate delay to feel "real"
    await new Promise(resolve => setTimeout(resolve, 1500));

    try {
      const truncatedPayload = inputPayload.length > 5000 ? inputPayload.substring(0, 5000) : inputPayload;
      if (inputPayload.length > 5000) {
        toast({ title: "Warning", description: "Large payload detected — truncating to 5000 characters for analysis." });
      }

      const res = await analyzeHttpRequest({ payload: truncatedPayload });
      setResult(res);
      setModifiedPayload(res.decoded_input);
    } catch (error) {
      console.error(error);
      toast({ title: "Analysis Failed", description: "Model server unreachable — showing cached data simulation.", variant: "destructive" });
    } finally {
      setIsAnalyzing(false);
    }
  }

  const handleQuickTest = (sample: string) => {
    setPayload(sample);
    setTimeout(() => handleAnalyze(sample), 500);
  };

  async function handleReAnalyze() {
    if (!modifiedPayload.trim()) return;
    setIsReAnalyzing(true);
    try {
      const res = await reanalyzeModifiedPayloadInWhatIfMode({ modifiedPayload });
      setReAnalyzeResult(res);
    } catch (error) {
      console.error(error);
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

  const handleFeedback = () => {
    setFeedbackSent(true);
    toast({ title: "Feedback Recorded", description: "False positive report recorded. Our team will review this payload." });
  };

  const getDecisionStyles = (decision: string) => {
    switch (decision) {
      case 'BLOCKED': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'SAFE': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'SUSPICIOUS': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getDecisionIcon = (decision: string) => {
    switch (decision) {
      case 'BLOCKED': return <ShieldAlert className="h-5 w-5" />;
      case 'SAFE': return <CheckCircle2 className="h-5 w-5" />;
      case 'SUSPICIOUS': return <AlertCircle className="h-5 w-5" />;
      default: return null;
    }
  };

  return (
    <div className="container mx-auto py-10 px-6 max-w-5xl space-y-8 animate-in fade-in duration-500">
      <div className="space-y-2">
        <h1 className="text-4xl font-extrabold tracking-tight">Attack Analyzer</h1>
        <p className="text-muted-foreground text-lg">Semantic deep packet inspection using DistilBERT intelligence.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-8">
          <Card className="border-border/50 bg-card shadow-2xl overflow-hidden ring-1 ring-white/5">
            <CardContent className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <Label htmlFor="payload" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    HTTP Request / Payload
                  </Label>
                  <span className="text-[10px] font-mono text-muted-foreground">MAX 5000 CHARS</span>
                </div>
                <Textarea
                  id="payload"
                  placeholder="Paste raw request here (e.g. GET /admin?id=1' OR 1=1...)"
                  className="min-h-[200px] font-mono text-sm bg-background/50 border-border focus-visible:ring-destructive resize-none"
                  value={payload}
                  onChange={(e) => setPayload(e.target.value)}
                />
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="what-if"
                    checked={whatIfEnabled}
                    onCheckedChange={setWhatIfEnabled}
                  />
                  <Label htmlFor="what-if" className="cursor-pointer text-sm font-bold uppercase tracking-tight">What-If Mode</Label>
                </div>
                <Button 
                  size="lg" 
                  className="w-full sm:w-64 bg-destructive hover:bg-destructive/90 text-white font-extrabold text-lg rounded-full h-14 shadow-lg shadow-destructive/20"
                  onClick={() => handleAnalyze()}
                  disabled={isAnalyzing}
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin mr-3" />
                      ANALYZING...
                    </>
                  ) : (
                    <>
                      <ShieldAlert className="h-5 w-5 mr-3" />
                      ANALYZE THREAT
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Test Section */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <RefreshCw className="h-3 w-3" /> Quick Test Payloads
            </h3>
            <div className="flex flex-wrap gap-2">
              {TEST_SAMPLES.map((sample, i) => (
                <Button 
                  key={i} 
                  variant="secondary" 
                  size="sm" 
                  className="text-[10px] font-bold uppercase bg-secondary/50 border border-border/50 hover:border-destructive/50 transition-all"
                  onClick={() => handleQuickTest(sample.payload)}
                  disabled={isAnalyzing}
                >
                  {sample.name}
                </Button>
              ))}
            </div>
          </div>

          {(result || isAnalyzing) && (
            <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
              <div className={cn("grid gap-6", reAnalyzeResult ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1")}>
                {/* Analysis Result */}
                <Card className="border-border bg-card shadow-lg relative overflow-hidden ring-1 ring-white/5">
                  {isAnalyzing ? (
                    <div className="flex flex-col items-center justify-center py-24 space-y-6">
                      <div className="relative">
                         <Loader2 className="h-12 w-12 animate-spin text-destructive" />
                         <ShieldAlert className="h-5 w-5 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white" />
                      </div>
                      <div className="text-center space-y-2">
                        <p className="font-bold text-lg animate-pulse">Running Transformers Inference...</p>
                        <p className="text-xs text-muted-foreground uppercase tracking-widest font-mono">DistilBERT engine v2.0</p>
                      </div>
                    </div>
                  ) : result && (
                    <>
                      <div className={cn("absolute top-0 left-0 w-1.5 h-full", 
                        result.decision === 'BLOCKED' ? "bg-destructive" : 
                        result.decision === 'SAFE' ? "bg-emerald-500" : "bg-amber-500")} 
                      />
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-xl font-bold flex items-center gap-2">
                              Analysis Result
                            </CardTitle>
                            <CardDescription className="text-xs font-mono uppercase">Reference: {result.raw_input.substring(0, 10)}...</CardDescription>
                          </div>
                          <Badge variant="outline" className={cn("px-4 py-1.5 text-sm font-extrabold", getDecisionStyles(result.decision))}>
                            <span className="flex items-center gap-2 uppercase">
                              {getDecisionIcon(result.decision)}
                              {result.decision}
                            </span>
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
                          <Progress 
                            value={result.confidence_score * 100} 
                            className="h-2 bg-secondary/50" 
                            indicatorClassName={cn(
                              result.decision === 'BLOCKED' ? "bg-destructive" : 
                              result.decision === 'SAFE' ? "bg-emerald-500" : "bg-amber-500"
                            )}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4 bg-secondary/20 p-4 rounded-xl border border-border/30">
                          <div className="space-y-1">
                            <Label className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Predicted Class</Label>
                            <p className="font-extrabold text-lg">{result.predicted_class}</p>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">OWASP Category</Label>
                            <p className="font-bold text-xs leading-tight">{result.owasp_category}</p>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <Label className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Decoded & Highlighted Payload</Label>
                          <div className="p-4 bg-black/40 rounded-xl border border-border/50 text-xs font-mono break-all leading-relaxed max-h-[150px] overflow-auto">
                            {result.decoded_input.split('').map((char, i) => {
                              const isHighlighted = result.highlighted_tokens.some(token => 
                                result.decoded_input.substring(i, i + token.length).toLowerCase() === token.toLowerCase()
                              );
                              return <span key={i} className={cn(isHighlighted ? "bg-yellow-500/30 text-yellow-200 border-b border-yellow-500 px-0.5 rounded-sm" : "")}>{char}</span>;
                            })}
                          </div>
                          {result.highlighted_tokens.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {result.highlighted_tokens.map((token, i) => (
                                <Badge key={i} variant="secondary" className="text-[9px] bg-yellow-500/10 text-yellow-500 border-yellow-500/30 uppercase">
                                  {token}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Analyst Explanation</Label>
                          <div className="relative">
                            <div className="absolute top-0 left-0 text-3xl opacity-10 text-destructive font-serif">"</div>
                            <p className="text-sm text-muted-foreground italic leading-relaxed px-4 pt-2">
                              {result.explanation}
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-2 pt-4 border-t border-border/50">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1 text-[10px] font-bold uppercase h-9"
                            onClick={handleCopy}
                          >
                            <Copy className="h-3.5 w-3.5 mr-2" />
                            {copied ? "COPIED!" : "COPY RESULT"}
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className={cn(
                              "flex-1 text-[10px] font-bold uppercase h-9",
                              feedbackSent ? "text-emerald-500" : "text-muted-foreground hover:text-white"
                            )}
                            onClick={handleFeedback}
                            disabled={feedbackSent}
                          >
                            <Flag className="h-3.5 w-3.5 mr-2" />
                            {feedbackSent ? "REPORTED" : "REPORT FALSE POSITIVE"}
                          </Button>
                        </div>

                        <div className="flex justify-between items-center text-[10px] text-muted-foreground font-mono">
                          <span className="flex items-center gap-1.5">
                            <RefreshCw className="h-3 w-3" /> INFERENCE TIME: {result.inference_time_ms}ms
                          </span>
                          <span className="uppercase">DistilBERT-HTTP v2.0</span>
                        </div>
                      </>
                    )}
                </Card>

                {/* What-If Result */}
                {reAnalyzeResult && (
                  <Card className="border-border bg-card shadow-lg relative overflow-hidden animate-in fade-in slide-in-from-right-4 ring-1 ring-white/5">
                    <div className={cn("absolute top-0 left-0 w-1.5 h-full", 
                      reAnalyzeResult.decision === 'BLOCKED' ? "bg-destructive" : 
                      reAnalyzeResult.decision === 'SAFE' ? "bg-emerald-500" : "bg-amber-500")} 
                    />
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-xl font-bold">What-If Result</CardTitle>
                          <CardDescription className="text-xs uppercase font-mono tracking-tighter">Modified Payload Inference</CardDescription>
                        </div>
                        <Badge variant="outline" className={cn("px-4 py-1.5 text-sm font-extrabold", getDecisionStyles(reAnalyzeResult.decision))}>
                          <span className="flex items-center gap-2 uppercase">
                            {getDecisionIcon(reAnalyzeResult.decision)}
                            {reAnalyzeResult.decision}
                          </span>
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm font-bold">
                          <span className="uppercase tracking-tighter text-muted-foreground">Threat Score</span>
                          <span>{Math.round(reAnalyzeResult.confidence_score * 100)}%</span>
                        </div>
                        <Progress 
                          value={reAnalyzeResult.confidence_score * 100} 
                          className="h-2 bg-secondary/50"
                          indicatorClassName={cn(
                            reAnalyzeResult.decision === 'BLOCKED' ? "bg-destructive" : 
                            reAnalyzeResult.decision === 'SAFE' ? "bg-emerald-500" : "bg-amber-500"
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4 bg-secondary/20 p-4 rounded-xl border border-border/30">
                        <div className="space-y-1">
                          <Label className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Predicted Class</Label>
                          <p className="font-extrabold text-lg">{reAnalyzeResult.predicted_class}</p>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">OWASP mapping</Label>
                          <p className="font-bold text-xs leading-tight">{reAnalyzeResult.owasp_category || 'N/A'}</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Inference Insight</Label>
                        <p className="text-sm text-muted-foreground italic leading-relaxed border-l-2 border-border pl-4">
                          "{reAnalyzeResult.explanation}"
                        </p>
                      </div>

                      <div className="pt-4 border-t border-border/50 flex justify-between items-center text-[10px] text-muted-foreground font-mono">
                        <span className="uppercase">Simulated Latency</span>
                        <span>{reAnalyzeResult.inference_time_ms}ms</span>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* What-If Mode Editor */}
              {whatIfEnabled && result && (
                <Card className="border-destructive/30 bg-destructive/5 animate-in slide-in-from-bottom-4 shadow-xl">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <RefreshCw className="h-4 w-4 text-destructive animate-spin-slow" />
                        <Label className="text-sm font-extrabold uppercase tracking-widest text-destructive">What-If Editor: Simulation Layer</Label>
                      </div>
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        className="font-bold text-xs h-8 px-6"
                        onClick={handleReAnalyze}
                        disabled={isReAnalyzing}
                      >
                        {isReAnalyzing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
                        RE-RUN INFERENCE
                      </Button>
                    </div>
                    <Textarea 
                      className="bg-background/80 font-mono text-sm min-h-[120px] border-destructive/20 focus-visible:ring-destructive"
                      value={modifiedPayload}
                      onChange={(e) => setModifiedPayload(e.target.value)}
                      placeholder="Modify the decoded payload here to test detection robustness..."
                    />
                    <p className="text-[10px] text-muted-foreground text-center uppercase tracking-tighter">
                      Modifying payload allows security researchers to test for bypass techniques and verify model edge cases.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <Card className="border-border/50 bg-secondary/10">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Activity className="h-4 w-4 text-destructive" /> Real-time Intel
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 bg-secondary/30 rounded-lg border border-border/50 space-y-1">
                <p className="text-[10px] text-muted-foreground uppercase font-bold">Detection Speed</p>
                <p className="font-mono text-xl font-bold text-accent">7.2ms <span className="text-[10px] font-normal text-muted-foreground">AVG</span></p>
              </div>
              <div className="p-3 bg-secondary/30 rounded-lg border border-border/50 space-y-1">
                <p className="text-[10px] text-muted-foreground uppercase font-bold">Model Precision</p>
                <p className="font-mono text-xl font-bold text-emerald-500">93.8%</p>
              </div>
              <div className="p-3 bg-secondary/30 rounded-lg border border-border/50 space-y-1">
                <p className="text-[10px] text-muted-foreground uppercase font-bold">Active Rulesets</p>
                <p className="font-mono text-xl font-bold">6,402</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-secondary/10 overflow-hidden">
             <div className="h-24 bg-destructive/10 flex items-center justify-center border-b border-border/50">
               <ShieldAlert className="h-12 w-12 text-destructive opacity-50" />
             </div>
             <CardHeader className="pt-4">
               <CardTitle className="text-xs font-bold uppercase tracking-widest">Security Advisory</CardTitle>
             </CardHeader>
             <CardContent>
               <p className="text-[11px] text-muted-foreground leading-relaxed">
                 DistilBERT-HTTP is trained on the CSIC 2010 dataset. While highly accurate against SQLi and XSS, always verify critical blocks manually.
               </p>
               <Button variant="link" className="p-0 h-auto text-[10px] text-destructive uppercase font-bold mt-4">
                 View Latest Threats <ArrowRight className="h-3 w-3 ml-1" />
               </Button>
             </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function ArrowRight(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}
