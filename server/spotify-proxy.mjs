#!/usr/bin/env node
/**
 * Local token proxy: keeps SPOTIFY_CLIENT_SECRET off the browser.
 *
 *   SPOTIFY_CLIENT_ID=... SPOTIFY_CLIENT_SECRET=... node server/spotify-proxy.mjs
 *   Or: copy .env.example → .env in project root, fill values, then: npm run spotify-proxy:env
 *
 * Optional: SPOTIFY_REDIRECT_ALLOWLIST=http://127.0.0.1:3000/index2.html,https://yoursite.github.io/index2.html
 *
 * Then in index2.html set on #spotify-widget:
 *   data-token-proxy="http://127.0.0.1:3847/api/spotify/token"
 */

import http from 'node:http';
import { spotifyTokenBackend, corsHeaders } from '../lib/spotify-token-backend.mjs';

const PORT = Number(process.env.SPOTIFY_PROXY_PORT || 3847, 10);
const clientId = process.env.SPOTIFY_CLIENT_ID;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
const redirectAllowlist = process.env.SPOTIFY_REDIRECT_ALLOWLIST;

if (!clientId || !clientSecret) {
  console.error('Set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET');
  process.exit(1);
}

const server = http.createServer(async (req, res) => {
  const send = (status, headers, body) => {
    res.writeHead(status, headers);
    res.end(body);
  };

  if (req.method === 'OPTIONS' && req.url === '/api/spotify/token') {
    const h = { ...corsHeaders() };
    delete h['Content-Type'];
    return send(204, h, '');
  }

  if (req.method !== 'POST' || req.url !== '/api/spotify/token') {
    return send(404, { 'Content-Type': 'text/plain' }, 'Not found');
  }

  let raw = '';
  for await (const chunk of req) raw += chunk;

  let body;
  try {
    body = JSON.parse(raw || '{}');
  } catch {
    return send(400, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }, JSON.stringify({ error: 'invalid_json' }));
  }

  const out = await spotifyTokenBackend({ clientId, clientSecret, redirectAllowlist }, body);
  return send(out.statusCode, out.headers, out.body);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(
      `Port ${PORT} is already in use (another spotify-proxy may be running).\n` +
        `  Fix: quit that process, or set SPOTIFY_PROXY_PORT=3848 in .env and update data-token-proxy to match.\n` +
        `  Find PID (macOS): lsof -i :${PORT}`,
    );
  } else {
    console.error(err);
  }
  process.exit(1);
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Spotify token proxy: http://127.0.0.1:${PORT}/api/spotify/token`);
});
