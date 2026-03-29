import { requireAuth } from './lib/auth.js';

export default async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const user = requireAuth(req);
  if (!user) return json({ error: 'Unauthorized' }, 401);

  try {
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file) return json({ error: 'No file provided' }, 400);

    const cloudName = Netlify.env.get('CLOUDINARY_CLOUD_NAME');
    const apiKey = Netlify.env.get('CLOUDINARY_API_KEY');
    const apiSecret = Netlify.env.get('CLOUDINARY_API_SECRET');

    // Create upload signature
    const timestamp = Math.round(Date.now() / 1000);
    const folder = 'mahalaxmi-jwellers';

    // Sign the upload (simplified - for production use crypto.subtle HMAC-SHA1)
    const signatureStr = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
    const encoder = new TextEncoder();
    const data = encoder.encode(signatureStr);
    const hashBuffer = await crypto.subtle.digest('SHA-1', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const signature = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // Upload to Cloudinary
    const uploadData = new FormData();
    uploadData.append('file', file);
    uploadData.append('api_key', apiKey);
    uploadData.append('timestamp', timestamp);
    uploadData.append('signature', signature);
    uploadData.append('folder', folder);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      { method: 'POST', body: uploadData }
    );

    const result = await response.json();

    if (!response.ok) {
      return json({ error: 'Cloudinary upload failed', detail: result.error?.message }, 500);
    }

    return json({
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
    });
  } catch (err) {
    console.error('Upload error:', err);
    return json({ error: 'Upload failed', detail: err.message }, 500);
  }
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export const config = { path: '/api/upload' };
