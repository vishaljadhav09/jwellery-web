// Simple JWT implementation without external deps
function base64url(str) {
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function base64urlDecode(str) {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) str += '=';
  return atob(str);
}

export function signToken(payload) {
  const secret = Netlify.env.get('JWT_SECRET') || 'mahalaxmi-secret-2024';
  const header = base64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = base64url(JSON.stringify({ ...payload, exp: Date.now() + 86400000 }));
  // For production use a proper HMAC — this is simplified for demo
  const signature = base64url(`${header}.${body}.${secret}`);
  return `${header}.${body}.${signature}`;
}

export function verifyToken(token) {
  try {
    const [header, body, signature] = token.split('.');
    const secret = Netlify.env.get('JWT_SECRET') || 'mahalaxmi-secret-2024';
    const expectedSig = base64url(`${header}.${body}.${secret}`);
    if (signature !== expectedSig) return null;
    const payload = JSON.parse(base64urlDecode(body));
    if (payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export function requireAuth(req) {
  const auth = req.headers.get('authorization') || '';
  const token = auth.replace('Bearer ', '');
  if (!token) return null;
  return verifyToken(token);
}
