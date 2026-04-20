import { createClient } from "@supabase/supabase-js";

const supabase = () => createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export async function GET() {
  const { data, error } = await supabase()
    .from("decode_terms")
    .select("*")
    .order("term");

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data);
}

export async function POST(request) {
  const body = await request.json();

  const { data, error } = await supabase()
    .from("decode_terms")
    .insert({
      term: body.term,
      emoji: body.emoji,
      definition: body.definition,
      examples: body.examples,
      deep_dive: body.deepDive,
      smart_lines: body.smartLines ?? null,
      tag: body.tag,
      contributor: body.contributor ?? null,
    })
    .select()
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data, { status: 201 });
}

export async function DELETE(request) {
  const cookie = request.headers.get('cookie') || '';
  if (!cookie.includes('kairo-auth=granted')) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { term } = await request.json();

  const { error } = await supabase()
    .from("decode_terms")
    .delete()
    .eq("term", term);

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true });
}

export async function PATCH(request) {
  const body = await request.json();

  const updates = {};
  if (body.smartLines !== undefined) updates.smart_lines = body.smartLines;
  if (body.deepDive !== undefined) updates.deep_dive = body.deepDive;

  const { data, error } = await supabase()
    .from("decode_terms")
    .update(updates)
    .eq("term", body.term)
    .select()
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data);
}
