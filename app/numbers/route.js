import { createClient } from "@supabase/supabase-js";

const supabase = () => createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

const PAGE_LABELS = {
  'decode':               'Kairo Decode',
  'decode-gallery':       'Gallery · Session 1',
  'asoworkshop-session1': 'Workshop · Session 1',
  'asoworkshop-session2': 'Workshop · Session 2',
  'asoworkshop':          'Workshop (original URL)',
};

const DECODE_PAGES    = ['decode'];
const WORKSHOP_PAGES  = ['asoworkshop-session1', 'decode-gallery', 'asoworkshop-session2'];
const WORKSHOP_LEGACY = ['asoworkshop'];

const COUNTRY_NAMES = {
  GB:'🇬🇧 UK', US:'🇺🇸 US', AU:'🇦🇺 Australia', CA:'🇨🇦 Canada', DE:'🇩🇪 Germany',
  FR:'🇫🇷 France', NL:'🇳🇱 Netherlands', SG:'🇸🇬 Singapore', IN:'🇮🇳 India', IE:'🇮🇪 Ireland',
  NZ:'🇳🇿 New Zealand', JP:'🇯🇵 Japan', ES:'🇪🇸 Spain', IT:'🇮🇹 Italy', SE:'🇸🇪 Sweden',
};

function rel(dateStr, now) {
  if (!dateStr) return '—';
  const m = Math.floor((now - new Date(dateStr)) / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function fmt(dateStr) {
  return new Date(dateStr).toLocaleString('en-GB', {
    day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit',
  });
}

export async function GET() {
  const now = new Date();
  const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);

  const { data, error } = await supabase()
    .from('page_visits')
    .select('page, visited_at, device, country, referrer')
    .order('visited_at', { ascending: false });

  const visits = data || [];

  // Aggregate stats per page
  const totals = {}, weekCounts = {}, lastSeen = {};
  const deviceCounts = { mobile: 0, desktop: 0, tablet: 0, unknown: 0 };
  const countryCounts = {};

  visits.forEach(v => {
    totals[v.page] = (totals[v.page] || 0) + 1;
    if (new Date(v.visited_at) > sevenDaysAgo) weekCounts[v.page] = (weekCounts[v.page] || 0) + 1;
    if (!lastSeen[v.page]) lastSeen[v.page] = v.visited_at;
    const d = v.device || 'unknown';
    deviceCounts[d] = (deviceCounts[d] || 0) + 1;
    if (v.country) countryCounts[v.country] = (countryCounts[v.country] || 0) + 1;
  });

  const totalAll = visits.length;
  const thisWeekAll = visits.filter(v => new Date(v.visited_at) > sevenDaysAgo).length;

  function statCards(pages) {
    return pages.map(page => {
      const label = PAGE_LABELS[page] || page;
      const total = totals[page] || 0;
      const week = weekCounts[page] || 0;
      const last = rel(lastSeen[page], now);
      return `<div class="stat-card">
        <div class="page-label">${label}</div>
        <div class="page-count">${total}</div>
        <div class="page-meta">${week} this week · last ${last}</div>
      </div>`;
    }).join('');
  }

  // Device breakdown
  const deviceTotal = Object.values(deviceCounts).reduce((a, b) => a + b, 0) || 1;
  const deviceBar = ['mobile', 'desktop', 'tablet']
    .filter(d => deviceCounts[d])
    .map(d => {
      const pct = Math.round(deviceCounts[d] / deviceTotal * 100);
      const colors = { mobile: '#818cf8', desktop: '#34d399', tablet: '#fb923c' };
      return `<div class="bar-seg" style="width:${pct}%;background:${colors[d]}" title="${d}: ${deviceCounts[d]}"></div>`;
    }).join('');

  const deviceLegend = ['mobile', 'desktop', 'tablet']
    .filter(d => deviceCounts[d])
    .map(d => {
      const pct = Math.round(deviceCounts[d] / deviceTotal * 100);
      const icons = { mobile: '📱', desktop: '🖥️', tablet: '📲' };
      return `<span class="legend-item"><span class="legend-dot" style="background:${({mobile:'#818cf8',desktop:'#34d399',tablet:'#fb923c'})[d]}"></span>${icons[d]} ${d} <strong>${pct}%</strong></span>`;
    }).join('');

  // Country breakdown (top 8)
  const topCountries = Object.entries(countryCounts)
    .sort(([,a],[,b]) => b - a).slice(0, 8)
    .map(([code, count]) => {
      const label = COUNTRY_NAMES[code] || code;
      const pct = Math.round(count / totalAll * 100);
      return `<div class="country-row">
        <span class="country-label">${label}</span>
        <div class="country-bar-wrap">
          <div class="country-bar" style="width:${Math.max(pct, 2)}%"></div>
        </div>
        <span class="country-count">${count}</span>
      </div>`;
    }).join('') || '<p class="empty">Country data will appear here once new visits are recorded.</p>';

  // Recent visits (last 60)
  const recentRows = visits.slice(0, 60).map(v => {
    const deviceIcon = ({ mobile: '📱', desktop: '🖥️', tablet: '📲' })[v.device] || '·';
    const countryFlag = v.country ? (COUNTRY_NAMES[v.country]?.split(' ')[0] || v.country) : '';
    return `<tr>
      <td>${PAGE_LABELS[v.page] || v.page}</td>
      <td>${deviceIcon} ${countryFlag}</td>
      <td>${fmt(v.visited_at)}</td>
      <td class="muted">${rel(v.visited_at, now)}</td>
    </tr>`;
  }).join('');

  const loadedAt = now.toLocaleString('en-GB', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' });
  const errorNote = error ? `<p style="color:#fb7185;font-size:10pt;margin-bottom:1rem">⚠️ ${error.message}</p>` : '';

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <link rel="icon" href="/icon.png">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Numbers — Decode</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:'Inter',-apple-system,sans-serif;font-size:11pt;line-height:1.6;color:#e5e5e7;background:linear-gradient(180deg,#0a0a0f 0%,#111118 100%);min-height:100vh;padding:2rem}
    .container{max-width:760px;margin:0 auto}
    .badge{display:inline-block;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;font-size:10pt;font-weight:600;padding:.4rem 1rem;border-radius:20px;margin-bottom:1rem;letter-spacing:.02em}
    .title-row{display:flex;align-items:baseline;gap:.75rem;flex-wrap:wrap;margin-bottom:.5rem}
    h1{font-size:28pt;font-weight:700;color:#fff;letter-spacing:-.03em}
    .total-badge{background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.1);border-radius:8px;padding:.2rem .65rem;font-size:10pt;color:#a1a1aa}
    .meta-row{display:flex;align-items:center;gap:.75rem;margin-bottom:2rem}
    .loaded-at{font-size:9.5pt;color:#52525b}
    .refresh-btn{display:inline-flex;align-items:center;gap:.35rem;padding:.35rem .85rem;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-radius:8px;color:#a1a1aa;font-size:9.5pt;font-family:'Inter',sans-serif;cursor:pointer;transition:background .2s,color .2s}
    .refresh-btn:hover{background:rgba(255,255,255,.12);color:#fff}
    h2{font-size:12pt;font-weight:600;color:#fff;margin-top:2rem;margin-bottom:.75rem;display:flex;align-items:center;gap:.5rem}
    h2::before{content:'';display:inline-block;width:4px;height:1.1em;background:linear-gradient(180deg,#6366f1,#8b5cf6);border-radius:2px;flex-shrink:0}
    .stats-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(185px,1fr));gap:1rem}
    .stats-grid-2{display:grid;grid-template-columns:repeat(2,1fr);gap:1rem}
    .stat-card{background:rgba(99,102,241,.07);border:1px solid rgba(99,102,241,.2);border-radius:16px;padding:1.25rem}
    .page-label{font-size:9.5pt;color:#818cf8;margin-bottom:.5rem;font-weight:500}
    .page-count{font-size:34pt;font-weight:700;color:#fff;letter-spacing:-.04em;line-height:1;margin-bottom:.3rem}
    .page-meta{font-size:9pt;color:#52525b}
    .two-col{display:grid;grid-template-columns:1fr 1fr;gap:1.5rem;margin-top:.25rem}
    @media(max-width:560px){.two-col{grid-template-columns:1fr}}
    .panel{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.07);border-radius:14px;padding:1.25rem}
    .panel-title{font-size:9.5pt;font-weight:600;color:#71717a;letter-spacing:.05em;text-transform:uppercase;margin-bottom:.85rem}
    .bar-wrap{height:10px;border-radius:6px;background:rgba(255,255,255,.06);overflow:hidden;display:flex;margin-bottom:.75rem}
    .bar-seg{height:100%;transition:width .3s}
    .legend-item{display:inline-flex;align-items:center;gap:.35rem;font-size:9.5pt;color:#a1a1aa;margin-right:1rem}
    .legend-dot{width:8px;height:8px;border-radius:50%;display:inline-block}
    .country-row{display:flex;align-items:center;gap:.65rem;margin-bottom:.5rem}
    .country-label{font-size:9.5pt;color:#c4c4cf;width:130px;flex-shrink:0}
    .country-bar-wrap{flex:1;height:7px;background:rgba(255,255,255,.06);border-radius:4px;overflow:hidden}
    .country-bar{height:100%;background:linear-gradient(90deg,#6366f1,#8b5cf6);border-radius:4px}
    .country-count{font-size:9pt;color:#52525b;width:2.5rem;text-align:right;flex-shrink:0}
    table{width:100%;border-collapse:collapse;font-size:10pt;margin-top:.25rem}
    th{text-align:left;padding:.5rem .6rem;border-bottom:1px solid rgba(255,255,255,.08);color:#6b7280;font-weight:500;font-size:9.5pt}
    td{padding:.45rem .6rem;border-bottom:1px solid rgba(255,255,255,.04);color:#c4c4cf}
    tr:last-child td{border-bottom:none}
    td.muted{color:#52525b}
    .empty{font-size:10pt;color:#52525b;padding:.5rem 0}
    footer{margin-top:3rem;padding-top:1.5rem;border-top:1px solid rgba(255,255,255,.06);text-align:center;font-size:10pt;color:#3f3f46}
  </style>
</head>
<body>
<div class="container">
  <div>
    <div class="badge">Decode Analytics</div>
    <div class="title-row">
      <h1>Numbers</h1>
      <span class="total-badge">${totalAll} total · ${thisWeekAll} this week</span>
    </div>
    <div class="meta-row">
      <button class="refresh-btn" onclick="location.reload()">↺ Refresh</button>
      <span class="loaded-at">Updated ${loadedAt}</span>
    </div>
  </div>

  ${errorNote}

  <h2>Decode</h2>
  <div class="stats-grid">${statCards(DECODE_PAGES)}</div>

  <h2>Workshop</h2>
  <div class="stats-grid-2">${statCards(WORKSHOP_PAGES)}</div>
  <div class="stats-grid" style="margin-top:1rem">${statCards(WORKSHOP_LEGACY)}</div>

  <h2>Breakdown</h2>
  <div class="two-col">
    <div class="panel">
      <div class="panel-title">Device</div>
      <div class="bar-wrap">${deviceBar || '<div class="bar-seg" style="width:100%;background:rgba(255,255,255,.08)"></div>'}</div>
      <div>${deviceLegend || '<span class="empty">No data yet</span>'}</div>
    </div>
    <div class="panel">
      <div class="panel-title">Country</div>
      ${topCountries}
    </div>
  </div>

  <h2>Recent Visits</h2>
  ${visits.length > 0 ? `
  <table>
    <thead><tr><th>Page</th><th>Device · Country</th><th>Date</th><th>When</th></tr></thead>
    <tbody>${recentRows}</tbody>
  </table>` : '<p class="empty">No visits recorded yet.</p>'}

  <footer>Decode · Analytics</footer>
</div>
</body>
</html>`;

  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
