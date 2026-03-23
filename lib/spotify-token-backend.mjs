const TOKEN_URL = 'https://accounts.spotify.com/api/token';

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };
}

function parseAllowlist(raw) {
  if (!raw || !String(raw).trim()) return null;
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * @param {object} opts
 * @param {string} opts.clientId
 * @param {string} opts.clientSecret
 * @param {string | undefined} opts.redirectAllowlist - comma-separated exact redirect_uri values, or omit to allow any
 * @param {object} body - { grant: 'code'|'refresh', code?, redirect_uri?, refresh_token? }
 */
export async function spotifyTokenBackend(opts, body) {
  const { clientId, clientSecret, redirectAllowlist } = opts;
  if (!clientId || !clientSecret) {
    return { statusCode: 500, headers: corsHeaders(), body: JSON.stringify({ error: 'server_missing_spotify_credentials' }) };
  }

  const allow = parseAllowlist(redirectAllowlist);
  if (body?.grant === 'code' && allow?.length && !allow.includes(body.redirect_uri)) {
    return { statusCode: 403, headers: corsHeaders(), body: JSON.stringify({ error: 'redirect_uri_not_allowed' }) };
  }

  const params = new URLSearchParams();
  params.set('client_id', clientId);
  params.set('client_secret', clientSecret);

  if (body?.grant === 'code') {
    if (!body.code || !body.redirect_uri) {
      return { statusCode: 400, headers: corsHeaders(), body: JSON.stringify({ error: 'code_and_redirect_uri_required' }) };
    }
    params.set('grant_type', 'authorization_code');
    params.set('code', body.code);
    params.set('redirect_uri', body.redirect_uri);
  } else if (body?.grant === 'refresh') {
    if (!body.refresh_token) {
      return { statusCode: 400, headers: corsHeaders(), body: JSON.stringify({ error: 'refresh_token_required' }) };
    }
    params.set('grant_type', 'refresh_token');
    params.set('refresh_token', body.refresh_token);
  } else {
    return { statusCode: 400, headers: corsHeaders(), body: JSON.stringify({ error: 'grant_must_be_code_or_refresh' }) };
  }

  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params,
  });

  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = { error: 'invalid_spotify_response', raw: text.slice(0, 200) };
  }

  return {
    statusCode: res.status,
    headers: corsHeaders(),
    body: JSON.stringify(json),
  };
}

export { corsHeaders };
