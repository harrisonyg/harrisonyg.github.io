/**
 * Spotify “now playing” (Web API).
 *
 * Never put your Client Secret in this file or in HTML — it would be public.
 *
 * Two modes:
 * 1) PKCE (default): only data-client-id on #spotify-widget. No secret; works on static GitHub Pages.
 * 2) Client secret: run a small token proxy (see server/spotify-proxy.mjs or Netlify function).
 *    Set data-token-proxy to your proxy URL (e.g. http://127.0.0.1:3847/api/spotify/token or
 *    https://your-site.netlify.app/.netlify/functions/spotify-token).
 *
 * Spotify app: add Redirect URI = exact URL of this page. Dashboard: https://developer.spotify.com/dashboard
 */

const AUTH = 'https://accounts.spotify.com/authorize';
const TOKEN = 'https://accounts.spotify.com/api/token';
const API = 'https://api.spotify.com/v1/me/player/currently-playing';
const SCOPES = ['user-read-currently-playing', 'user-read-playback-state'].join(' ');

const LS = {
  access: 'spotify_access_token',
  refresh: 'spotify_refresh_token',
  expires: 'spotify_token_expires_at',
};
const SS_VERIFIER = 'spotify_pkce_verifier';
const SS_AUTH_ERR = 'spotify_auth_error';

function b64url(buf) {
  const u8 = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  const bin = String.fromCharCode(...u8);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function sha256b64url(plain) {
  const data = new TextEncoder().encode(plain);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return b64url(hash);
}

function randomVerifier() {
  const a = new Uint8Array(32);
  crypto.getRandomValues(a);
  return b64url(a);
}

function getWidget() {
  return document.getElementById('spotify-widget');
}

/** Must match a Redirect URI in the Spotify app exactly (trailing slash and /index.html matter). Optional override: data-spotify-redirect-uri on #spotify-widget. */
function redirectUri() {
  const override = getWidget()?.dataset?.spotifyRedirectUri?.trim();
  if (override) return override;
  return `${location.origin}${location.pathname}`;
}

function setAuthError(msg) {
  if (msg) sessionStorage.setItem(SS_AUTH_ERR, msg);
  else sessionStorage.removeItem(SS_AUTH_ERR);
}

function readAuthError() {
  return sessionStorage.getItem(SS_AUTH_ERR) || '';
}

function getClientId() {
  const el = getWidget();
  const id = el?.dataset?.clientId?.trim();
  return id && id !== 'YOUR_SPOTIFY_CLIENT_ID' ? id : '';
}

/** When set, authorization uses confidential flow; token exchange goes through this URL (POST JSON). */
function getTokenProxy() {
  const u = getWidget()?.dataset?.tokenProxy?.trim();
  return u || '';
}

function usesTokenProxy() {
  return Boolean(getTokenProxy());
}

function stripAuthParamsFromUrl() {
  const url = new URL(location.href);
  url.searchParams.delete('code');
  url.searchParams.delete('state');
  url.searchParams.delete('error');
  history.replaceState({}, '', url.pathname + url.search + url.hash);
}

function setTokens(access, refresh, expiresInSec) {
  const expiresAt = Date.now() + (expiresInSec - 60) * 1000;
  localStorage.setItem(LS.access, access);
  if (refresh) localStorage.setItem(LS.refresh, refresh);
  localStorage.setItem(LS.expires, String(expiresAt));
}

function clearTokens() {
  [LS.access, LS.refresh, LS.expires].forEach((k) => localStorage.removeItem(k));
}

async function refreshViaProxy(refreshTok) {
  const proxy = getTokenProxy();
  const res = await fetch(proxy, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ grant: 'refresh', refresh_token: refreshTok }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.access_token) {
    clearTokens();
    return null;
  }
  setTokens(data.access_token, data.refresh_token || refreshTok, data.expires_in);
  return data.access_token;
}

async function refreshAccess() {
  const refresh = localStorage.getItem(LS.refresh);
  const clientId = getClientId();
  if (!refresh || !clientId) return null;

  if (usesTokenProxy()) {
    return refreshViaProxy(refresh);
  }

  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refresh,
    client_id: clientId,
  });

  const res = await fetch(TOKEN, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  if (!res.ok) {
    clearTokens();
    return null;
  }

  const data = await res.json();
  setTokens(data.access_token, data.refresh_token || refresh, data.expires_in);
  return data.access_token;
}

