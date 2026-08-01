const http = require('http');
const https = require('https');

const HOP_BY_HOP_HEADERS = new Set([
  'connection', 'keep-alive', 'proxy-authenticate', 'proxy-authorization',
  'te', 'trailer', 'transfer-encoding', 'upgrade'
]);

module.exports = (req, res) => {
  const origin = process.env.DASHBOARD_ORIGIN;
  if (!origin) {
    res.statusCode = 500;
    res.end('DASHBOARD_ORIGIN is not configured.');
    return;
  }

  let target;
  try {
    target = new URL(req.url || '/', origin);
  } catch {
    res.statusCode = 500;
    res.end('Invalid DASHBOARD_ORIGIN.');
    return;
  }

  const headers = {};
  for (const [name, value] of Object.entries(req.headers)) {
    if (!HOP_BY_HOP_HEADERS.has(name.toLowerCase()) && value !== undefined) {
      headers[name] = value;
    }
  }
  headers.host = target.host;
  headers['x-forwarded-host'] = req.headers.host || '';
  headers['x-forwarded-proto'] = 'https';

  const client = target.protocol === 'https:' ? https : http;
  const upstream = client.request(target, { method: req.method, headers }, upstreamRes => {
    const responseHeaders = { ...upstreamRes.headers };
    if (Array.isArray(responseHeaders['set-cookie'])) {
      responseHeaders['set-cookie'] = responseHeaders['set-cookie'].map(cookie =>
        /;\s*secure/i.test(cookie) ? cookie : `${cookie}; Secure; SameSite=Lax`
      );
    }
    res.writeHead(upstreamRes.statusCode || 502, responseHeaders);
    upstreamRes.pipe(res);
  });

  upstream.on('error', () => {
    if (!res.headersSent) {
      res.statusCode = 502;
      res.end('Twisha dashboard is currently unavailable.');
    }
  });
  req.pipe(upstream);
};

module.exports.config = { api: { bodyParser: false } };
