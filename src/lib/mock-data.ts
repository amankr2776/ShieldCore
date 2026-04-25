
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

// Real CSIC 2010 Parsed Samples (Valid Traffic)
export const CSIC_VALID_SAMPLES = [
  { method: "GET", url: "/tienda1/imagenes/nuestratierra.jpg", payload: "Cookie: JSESSIONID=1DAB65B0324F0B760D56507C0FFCD929", id: "7704" },
  { method: "GET", url: "/tienda1/publico/registro.jsp?modo=registro&login=sikander&password=2eSCo63ENti2&dni=19064192K", payload: "Cookie: JSESSIONID=8CD26B5FBF3F555875293CA8CA90F199", id: "13515" },
  { method: "GET", url: "/tienda1/miembros/imagenes/zarauz.jpg", payload: "Cookie: JSESSIONID=3BB7D3CFA4883626F142D5A83A97EDC3", id: "12445" },
  { method: "GET", url: "/tienda1/publico/autenticar.jsp?modo=entrar&login=chuang&pwd=visionario&remember=on&B1=Entrar", payload: "Cookie: JSESSIONID=29BDC1A4215FA40AC619614130C4A037", id: "35896" },
  { method: "GET", url: "/tienda1/publico/vaciar.jsp?B2=Vaciar+carrito", payload: "Cookie: JSESSIONID=E535831273DD8A3D1C0D9932FA59F59C", id: "737" },
  { method: "POST", url: "/tienda1/publico/autenticar.jsp", payload: "modo=entrar&login=janna&pwd=eusquero&remember=off&B1=Entrar", id: "16025" },
  { method: "POST", url: "/tienda1/publico/caracteristicas.jsp", payload: "id=1", id: "10915" },
  { method: "GET", url: "/tienda1/miembros/index.jsp", payload: "Cookie: JSESSIONID=C61FBBEEE45E049ABE4DB9B7E1B47D54", id: "7082" },
  { method: "GET", url: "/tienda1/imagenes/logo.gif", payload: "Cookie: JSESSIONID=A53D159B0F23CDF15AF7AF825C939170", id: "11591" },
  { method: "POST", url: "/tienda1/miembros/editar.jsp", payload: "modo=registro&login=dyment&password=Z5R1174oSa&nombre=Sadoc&apellidos=Oruna", id: "21484" },
  { method: "POST", url: "/tienda1/publico/anadir.jsp", payload: "id=2&nombre=Jam%F3n+Ib%E9rico&precio=39&cantidad=98&B1=A%F1adir+al+carrito", id: "23259" },
  { method: "POST", url: "/tienda1/publico/pagar.jsp", payload: "modo=insertar&precio=1126&B1=Pasar+por+caja", id: "20713" },
  { method: "GET", url: "/tienda1/index.jsp", payload: "Cookie: JSESSIONID=F43C7CD943DE7B1C20D3A9896C463DFB", id: "13033" },
  { method: "POST", url: "/tienda1/publico/entrar.jsp", payload: "errorMsg=Credenciales+incorrectas", id: "3286" },
  { method: "GET", url: "/tienda1/publico/miembros.jsp", payload: "Cookie: JSESSIONID=2A48D6F851EE859F13A273FF4FF92637", id: "5267" },
  { method: "POST", url: "/tienda1/miembros/editar.jsp", payload: "modo=registro&login=eggebraa&pwd=enALtEceDOr&remember=on&B1=Entrar", id: "27977" },
  { method: "GET", url: "/tienda1/global/estilos.css", payload: "Accept: text/css", id: "14566" },
  { method: "GET", url: "/tienda1/miembros/salir.jsp", payload: "Cookie: JSESSIONID=7C7D9FAB545CDB214E96AFDE9E202090", id: "31314" },
  { method: "GET", url: "/tienda1/imagenes/logo.gif", payload: "Accept: image/gif", id: "25883" },
  { method: "GET", url: "/tienda1/global/menum.jsp", payload: "Cookie: JSESSIONID=42CFED5D078524484AA6B1692283DE86", id: "2864" },
  { method: "GET", url: "/tienda1/miembros/fotos.jsp", payload: "Cookie: JSESSIONID=4D52613C7A0A8769FEF7E8B93E050D2D", id: "22097" },
  { method: "GET", url: "/tienda1/publico/pagar.jsp?modo=insertar&precio=8656&B1=Confirmar", payload: "Cookie: JSESSIONID=6B8FCC0BFBF0378A7A2507C09243692E", id: "32160" }
];

