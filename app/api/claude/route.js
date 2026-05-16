import { isSameOrigin } from '@/lib/security';

export const maxDuration = 60;

const ALLOWED_MODELS = new Set([
  'claude-haiku-4-5-20251001',
  'claude-sonnet-4-6',
]);
const MAX_TOKENS_CAP = 4000;
const MAX_BODY_BYTES = 200 * 1024;

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

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify(body),
  });

  if (body.stream) {
    return new Response(res.body, {
      status: res.status,
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'X-Accel-Buffering': 'no',
      },
    });
  }

  const data = await res.json();
  return Response.json(data, { status: res.status });
}
