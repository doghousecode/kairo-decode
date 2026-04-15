import { createClient } from "@supabase/supabase-js";

const supabase = () => createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export async function POST(request) {
  try {
    const { page } = await request.json();
    if (page) await supabase().from('page_visits').insert({ page });
  } catch {}
  return Response.json({ ok: true });
}
