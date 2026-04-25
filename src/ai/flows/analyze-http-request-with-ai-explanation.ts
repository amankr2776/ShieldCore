'use server';

/**
 * @fileOverview This file implements a Genkit flow for analyzing HTTP requests and payloads
 * to detect security threats. It decodes the input, classifies it using mock logic,
 * and then generates a human-readable explanation using an LLM.
 *
 * - analyzeHttpRequest - A function that handles the HTTP request analysis process.
 * - AnalyzeHttpRequestInput - The input type for the analyzeHttpRequest function.
 * - AnalyzeHttpRequestOutput - The return type for the analyzeHttpRequest function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { Buffer } from 'buffer'; // Explicit import for Buffer

// --- Input and Output Schemas ---

const AnalyzeHttpRequestInputSchema = z.object({
    payload: z.string().describe('The raw HTTP request or payload to analyze.'),
});
export type AnalyzeHttpRequestInput = z.infer<typeof AnalyzeHttpRequestInputSchema>;

const AnalyzeHttpRequestOutputSchema = z.object({
    raw_input: z.string().describe('The original raw input payload.'),
    decoded_input: z.string().describe('The decoded payload after URL, Base64, and Unicode normalization.'),
    predicted_class: z.string().describe('The predicted class of the threat (e.g., "SQL Injection", "XSS", "Safe").'),
    confidence_score: z.number().describe('The confidence score of the prediction, between 0 and 1.'),
    decision: z.enum(['BLOCKED', 'SAFE', 'SUSPICIOUS']).describe('The security decision based on the threat score.'),
    owasp_category: z.string().describe('The associated OWASP Top 10 category.'),
    explanation: z.string().describe('A detailed, human-readable explanation of the detected threat.'),
    highlighted_tokens: z.array(z.string()).describe('Specific tokens in the decoded payload that triggered the detection.'),
    inference_time_ms: z.number().describe('The time taken for the analysis in milliseconds.'),
});
export type AnalyzeHttpRequestOutput = z.infer<typeof AnalyzeHttpRequestOutputSchema>;


// --- Helper Functions (Decode and Mock Classification) ---

/**
 * Decodes the raw input by applying URL decode, optional Base64 decode, and Unicode normalization.
 * @param rawInput The raw HTTP request or payload string.
 * @returns The decoded and normalized string.
 */
function decodeInput(rawInput: string): string {
    let currentInput = rawInput;
    let urlDecodedOnce = rawInput;

    // 1. URL decode the original input
    try {
        urlDecodedOnce = decodeURIComponent(currentInput.replace(/\+/g, ' '));
        currentInput = urlDecodedOnce; // Update currentInput if successful
    } catch (e) {
        console.warn('Initial URL decode failed, proceeding with raw input for next steps:', rawInput, e);
        // currentInput remains rawInput if URL decode fails
    }

    // 2. Attempt Base64 decode on currentInput (which might be urlDecodedOnce or rawInput)
    // Simple heuristic for Base64: check common characters and length multiple of 4
    const isLikelyBase64 = /^[A-Za-z0-9+/=]*$/.test(currentInput) && (currentInput.length % 4 === 0);
    if (isLikelyBase64) {
        try {
            const base64Decoded = Buffer.from(currentInput, 'base64').toString('utf8');
            // If valid Base64, decode it, then run URL decode again on result
            try {
                const urlDecodedAfterBase64 = decodeURIComponent(base64Decoded.replace(/\+/g, ' '));
                currentInput = urlDecodedAfterBase64;
            } catch (e) {
                console.warn('URL decode after Base64 failed, using Base64 decoded only:', e);
                currentInput = base64Decoded; // Use base64 decoded result directly
            }
        } catch (e) {
            console.warn('Base64 decode failed, proceeding with previous URL decoded (or raw) content:', e);
            // currentInput remains its value from prior step
        }
    }

    // 3. Unicode normalization (NFKC)
    return currentInput.normalize('NFKC');
}

/**
 * Mocks the classification pipeline to identify potential threats.
 * @param decodedInput The decoded and normalized input string.
 * @returns A MockClassificationResult object containing predicted class, score, decision, OWASP category, explanation seed, and highlighted tokens.
 */
interface MockClassificationResult {
    predicted_class: string;
    confidence_score: number;
    decision: 'BLOCKED' | 'SAFE' | 'SUSPICIOUS';
    owasp_category: string;
    explanation_seed: string; // Used as a base for LLM explanation
    highlighted_tokens: string[];
}

