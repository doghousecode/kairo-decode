import { createClient } from '@supabase/supabase-js';
import { isSameOrigin, supabaseKey } from '@/lib/security';

/*
  Supabase setup (run once, then drop the old permissive policies):

  create table if not exists translations (
    term text not null,
    lang text not null,
    definition text,
    smart_lines jsonb,
    deep_dive jsonb,
    primary key (term, lang)
  );
  alter table translations enable row level security;

  -- No policies needed: this route uses the service-role key, which bypasses RLS.
  -- The anon key now has no access, which is what we want.
  drop policy if exists "allow_select" on translations;
  drop policy if exists "allow_insert" on translations;
  drop policy if exists "allow_update" on translations;
*/

const supabase = () => createClient(process.env.SUPABASE_URL, supabaseKey());

export async function GET(request) {
  const lang = new URL(request.url).searchParams.get('lang');
  if (!lang || lang === 'en') return Response.json({});

  const { data, error } = await supabase()
    .from('translations')
    .select('term, definition, smart_lines, deep_dive')
    .eq('lang', lang);

  if (error) return Response.json({}, { status: 500 });

  const result = {};
  (data || []).forEach(row => {
    result[row.term] = {
      definition: row.definition,
      smartLines: row.smart_lines || [],
      deepDive: row.deep_dive || [],
    };
  });

  return Response.json(result);
}

export async function POST(request) {
  if (!isSameOrigin(request)) return Response.json({ ok: false }, { status: 403 });

  const { lang, translations } = await request.json();
  if (!lang || !translations) return Response.json({ ok: false }, { status: 400 });

  const rows = Object.entries(translations).map(([term, data]) => ({
    term,
    lang,
    definition: data.definition,
    smart_lines: data.smartLines || [],
    deep_dive: data.deepDive || [],
  }));

  const { error } = await supabase()
    .from('translations')
    .upsert(rows, { onConflict: 'term,lang' });

  if (error) return Response.json({ ok: false, error: error.message }, { status: 500 });
  return Response.json({ ok: true });
}
