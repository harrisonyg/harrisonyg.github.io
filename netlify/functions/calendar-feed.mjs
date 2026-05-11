/**
 * Returns upcoming events from a Google Calendar (or any) iCal feed.
 * Set in Netlify: GOOGLE_ICAL_URL = secret iCal link from Google Calendar → Settings → Integrate calendar.
 * Never commit that URL to git — keep it in Netlify env only.
 */

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json',
  };
}

function unfoldIcs(ics) {
  return ics.replace(/\r\n/g, '\n').replace(/\n[\t ]/g, '');
}

function parseDtStart(line) {
  const m = line.match(/:(\S+)/);
  if (!m) return null;
  const v = m[1].trim();
  if (/^\d{8}$/.test(v)) {
    return Date.UTC(+v.slice(0, 4), +v.slice(4, 6) - 1, +v.slice(6, 8), 12, 0, 0);
  }
  const m2 = v.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(Z)?/);
  if (m2) {
    if (m2[7]) {
      return Date.UTC(+m2[1], +m2[2] - 1, +m2[3], +m2[4], +m2[5], +m2[6]);
    }
    return new Date(+m2[1], +m2[2] - 1, +m2[3], +m2[4], +m2[5], +m2[6]).getTime();
  }
  const t = Date.parse(v);
  return Number.isNaN(t) ? null : t;
}

function unescapeIcsText(s) {
  return s.replace(/\\n/g, '\n').replace(/\\,/g, ',').replace(/\\\\/g, '\\');
}

function parseUpcoming(ics, limit) {
  const text = unfoldIcs(ics);
  const now = Date.now() - 30 * 60 * 1000;
  const out = [];
  const re = /BEGIN:VEVENT[\s\S]*?END:VEVENT/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    const block = m[0];
    if (/STATUS:CANCELLED/i.test(block)) continue;
    const sum = block.match(/^SUMMARY[^:]*:(.+)$/im);
    let title = sum ? sum[1].trim() : '(Event)';
    title = unescapeIcsText(title);
    const dtLine = block.match(/^DTSTART[^\n\r]+/im);
    if (!dtLine) continue;
    const start = parseDtStart(dtLine[0]);
    if (start == null || Number.isNaN(start)) continue;
    out.push({ title, start });
  }
  out.sort((a, b) => a.start - b.start);
  return out
    .filter((e) => e.start >= now)
    .slice(0, limit)
    .map((e) => ({
      title: e.title,
      start: e.start,
      startLabel: new Date(e.start).toLocaleString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      }),
    }));
}

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    const h = { ...corsHeaders() };
    delete h['Content-Type'];
    return { statusCode: 204, headers: h, body: '' };
  }
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, headers: corsHeaders(), body: JSON.stringify({ error: 'method_not_allowed' }) };
  }

  const url = process.env.GOOGLE_ICAL_URL;
  if (!url || !String(url).trim()) {
    return {
      statusCode: 200,
      headers: corsHeaders(),
      body: JSON.stringify({ configured: false, events: [], message: 'Set GOOGLE_ICAL_URL in Netlify' }),
    };
  }

  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'UltimateMindSystem/1.0' } });
    if (!res.ok) {
      return {
        statusCode: 502,
        headers: corsHeaders(),
        body: JSON.stringify({ error: 'calendar_fetch_failed', status: res.status }),
      };
    }
    const ics = await res.text();
    const events = parseUpcoming(ics, 15);
    return { statusCode: 200, headers: corsHeaders(), body: JSON.stringify({ configured: true, events }) };
  } catch (e) {
    return {
      statusCode: 502,
      headers: corsHeaders(),
      body: JSON.stringify({ error: 'calendar_parse_or_fetch', detail: String(e?.message || e) }),
    };
  }
};
