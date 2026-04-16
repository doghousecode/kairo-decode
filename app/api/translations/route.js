import { createClient } from "@supabase/supabase-js";

/*
  Run this SQL in your Supabase dashboard (SQL editor):

  create table translations (
    term text not null,
    lang text not null,
    definition text,
    smart_lines jsonb,
    primary key (term, lang)
  );
  alter table translations enable row level security;
  create policy "allow_select" on translations for select using (true);
  create policy "allow_insert" on translations for insert with check (true);
  create policy "allow_update" on translations for update using (true);
*/

const supabase = () => createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export async function GET(request) {
  const lang = new URL(request.url).searchParams.get('lang');
  if (!lang || lang === 'en') return Response.json({});

  const { data, error } = await supabase()
    .from('translations')
    .select('term, definition, smart_lines')
    .eq('lang', lang);

  if (error) return Response.json({}, { status: 500 });

  const result = {};
  (data || []).forEach(row => {
    result[row.term] = { definition: row.definition, smartLines: row.smart_lines || [] };
  });

  return Response.json(result);
}

export async function POST(request) {
  const { lang, translations } = await request.json();
  if (!lang || !translations) return Response.json({ ok: false }, { status: 400 });

  const rows = Object.entries(translations).map(([term, data]) => ({
    term,
    lang,
    definition: data.definition,
    smart_lines: data.smartLines || [],
  }));

  const { error } = await supabase()
    .from('translations')
    .upsert(rows, { onConflict: 'term,lang' });

  if (error) return Response.json({ ok: false, error: error.message }, { status: 500 });
  return Response.json({ ok: true });
}
