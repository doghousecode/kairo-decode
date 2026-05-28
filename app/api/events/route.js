import { createClient } from '@supabase/supabase-js';
import { isSameOrigin, supabaseKey } from '@/lib/security';

/*
  Run this SQL in Supabase to create the events table:

  CREATE TABLE IF NOT EXISTS decode_events (
    id bigserial PRIMARY KEY,
    event_type text NOT NULL,
    term text,
    payload jsonb,
    initials text,
    lang text,
    created_at timestamptz DEFAULT now()
  );
  CREATE INDEX IF NOT EXISTS decode_events_created_at_idx ON decode_events (created_at DESC);
  CREATE INDEX IF NOT EXISTS decode_events_type_idx ON decode_events (event_type);
  CREATE INDEX IF NOT EXISTS decode_events_term_idx ON decode_events (term);
*/

const supabase = () => createClient(process.env.SUPABASE_URL, supabaseKey());

// Allowlist of event types so a hostile client can't poison the table with junk.
const ALLOWED_EVENTS = new Set([
  'card_open',
  'deep_dive_run',
  'custom_ask',
  'term_added',
  'deep_link_hit',
]);

const MAX_TERM_LEN = 120;
const MAX_QUESTION_LEN = 500;
const MAX_PAYLOAD_BYTES = 4 * 1024;

function sanitiseInitials(raw) {
  if (typeof raw !== 'string') return null;
  const clean = raw.replace(/[^A-Za-z0-9]/g, '').slice(0, 3).toUpperCase();
  return clean || null;
}

function clipString(s, n) {
  if (typeof s !== 'string') return null;
  return s.length > n ? s.slice(0, n) : s;
}

export async function POST(request) {
  if (!isSameOrigin(request)) return Response.json({ ok: true });

  try {
    const body = await request.json();
    if (!body.event_type || !ALLOWED_EVENTS.has(body.event_type)) {
      return Response.json({ ok: true });
    }

    const payload = body.payload && typeof body.payload === 'object' ? body.payload : null;
    let safePayload = null;
    if (payload) {
      const clipped = { ...payload };
      if (typeof clipped.question === 'string') clipped.question = clipString(clipped.question, MAX_QUESTION_LEN);
      if (typeof clipped.prompt === 'string') clipped.prompt = clipString(clipped.prompt, MAX_QUESTION_LEN);
      const json = JSON.stringify(clipped);
      if (json.length <= MAX_PAYLOAD_BYTES) safePayload = clipped;
    }

    await supabase().from('decode_events').insert({
      event_type: body.event_type,
      term: clipString(body.term, MAX_TERM_LEN),
      payload: safePayload,
      initials: sanitiseInitials(body.initials),
      lang: clipString(body.lang, 8),
    });
  } catch {}
  return Response.json({ ok: true });
}
