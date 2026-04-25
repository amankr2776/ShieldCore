'use server';
/**
 * @fileOverview A Genkit flow for re-analyzing a modified payload in "What-If Mode".
 *
 * - reanalyzeModifiedPayloadInWhatIfMode - A function that re-analyzes a modified payload
 *   based on mock WAF classification rules.
 * - ReanalyzeModifiedPayloadInWhatIfModeInput - The input type for the reanalyzeModifiedPayloadInWhatIfMode function.
 * - ReanalyzeModifiedPayloadInWhatIfModeOutput - The return type for the reanalyzeModifiedPayloadInWhatIfMode function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ReanalyzeModifiedPayloadInWhatIfModeInputSchema = z.object({
  modifiedPayload: z.string().describe('The modified decoded payload string to re-analyze.'),
});
export type ReanalyzeModifiedPayloadInWhatIfModeInput = z.infer<typeof ReanalyzeModifiedPayloadInWhatIfModeInputSchema>;

const ReanalyzeModifiedPayloadInWhatIfModeOutputSchema = z.object({
  predicted_class: z.string().describe('The classified threat type (e.g., "SQL Injection", "XSS", "Safe").'),
  confidence_score: z.number().min(0).max(1).describe('The confidence score of the classification, a value between 0 and 1.'),
  decision: z.enum(['BLOCKED', 'SAFE', 'SUSPICIOUS']).describe('The WAF decision based on the threat score. BLOCKED if score > 0.85, SUSPICIOUS if score 0.50-0.85, SAFE if score < 0.50.'),
  owasp_category: z.string().optional().describe('The relevant OWASP Top 10 2021 category, if applicable (e.g., "A03:2021 - Injection").'),
  explanation: z.string().describe('A human-readable explanation of the detection or why it is considered safe.'),
  highlighted_tokens: z.array(z.string()).describe('An array of specific tokens or patterns in the payload that triggered the detection.'),
  inference_time_ms: z.number().int().min(1).max(100).describe('The simulated inference time in milliseconds (e.g., 7).'),
});
export type ReanalyzeModifiedPayloadInWhatIfModeOutput = z.infer<typeof ReanalyzeModifiedPayloadInWhatIfModeOutputSchema>;

const WAF_CLASSIFICATION_RULES = `
Here are the classification rules you must follow:

- If the payload contains any of: 'SELECT', 'UNION', 'OR '1'='1', '--', 'DROP', 'INSERT', 'UPDATE' (case-insensitive search), classify as SQL Injection.
  - Confidence Score: Generate a random float between 0.91 and 0.98.
  - Decision: BLOCKED.
  - OWASP Category: A03:2021 — Injection.
  - Highlight relevant SQL keywords found in the payload (e.g., "SELECT", "OR '1'='1'").

- If the payload contains any of: '<script', 'alert(', 'onerror=', 'document.cookie', 'javascript:' (case-insensitive search), classify as XSS.
  - Confidence Score: Generate a random float between 0.89 and 0.95.
  - Decision: BLOCKED.
  - OWASP Category: A03:2021 — Injection.
  - Highlight relevant XSS keywords found in the payload (e.g., "<script", "alert(").

- If the payload contains any of: '../', '/etc/passwd', '/etc/shadow', '..\\' (case-insensitive search), classify as Path Traversal.
  - Confidence Score: Generate a random float between 0.88 and 0.94.
  - Decision: BLOCKED.
  - OWASP Category: A05:2021 — Security Misconfiguration.
  - Highlight relevant path traversal patterns found in the payload (e.g., "../", "/etc/passwd").

- If the payload contains any of: '; ls', '&& cat', '| whoami', 'id', '$(cmd)' (case-insensitive search), classify as Command Injection.
  - Confidence Score: Generate a random float between 0.90 and 0.96.
  - Decision: BLOCKED.
  - OWASP Category: A03:2021 — Injection.
  - Highlight relevant command injection patterns found in the payload (e.g., "; ls", "whoami").

- If the payload contains: 'AAAAAAA' (20 or more repeated 'A' characters) or '%90%90%90' (case-insensitive search), classify as Buffer Overflow.
  - Confidence Score: Generate a random float between 0.85 and 0.92.
  - Decision: BLOCKED.
  - OWASP Category: A03:2021 — Injection.
  - Highlight the repeated characters (e.g., "AAAAAAAAAAAAAAAAAAAA") or hex patterns (e.g., "%90%90%90").

- If the payload contains any of: 'http://internal', '169.254.', 'localhost:', 'file://' (case-insensitive search), classify as SSRF.
  - Confidence Score: Generate a random float between 0.87 and 0.93.
  - Decision: BLOCKED.
  - OWASP Category: A10:2021 — Server-Side Request Forgery.
  - Highlight relevant SSRF indicators found in the payload (e.g., "http://internal", "169.254.").

- If none of the above patterns are found, classify as Safe.
  - Confidence Score: Generate a random float between 0.01 and 0.12.
  - Decision: SAFE.
  - OWASP Category: None.
  - Highlighted tokens: An empty array [].

General Decision Rules based on final Confidence Score:
- Scores above 0.85: Decision is BLOCKED.
- Scores 0.50-0.85: Decision is SUSPICIOUS.
- Scores below 0.50: Decision is SAFE.
Note: Given the specific attack score ranges, most detected attacks will result in BLOCKED. The SUSPICIOUS category might be less frequently used unless the model interprets a partial match or generates a score within that range.

Inference Time: Generate a random integer between 5 and 15 milliseconds.
`;

const reanalyzePrompt = ai.definePrompt({
  name: 'reanalyzeModifiedPayloadPrompt',
  input: { schema: ReanalyzeModifiedPayloadInWhatIfModeInputSchema },
  output: { schema: ReanalyzeModifiedPayloadInWhatIfModeOutputSchema },
  system: `You are an AI-powered Web Application Firewall (WAF) engine for ShieldCore WAF. Your task is to analyze a given HTTP payload string based on a set of predefined classification rules and output a JSON object containing the classification results.
Strictly adhere to the provided rules for classification, confidence scores, decisions, OWASP categories, and highlighted tokens. Generate a concise, accurate, and human-readable explanation that justifies the classification based on the detected patterns.
The confidence score should be a float within the specified range for the detected class. The inference time should be a realistic integer within the specified range.

${WAF_CLASSIFICATION_RULES}

Ensure your output is a valid JSON object matching the ReanalyzeModifiedPayloadInWhatIfModeOutputSchema.
`,
  prompt: `Analyze the following modified payload and return the classification results:

Modified Payload: {{{modifiedPayload}}}
`,
});

const reanalyzeModifiedPayloadInWhatIfModeFlow = ai.defineFlow(
  {
    name: 'reanalyzeModifiedPayloadInWhatIfModeFlow',
    inputSchema: ReanalyzeModifiedPayloadInWhatIfModeInputSchema,
    outputSchema: ReanalyzeModifiedPayloadInWhatIfModeOutputSchema,
  },
  async (input) => {
    const { output } = await reanalyzePrompt(input);
    if (!output) {
      throw new Error('Failed to get output from prompt.');
    }
    return output;
  }
);

export async function reanalyzeModifiedPayloadInWhatIfMode(
  input: ReanalyzeModifiedPayloadInWhatIfModeInput
): Promise<ReanalyzeModifiedPayloadInWhatIfModeOutput> {
  return reanalyzeModifiedPayloadInWhatIfModeFlow(input);
}
