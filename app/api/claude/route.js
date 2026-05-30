import { createClient } from '@supabase/supabase-js';
import { isSameOrigin, supabaseKey } from '@/lib/security';

/*
  Run this SQL in Supabase to create the usage table.
  RLS is enabled with NO policies — the route uses the service-role key
  (which bypasses RLS), and the anon key gets denied by default. Same
  posture as page_visits.

  CREATE TABLE IF NOT EXISTS decode_claude_usage (
    id bigserial PRIMARY KEY,
    purpose text,
    model text,
    input_tokens int DEFAULT 0,
    output_tokens int DEFAULT 0,
    cache_read_tokens int DEFAULT 0,
    cache_creation_tokens int DEFAULT 0,
    cost_usd numeric(10,6) DEFAULT 0,
    term text,
    initials text,
    lang text,
    created_at timestamptz DEFAULT now()
  );
  ALTER TABLE decode_claude_usage ENABLE ROW LEVEL SECURITY;
  CREATE INDEX IF NOT EXISTS decode_claude_usage_created_at_idx ON decode_claude_usage (created_at DESC);
  CREATE INDEX IF NOT EXISTS decode_claude_usage_purpose_idx ON decode_claude_usage (purpose);
*/

export const maxDuration = 60;

const ALLOWED_MODELS = new Set([
  'claude-haiku-4-5-20251001',
  'claude-sonnet-4-6',
]);
const MAX_TOKENS_CAP = 4000;
const MAX_BODY_BYTES = 200 * 1024;

// Anthropic published per-million-token prices, USD. Verify against
// https://www.anthropic.com/pricing — used only for cost estimates on /numbers.
const PRICING_USD_PER_MTOK = {
  'claude-haiku-4-5-20251001':  { input: 1.00, output: 5.00 },
  'claude-sonnet-4-6':           { input: 3.00, output: 15.00 },
};
const CACHE_READ_DISCOUNT = 0.10;     // cache reads typically 10% of input price
const CACHE_WRITE_PREMIUM = 1.25;     // cache writes typically 125% of input price

const ALLOWED_PURPOSES = new Set([
  'add-term',
  'card-smartlines',
  'card-deepdive-gen',
  'deep-dive-run',
  'custom-ask',
  'translate-batch',
  'unknown',
]);

const supabase = () => createClient(process.env.SUPABASE_URL, supabaseKey());

function costUSD(model, usage) {
  const price = PRICING_USD_PER_MTOK[model];
  if (!price || !usage) return 0;
  const inT = usage.input_tokens || 0;
  const outT = usage.output_tokens || 0;
  const cacheRead = usage.cache_read_input_tokens || 0;
  const cacheWrite = usage.cache_creation_input_tokens || 0;
  const cost =
    (inT * price.input +
     outT * price.output +
     cacheRead * price.input * CACHE_READ_DISCOUNT +
     cacheWrite * price.input * CACHE_WRITE_PREMIUM) / 1_000_000;
  return Math.round(cost * 1_000_000) / 1_000_000;
}

function clip(s, n) {
  if (typeof s !== 'string') return null;
  return s.length > n ? s.slice(0, n) : s;
}

function sanitiseInitials(raw) {
  if (typeof raw !== 'string') return null;
  const clean = raw.replace(/[^A-Za-z0-9]/g, '').slice(0, 3).toUpperCase();
  return clean || null;
}

async function logUsage({ purpose, model, usage, term, initials, lang }) {
  if (!usage) return;
  try {
    await supabase().from('decode_claude_usage').insert({
      purpose: ALLOWED_PURPOSES.has(purpose) ? purpose : 'unknown',
      model,
      input_tokens: usage.input_tokens || 0,
      output_tokens: usage.output_tokens || 0,
      cache_read_tokens: usage.cache_read_input_tokens || 0,
      cache_creation_tokens: usage.cache_creation_input_tokens || 0,
      cost_usd: costUSD(model, usage),
      term: clip(term, 120),
      initials: sanitiseInitials(initials),
      lang: clip(lang, 8),
    });
  } catch {}
}

// Parse the SSE stream that Anthropic returns and pull the final usage object
// out of message_start (input/cache tokens) + message_delta (output tokens).
async function parseStreamUsage(stream) {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buf = '';
  const usage = { input_tokens: 0, output_tokens: 0, cache_read_input_tokens: 0, cache_creation_input_tokens: 0 };
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });
      let nl;
      while ((nl = buf.indexOf('\n')) !== -1) {
        const line = buf.slice(0, nl).trim();
        buf = buf.slice(nl + 1);
        if (!line.startsWith('data: ')) continue;
        const data = line.slice(6).trim();
        if (!data || data === '[DONE]') continue;
        try {
          const evt = JSON.parse(data);
          if (evt.type === 'message_start' && evt.message?.usage) {
            const u = evt.message.usage;
            usage.input_tokens = u.input_tokens || 0;
            usage.cache_read_input_tokens = u.cache_read_input_tokens || 0;
            usage.cache_creation_input_tokens = u.cache_creation_input_tokens || 0;
            usage.output_tokens = u.output_tokens || 0;
          } else if (evt.type === 'message_delta' && evt.usage) {
            // message_delta carries the running output total — overwrites the
            // small placeholder from message_start.
            if (typeof evt.usage.output_tokens === 'number') usage.output_tokens = evt.usage.output_tokens;
          }
        } catch {}
      }
    }
  } catch {}
  return usage;
}

export async function POST(request) {
  if (!isSameOrigin(request)) {
    return Response.json({ error: 'forbidden' }, { status: 403 });
  }

  const raw = await request.text();
  if (raw.length > MAX_BODY_BYTES) {
    return Response.json({ error: 'payload too large' }, { status: 413 });
  }

  let body;
  try { body = JSON.parse(raw); }
  catch { return Response.json({ error: 'bad json' }, { status: 400 }); }

  if (!ALLOWED_MODELS.has(body.model)) {
    return Response.json({ error: 'model not allowed' }, { status: 400 });
  }
  if (typeof body.max_tokens !== 'number' || body.max_tokens < 1 || body.max_tokens > MAX_TOKENS_CAP) {
    return Response.json({ error: 'max_tokens out of range' }, { status: 400 });
  }

  // Pull our own bookkeeping fields out before forwarding to Anthropic.
  const { purpose, term, initials, lang, ...upstreamBody } = body;
  const meta = { purpose, term, initials, lang, model: body.model };

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify(upstreamBody),
  });

  if (upstreamBody.stream) {
    // Tee the body so the client gets bytes immediately while we accumulate
    // a second copy server-side to parse the final usage out of the SSE.
    const [toClient, toMeter] = res.body.tee();
    parseStreamUsage(toMeter).then(usage => logUsage({ ...meta, usage }));
    return new Response(toClient, {
      status: res.status,
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'X-Accel-Buffering': 'no',
      },
    });
  }

  const data = await res.json();
  if (res.ok && data?.usage) logUsage({ ...meta, usage: data.usage });
  return Response.json(data, { status: res.status });
}
