// Helpers shared by route handlers. Server-side only.

// Service-role key — bypasses RLS. Server-only. If this is ever unset, every
// Supabase-backed route will 500, which is the loud failure we want — the old
// anon key has no policies and can't read anything anyway.
export function supabaseKey() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY;
}

export function escapeHtml(input) {
  if (input === null || input === undefined) return '';
  return String(input)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// True when Origin or Referer matches the request's own host. Used to block
// cross-site POSTs to state-changing endpoints (CSRF defence + cheap proxy guard).
export function isSameOrigin(request) {
  const host = request.headers.get('host');
  if (!host) return false;
  const origin = request.headers.get('origin');
  if (origin) {
    try {
      if (new URL(origin).host === host) return true;
    } catch {}
    return false;
  }
  const referer = request.headers.get('referer');
  if (referer) {
    try {
      if (new URL(referer).host === host) return true;
    } catch {}
  }
  return false;
}

export function isAuthed(request) {
  return request.cookies?.get('kairo-auth')?.value === 'granted';
}

// Constant-time equality for short secrets. Avoids the obvious timing leak
// without needing a Node crypto import in the edge runtime.
export function timingSafeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