// Real CSIC 2010 Parsed Samples (Anomalous/Attack Traffic)
export const CSIC_ANOMALOUS_SAMPLES = [
  { method: "GET", url: "/tienda1/publico/caracteristicas.jsp?idA=2", payload: "Parameter Tampering Detected", attackType: "Path Traversal", score: 0.92, id: "AN-11044" },
  { method: "POST", url: "/tienda1/publico/autenticar.jsp", payload: "login=arro&pwd=CarMinAR%3C%21--%23include+file%3D%22archivo_secreto%22+--%3E", attackType: "Command Injection", score: 0.98, id: "AN-1174" },
  { method: "GET", url: "/tienda1/publico/anadir.jsp?id=2&nombre=Jam%F3n+Ib%E9rico&precio=100%2F&cantidad=60", attackType: "SQL Injection", score: 0.89, id: "AN-21535" },
  { method: "POST", url: "/tienda1/publico/registro.jsp", payload: "login=defalco&password=botonesSet-cookie%253A%2BTamper%253D1041264011025374727", attackType: "XSS", score: 0.95, id: "AN-13852" },
  { method: "GET", url: "/tienda1/publico/pagar.jsp?modo=insertar&precio=1633&B1=Confirmar%27INJECTED_PARAM", attackType: "SQL Injection", score: 0.94, id: "AN-3053" },
  { method: "GET", url: "/tienda1/miembros/imagenes/zarauz.jpg.BAK", payload: "Source Code Leakage Attempt", attackType: "Path Traversal", score: 0.96, id: "AN-8203" },
  { method: "GET", url: "/tienda1/imagenes.java", payload: "Directory Brute Force Detected", attackType: "Path Traversal", score: 0.91, id: "AN-16628" },
  { method: "POST", url: "/tienda1/miembros/editar.jsp", payload: "login=blodgett&password=1LFiLERer5&provincia=Al%2Fmer.%EDa", attackType: "Path Traversal", score: 0.88, id: "AN-5232" },
  { method: "GET", url: "/tienda1/publico/caracteristicas.jsp.INC", payload: "Include File Disclosure Attempt", attackType: "Path Traversal", score: 0.93, id: "AN-2834" },
  { method: "POST", url: "/tienda1/miembros/editar.jsp", payload: "login=julee&password=any%253F%250D%250ASet-cookie%253A%2BTamper%253D1041264011025374727", attackType: "XSS", score: 0.97, id: "AN-1258" },
  { method: "GET", url: "/tienda1/publico/autenticar.jsp?modo=entrar&login=lilllie8&pwd=4mpo599c7mientoSet-cookie%253A%2BTamper%253D1041264011025374727", attackType: "XSS", score: 0.92, id: "AN-10989" },
  { method: "GET", url: "/tienda1/publico/anadir.jsp/asf-logo-wide", attackType: "Path Traversal", score: 0.85, id: "AN-17943" },
  { method: "POST", url: "/tienda1/publico/entrar.jsp", payload: "errorMsg=any%253F%250ASet-cookie%253A%2BTamper%253D5765205567234876235", attackType: "XSS", score: 0.94, id: "AN-5016" },
  { method: "GET", url: "/tienda1/publico/pagar.jsp?modo=insertar&precio=1012%27INJECTED_PARAM&B1=Pasar+por+caja", attackType: "SQL Injection", score: 0.96, id: "AN-23333" },
  { method: "POST", url: "/tienda1/publico/anadir.jsp", payload: "id=2%257C&nombre=Vino+Rioja&precio=85&cantidad=18", attackType: "Command Injection", score: 0.91, id: "AN-8576" },
  { method: "POST", url: "/tienda1/publico/pagar.jsp", payload: "modo=insertar&precio=6027&B1=Confirmar%253CSCRIPT%253Ealert%2528%2522Paros%2522%2529%253B%253C%252FSCRIPT%253E", attackType: "XSS", score: 0.98, id: "AN-7122" },
  { method: "GET", url: "/tienda1/publico/pagar.jsp/asf-logo-wide.java", attackType: "Path Traversal", score: 0.94, id: "AN-22323" }
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
  
  // Ensure the ID is globally unique for React keys even if the same sample is picked multiple times
  const uniqueId = `${sample.id || 'id'}-${Math.random().toString(36).substring(2, 7)}-${Date.now() % 10000}`;

  return {
    id: uniqueId,
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
