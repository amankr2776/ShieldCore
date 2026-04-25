
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

// Real CSIC 2010 Parsed Samples (Valid)
export const CSIC_VALID_SAMPLES = [
  { method: "GET", url: "/tienda1/imagenes/nuestratierra.jpg", payload: "Cookie: JSESSIONID=1DAB65B0324F0B760D56507C0FFCD929", id: "7704" },
  { method: "GET", url: "/tienda1/publico/registro.jsp?modo=registro&login=sikander&password=2eSCo63ENti2&dni=19064192K", payload: "Cookie: JSESSIONID=8CD26B5FBF3F555875293CA8CA90F199", id: "13515" },
  { method: "GET", url: "/tienda1/miembros/imagenes/zarauz.jpg", payload: "Cookie: JSESSIONID=3BB7D3CFA4883626F142D5A83A97EDC3", id: "12445" },
  { method: "GET", url: "/tienda1/publico/autenticar.jsp?modo=entrar&login=chuang&pwd=visionario&remember=on&B1=Entrar", payload: "Cookie: JSESSIONID=29BDC1A4215FA40AC619614130C4A037", id: "35896" },
  { method: "GET", url: "/tienda1/publico/vaciar.jsp?B2=Vaciar+carrito", payload: "Cookie: JSESSIONID=E535831273DD8A3D1C0D9932FA59F59C", id: "737" },
  { method: "POST", url: "/tienda1/publico/autenticar.jsp", payload: "modo=entrar&login=janna&pwd=eusquero&remember=off&B1=Entrar", id: "16025" },
  { method: "POST", url: "/tienda1/publico/caracteristicas.jsp", payload: "id=1", id: "10915" },
  { method: "GET", url: "/tienda1/miembros/index.jsp", payload: "Cookie: JSESSIONID=C61FBBEEE45E049ABE4DB9B7E1B47D54", id: "7082" },
  { method: "POST", url: "/tienda1/miembros/editar.jsp", payload: "modo=registro&login=dyment&password=Z5R1174oSa&nombre=Sadoc&apellidos=Oruna", id: "21484" },
  { method: "POST", url: "/tienda1/publico/anadir.jsp", payload: "id=2&nombre=Jam%F3n+Ib%E9rico&precio=39&cantidad=98&B1=A%F1adir+al+carrito", id: "23259" },
  { method: "POST", url: "/tienda1/publico/pagar.jsp", payload: "modo=insertar&precio=1126&B1=Pasar+por+caja", id: "20713" },
  { method: "GET", url: "/tienda1/index.jsp", payload: "Cookie: JSESSIONID=F43C7CD943DE7B1C20D3A9896C463DFB", id: "13033" },
  { method: "POST", url: "/tienda1/publico/entrar.jsp", payload: "errorMsg=Credenciales+incorrectas", id: "3286" },
  { method: "GET", url: "/tienda1/publico/miembros.jsp", payload: "Cookie: JSESSIONID=2A48D6F851EE859F13A273FF4FF92637", id: "5267" },
  { method: "POST", url: "/tienda1/miembros/editar.jsp", payload: "modo=registro&login=dafoe&password=25I6La&nombre=Aldebar", id: "19288" }
];

// Real CSIC 2010 Parsed Samples (Anomalous - Reconstructed from typical patterns in dataset)
export const CSIC_ANOMALOUS_SAMPLES = [
  { method: "GET", url: "/tienda1/publico/caracteristicas.jsp?id=%27OR%27a%3D%27a", payload: "SQL Injection", attackType: "SQL Injection", score: 0.96, id: "AN-1" },
  { method: "GET", url: "/tienda1/miembros/editar.jsp?modo=registro%3CSCRIPT%3Ealert%28%22Paros%22%29%3B%3C%2FSCRIPT%3E", payload: "XSS script execution", attackType: "XSS", score: 0.94, id: "AN-2" },
  { method: "POST", url: "/tienda1/publico/autenticar.jsp", payload: "login=admin%27--&pwd=bypass", attackType: "SQL Injection", score: 0.98, id: "AN-3" },
  { method: "GET", url: "/tienda1/miembros/imagenes/zarauz.jpg?path=../../etc/passwd", payload: "Path Traversal", attackType: "Path Traversal", score: 0.92, id: "AN-4" },
  { method: "POST", url: "/tienda1/publico/registro.jsp", payload: "email=%3Cimg+src%3Dx+onerror%3Dalert(1)%3E", attackType: "XSS", score: 0.95, id: "AN-5" },
  { method: "GET", url: "/tienda1/publico/anadir.jsp?id=3&cantidad=999999999999999999", payload: "Buffer Overflow", attackType: "Buffer Overflow", score: 0.88, id: "AN-6" },
  { method: "GET", url: "/api/proxy?url=http://169.254.169.254/latest/meta-data/", payload: "SSRF Attempt", attackType: "SSRF", score: 0.91, id: "AN-7" }
];

export const ATTACK_TYPES = [
  "SQL Injection", "XSS", "Path Traversal", "Command Injection", "Buffer Overflow", "SSRF"
];

export function getRandomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateFakeRequest(timestampOverride?: string) {
  const roll = Math.random();
  let decision: 'SAFE' | 'BLOCKED' | 'SUSPICIOUS' = 'SAFE';
  let sample;
  
  if (roll > 0.85) {
    decision = 'BLOCKED';
    sample = getRandomElement(CSIC_ANOMALOUS_SAMPLES);
  } else if (roll > 0.75) {
    decision = 'SUSPICIOUS';
    const validBase = getRandomElement(CSIC_VALID_SAMPLES);
    sample = { ...validBase, attackType: 'Suspicious Anomaly', score: 0.65, payload: "Malformed Header: " + validBase.payload };
  } else {
    decision = 'SAFE';
    const validBase = getRandomElement(CSIC_VALID_SAMPLES);
    sample = { ...validBase, attackType: 'Safe', score: 0.05, payload: validBase.payload };
  }

  const ip = getRandomElement(FAKE_IPS);

  return {
    id: sample.id || Math.random().toString(36).substr(2, 9),
    timestamp: timestampOverride || new Date().toISOString(),
    ip: ip,
    country: IP_TO_COUNTRY[ip] || "US",
    endpoint: sample.url,
    method: sample.method,
    attackType: (sample as any).attackType || 'Safe',
    score: (sample as any).score || 0.05,
    decision: decision,
    inferenceTime: Math.floor(Math.random() * 8) + 2,
    payload: sample.payload || "Request Context: CSIC-2010-VALID"
  };
}

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
