import { createClient } from "@supabase/supabase-js";

/*
  Requires a Supabase table — run this SQL in your Supabase dashboard:

  create table page_visits (
    id uuid default gen_random_uuid() primary key,
    page text not null,
    visited_at timestamptz default now() not null
  );
  alter table page_visits enable row level security;
  create policy "allow_insert" on page_visits for insert with check (true);
  create policy "allow_select" on page_visits for select using (true);
*/

const supabase = () => createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

const PAGE_LABELS = {
  'asoworkshop':          'ASO Workshop (original URL)',
  'asoworkshop-session1': 'Workshop · Session 1',
  'asoworkshop-session2': 'Workshop · Session 2',
};

const WORKSHOP_PAGES = ['asoworkshop', 'asoworkshop-session1', 'asoworkshop-session2'];

function formatRelative(dateStr, now) {
  if (!dateStr) return '—';
  const diff = now - new Date(dateStr);
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function formatDateTime(dateStr) {
  return new Date(dateStr).toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export async function GET() {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const { data, error } = await supabase()
    .from('page_visits')
    .select('page, visited_at')
    .order('visited_at', { ascending: false });

  const allVisits = data || [];

  const totals = {};
  const weekCounts = {};
  const lastSeen = {};

  allVisits.forEach(v => {
    totals[v.page] = (totals[v.page] || 0) + 1;
    if (new Date(v.visited_at) > sevenDaysAgo) {
      weekCounts[v.page] = (weekCounts[v.page] || 0) + 1;
    }
    if (!lastSeen[v.page]) lastSeen[v.page] = v.visited_at;
  });

  const statsCards = WORKSHOP_PAGES.map(page => {
    const label = PAGE_LABELS[page];
    const total = totals[page] || 0;
    const week = weekCounts[page] || 0;
    const last = formatRelative(lastSeen[page], now);
    return `
      <div class="stat-card">
        <div class="page-label">${label}</div>
        <div class="page-count">${total}</div>
        <div class="page-meta">${week} this week &middot; last ${last}</div>
      </div>`;
  }).join('');

  const recentRows = allVisits.slice(0, 50).map(v => `
    <tr>
      <td>${PAGE_LABELS[v.page] || v.page}</td>
      <td>${formatDateTime(v.visited_at)}</td>
      <td class="muted">${formatRelative(v.visited_at, now)}</td>
    </tr>`).join('');

  const totalAll = allVisits.length;
  const loadedAt = now.toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  const errorNote = error ? `<p style="color:#fb7185;font-size:10pt;margin-bottom:1rem;">⚠️ ${error.message}</p>` : '';

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <link rel="icon" href="/icon.png">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Visitors — Decode</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 11pt;
      line-height: 1.6;
      color: #e5e5e7;
      background: linear-gradient(180deg, #0a0a0f 0%, #111118 100%);
      min-height: 100vh;
      padding: 2rem;
    }
    .container { max-width: 720px; margin: 0 auto; }
    .header { padding: 2rem 0 1.5rem; }
    .badge {
      display: inline-block;
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      color: white;
      font-size: 10pt;
      font-weight: 600;
      padding: 0.4rem 1rem;
      border-radius: 20px;
      margin-bottom: 1rem;
      letter-spacing: 0.02em;
    }
    .title-row { display: flex; align-items: baseline; gap: 0.75rem; flex-wrap: wrap; margin-bottom: 0.75rem; }
    h1 { font-size: 28pt; font-weight: 700; color: #fff; letter-spacing: -0.03em; }
    .total-badge {
      background: rgba(255,255,255,0.07);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 8px;
      padding: 0.2rem 0.65rem;
      font-size: 10pt;
      color: #a1a1aa;
    }
    .meta-row { display: flex; align-items: center; gap: 0.75rem; }
    .loaded-at { font-size: 9.5pt; color: #52525b; }
    .refresh-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.35rem 0.85rem;
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 8px;
      color: #a1a1aa;
      font-size: 9.5pt;
      font-family: 'Inter', sans-serif;
      cursor: pointer;
      transition: background 0.2s, color 0.2s;
    }
    .refresh-btn:hover { background: rgba(255,255,255,0.12); color: #fff; }
    h2 {
      font-size: 12pt;
      font-weight: 600;
      color: #fff;
      margin-top: 2rem;
      margin-bottom: 0.75rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    h2::before {
      content: '';
      display: inline-block;
      width: 4px;
      height: 1.1em;
      background: linear-gradient(180deg, #6366f1 0%, #8b5cf6 100%);
      border-radius: 2px;
      flex-shrink: 0;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(195px, 1fr));
      gap: 1rem;
      margin-top: 0.25rem;
    }
    .stat-card {
      background: rgba(99,102,241,0.07);
      border: 1px solid rgba(99,102,241,0.2);
      border-radius: 16px;
      padding: 1.25rem;
    }
    .page-label { font-size: 9.5pt; color: #818cf8; margin-bottom: 0.5rem; font-weight: 500; }
    .page-count { font-size: 36pt; font-weight: 700; color: #fff; letter-spacing: -0.04em; line-height: 1; margin-bottom: 0.35rem; }
    .page-meta { font-size: 9pt; color: #52525b; }
    .visits-table { width: 100%; border-collapse: collapse; font-size: 10pt; margin-top: 0.25rem; }
    .visits-table th {
      text-align: left;
      padding: 0.5rem 0.75rem;
      border-bottom: 1px solid rgba(255,255,255,0.08);
      color: #6b7280;
      font-weight: 500;
      font-size: 9.5pt;
    }
    .visits-table td { padding: 0.5rem 0.75rem; border-bottom: 1px solid rgba(255,255,255,0.04); color: #c4c4cf; }
    .visits-table tr:last-child td { border-bottom: none; }
    .visits-table td.muted { color: #52525b; }
    .empty { font-size: 10pt; color: #52525b; padding: 1rem 0; }
    footer {
      margin-top: 3rem;
      padding-top: 1.5rem;
      border-top: 1px solid rgba(255,255,255,0.06);
      text-align: center;
      font-size: 10pt;
      color: #3f3f46;
    }
  </style>
</head>
<body>
<div class="container">
  <div class="header">
    <div class="badge">Decode Analytics</div>
    <div class="title-row">
      <h1>Visitors</h1>
      <span class="total-badge">${totalAll} total</span>
    </div>
    <div class="meta-row">
      <button class="refresh-btn" onclick="location.reload()">↺ Refresh</button>
      <span class="loaded-at">Updated ${loadedAt}</span>
    </div>
  </div>

  ${errorNote}

  <h2>Workshop Pages</h2>
  <div class="stats-grid">${statsCards}</div>

  <h2>Recent Visits</h2>
  ${allVisits.length > 0 ? `
  <table class="visits-table">
    <thead><tr><th>Page</th><th>Date &amp; Time</th><th>When</th></tr></thead>
    <tbody>${recentRows}</tbody>
  </table>` : '<p class="empty">No visits recorded yet. Make sure the page_visits table exists in Supabase.</p>'}

  <footer>Decode &middot; Visitor Analytics</footer>
</div>
</body>
</html>`;

  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
