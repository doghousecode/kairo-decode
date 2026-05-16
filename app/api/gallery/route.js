import { createClient } from '@supabase/supabase-js';
import { isSameOrigin, isAuthed, supabaseKey } from '@/lib/security';

/*
  Supabase setup (run once, then drop the old permissive policies):

  create table if not exists gallery_entries (
    id uuid default gen_random_uuid() primary key,
    filename text not null unique,
    display_name text,
    uploaded_at timestamptz default now() not null
  );
  alter table gallery_entries enable row level security;

  -- This route uses the service-role key, which bypasses RLS.
  drop policy if exists "allow_insert" on gallery_entries;
  drop policy if exists "allow_select" on gallery_entries;

  -- Storage: keep the session1-gallery bucket public for SELECT (we serve
  -- public URLs from it). Drop any anon INSERT policy on the bucket —
  -- uploads now go through this route, which uses the service-role key.
*/

const MAX_BYTES = 10 * 1024 * 1024;
const BUCKET = 'session1-gallery';

const supabase = () => createClient(process.env.SUPABASE_URL, supabaseKey());

export async function GET() {
  const client = supabase();
  const { data, error } = await client
    .from('gallery_entries')
    .select('filename, display_name, uploaded_at')
    .order('uploaded_at', { ascending: false })
    .limit(200);

  if (error) return Response.json({ error: error.message }, { status: 500 });

  const images = (data || []).map(row => ({
    filename: row.filename,
    url: client.storage.from(BUCKET).getPublicUrl(row.filename).data.publicUrl,
    display_name: row.display_name || null,
  }));

  return Response.json({ images });
}

export async function DELETE(request) {
  if (!isSameOrigin(request)) return Response.json({ error: 'forbidden' }, { status: 403 });
  if (!isAuthed(request)) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { filename } = await request.json();
  if (!filename) return Response.json({ error: 'Missing filename' }, { status: 400 });

  const client = supabase();
  await client.from('gallery_entries').delete().eq('filename', filename);
  await client.storage.from(BUCKET).remove([filename]);
  return Response.json({ ok: true });
}

export async function POST(request) {
  if (!isSameOrigin(request)) return Response.json({ error: 'forbidden' }, { status: 403 });

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
