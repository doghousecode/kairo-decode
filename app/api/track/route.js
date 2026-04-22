import { createClient } from "@supabase/supabase-js";

/*
  Run this SQL in Supabase to add enrichment columns (safe to run on existing table):

  ALTER TABLE page_visits
    ADD COLUMN IF NOT EXISTS device text,
    ADD COLUMN IF NOT EXISTS country text,
    ADD COLUMN IF NOT EXISTS referrer text,
    ADD COLUMN IF NOT EXISTS initials text;
*/

const supabase = () => createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

function getDevice(ua = "") {
  if (!ua) return null;
  if (/tablet|ipad/i.test(ua)) return "tablet";
  if (/mobile|iphone|android|ipod/i.test(ua)) return "mobile";
  return "desktop";
}

export async function POST(request) {
  try {
    const { page, initials } = await request.json();
    if (!page) return Response.json({ ok: true });

    const ua = request.headers.get("user-agent") || "";
    const country = request.headers.get("x-vercel-ip-country") || null;
    const referrer = request.headers.get("referer") || null;
    const device = getDevice(ua);

    await supabase().from("page_visits").insert({ page, device, country, referrer, initials: initials || null });
  } catch {}
  return Response.json({ ok: true });
}
