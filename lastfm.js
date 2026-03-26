/**
 * Last.fm "now playing" widget (no Premium required).
 *
 * Set on #spotify-widget (or any element with the right data attrs):
 *   data-lastfm-user="YOUR_LASTFM_USERNAME"
 *   data-lastfm-key="YOUR_LASTFM_API_KEY"
 */

const API = 'https://ws.audioscrobbler.com/2.0/';
const POLL_MS = 15_000;

function getWidget() {
  return document.getElementById('spotify-widget');
}

function getConfig() {
  const el = getWidget();
  if (!el) return null;
  const user = el.dataset.lastfmUser?.trim();
  const key = el.dataset.lastfmKey?.trim();
  if (!user || !key) return null;
  return { user, key };
}

function escapeHtml(s) {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

function renderPlaying(track, isNowPlaying) {
  const w = getWidget();
  if (!w) return;

  const img = track.image?.find((i) => i.size === 'medium')?.['#text']
    || track.image?.find((i) => i.size === 'large')?.['#text']
    || '';
  const title = track.name || 'Unknown track';
  const artist = track.artist?.['#text'] || track.artist?.name || 'Unknown artist';
  const href = track.url || '#';

  w.innerHTML = `
    <div class="spotify-now__inner spotify-now--playing ${isNowPlaying ? 'is-playing' : ''}">
      ${img ? `<img class="spotify-now__art" src="${img}" width="48" height="48" alt="" loading="lazy">` : '<div class="spotify-now__art spotify-now__art--placeholder"></div>'}
      <div class="spotify-now__text">
        <span class="spotify-now__label">${isNowPlaying ? 'Vibing now' : 'Last vibe'}</span>
        <a class="spotify-now__title" href="${href}" target="_blank" rel="noopener noreferrer">${escapeHtml(title)}</a>
        <span class="spotify-now__artist">${escapeHtml(artist)}</span>
      </div>
    </div>`;
}

function renderIdle(message) {
  const w = getWidget();
  if (!w) return;
  w.innerHTML = `
    <div class="spotify-now__inner spotify-now--idle">
      <span class="spotify-now__label">Listening</span>
      <span class="spotify-now__meta">${escapeHtml(message)}</span>
    </div>`;
}

async function fetchNowPlaying() {
  const cfg = getConfig();
  if (!cfg) {
    renderIdle('Add Last.fm user & API key to widget');
    return;
  }

  try {
    const url = `${API}?method=user.getrecenttracks&user=${encodeURIComponent(cfg.user)}&api_key=${encodeURIComponent(cfg.key)}&format=json&limit=1`;
    const res = await fetch(url);

    if (!res.ok) {
      renderIdle('Could not load listening data');
      return;
    }

    const data = await res.json();
    const tracks = data?.recenttracks?.track;

    if (!tracks || tracks.length === 0) {
      renderIdle('Nothing played yet');
      return;
    }

    const latest = tracks[0];
    const isNowPlaying = latest['@attr']?.nowplaying === 'true';
    renderPlaying(latest, isNowPlaying);
  } catch (e) {
    console.error('Last.fm fetch error:', e);
    renderIdle('Could not reach Last.fm');
  }
}

async function init() {
  await fetchNowPlaying();
  setInterval(fetchNowPlaying, POLL_MS);
}

init();