async function getValidAccessToken() {
  const clientId = getClientId();
  if (!clientId) return null;

  let access = localStorage.getItem(LS.access);
  const expires = Number(localStorage.getItem(LS.expires) || 0);

  if (access && Date.now() < expires) return access;

  access = await refreshAccess();
  return access;
}

function formatTokenError(data) {
  if (!data || typeof data !== 'object') return 'Token exchange failed';
  return [data.error_description, data.error].filter(Boolean).join(' — ') || 'Token exchange failed';
}

async function exchangeCodeViaProxy(code) {
  const proxy = getTokenProxy();
  const res = await fetch(proxy, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant: 'code',
      code,
      redirect_uri: redirectUri(),
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.access_token) {
    console.error('Spotify token exchange failed', data);
    setAuthError(`Sign-in failed: ${formatTokenError(data)}`);
    return;
  }
  setAuthError('');
  setTokens(data.access_token, data.refresh_token, data.expires_in);
}

async function exchangeCodePkce(code) {
  const clientId = getClientId();
  const verifier = sessionStorage.getItem(SS_VERIFIER);
  if (!clientId || !verifier) {
    setAuthError(
      'Sign-in was interrupted (PKCE data missing). Use the same browser tab, or add this exact page URL as a Redirect URI in Spotify.',
    );
    return;
  }

  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: redirectUri(),
    client_id: clientId,
    code_verifier: verifier,
  });

  const res = await fetch(TOKEN, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  sessionStorage.removeItem(SS_VERIFIER);

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    console.error('Spotify token exchange failed', data);
    setAuthError(`Sign-in failed: ${formatTokenError(data)}`);
    return;
  }

  const data = await res.json();
  setAuthError('');
  setTokens(data.access_token, data.refresh_token, data.expires_in);
}

async function exchangeCode(code) {
  try {
    if (usesTokenProxy()) {
      await exchangeCodeViaProxy(code);
    } else {
      await exchangeCodePkce(code);
    }
  } finally {
    stripAuthParamsFromUrl();
  }
}

async function startAuth() {
  const clientId = getClientId();
  if (!clientId) {
    alert('Add your Spotify Client ID to the spotify-widget data-client-id attribute.');
    return;
  }

  const state = randomVerifier();
  sessionStorage.setItem('spotify_oauth_state', state);

  const params = new URLSearchParams({
    client_id: clientId,
    response_type: 'code',
    redirect_uri: redirectUri(),
    scope: SCOPES,
    state,
  });

  if (!usesTokenProxy()) {
    const verifier = randomVerifier();
    const challenge = await sha256b64url(verifier);
    sessionStorage.setItem(SS_VERIFIER, verifier);
    params.set('code_challenge_method', 'S256');
    params.set('code_challenge', challenge);
  }

  location.href = `${AUTH}?${params}`;
}

function parseOAuthReturn() {
  const params = new URLSearchParams(location.search);
  const code = params.get('code');
  const state = params.get('state');
  const err = params.get('error');

  if (err) {
    console.error('Spotify auth error:', err);
    const desc = params.get('error_description');
    setAuthError(desc ? `Spotify: ${desc}` : `Spotify: ${err}`);
    stripAuthParamsFromUrl();
    return Promise.resolve();
  }

  if (!code || !state) return Promise.resolve();

  const expected = sessionStorage.getItem('spotify_oauth_state');
  sessionStorage.removeItem('spotify_oauth_state');
  if (expected && state !== expected) {
    console.error('Spotify OAuth state mismatch');
    setAuthError('Sign-in state mismatch — try Connect Spotify again.');
    stripAuthParamsFromUrl();
    return Promise.resolve();
  }

  return exchangeCode(code);
}

function renderIdle(message, opts = {}) {
  const w = getWidget();
  if (!w) return;
  const showConnect = opts.showConnect !== false && getClientId();
  w.innerHTML = `
    <div class="spotify-now__inner spotify-now--idle">
      <span class="spotify-now__label">Listening</span>
      <span class="spotify-now__meta">${escapeHtml(message)}</span>
      ${showConnect ? '<button type="button" class="spotify-now__btn" id="spotify-connect">Connect Spotify</button>' : ''}
    </div>`;
  const btn = document.getElementById('spotify-connect');
  if (btn) {
    btn.addEventListener('click', () => {
      setAuthError('');
      startAuth();
    });
  }
}

