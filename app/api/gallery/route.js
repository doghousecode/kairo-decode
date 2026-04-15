import { createClient } from "@supabase/supabase-js";

/*
  Run this SQL in your Supabase dashboard (SQL editor):

  create table gallery_entries (
    id uuid default gen_random_uuid() primary key,
    filename text not null unique,
    display_name text,
    uploaded_at timestamptz default now() not null
  );
  alter table gallery_entries enable row level security;
  create policy "allow_insert" on gallery_entries for insert with check (true);
  create policy "allow_select" on gallery_entries for select using (true);

  Storage bucket "session1-gallery" should remain public with an INSERT policy.
  No SELECT storage policy needed — we read from the table instead.
*/

const MAX_BYTES = 10 * 1024 * 1024;
const BUCKET = 'session1-gallery';

const supabase = () => createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export async function GET() {
  const client = supabase();
  const { data, error } = await client
    .from('gallery_entries')
    .select('filename, display_name, uploaded_at')
    .order('uploaded_at', { ascending: false })
    .limit(200);

  if (error) return Response.json({ error: error.message }, { status: 500 });

  const images = (data || []).map(row => ({
    url: client.storage.from(BUCKET).getPublicUrl(row.filename).data.publicUrl,
    display_name: row.display_name || null,
  }));

  return Response.json({ images });
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('image');
    const displayName = (formData.get('display_name') || '').trim().slice(0, 80) || null;

    if (!file || !file.size) {
      return Response.json({ error: 'No image provided' }, { status: 400 });
    }
    if (!file.type.startsWith('image/')) {
      return Response.json({ error: 'File must be an image' }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return Response.json({ error: 'Image too large (max 10 MB)' }, { status: 400 });
    }

    const ext = file.type.split('/')[1]?.replace('jpeg', 'jpg') || 'jpg';
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const client = supabase();

    const { error: uploadError } = await client.storage
      .from(BUCKET)
      .upload(filename, new Uint8Array(await file.arrayBuffer()), { contentType: file.type });

    if (uploadError) return Response.json({ error: uploadError.message }, { status: 500 });

    await client.from('gallery_entries').insert({ filename, display_name: displayName });

    const { data: { publicUrl } } = client.storage.from(BUCKET).getPublicUrl(filename);
    return Response.json({ ok: true, url: publicUrl });
  } catch {
    return Response.json({ error: 'Upload failed' }, { status: 500 });
  }
}
