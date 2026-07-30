const http = require("http");

// Minimal fixed-IP forwarder: Vercel's serverless functions rotate outbound
// IPs, but Compulife authorizes exactly one IP per Authorization ID. This
// service runs on a host with a static outbound IP (Railway) and simply
// relays the already-built Compulife request URL, so Compulife only ever
// sees traffic from this one IP.
const PORT = process.env.PORT || 3000;
const PROXY_SECRET = process.env.PROXY_SECRET;
const ALLOWED_HOST = "www.compulifeapi.com";

if (!PROXY_SECRET) {
  console.error("PROXY_SECRET is not set — refusing to start.");
  process.exit(1);
}

const server = http.createServer((req, res) => {
  if (req.method !== "POST" || req.url !== "/forward") {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Not found" }));
    return;
  }

  if (req.headers["x-proxy-secret"] !== PROXY_SECRET) {
    res.writeHead(401, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Unauthorized" }));
    return;
  }

  let body = "";
  req.on("data", (chunk) => {
    body += chunk;
  });

  req.on("end", async () => {
    let target;
    try {
      const parsed = JSON.parse(body);
      target = new URL(parsed.url);
    } catch {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Invalid request body" }));
      return;
    }

    if (target.hostname !== ALLOWED_HOST) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Forwarding to this host is not allowed" }));
      return;
    }

    try {
      const upstream = await fetch(target, { method: "GET" });
      const text = await upstream.text();
      res.writeHead(upstream.status, {
        "Content-Type": upstream.headers.get("content-type") || "application/json",
      });
      res.end(text);
    } catch (error) {
      res.writeHead(502, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Upstream request failed", detail: String(error) }));
    }
  });
});

server.listen(PORT, () => {
  console.log(`Compulife proxy listening on port ${PORT}`);
});
