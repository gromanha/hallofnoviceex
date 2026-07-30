import { requireAdmin } from './lib/auth.js';
import { getSupabaseAdmin } from './lib/supabase.js';

const BUCKET = 'blog-images';
const MAX_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const admin = requireAdmin(req);
  if (!admin) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const { file, filename, contentType } = req.body;

    if (!file || !filename || !contentType) {
      return res.status(400).json({ error: 'Missing file, filename, or contentType' });
    }

    if (!ALLOWED_TYPES.includes(contentType)) {
      return res.status(400).json({ error: `Invalid file type: ${contentType}. Allowed: ${ALLOWED_TYPES.join(', ')}` });
    }

    const buffer = Buffer.from(file, 'base64');
    if (buffer.length > MAX_SIZE) {
      return res.status(400).json({ error: `File too large: ${(buffer.length / 1024 / 1024).toFixed(1)}MB. Max: 10MB` });
    }

    const ext = filename.split('.').pop() || 'jpg';
    const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const path = `blog/${safeName}`;

    const supabase = getSupabaseAdmin();
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, buffer, {
        contentType,
        cacheControl: '31536000',
        upsert: false,
      });

    if (uploadError) {
      console.error('[upload] Supabase error:', uploadError);
      return res.status(500).json({ error: 'Failed to upload image' });
    }

    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path);

    return res.status(200).json({ url: urlData.publicUrl, path });
  } catch (err) {
    console.error('[upload] Error:', err);
    return res.status(500).json({ error: 'Upload failed' });
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '12mb',
    },
  },
};
