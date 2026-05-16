import { createClient } from '@supabase/supabase-js';
import { isSameOrigin } from '@/lib/security';

/*
  Run this SQL in Supabase to add enrichment columns (safe to run on existing table):

  ALTER TABLE page_visits
    ADD COLUMN IF NOT EXISTS device text,
    ADD COLUMN IF NOT EXISTS country text,
    ADD COLUMN IF NOT EXISTS referrer text,
    ADD COLUMN IF NOT EXISTS initials text;

  -- This route uses the service-role key, so RLS bypass; drop the old permissive
  -- policies so the anon key can no longer read or write tracking data.
  drop policy if exists "allow_insert" on page_visits;
  drop policy if exists "allow_select" on page_visits;
*/

const supabase = () => createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

// Pages the client is allowed to record visits for. Anything else is dropped,
// which prevents a stored-XSS vector via the analytics dashboards.
const ALLOWED_PAGES = new Set([
  'decode',
  'decode-gallery',
  'asoworkshop',
  'asoworkshop-session1',
  'asoworkshop-session2',
]);

function getDevice(ua = '') {
  if (!ua) return null;
  if (/ipad/i.test(ua)) return 'ipad';
  if (/iphone|ipod/i.test(ua)) return 'iphone';
  if (/android/i.test(ua) && /mobile/i.test(ua)) return 'android';
  if (/android/i.test(ua)) return 'android-tablet';
  if (/macintosh|mac os x/i.test(ua)) return 'mac';
  if (/windows/i.test(ua)) return 'windows';
  if (/linux/i.test(ua)) return 'linux';
  return 'desktop';
}

function sanitiseInitials(raw) {
  if (typeof raw !== 'string') return null;
  const clean = raw.replace(/[^A-Za-z0-9]/g, '').slice(0, 3).toUpperCase();
  return clean || null;
}

export async function POST(request) {
  if (!isSameOrigin(request)) return Response.json({ ok: true });

  try {
    const { page, initials } = await request.json();
    if (!page || !ALLOWED_PAGES.has(page)) return Response.json({ ok: true });

    const ua = request.headers.get('user-agent') || '';
    const country = request.headers.get('x-vercel-ip-country') || null;
    const referrer = request.headers.get('referer') || null;
    const device = getDevice(ua);

    await supabase().from('page_visits').insert({
      page,
      device,
      country,
      referrer,
      initials: sanitiseInitials(initials),
    });
  } catch {}
  return Response.json({ ok: true });
}
