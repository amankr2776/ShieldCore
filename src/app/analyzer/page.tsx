"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle2, ShieldAlert, Loader2, RefreshCw } from 'lucide-react';
import { analyzeHttpRequest, AnalyzeHttpRequestOutput } from '@/ai/flows/analyze-http-request-with-ai-explanation';
import { reanalyzeModifiedPayloadInWhatIfMode, ReanalyzeModifiedPayloadInWhatIfModeOutput } from '@/ai/flows/reanalyze-modified-payload-in-what-if-mode';
import { cn } from '@/lib/utils';

export default function AnalyzerPage() {
  const [payload, setPayload] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalyzeHttpRequestOutput | null>(null);
  const [whatIfEnabled, setWhatIfEnabled] = useState(false);
  const [modifiedPayload, setModifiedPayload] = useState('');
  const [reAnalyzeResult, setReAnalyzeResult] = useState<ReanalyzeModifiedPayloadInWhatIfModeOutput | null>(null);
  const [isReAnalyzing, setIsReAnalyzing] = useState(false);

  async function handleAnalyze() {
    if (!payload.trim()) return;
    setIsAnalyzing(true);
    setReAnalyzeResult(null);
    try {
      const res = await analyzeHttpRequest({ payload });
      setResult(res);
      setModifiedPayload(res.decoded_input);
    } catch (error) {
      console.error(error);
    } finally {
      setIsAnalyzing(false);
    }
  }

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
        <h1 className="text-3xl font-bold tracking-tight">Attack Analyzer</h1>
        <p className="text-muted-foreground">Paste HTTP payloads to analyze potential security threats using FusionX AI engine.</p>
      </div>

      <Card className="border-accent/20 bg-card shadow-xl overflow-hidden">
        <CardContent className="p-6 space-y-6">
          <div className="space-y-4">
            <Label htmlFor="payload" className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Paste HTTP Request or Payload
            </Label>
            <Textarea
              id="payload"
              placeholder="GET /admin/login?id=1' OR '1'='1' HTTP/1.1..."
              className="min-h-[200px] font-mono text-sm bg-background border-border focus-visible:ring-accent"
              value={payload}
              onChange={(e) => setPayload(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Switch
                id="what-if"
                checked={whatIfEnabled}
                onCheckedChange={setWhatIfEnabled}
              />
              <Label htmlFor="what-if" className="cursor-pointer text-sm font-medium">What-If Mode</Label>
            </div>
            <Button 
              size="lg" 
              className="w-full sm:w-48 bg-destructive hover:bg-destructive/90 text-white font-bold"
              onClick={handleAnalyze}
              disabled={isAnalyzing}
            >
              {isAnalyzing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ShieldAlert className="h-4 w-4 mr-2" />}
              ANALYZE
            </Button>
          </div>
        </CardContent>
      </Card>

      {(result || isAnalyzing) && (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
          <div className={cn("grid gap-6", reAnalyzeResult ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1")}>
            {/* Original Analysis Result */}
            <Card className="border-border bg-card shadow-lg relative overflow-hidden">
              <div className={cn("absolute top-0 left-0 w-1 h-full", 
                result?.decision === 'BLOCKED' ? "bg-destructive" : 
                result?.decision === 'SAFE' ? "bg-emerald-500" : "bg-amber-500")} 
              />
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">Analysis Result</CardTitle>
                    <CardDescription>Original Request Classification</CardDescription>
                  </div>
                  {result && (
                    <Badge variant="outline" className={cn("px-4 py-1 text-sm font-bold", getDecisionStyles(result.decision))}>
                      <span className="flex items-center gap-2">
                        {getDecisionIcon(result.decision)}
                        {result.decision}
                      </span>
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {result ? (
                  <>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm font-medium">
                        <span>Threat Confidence Score</span>
                        <span>{Math.round(result.confidence_score * 100)}%</span>
                      </div>
                      <Progress 
                        value={result.confidence_score * 100} 
                        className="h-2" 
                        indicatorClassName={cn(
                          result.decision === 'BLOCKED' ? "bg-destructive" : 
                          result.decision === 'SAFE' ? "bg-emerald-500" : "bg-amber-500"
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground uppercase">Predicted Class</Label>
                        <p className="font-bold">{result.predicted_class}</p>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground uppercase">OWASP Category</Label>
                        <p className="font-bold text-sm">{result.owasp_category}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground uppercase">Decoded Payload</Label>
                      <div className="p-3 bg-background rounded border text-xs font-mono break-all leading-relaxed">
                        {result.decoded_input.split('').map((char, i) => {
                          const isHighlighted = result.highlighted_tokens.some(token => 
                            result.decoded_input.substring(i, i + token.length).toLowerCase() === token.toLowerCase()
                          );
                          return <span key={i} className={isHighlighted ? "bg-yellow-500/30 border-b border-yellow-500" : ""}>{char}</span>;
                        })}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground uppercase">AI Explanation</Label>
                      <p className="text-sm text-muted-foreground italic leading-relaxed">"{result.explanation}"</p>
                    </div>

                    <div className="pt-4 border-t flex justify-between items-center text-xs text-muted-foreground">
                      <span>Inference Time</span>
                      <span className="font-mono">{result.inference_time_ms}ms</span>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 space-y-4">
                    <Loader2 className="h-8 w-8 animate-spin text-accent" />
                    <p className="text-sm text-muted-foreground">Processing with DistilBERT engine...</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Re-analysis / What-If Result */}
            {reAnalyzeResult && (
              <Card className="border-border bg-card shadow-lg relative overflow-hidden animate-in fade-in slide-in-from-right-4">
                 <div className={cn("absolute top-0 left-0 w-1 h-full", 
                  reAnalyzeResult.decision === 'BLOCKED' ? "bg-destructive" : 
                  reAnalyzeResult.decision === 'SAFE' ? "bg-emerald-500" : "bg-amber-500")} 
                />
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">What-If Result</CardTitle>
                      <CardDescription>Modified Payload Classification</CardDescription>
                    </div>
                    <Badge variant="outline" className={cn("px-4 py-1 text-sm font-bold", getDecisionStyles(reAnalyzeResult.decision))}>
                      <span className="flex items-center gap-2">
                        {getDecisionIcon(reAnalyzeResult.decision)}
                        {reAnalyzeResult.decision}
                      </span>
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm font-medium">
                      <span>Threat Confidence Score</span>
                      <span>{Math.round(reAnalyzeResult.confidence_score * 100)}%</span>
                    </div>
                    <Progress 
                      value={reAnalyzeResult.confidence_score * 100} 
                      className="h-2"
                      indicatorClassName={cn(
                        reAnalyzeResult.decision === 'BLOCKED' ? "bg-destructive" : 
                        reAnalyzeResult.decision === 'SAFE' ? "bg-emerald-500" : "bg-amber-500"
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground uppercase">Predicted Class</Label>
                      <p className="font-bold">{reAnalyzeResult.predicted_class}</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground uppercase">OWASP Category</Label>
                      <p className="font-bold text-sm">{reAnalyzeResult.owasp_category || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground uppercase">AI Explanation</Label>
                    <p className="text-sm text-muted-foreground italic leading-relaxed">"{reAnalyzeResult.explanation}"</p>
                  </div>

                  <div className="pt-4 border-t flex justify-between items-center text-xs text-muted-foreground">
                    <span>Simulated Inference Time</span>
                    <span className="font-mono">{reAnalyzeResult.inference_time_ms}ms</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* What-If Mode Editor */}
          {whatIfEnabled && result && (
            <Card className="border-accent/40 bg-accent/5 animate-in slide-in-from-bottom-4">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold uppercase tracking-wider text-accent">What-If Editor: Modify Decoded Payload</Label>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="border-accent text-accent hover:bg-accent/10"
                    onClick={handleReAnalyze}
                    disabled={isReAnalyzing}
                  >
                    {isReAnalyzing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
                    RE-ANALYZE
                  </Button>
                </div>
                <Textarea 
                  className="bg-background font-mono text-sm min-h-[100px]"
                  value={modifiedPayload}
                  onChange={(e) => setModifiedPayload(e.target.value)}
                />
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}