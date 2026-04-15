import { createClient } from "@supabase/supabase-js";

/*
  Supabase Storage setup — run once in your Supabase dashboard:

  1. Go to Storage → New bucket
  2. Name: "session1-gallery"
  3. Toggle ON "Public bucket"
  4. Under Storage → Policies, add two policies for "session1-gallery":
     - SELECT (read): allow all  → using (true)
     - INSERT (upload): allow all → with check (true)
*/

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB
const BUCKET = 'session1-gallery';

const supabase = () => createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export async function GET() {
  const client = supabase();
  const { data, error } = await client.storage.from(BUCKET).list('', {
    limit: 200,
    sortBy: { column: 'created_at', order: 'desc' },
  });

  if (error) return Response.json({ error: error.message }, { status: 500 });

  const images = (data || [])
    .filter(f => f.name !== '.emptyFolderPlaceholder')
    .map(f => ({
      name: f.name,
      url: client.storage.from(BUCKET).getPublicUrl(f.name).data.publicUrl,
    }));

  return Response.json({ images });
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('image');

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
    const { error } = await client.storage
      .from(BUCKET)
      .upload(filename, new Uint8Array(await file.arrayBuffer()), { contentType: file.type });

    if (error) return Response.json({ error: error.message }, { status: 500 });

    const { data: { publicUrl } } = client.storage.from(BUCKET).getPublicUrl(filename);
    return Response.json({ ok: true, url: publicUrl, name: filename });
  } catch {
    return Response.json({ error: 'Upload failed' }, { status: 500 });
  }
}