function renderPlaying(item, isPlaying) {
  const w = getWidget();
  if (!w) return;
  const img = item.album?.images?.[1]?.url || item.album?.images?.[0]?.url || '';
  const title = item.name || 'Unknown track';
  const artist = (item.artists || []).map((a) => a.name).join(', ') || 'Unknown artist';
  const href = item.external_urls?.spotify || '#';

  w.innerHTML = `
    <div class="spotify-now__inner spotify-now--playing ${isPlaying ? 'is-playing' : ''}">
      ${img ? `<img class="spotify-now__art" src="${img}" width="48" height="48" alt="" loading="lazy">` : '<div class="spotify-now__art spotify-now__art--placeholder"></div>'}
      <div class="spotify-now__text">
        <span class="spotify-now__label">${isPlaying ? 'Now playing' : 'Paused'}</span>
        <a class="spotify-now__title" href="${href}" target="_blank" rel="noopener noreferrer">${escapeHtml(title)}</a>
        <span class="spotify-now__artist">${escapeHtml(artist)}</span>
      </div>
      <button type="button" class="spotify-now__btn spotify-now__btn--ghost" id="spotify-disconnect" title="Disconnect">Disconnect</button>
    </div>`;
  document.getElementById('spotify-disconnect')?.addEventListener('click', () => {
    clearTokens();
    setAuthError('');
    renderIdle('Not connected', { showConnect: true });
  });
}

function escapeHtml(s) {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

let pollTimer = null;

async function fetchNowPlaying() {
  const token = await getValidAccessToken();
  if (!token) {
    const authErr = readAuthError();
    if (getClientId()) {
      renderIdle(authErr || 'Not connected — click below, then play music in Spotify.', { showConnect: true });
    } else renderIdle('Add Client ID in HTML to connect', { showConnect: false });
    return;
  }

  const res = await fetch(API, { headers: { Authorization: `Bearer ${token}` } });

  if (res.status === 401) {
    clearTokens();
    setAuthError('');
    renderIdle('Session expired — connect again', { showConnect: true });
    return;
  }

  if (res.status === 403) {
    renderPlaybackNotice(
      'Spotify won’t share playback here (often needs Premium or an active Spotify app / web player). Start playback there and refresh.',
    );
    return;
  }

  if (res.status === 204 || res.status === 200) {
    if (res.status === 204) {
      renderConnectedButIdle();
      return;
    }
    const data = await res.json();
    if (!data.item) {
      renderConnectedButIdle();
      return;
    }
    renderPlaying(data.item, data.is_playing);
    return;
  }

  renderIdle('Could not load playback', { showConnect: false });
}

function renderPlaybackNotice(msg) {
  const w = getWidget();
  if (!w) return;
  w.innerHTML = `
    <div class="spotify-now__inner spotify-now--idle">
      <span class="spotify-now__label">Spotify</span>
      <span class="spotify-now__meta">${escapeHtml(msg)}</span>
      <button type="button" class="spotify-now__btn spotify-now__btn--ghost" id="spotify-disconnect">Disconnect</button>
    </div>`;
  document.getElementById('spotify-disconnect')?.addEventListener('click', () => {
    clearTokens();
    setAuthError('');
    renderIdle('Not connected', { showConnect: true });
  });
}

function renderConnectedButIdle() {
  const w = getWidget();
  if (!w) return;
  w.innerHTML = `
    <div class="spotify-now__inner spotify-now--idle">
      <span class="spotify-now__label">Spotify</span>
      <span class="spotify-now__meta">Nothing playing right now</span>
      <button type="button" class="spotify-now__btn spotify-now__btn--ghost" id="spotify-disconnect">Disconnect</button>
    </div>`;
  document.getElementById('spotify-disconnect')?.addEventListener('click', () => {
    clearTokens();
    setAuthError('');
    renderIdle('Not connected', { showConnect: true });
  });
}

async function init() {
  await parseOAuthReturn();
  await fetchNowPlaying();
  if (pollTimer) clearInterval(pollTimer);
  pollTimer = setInterval(fetchNowPlaying, 15000);
}

init();
