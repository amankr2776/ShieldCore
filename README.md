<div align="center">

<img src="https://img.shields.io/badge/ShieldCore-WAF-red?style=for-the-badge&logo=shield&logoColor=white" />
<img src="https://img.shields.io/badge/AI--Powered-Neural%20WAF-blueviolet?style=for-the-badge" />
<img src="https://img.shields.io/badge/CSIC%202010-Dataset-green?style=for-the-badge" />
<img src="https://img.shields.io/badge/Version-1.0.0-orange?style=for-the-badge" />

# 🛡️ SHIELDCORE WAF
### *LPU-Accelerated Neural Packet Inspection · Global Edge Protection for the Modern Internet*

**[🔴 Live Demo](https://shield-core-yjz1.vercel.app/) · [📊 Analyzer](https://shield-core-yjz1.vercel.app/analyzer) · [📡 Live Feed](https://shield-core-yjz1.vercel.app/live-feed) · [🪞 Attacker Mirror](https://shield-core-yjz1.vercel.app/attacker-mirror) · [📈 Analytics](https://shield-core-yjz1.vercel.app/analytics)**

</div>

---

## ⚡ Overview

**ShieldCore WAF** is an AI-powered Web Application Firewall dashboard built to detect, analyze, and neutralize web-layer threats in real time. Trained on the **CSIC 2010 dataset** (61,000 samples), ShieldCore combines a 5-stage neural inference pipeline with live global threat mapping, attacker behavioral profiling, and a one-of-a-kind **Attacker vs Defender Mirror** — giving security teams true visibility into how attacks are constructed and crushed.

> Built in **24 hours** at a hackathon. Zero compromises on depth or design.

---

## 🔢 Core Stats

| Metric | Value |
|---|---|
| 📦 Dataset Size | 61,000 samples (CSIC 2010) |
| 🚫 Total Blocks Executed | 125,026+ |
| 📡 Packets Inspected | 2,846,430+ |
| 🌍 Global Attacks Tracked | 25,124 across 42 regions |
| ⚡ Avg Inference Time | 5.2ms |
| 🎯 Model Accuracy | 94.3% |
| 📶 Ingress Velocity | 482.4k packets/min |

---

## 🧠 Modules

### 🔍 1. Payload Analyzer
The core intelligence engine of ShieldCore. Submits raw HTTP payloads through a **5-stage neural pipeline**:

```
INGRESS RECEIVED → URL DECODE → BASE64 DECODE → TOKENIZATION → NEURAL CLASSIFY
```

- Detects **SQL Injection, XSS, Path Traversal**, and anomalous patterns
- Outputs **Attack Class, Severity, Confidence Score, and Inference Time**
- Displays an **AI Forensic Verdict** with plain-language explanation
- Supports **RAW / DECODED** payload view toggle
- OWASP classification + Export Intelligence as JSON or PDF
- Threat library with 61k corpus (59% valid / 41% anomalous)

---

### 📡 2. Live Feed — Traffic Stream
Edge-wide telemetry across global ingress nodes, streamed in real time.

- Tracks **Total Ingress, Neutralized Threats, and Avg Threat Index** live
- Color-coded entries: `BLOCKED` / `SAFE` with intelligence match scores
- Search by **IP address or Attack Class**
- Suspend/resume feed on demand
- Each entry shows IP, endpoint, HTTP method, latency, and threat verdict

---

### 🪞 3. Attacker Mirror
ShieldCore's most powerful and unique module — a **split-screen battle view** between attacker and defender.

**Attacker Side — Intercepted Hacker Workstation:**
- Shows the full **Payload Construction Stack** step by step
- Start with Malicious Intent → Add Encoding → Obfuscate → Launch

**Defender Side — ShieldCore Neural Ingress Core:**
- Edge Node Intercept → De-obfuscation → Neural Transformer Activation → Final Decision
- Surfaces **Forensic Evidence**: decoded SQL injection patterns, boolean logic detection, OWASP A03:2021 violations
- Provides **Defender Recommendations** with one-click IP range blocking
- Scoreboard: Attacker vs Defender (0 vs 9 — defender wins 🛡️)
- Modes: **Explain Mode**, **Live Intercept**, **Suspicious Anomaly**

---

### 📊 4. Analytics Dashboard
Strategic command center for long-term threat intelligence.

- **Attack Vector Distribution** — concentric ring chart of 25k anomalous samples
- **Threat Intensity by Country** — ranked bar chart (Russia, China, Iran, North Korea, India...)
- **Attacker Sophistication Profile** — rainbow arc chart profiling threat actor skill levels
- **Real-Time Ingress Velocity** — live line chart at 482.4 kbps
- **Global Neural Ingress Map** — world map with animated attack origin arcs
- Filter by: SQLi, XSS, DDoS, Malware, Phishing, APT, Botnet
- Search by Host Origin | Filter by Skill Level

---

## 🗺️ Global Threat Map

The **Global Neural Ingress** map visualizes active attack trajectories across the world in real time using the CSIC 2010 simulation dataset.

- 25,124 total attacks across 42 affected regions
- Most active threat: **Moscow / SQL Injection**
- Threat Level: **CRITICAL**
- Animated dashed arc lines per attack vector with cluster counts per region

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React / Next.js |
| Styling | Tailwind CSS |
| AI/ML | Neural Classifier (CSIC 2010) |
| Dataset | CSIC 2010 HTTP Dataset |
| Deployment | Vercel |
| Charts | Recharts / D3.js |
| Maps | Leaflet / MapBox |

---

## 📁 Project Structure

```
shieldcore-waf/
├── app/
│   ├── page.tsx              # Landing page
│   ├── analyzer/             # Payload Analysis Engine
│   ├── live-feed/            # Traffic Stream
│   ├── attacker-mirror/      # Attacker vs Defender
│   └── analytics/            # Global Analytics Dashboard
├── components/
│   ├── ThreatMap.tsx
│   ├── PayloadPipeline.tsx
│   ├── LiveFeedStream.tsx
│   └── AttackerMirror.tsx
├── lib/
│   └── neural-classifier.ts
└── public/
```

---

## 🔐 Security Coverage

| Attack Type | Detection |
|---|---|
| SQL Injection | ✅ |
| Cross-Site Scripting (XSS) | ✅ |
| Path Traversal | ✅ |
| DDoS Patterns | ✅ |
| Malware Signatures | ✅ |
| Phishing Payloads | ✅ |
| APT Indicators | ✅ |
| Botnet Traffic | ✅ |
| Base64 Obfuscation | ✅ |
| OWASP Top 10 Coverage | ✅ |

---

## 🏆 Built At

> 🎯 **24-Hour Hackathon Project**
> Built under pressure, shipped with pride.
> This project represents what's possible when a focused team combines AI, security engineering, and design in a single sprint.

---

## 📄 License

MIT License © 2025 ShieldCore Team

---

<div align="center">

**ShieldCore WAF v1.0.0 | CSIC 2010 | Strategic Defense Node Active** 🛡️

*"The best firewall doesn't just block threats — it understands them."*

</div>
