
export const FAKE_IPS = [
  "192.168.1.1", "10.0.0.12", "172.16.254.1", "45.33.22.11", 
  "88.99.100.12", "201.12.33.44", "92.111.45.6", "12.4.5.6",
  "142.250.190.46", "31.13.71.36", "157.240.22.35", "104.244.42.193",
  "185.60.216.35", "23.235.46.133", "52.84.162.119", "205.251.242.103",
  "1.1.1.1", "8.8.8.8", "212.58.244.70", "13.107.42.12"
];

export const IP_TO_COUNTRY: Record<string, string> = {
  "192.168.1.1": "US", "10.0.0.12": "US", "172.16.254.1": "DE", "45.33.22.11": "UK",
  "88.99.100.12": "RU", "201.12.33.44": "BR", "92.111.45.6": "FR", "12.4.5.6": "CN",
  "142.250.190.46": "US", "31.13.71.36": "IE", "157.240.22.35": "SG", "104.244.42.193": "US",
  "185.60.216.35": "NL", "23.235.46.133": "US", "52.84.162.119": "JP", "205.251.242.103": "US",
  "1.1.1.1": "AU", "8.8.8.8": "US", "212.58.244.70": "UK", "13.107.42.12": "US"
};

export const ENDPOINTS = [
  "/login", "/search", "/api/users", "/admin", "/checkout", "/upload", "/api/data", "/v1/auth"
];

export const ENDPOINT_CATEGORIES: Record<string, string> = {
  "/login": "auth", "/v1/auth": "auth", "/search": "search", "/admin": "admin",
  "/api/users": "api", "/api/data": "api", "/checkout": "api", "/upload": "upload"
};

export const METHODS = ["GET", "POST", "PUT", "DELETE"];

export const ATTACK_TYPES = [
  "SQL Injection", "XSS", "Path Traversal", "Command Injection", "Buffer Overflow", "SSRF"
];

export function getRandomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateFakeRequest(timestampOverride?: string) {
  const roll = Math.random();
  let decision: 'SAFE' | 'BLOCKED' | 'SUSPICIOUS' = 'SAFE';
  let predictedClass = 'Safe';
  let score = parseFloat((Math.random() * 0.12 + 0.01).toFixed(2));

  // Vary frequency by "simulated hour" - assume business hours are higher risk
  const now = timestampOverride ? new Date(timestampOverride) : new Date();
  const hour = now.getHours();
  const riskFactor = (hour >= 9 && hour <= 18) ? 0.35 : 0.15;

  if (roll > 1 - riskFactor * 0.2) {
    decision = 'SUSPICIOUS';
    predictedClass = 'Potential Anomaly';
    score = parseFloat((Math.random() * 0.35 + 0.50).toFixed(2));
  } else if (roll > 1 - riskFactor) {
    decision = 'BLOCKED';
    predictedClass = getRandomElement(ATTACK_TYPES);
    score = parseFloat((Math.random() * 0.13 + 0.85).toFixed(2));
  }

  const ip = getRandomElement(FAKE_IPS);
  const endpoint = getRandomElement(ENDPOINTS);

  return {
    id: Math.random().toString(36).substr(2, 9),
    timestamp: timestampOverride || new Date().toISOString(),
    ip: ip,
    country: IP_TO_COUNTRY[ip] || "US",
    endpoint: endpoint,
    category: ENDPOINT_CATEGORIES[endpoint] || "api",
    method: getRandomElement(METHODS),
    attackType: predictedClass,
    score: score,
    decision: decision,
    inferenceTime: Math.floor(Math.random() * 10) + 5,
    payload: decision === 'SAFE' ? "Normal request context" : "Simulated attack payload: " + predictedClass
  };
}

// Seed data for demo (200 requests spread over last 24h)
export function getSeededData() {
  const data = [];
  const now = Date.now();
  const oneDay = 24 * 60 * 60 * 1000;
  
  for (let i = 0; i < 200; i++) {
    const timestamp = new Date(now - Math.random() * oneDay).toISOString();
    data.push(generateFakeRequest(timestamp));
  }
  
  return data.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}
