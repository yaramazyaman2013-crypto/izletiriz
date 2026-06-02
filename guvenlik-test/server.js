const http = require("http");
const net  = require("net");
const path = require("path");
const fs   = require("fs");

const PORT = 3030;

const COMMON_PORTS = [21, 22, 23, 25, 53, 80, 110, 143, 443, 445, 3306, 3389, 5432, 8080, 8443];

/* ── SSE bağlı alıcılar ── */
const receivers = new Set();

function broadcast(payload) {
  const data = `data: ${JSON.stringify(payload)}\n\n`;
  for (const res of receivers) {
    try { res.write(data); } catch { receivers.delete(res); }
  }
  console.log(`[BROADCAST] ${receivers.size} alıcıya gönderildi — ${payload.level}: ${payload.message.slice(0,60)}`);
}

/* ── Yardımcılar ── */
function isValidIPv4(ip) {
  return /^(25[0-5]|2[0-4]\d|[01]?\d\d?)\.(25[0-5]|2[0-4]\d|[01]?\d\d?)\.(25[0-5]|2[0-4]\d|[01]?\d\d?)\.(25[0-5]|2[0-4]\d|[01]?\d\d?)$/.test(ip.trim());
}

function isPrivateIP(ip) {
  return (
    ip.startsWith("10.") ||
    ip.startsWith("192.168.") ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(ip) ||
    ip === "127.0.0.1" ||
    ip.startsWith("169.254.")
  );
}

function checkPort(ip, port, timeoutMs = 1500) {
  return new Promise((resolve) => {
    const socket = net.createConnection({ host: ip, port });
    const timer = setTimeout(() => { socket.destroy(); resolve(false); }, timeoutMs);
    socket.on("connect", () => { clearTimeout(timer); socket.destroy(); resolve(true); });
    socket.on("error",   () => { clearTimeout(timer); resolve(false); });
  });
}

function buildWarnings(openPorts) {
  const warnings = [];
  const has    = (p)    => openPorts.some((r) => r.port === p);
  const hasAny = (...ps) => ps.some((p) => has(p));

  if (has(23))        warnings.push({ level: "critical", message: "Telnet (port 23) açık — şifrelenmemiş iletişim, ciddi güvenlik riski!" });
  if (has(445))       warnings.push({ level: "critical", message: "SMB (port 445) açık — EternalBlue/WannaCry tipi saldırılara karşı savunmasız." });
  if (has(3306))      warnings.push({ level: "critical", message: "MySQL (port 3306) açık — veritabanı internete açık, yetkisiz erişim riski." });
  if (has(5432))      warnings.push({ level: "critical", message: "PostgreSQL (port 5432) açık — veritabanı internete açık." });
  if (has(3389))      warnings.push({ level: "critical", message: "RDP (port 3389) açık — uzak masaüstü internete açık, brute-force riski." });
  if (has(22))        warnings.push({ level: "warning",  message: "SSH (port 22) açık — anahtar tabanlı kimlik doğrulama ve fail2ban kullanıldığından emin olun." });
  if (has(21))        warnings.push({ level: "warning",  message: "FTP (port 21) açık — kimlik bilgileri düz metin iletilir; SFTP'ye geçiş önerilir." });
  if (has(25))        warnings.push({ level: "warning",  message: "SMTP (port 25) açık — relay açık olup olmadığını kontrol edin." });
  if (hasAny(110,143))  warnings.push({ level: "warning",  message: "Şifrelenmemiş e-posta protokolü açık (POP3/IMAP) — SSL sürümlerine geçin." });
  if (hasAny(8080,8443))warnings.push({ level: "warning",  message: "Alternatif web portu açık (8080/8443) — yetkisiz panel erişimi riski." });
  if (has(80))        warnings.push({ level: "info",     message: "HTTP (port 80) açık — HTTPS'e yönlendirme yapıldığından emin olun." });
  if (hasAny(443,8443)) warnings.push({ level: "info",     message: "HTTPS aktif — SSL sertifikasının geçerliliğini ve sürümünü kontrol edin." });
  if (has(53))        warnings.push({ level: "info",     message: "DNS (port 53) açık — zone transfer kapalı olduğundan emin olun." });

  if (warnings.length === 0 && openPorts.length > 0)
    warnings.push({ level: "info", message: "Açık portlarda bilinen kritik açık tespit edilmedi." });
  if (openPorts.length === 0)
    warnings.push({ level: "info", message: "Taranan portlarda açık port bulunamadı veya güvenlik duvarı engelledi." });

  return warnings;
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (c) => (body += c));
    req.on("end",  () => resolve(body));
    req.on("error", reject);
  });
}

