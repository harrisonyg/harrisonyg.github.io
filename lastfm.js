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

function normalizeImageUrl(url) {
  if (!url) return '';
  if (url.startsWith('//')) return `https:${url}`;
  if (url.startsWith('http://')) return `https://${url.slice('http://'.length)}`;
  return url;
}

function pickCoverArt(track) {
  const bySize = new Map((track.image || []).map((i) => [i.size, i['#text']]));
  const candidate = bySize.get('extralarge')
    || bySize.get('large')
    || bySize.get('medium')
    || bySize.get('small')
    || '';
  return normalizeImageUrl(candidate);
}

function setAlbumGlow(imageUrl) {
  const w = getWidget();
  if (!w) return;
  if (!imageUrl) {
    w.style.setProperty('--album-glow', 'rgba(124, 92, 255, 0.35)');
    return;
  }

  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.referrerPolicy = 'no-referrer';
  img.src = imageUrl;

  img.onload = () => {
    try {
      const canvas = document.createElement('canvas');
      const size = 32;
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;

      ctx.drawImage(img, 0, 0, size, size);
      const data = ctx.getImageData(0, 0, size, size).data;
      let r = 0;
      let g = 0;
      let b = 0;
      let count = 0;

      for (let i = 0; i < data.length; i += 4) {
        const alpha = data[i + 3];
        if (alpha < 200) continue;
        r += data[i];
        g += data[i + 1];
        b += data[i + 2];
        count += 1;
      }

      if (!count) return;
      r = Math.round(r / count);
      g = Math.round(g / count);
      b = Math.round(b / count);
      w.style.setProperty('--album-glow', `rgba(${r}, ${g}, ${b}, 0.42)`);
    } catch (e) {
      // Tainted canvas (CORS) or browser limitations; keep fallback glow.
    }
  };
}

function renderPlaying(track, isNowPlaying) {
  const w = getWidget();
  if (!w) return;

  const img = pickCoverArt(track);
  const title = track.name || 'Unknown track';
  const artist = track.artist?.['#text'] || track.artist?.name || 'Unknown artist';
  const href = track.url || '#';
  setAlbumGlow(img);

  w.innerHTML = `
    <div class="spotify-now__inner spotify-now--playing ${isNowPlaying ? 'is-playing' : ''}">
      ${img ? `<img class="spotify-now__art" src="${img}" width="64" height="64" alt="" loading="lazy">` : '<div class="spotify-now__art spotify-now__art--placeholder"></div>'}
      <div class="spotify-now__text">
        <span class="spotify-now__label"><span class="spotify-now__pulse" aria-hidden="true"></span>${isNowPlaying ? 'Live — what I’m vibing to 🎧' : 'Last spin — still on my mind'}</span>
        <a class="spotify-now__title" href="${href}" target="_blank" rel="noopener noreferrer">${escapeHtml(title)}</a>
        <span class="spotify-now__artist">${escapeHtml(artist)}</span>
      </div>
    </div>`;
}

function renderIdle(message) {
  const w = getWidget();
  if (!w) return;
  w.style.setProperty('--album-glow', 'rgba(124, 92, 255, 0.35)');
  w.innerHTML = `
    <div class="spotify-now__inner spotify-now--idle">
      <span class="spotify-now__label"><span class="spotify-now__pulse" aria-hidden="true"></span>Live — what I’m vibing to 🎧</span>
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
