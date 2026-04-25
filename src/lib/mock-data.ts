export const FAKE_IPS = [
  "192.168.1.1", "10.0.0.12", "172.16.254.1", "45.33.22.11", 
  "88.99.100.12", "201.12.33.44", "92.111.45.6", "12.4.5.6",
  "142.250.190.46", "31.13.71.36", "157.240.22.35", "104.244.42.193",
  "185.60.216.35", "23.235.46.133", "52.84.162.119", "205.251.242.103"
];

export const ENDPOINTS = [
  "/login", "/search", "/api/users", "/admin", "/checkout", "/upload", "/api/data", "/v1/auth"
];

export const METHODS = ["GET", "POST", "PUT", "DELETE"];

export const ATTACK_TYPES = [
  "SQL Injection", "XSS", "Path Traversal", "Command Injection", "Buffer Overflow", "SSRF"
];

export function getRandomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateFakeRequest() {
  const roll = Math.random();
  let decision: 'SAFE' | 'BLOCKED' | 'SUSPICIOUS' = 'SAFE';
  let predictedClass = 'Safe';
  let score = parseFloat((Math.random() * 0.12 + 0.01).toFixed(2));

  if (roll > 0.90) {
    decision = 'SUSPICIOUS';
    predictedClass = 'Potential Anomaly';
    score = parseFloat((Math.random() * 0.35 + 0.50).toFixed(2));
  } else if (roll > 0.65) {
    decision = 'BLOCKED';
    predictedClass = getRandomElement(ATTACK_TYPES);
    score = parseFloat((Math.random() * 0.13 + 0.85).toFixed(2));
  }

  return {
    id: Math.random().toString(36).substr(2, 9),
    timestamp: new Date().toISOString(),
    ip: getRandomElement(FAKE_IPS),
    endpoint: getRandomElement(ENDPOINTS),
    method: getRandomElement(METHODS),
    attackType: predictedClass,
    score: score,
    decision: decision,
    inferenceTime: Math.floor(Math.random() * 10) + 5
  };
}