/* ── HTTP Sunucu ── */
const server = http.createServer(async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin",  "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") { res.writeHead(204); res.end(); return; }

  /* Admin paneli */
  if (req.method === "GET" && (req.url === "/" || req.url === "/index.html")) {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(fs.readFileSync(path.join(__dirname, "index.html"), "utf8"));
    return;
  }

  /* Alıcı ekranı */
  if (req.method === "GET" && req.url === "/izle") {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(fs.readFileSync(path.join(__dirname, "receiver.html"), "utf8"));
    return;
  }

  /* SSE — alıcı ekranları bağlanır */
  if (req.method === "GET" && req.url === "/events") {
    res.writeHead(200, {
      "Content-Type":  "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection":    "keep-alive",
    });
    res.write(": bağlı\n\n");
    receivers.add(res);
    console.log(`[SSE] Yeni alıcı bağlandı. Toplam: ${receivers.size}`);

    // Canlılık ping'i (30 sn)
    const ping = setInterval(() => {
      try { res.write(": ping\n\n"); } catch { clearInterval(ping); }
    }, 30000);

    req.on("close", () => {
      clearInterval(ping);
      receivers.delete(res);
      console.log(`[SSE] Alıcı ayrıldı. Toplam: ${receivers.size}`);
    });
    return;
  }

  /* Alıcı sayısı */
  if (req.method === "GET" && req.url === "/api/receivers") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ count: receivers.size }));
    return;
  }

  /* Uyarı gönder → tüm alıcılara push */
  if (req.method === "POST" && req.url === "/api/alert") {
    let parsed;
    try { parsed = JSON.parse(await readBody(req)); } catch {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Geçersiz JSON." }));
      return;
    }

    const level   = parsed.level;
    const message = (parsed.message ?? "").trim();

    if (!["critical","warning","info"].includes(level) || !message) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "level ve message zorunlu." }));
      return;
    }

    broadcast({ level, message, timestamp: new Date().toISOString() });
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ sent: receivers.size }));
    return;
  }

  /* Port tarama */
  if (req.method === "POST" && req.url === "/api/scan") {
    let parsed;
    try { parsed = JSON.parse(await readBody(req)); } catch {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Geçersiz JSON." }));
      return;
    }

    const ip = (parsed.ip ?? "").trim();
    if (!ip) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "IP adresi girilmedi." }));
      return;
    }
    if (!isValidIPv4(ip)) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Geçersiz IPv4 adresi formatı." }));
      return;
    }

    console.log(`[TARAMA] ${ip} — ${new Date().toISOString()}`);
    const portResults = await Promise.all(
      COMMON_PORTS.map(async (port) => ({ port, open: await checkPort(ip, port) }))
    );
    const openPorts = portResults.filter((r) => r.open);
    const warnings  = buildWarnings(openPorts);

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({
      ip, isPrivate: isPrivateIP(ip),
      scannedPorts: COMMON_PORTS.length,
      openPorts, warnings,
      timestamp: new Date().toISOString(),
    }));
    return;
  }

  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "Bulunamadı." }));
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`\nSecPanel çalışıyor:`);
  console.log(`  Admin Paneli  → http://localhost:${PORT}`);
  console.log(`  Alıcı Ekranı  → http://localhost:${PORT}/izle`);
  console.log(`  (Test makinelerinde /izle adresini açın)\n`);
});
