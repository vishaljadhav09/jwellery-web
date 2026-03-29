import { signToken } from './lib/auth.js';

export default async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const { password } = await req.json();
  const adminPassword = Netlify.env.get('ADMIN_PASSWORD') || 'admin123';

  if (password !== adminPassword) {
    return new Response(JSON.stringify({ error: 'Invalid password' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const token = signToken({ role: 'admin', shop: 'mahalaxmi' });

  return new Response(JSON.stringify({ token, role: 'admin' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};

export const config = {
  path: '/api/auth/login',
};