function mockClassify(decodedInput: string): MockClassificationResult {
    const lowerInput = decodedInput.toLowerCase();
    const result: MockClassificationResult = {
        predicted_class: 'Safe',
        confidence_score: parseFloat((Math.random() * 0.11 + 0.01).toFixed(2)), // 0.01–0.12
        decision: 'SAFE',
        owasp_category: 'None',
        explanation_seed: 'The request appears to be safe and does not contain any known attack patterns.',
        highlighted_tokens: [],
    };

    const rules = [
        {
            // SQL Injection
            patterns: ['select', 'union', "or '1'='1", '--', 'drop', 'insert', 'update'],
            class: 'SQL Injection',
            owasp: 'A03:2021 — Injection',
            score: () => parseFloat((Math.random() * 0.07 + 0.91).toFixed(2)), // 0.91–0.98
            explanation: 'Boolean-based blind SQL injection detected in query parameter. Attacker attempting to bypass authentication using OR logic. Common techniques include `OR 1=1` for authentication bypass and `UNION SELECT` for data exfiltration.',
        },
        {
            // XSS
            patterns: ['<script', 'alert(', 'onerror=', 'document.cookie', 'javascript:'],
            class: 'XSS',
            owasp: 'A03:2021 — Injection',
            score: () => parseFloat((Math.random() * 0.06 + 0.89).toFixed(2)), // 0.89–0.95
            explanation: 'Cross-Site Scripting (XSS) payload detected. An attacker might be trying to inject malicious client-side scripts to steal session cookies or deface the website. Payloads often include `<script>` tags or `javascript:` URIs.',
        },
        {
            // Path Traversal
            patterns: ['../', '/etc/passwd', '/etc/shadow', '..\\'], // '\\' for literal backslash
            class: 'Path Traversal',
            owasp: 'A05:2021 — Security Misconfiguration',
            score: () => parseFloat((Math.random() * 0.06 + 0.88).toFixed(2)), // 0.88–0.94
            explanation: 'Path Traversal attempt detected. An attacker may be trying to access files and directories stored outside the web root folder by manipulating file paths, often using `../` or similar sequences.',
        },
        {
            // Command Injection
            patterns: ['; ls', '&& cat', '| whoami', 'id', '$(cmd)'],
            class: 'Command Injection',
            owasp: 'A03:2021 — Injection',
            score: () => parseFloat((Math.random() * 0.06 + 0.90).toFixed(2)), // 0.90–0.96
            explanation: 'Command Injection attempt detected. An attacker might be trying to execute arbitrary commands on the host operating system. Common delimiters like `;`, `&&`, `|` are often used to chain commands.',
        },
        {
            // Buffer Overflow
            patterns: ['%90%90%90'], // Specific NOP sled pattern. Regex will handle A{20,} part.
            class: 'Buffer Overflow',
            owasp: 'A03:2021 — Injection', // For injection-like overflows
            score: () => parseFloat((Math.random() * 0.07 + 0.85).toFixed(2)), // 0.85–0.92
            explanation: 'Buffer Overflow pattern detected. An abnormally long sequence of repeated characters (e.g., `AAAA...`) or specific byte sequences (like NOP sleds) suggests an attempt to overwrite memory regions.',
            regex: new RegExp(`(A{20,}|%90%90%90)`, 'gi') // AAAAAAA (20+ repeated chars) or NOP sled
        },
        {
            // SSRF
            patterns: ['http://internal', '169.254.', 'localhost:', 'file://'],
            class: 'SSRF',
            owasp: 'A10:2021 — Server-Side Request Forgery (SSRF)',
            score: () => parseFloat((Math.random() * 0.06 + 0.87).toFixed(2)), // 0.87–0.93
            explanation: 'Server-Side Request Forgery (SSRF) attempt detected. An attacker is trying to make the server request an internal resource, potentially accessing sensitive data or internal services. Common targets include internal IP ranges or file system access.',
        },
    ];

    for (const rule of rules) {
        let matched = false;
        let tokens: string[] = [];

        // Check for regex patterns if provided (e.g., for Buffer Overflow with variable length)
        if (rule.regex) {
            const matches = Array.from(lowerInput.matchAll(rule.regex));
            if (matches.length > 0) {
                matched = true;
                matches.forEach(match => {
                    if (match[0]) tokens.push(match[0]);
                });
            }
        } 
        // Check for literal string patterns if no regex or if regex didn't match
        for (const pattern of rule.patterns) {
            if (lowerInput.includes(pattern.toLowerCase())) {
                matched = true;
                tokens.push(pattern);
            }
        }
        
        if (matched) {
            result.predicted_class = rule.class;
            result.confidence_score = rule.score();
            result.owasp_category = rule.owasp;
            result.explanation_seed = rule.explanation;
            result.highlighted_tokens = Array.from(new Set(tokens)); // Ensure unique tokens
            break; // First rule that matches wins
        }
    }

    // Determine decision based on score
    if (result.confidence_score >= 0.85) {
        result.decision = 'BLOCKED';
    } else if (result.confidence_score >= 0.50) {
        result.decision = 'SUSPICIOUS';
    } else {
        result.decision = 'SAFE';
    }

    return result;
}


