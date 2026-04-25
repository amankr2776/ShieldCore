
'use server';

/**
 * @fileOverview FusionX WAF Ingress Analysis Engine
 * Integrates with Groq API for sub-10ms LPU inference using Llama 3 8B.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || '' });

const AnalyzeInputSchema = z.object({
  payload: z.string().describe('The raw HTTP request or payload to analyze.'),
});

const AnalyzeOutputSchema = z.object({
  predicted_class: z.string(),
  confidence_score: z.number(),
  decision: z.enum(['BLOCKED', 'SAFE', 'SUSPICIOUS']),
  owasp_category: z.string(),
  explanation: z.string(),
  highlighted_tokens: z.array(z.string()),
  token_scores: z.array(z.object({
    token: z.string(),
    score: z.number()
  })),
  decode_steps: z.array(z.object({
    step_name: z.string(),
    output: z.string()
  })),
  inference_time_ms: z.number(),
  raw_input: z.string().optional(),
  decoded_input: z.string().optional()
});

export type AnalyzeInput = z.infer<typeof AnalyzeInputSchema>;
export type AnalyzeOutput = z.infer<typeof AnalyzeOutputSchema>;

/**
 * Recursive decoder to simulate the WAF de-obfuscation pipeline
 */
function recursiveDecode(text: string, steps: any[] = [], depth = 0): { decoded: string, steps: any[] } {
  if (depth === 0) steps.push({ step_name: 'Raw Input', output: text });
  if (depth >= 3) return { decoded: text, steps };
  
  let current = text;
  
  // 1. URL Decode
  try {
    const next = decodeURIComponent(current.replace(/\+/g, ' '));
    if (next !== current) {
      current = next;
      steps.push({ step_name: 'URL Decode', output: current });
    }
  } catch (e) {}

  // 2. Base64 Check & Decode
  const isB64 = /^[A-Za-z0-9+/=]*$/.test(current) && (current.length % 4 === 0) && current.length > 8;
  if (isB64) {
    try {
      const b64 = Buffer.from(current, 'base64').toString('utf8');
      if (b64.length > 0 && b64 !== current) {
        current = b64;
        steps.push({ step_name: 'Base64 Decode', output: current });
      }
    } catch (e) {}
  }

  // 3. Unicode Normalize
  const normalized = current.normalize('NFKC');
  if (normalized !== current) {
    current = normalized;
    steps.push({ step_name: 'Unicode Normalization', output: current });
  }

  if (current !== text) {
    return recursiveDecode(current, steps, depth + 1);
  }
  return { decoded: current, steps };
}

/**
 * Fallback classification logic if Groq API is unavailable
 */
function ruleBasedFallback(decoded: string, steps: any[]): AnalyzeOutput {
  const lower = decoded.toLowerCase();
  let predictedClass = 'Safe';
  let score = Math.random() * 0.1;
  let tokens: string[] = [];

  if (lower.includes('select') || lower.includes('union') || lower.includes("' or '1'='1")) {
    predictedClass = 'SQL Injection';
    score = 0.92;
    tokens = ['select', 'union'];
  } else if (lower.includes('<script') || lower.includes('alert(')) {
    predictedClass = 'XSS';
    score = 0.95;
    tokens = ['<script>', 'alert('];
  } else if (lower.includes('../') || lower.includes('/etc/passwd')) {
    predictedClass = 'Path Traversal';
    score = 0.89;
    tokens = ['../', '/etc/passwd'];
  }

  const decision = score > 0.85 ? 'BLOCKED' : score > 0.50 ? 'SUSPICIOUS' : 'SAFE';
  
  return {
    predicted_class: predictedClass,
    confidence_score: score,
    decision,
    owasp_category: predictedClass === 'Safe' ? 'Safe' : 'A03:2021',
    explanation: `Rule-based fallback: Detected suspicious patterns matching ${predictedClass} signatures.`,
    highlighted_tokens: tokens,
    token_scores: tokens.map(t => ({ token: t, score: 0.98 })),
    decode_steps: [...steps, { step_name: 'Final Classification', output: predictedClass }],
    inference_time_ms: 2,
    decoded_input: decoded
  };
}

export async function analyzeHttpRequest(input: AnalyzeInput): Promise<AnalyzeOutput> {
  const start = Date.now();
  const { decoded, steps } = recursiveDecode(input.payload);
  
  if (!process.env.GROQ_API_KEY) {
    console.warn("GROQ_API_KEY missing - using rule-based fallback");
    return ruleBasedFallback(decoded, steps);
  }

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `You are a Web Application Firewall classifier. Analyze the HTTP payload and return ONLY a JSON object with no extra text, no markdown, no explanation outside the JSON.

Return exactly this structure:
{
  "predicted_class": "SQL Injection" or "XSS" or "Path Traversal" or "Command Injection" or "Buffer Overflow" or "SSRF" or "Safe",
  "confidence_score": float between 0.0 and 1.0,
  "decision": "BLOCKED" or "SUSPICIOUS" or "SAFE",
  "owasp_category": "A03:2021" or "A01:2021" or "A04:2021" or "A10:2021" or "Safe",
  "explanation": "one sentence human readable explanation",
  "highlighted_tokens": ["token1", "token2"],
  "token_scores": [{"token": "token1", "score": 0.95}]
}`
        },
        {
          role: 'user',
          content: `Payload: ${decoded}`
        }
      ],
      model: 'llama3-8b-8192',
      response_format: { type: 'json_object' }
    });

    const result = JSON.parse(chatCompletion.choices[0]?.message?.content || '{}');
    const inference_time_ms = Date.now() - start;

    return {
      ...result,
      decode_steps: [...steps, { step_name: 'Final Classification', output: result.predicted_class }],
      inference_time_ms,
      raw_input: input.payload,
      decoded_input: decoded
    };
  } catch (error) {
    console.error("Groq Inference Error:", error);
    return ruleBasedFallback(decoded, steps);
  }
}
