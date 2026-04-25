
'use server';

/**
 * @fileOverview FusionX WAF Semantic Analysis Engine.
 * 
 * This flow simulates the DistilBERT-HTTP fine-tuned model logic, 
 * incorporating multi-stage decoding and OWASP mapping.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const OWASP_MAPPING: Record<string, string> = {
  "SQL Injection": "A03:2021 — Injection",
  "XSS": "A03:2021 — Injection",
  "Path Traversal": "A01:2021 — Broken Access Control",
  "Command Injection": "A03:2021 — Injection",
  "Buffer Overflow": "A04:2021 — Next-Gen Risk",
  "SSRF": "A10:2021 — Server-Side Request Forgery",
  "Safe": "None"
};

const AnalyzeInputSchema = z.object({
  payload: z.string().describe('The raw HTTP request or payload to analyze.'),
});

const AnalyzeOutputSchema = z.object({
  raw_input: z.string(),
  decoded_input: z.string(),
  predicted_class: z.string(),
  confidence_score: z.number(),
  decision: z.enum(['BLOCKED', 'SAFE', 'SUSPICIOUS']),
  owasp_category: z.string(),
  explanation: z.string(),
  highlighted_tokens: z.array(z.string()),
  inference_time_ms: z.number(),
});

export type AnalyzeInput = z.infer<typeof AnalyzeInputSchema>;
export type AnalyzeOutput = z.infer<typeof AnalyzeOutputSchema>;

function recursiveDecode(text: string, depth = 0): string {
  if (depth >= 3) return text;
  
  let decoded = text;
  
  // 1. URL Decode
  try {
    decoded = decodeURIComponent(decoded.replace(/\+/g, ' '));
  } catch (e) {}

  // 2. Base64 Check & Decode
  const isB64 = /^[A-Za-z0-9+/=]*$/.test(decoded) && (decoded.length % 4 === 0);
  if (isB64 && decoded.length > 8) {
    try {
      const b64 = Buffer.from(decoded, 'base64').toString('utf8');
      if (b64.length > 0) decoded = b64;
    } catch (e) {}
  }

  // 3. Unicode Normalize
  decoded = decoded.normalize('NFKC');

  if (decoded !== text) {
    return recursiveDecode(decoded, depth + 1);
  }
  return decoded;
}

const analyzePrompt = ai.definePrompt({
  name: 'analyzeWafPrompt',
  input: { schema: AnalyzeInputSchema },
  output: { schema: AnalyzeOutputSchema },
  system: `You are the FusionX WAF DistilBERT-HTTP Inference Engine.
Your task is to analyze a decoded HTTP payload and classify it as SAFE, BLOCKED, or SUSPICIOUS.
You must adhere to the CSIC 2010 dataset patterns.

Classification Rules:
- SQL Injection: SELECT, UNION, OR '1'='1', '--', DROP, INSERT.
- XSS: <script, alert(, onerror=, document.cookie.
- Path Traversal: ../, /etc/passwd, /etc/shadow, ..\\.
- Command Injection: ; ls, && cat, | whoami, $(cmd).
- Buffer Overflow: AAAAAAA (20+ repeated), %90%90.
- SSRF: http://internal, 169.254., localhost:, file://.

Return the classification, confidence score (0-1), a concise explanation, and the specific tokens that triggered the detection.`,
  prompt: `Analyze this decoded payload for security threats:
---
{{{payload}}}
---`,
});

export async function analyzeHttpRequest(input: AnalyzeInput): Promise<AnalyzeOutput> {
  const start = Date.now();
  const decoded = recursiveDecode(input.payload);
  
  const { output } = await analyzePrompt({ payload: decoded });
  
  if (!output) throw new Error("Analysis failed");
  
  const inference_time_ms = Date.now() - start;
  
  return {
    ...output,
    raw_input: input.payload,
    decoded_input: decoded,
    owasp_category: OWASP_MAPPING[output.predicted_class] || "None",
    inference_time_ms,
  };
}