// --- Genkit Prompt for Explanation Generation ---

const generateWafExplanationPrompt = ai.definePrompt({
    name: 'generateWafExplanationPrompt',
    input: {
        schema: z.object({
            predicted_class: z.string().describe('The predicted class of the threat (e.g., "SQL Injection").'),
            decoded_input: z.string().describe('The decoded payload that was analyzed.'),
            owasp_category_raw: z.string().describe('The raw OWASP category identified by the system.'),
            highlighted_tokens: z.array(z.string()).describe('The specific tokens in the decoded payload that were highlighted as suspicious.'),
            explanation_seed: z.string().describe('An initial, concise explanation based on the classification.'),
        }),
    },
    output: {
        schema: z.object({
            explanation: z.string().describe('A detailed, human-readable explanation of the detected threat.'),
            owasp_category: z.string().describe('The refined OWASP Top 10 category associated with the threat.'),
        }),
    },
    prompt: `You are an expert cybersecurity analyst for a Web Application Firewall (WAF).
Your task is to provide a detailed, human-readable explanation of a detected security threat,
and confirm/refine its OWASP Top 10 category.

Use the provided classification results, decoded input, and highlighted tokens to craft your explanation.
Explain *what* the attack is, *how* it was detected, and *why* it's a threat.
Ensure the explanation is professional, clear, and comprehensive for a security analyst.
Confirm the OWASP category, making sure it's accurate for the described threat.

---
Predicted Threat Class: {{{predicted_class}}}
Decoded Input Analyzed: {{{decoded_input}}}
Initial OWASP Category: {{{owasp_category_raw}}}
Highlighted Suspicious Tokens: {{#each highlighted_tokens}}- "{{this}}"
{{/each}}
Initial Explanation Summary: {{{explanation_seed}}}
---

Based on the above information, provide the detailed explanation and the confirmed OWASP category. Format your response strictly as JSON with 'explanation' and 'owasp_category' fields.`,
});


// --- Genkit Flow Definition ---

const analyzeHttpRequestFlow = ai.defineFlow(
    {
        name: 'analyzeHttpRequestFlow',
        inputSchema: AnalyzeHttpRequestInputSchema,
        outputSchema: AnalyzeHttpRequestOutputSchema,
    },
    async (input) => {
        const startTime = process.hrtime.bigint(); // Start high-resolution timer

        const rawInput = input.payload;
        const decodedInput = decodeInput(rawInput);
        const mockClassificationResult = mockClassify(decodedInput);

        const promptInput = {
            predicted_class: mockClassificationResult.predicted_class,
            decoded_input: decodedInput,
            owasp_category_raw: mockClassificationResult.owasp_category,
            highlighted_tokens: mockClassificationResult.highlighted_tokens,
            explanation_seed: mockClassificationResult.explanation_seed,
        };

        const { output: llmOutput } = await generateWafExplanationPrompt(promptInput);

        const endTime = process.hrtime.bigint(); // End high-resolution timer
        const inferenceTimeMs = Number(endTime - startTime) / 1_000_000; // Convert nanoseconds to milliseconds

        return {
            raw_input: rawInput,
            decoded_input: decodedInput,
            predicted_class: mockClassificationResult.predicted_class,
            confidence_score: mockClassificationResult.confidence_score,
            decision: mockClassificationResult.decision,
            owasp_category: llmOutput!.owasp_category, // Use LLM's refined OWASP category
            explanation: llmOutput!.explanation,
            highlighted_tokens: mockClassificationResult.highlighted_tokens, // Use mock's generated tokens
            inference_time_ms: parseFloat(inferenceTimeMs.toFixed(2)),
        };
    }
);

// --- Exported Wrapper Function ---

/**
 * Analyzes an HTTP request or payload to detect security threats.
 * It decodes the input, classifies it using mock logic, and then generates
 * a detailed, human-readable explanation using an LLM. 
 * @param input The raw HTTP request or payload to analyze.
 * @returns A detailed analysis including predicted class, threat score, decision, explanation, and highlighted tokens.
 */
export async function analyzeHttpRequest(input: AnalyzeHttpRequestInput): Promise<AnalyzeHttpRequestOutput> {
    return analyzeHttpRequestFlow(input);
}
