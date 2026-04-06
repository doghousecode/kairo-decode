import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export async function GET() {
  const { data, error } = await supabase
    .from("decode_terms")
    .select("*")
    .order("term");

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data);
}

export async function POST(request) {
  const body = await request.json();

  const { data, error } = await supabase
    .from("decode_terms")
    .insert({
      term: body.term,
      emoji: body.emoji,
      definition: body.definition,
      examples: body.examples,
      deep_dive: body.deepDive,
      smart_lines: body.smartLines ?? null,
      tag: body.tag,
    })
    .select()
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data, { status: 201 });
}
