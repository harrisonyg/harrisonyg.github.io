import { spotifyTokenBackend, corsHeaders } from '../../lib/spotify-token-backend.mjs';

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    const h = { ...corsHeaders() };
    delete h['Content-Type'];
    return { statusCode: 204, headers: h, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: corsHeaders(), body: JSON.stringify({ error: 'method_not_allowed' }) };
  }

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return { statusCode: 400, headers: corsHeaders(), body: JSON.stringify({ error: 'invalid_json' }) };
  }

  return spotifyTokenBackend(
    {
      clientId: process.env.SPOTIFY_CLIENT_ID,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
      redirectAllowlist: process.env.SPOTIFY_REDIRECT_ALLOWLIST,
    },
    body,
  );
};
