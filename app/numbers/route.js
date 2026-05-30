import { createClient } from "@supabase/supabase-js";
import { escapeHtml, supabaseKey } from "@/lib/security";

const supabase = () => createClient(process.env.SUPABASE_URL, supabaseKey());

const PAGE_LABELS = {
  'decode': 'Kairo Decode',
};

const DECODE_PAGES = ['decode'];

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
  const sixtyDaysAgo = new Date(now - 60 * 24 * 60 * 60 * 1000);

  const [visitsRes, eventsRes, usageRes] = await Promise.all([
    supabase()
      .from('page_visits')
      .select('page, visited_at, device, country, referrer, initials')
      .in('page', DECODE_PAGES)
      .order('visited_at', { ascending: false }),
    supabase()
      .from('decode_events')
      .select('event_type, term, payload, initials, lang, created_at')
      .gte('created_at', sixtyDaysAgo.toISOString())
      .order('created_at', { ascending: false }),
    supabase()
      .from('decode_claude_usage')
      .select('purpose, model, input_tokens, output_tokens, cache_read_tokens, cost_usd, term, initials, lang, created_at')
      .gte('created_at', sixtyDaysAgo.toISOString())
      .order('created_at', { ascending: false }),
  ]);

  let { data, error } = visitsRes;
  if (error) {
    const fallback = await supabase()
      .from('page_visits')
      .select('page, visited_at, device, country, referrer')
      .in('page', DECODE_PAGES)
      .order('visited_at', { ascending: false });
    data = fallback.data;
    error = fallback.error;
  }

  const visits = data || [];
  const events = eventsRes.data || [];
  const usage = usageRes.data || [];

  // Aggregate stats per page
  const totals = {}, weekCounts = {}, lastSeen = {};
  const deviceCounts = { iphone: 0, ipad: 0, mac: 0, android: 0, 'android-tablet': 0, windows: 0, linux: 0, desktop: 0, mobile: 0, tablet: 0, unknown: 0 };
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
        <div class="page-label">${escapeHtml(label)}</div>
        <div class="page-count">${total}</div>
        <div class="page-meta">${week} this week · last ${escapeHtml(last)}</div>
      </div>`;
    }).join('');
  }

  // Device breakdown
  const DEVICE_META = {
    iphone:          { label: 'iPhone',         icon: '📱', color: '#818cf8' },
    ipad:            { label: 'iPad',            icon: '📲', color: '#fb923c' },
    mac:             { label: 'Mac',             icon: '🖥️', color: '#34d399' },
    android:         { label: 'Android',         icon: '📱', color: '#a78bfa' },
    'android-tablet':{ label: 'Android tablet', icon: '📲', color: '#f97316' },
    windows:         { label: 'Windows',         icon: '🖥️', color: '#22d3ee' },
    linux:           { label: 'Linux',           icon: '🖥️', color: '#86efac' },
    desktop:         { label: 'Desktop',         icon: '🖥️', color: '#34d399' },
    mobile:          { label: 'Mobile',          icon: '📱', color: '#818cf8' },
    tablet:          { label: 'Tablet',          icon: '📲', color: '#fb923c' },
    unknown:         { label: 'Unknown',         icon: '·',  color: '#3f3f46' },
  };
  const deviceTotal = Object.values(deviceCounts).reduce((a, b) => a + b, 0) || 1;
  const deviceBar = Object.keys(DEVICE_META)
    .filter(d => deviceCounts[d])
    .map(d => {
      const pct = Math.round(deviceCounts[d] / deviceTotal * 100);
      return `<div class="bar-seg" style="width:${pct}%;background:${DEVICE_META[d].color}" title="${DEVICE_META[d].label}: ${deviceCounts[d]}"></div>`;
    }).join('');

  const deviceLegend = Object.keys(DEVICE_META)
    .filter(d => deviceCounts[d])
    .map(d => {
      const pct = Math.round(deviceCounts[d] / deviceTotal * 100);
      const m = DEVICE_META[d];
      return `<span class="legend-item"><span class="legend-dot" style="background:${m.color}"></span>${m.icon} ${m.label} <strong>${pct}%</strong></span>`;
    }).join('');

  // Country breakdown (top 8)
  const topCountries = Object.entries(countryCounts)
    .sort(([,a],[,b]) => b - a).slice(0, 8)
    .map(([code, count]) => {
      const label = COUNTRY_NAMES[code] || code;
      const pct = Math.round(count / totalAll * 100);
      return `<div class="country-row">
        <span class="country-label">${escapeHtml(label)}</span>
        <div class="country-bar-wrap">
          <div class="country-bar" style="width:${Math.max(pct, 2)}%"></div>
        </div>
        <span class="country-count">${count}</span>
      </div>`;
    }).join('') || '<p class="empty">Country data will appear here once new visits are recorded.</p>';

  // Recent visits (last 60)
  const recentRows = visits.slice(0, 60).map(v => {
    const dm = DEVICE_META[v.device];
    const deviceIcon = dm?.icon || '·';
    const deviceLabel = dm?.label || v.device || '';
    const countryFlag = v.country ? (COUNTRY_NAMES[v.country]?.split(' ')[0] || v.country) : '';
    const safeInitials = typeof v.initials === 'string'
      ? v.initials.replace(/[^A-Za-z0-9]/g, '').slice(0, 3).toUpperCase()
      : '';
    const avatar = safeInitials
      ? `<span style="display:inline-flex;align-items:center;justify-content:center;width:18px;height:18px;border-radius:50%;border:1.5px solid rgba(99,102,241,0.7);color:rgba(99,102,241,0.9);font-size:6pt;font-weight:700;letter-spacing:0.03em;vertical-align:middle">${safeInitials}</span>`
      : '<span style="color:#3f3f46;font-size:9pt">—</span>';
    return `<tr>
      <td>${escapeHtml(PAGE_LABELS[v.page] || v.page)}</td>
      <td>${avatar}</td>
      <td>${deviceIcon} ${escapeHtml(deviceLabel)} ${escapeHtml(countryFlag)}</td>
      <td>${fmt(v.visited_at)}</td>
      <td class="muted">${rel(v.visited_at, now)}</td>
    </tr>`;
  }).join('');

  // === Engagement analytics: aggregate decode_events ===
  const termOpens = {};            // term → count
  const deepDiveRuns = {};         // term → count
  const customAsks = [];           // { term, question, initials, lang, at }
  const deepLinkHits = [];         // { term, found, at }

  events.forEach(e => {
    if (e.event_type === 'card_open' && e.term) termOpens[e.term] = (termOpens[e.term] || 0) + 1;
    else if (e.event_type === 'deep_dive_run' && e.term) deepDiveRuns[e.term] = (deepDiveRuns[e.term] || 0) + 1;
    else if (e.event_type === 'custom_ask') customAsks.push({ term: e.term, question: e.payload?.question || '', initials: e.initials, lang: e.lang, at: e.created_at });
    else if (e.event_type === 'deep_link_hit') deepLinkHits.push({ term: e.term, found: !!e.payload?.found, at: e.created_at });
  });

  const topOpens = Object.entries(termOpens).sort(([,a],[,b]) => b - a).slice(0, 10);
  const topDives = Object.entries(deepDiveRuns).sort(([,a],[,b]) => b - a).slice(0, 10);
  const maxOpens = topOpens[0]?.[1] || 1;
  const maxDives = topDives[0]?.[1] || 1;

  const termBars = (entries, max) => entries.length === 0
    ? '<p class="empty">No data yet.</p>'
    : entries.map(([term, count]) => `<div class="country-row">
        <span class="country-label" title="${escapeHtml(term)}">${escapeHtml(term)}</span>
        <div class="country-bar-wrap"><div class="country-bar" style="width:${Math.max(Math.round(count / max * 100), 2)}%"></div></div>
        <span class="country-count">${count}</span>
      </div>`).join('');

  const recentCustomAsks = customAsks.slice(0, 20).map(a => `
    <div class="qa-row">
      <div class="qa-meta">
        ${a.initials ? `<span class="qa-initials">${escapeHtml(a.initials)}</span>` : '<span class="qa-initials qa-anon">—</span>'}
        <span class="qa-term">${escapeHtml(a.term || '·')}</span>
        <span class="qa-when">${escapeHtml(rel(a.at, now))}</span>
      </div>
      <p class="qa-q">"${escapeHtml(a.question)}"</p>
    </div>
  `).join('') || '<p class="empty">No custom questions yet.</p>';

  // === Token spend: aggregate decode_claude_usage ===
  let costTotal = 0, costWeek = 0;
  let tokTotal = 0, tokWeek = 0;
  const costByPurpose = {};
  const costByUser = {};
  const callsByPurpose = {};
  usage.forEach(u => {
    const c = Number(u.cost_usd) || 0;
    const t = (u.input_tokens || 0) + (u.output_tokens || 0);
    costTotal += c; tokTotal += t;
    if (new Date(u.created_at) > sevenDaysAgo) { costWeek += c; tokWeek += t; }
    const p = u.purpose || 'unknown';
    costByPurpose[p] = (costByPurpose[p] || 0) + c;
    callsByPurpose[p] = (callsByPurpose[p] || 0) + 1;
    const who = u.initials || '—';
    costByUser[who] = (costByUser[who] || 0) + c;
  });

  const fmtCost = (n) => n >= 1 ? `$${n.toFixed(2)}` : n >= 0.01 ? `$${n.toFixed(3)}` : `$${n.toFixed(4)}`;
  const fmtTokens = (n) => n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);

  const purposeRows = Object.entries(costByPurpose).sort(([,a],[,b]) => b - a).map(([purpose, cost]) => {
    const pct = costTotal > 0 ? Math.round(cost / costTotal * 100) : 0;
    return `<div class="country-row">
      <span class="country-label" title="${escapeHtml(purpose)}">${escapeHtml(purpose)} <span class="muted-inline">${callsByPurpose[purpose]} calls</span></span>
      <div class="country-bar-wrap"><div class="country-bar" style="width:${Math.max(pct, 2)}%"></div></div>
      <span class="country-count">${fmtCost(cost)}</span>
    </div>`;
  }).join('') || '<p class="empty">No Claude calls logged yet.</p>';

  const userRows = Object.entries(costByUser).sort(([,a],[,b]) => b - a).slice(0, 10).map(([who, cost]) => {
    const pct = costTotal > 0 ? Math.round(cost / costTotal * 100) : 0;
    return `<div class="country-row">
      <span class="country-label">${escapeHtml(who)}</span>
      <div class="country-bar-wrap"><div class="country-bar" style="width:${Math.max(pct, 2)}%"></div></div>
      <span class="country-count">${fmtCost(cost)}</span>
    </div>`;
  }).join('') || '<p class="empty">No data yet.</p>';

  const recentDeepLinks = deepLinkHits.slice(0, 10).map(h => `<tr>
    <td>${escapeHtml(h.term || '·')}</td>
    <td>${h.found ? '<span style="color:#34d399">✓</span>' : '<span style="color:#fb7185">✗</span>'}</td>
    <td class="muted">${escapeHtml(rel(h.at, now))}</td>
  </tr>`).join('');

  const loadedAt = now.toLocaleString('en-GB', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' });
  const errorNote = error ? `<p style="color:#fb7185;font-size:10pt;margin-bottom:1rem">⚠️ ${escapeHtml(error.message)}</p>` : '';

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
    .stats-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(185px,1fr));gap:1rem}
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
    .muted-inline{color:#52525b;font-size:8.5pt;margin-left:.35rem}
    .qa-row{padding:.65rem 0;border-bottom:1px solid rgba(255,255,255,.04)}
    .qa-row:last-child{border-bottom:none}
    .qa-meta{display:flex;align-items:center;gap:.6rem;margin-bottom:.25rem;font-size:9pt}
    .qa-initials{display:inline-flex;align-items:center;justify-content:center;min-width:22px;height:18px;border-radius:9px;border:1.5px solid rgba(99,102,241,0.7);color:rgba(99,102,241,0.9);font-size:7.5pt;font-weight:700;padding:0 4px;letter-spacing:.03em}
    .qa-initials.qa-anon{border-color:rgba(255,255,255,.12);color:#52525b}
    .qa-term{color:#a1a1aa;font-weight:500}
    .qa-when{color:#52525b;margin-left:auto;font-size:8.5pt}
    .qa-q{font-size:10pt;color:#c4c4cf;line-height:1.45;font-style:italic;padding-left:.2rem}
    .cost-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:1rem}
    .cost-card{background:rgba(20,184,166,.07);border:1px solid rgba(20,184,166,.2);border-radius:14px;padding:1rem 1.1rem}
    .cost-label{font-size:9pt;color:rgba(94,234,212,1);margin-bottom:.35rem;font-weight:500}
    .cost-value{font-size:22pt;font-weight:700;color:#fff;letter-spacing:-.03em;line-height:1;margin-bottom:.25rem}
    .cost-sub{font-size:8.5pt;color:#52525b}
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

  <h2>Engagement</h2>
  <div class="two-col">
    <div class="panel">
      <div class="panel-title">Most opened terms</div>
      ${termBars(topOpens, maxOpens)}
    </div>
    <div class="panel">
      <div class="panel-title">Most-run deep dives</div>
      ${termBars(topDives, maxDives)}
    </div>
  </div>

  <h2>Token spend</h2>
  <div class="cost-grid">
    <div class="cost-card">
      <div class="cost-label">Total</div>
      <div class="cost-value">${fmtCost(costTotal)}</div>
      <div class="cost-sub">${fmtTokens(tokTotal)} tokens · ${usage.length} calls</div>
    </div>
    <div class="cost-card">
      <div class="cost-label">This week</div>
      <div class="cost-value">${fmtCost(costWeek)}</div>
      <div class="cost-sub">${fmtTokens(tokWeek)} tokens</div>
    </div>
  </div>
  <div class="two-col" style="margin-top:1rem">
    <div class="panel">
      <div class="panel-title">Spend by purpose</div>
      ${purposeRows}
    </div>
    <div class="panel">
      <div class="panel-title">Spend by user</div>
      ${userRows}
    </div>
  </div>

  <h2>Custom questions</h2>
  <div class="panel">
    ${recentCustomAsks}
  </div>

  ${deepLinkHits.length > 0 ? `
  <h2>Deep-link hits</h2>
  <table>
    <thead><tr><th>Term</th><th>Found</th><th>When</th></tr></thead>
    <tbody>${recentDeepLinks}</tbody>
  </table>` : ''}

  <h2>Recent Visits</h2>
  ${visits.length > 0 ? `
  <table>
    <thead><tr><th>Page</th><th>Who</th><th>Device · Country</th><th>Date</th><th>When</th></tr></thead>
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
