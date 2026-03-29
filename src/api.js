// Central API client — all calls go through here

const BASE = '';  // same domain, Netlify handles routing

function getToken() {
  return localStorage.getItem('mj_admin_token');
}

function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handleResponse(res) {
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

// ── AUTH ────────────────────────────────────────────────────────────
export const authApi = {
  login: async (password) => {
    const res = await fetch(`${BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    return handleResponse(res);
  },
};

// ── PRODUCTS ────────────────────────────────────────────────────────
export const productsApi = {
  getAll: async (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    const res = await fetch(`${BASE}/api/products${qs ? '?' + qs : ''}`);
    return handleResponse(res);
  },

  getOne: async (id) => {
    const res = await fetch(`${BASE}/api/products?id=${id}`);
    return handleResponse(res);
  },

  create: async (product) => {
    const res = await fetch(`${BASE}/api/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(product),
    });
    return handleResponse(res);
  },

  update: async (id, updates) => {
    const res = await fetch(`${BASE}/api/products?id=${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(updates),
    });
    return handleResponse(res);
  },

  delete: async (id) => {
    const res = await fetch(`${BASE}/api/products?id=${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    return handleResponse(res);
  },
};

// ── ORDERS ──────────────────────────────────────────────────────────
export const ordersApi = {
  place: async (orderData) => {
    const res = await fetch(`${BASE}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData),
    });
    return handleResponse(res);
  },

  getAll: async (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    const res = await fetch(`${BASE}/api/orders${qs ? '?' + qs : ''}`, {
      headers: authHeaders(),
    });
    return handleResponse(res);
  },

  updateStatus: async (id, status) => {
    const res = await fetch(`${BASE}/api/orders?id=${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ status }),
    });
    return handleResponse(res);
  },

  delete: async (id) => {
    const res = await fetch(`${BASE}/api/orders?id=${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    return handleResponse(res);
  },
};

// ── UPLOAD ──────────────────────────────────────────────────────────
export const uploadApi = {
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${BASE}/api/upload`, {
      method: 'POST',
      headers: authHeaders(),
      body: formData,
    });
    return handleResponse(res);
  },
};

// ── SEED ────────────────────────────────────────────────────────────
export const seedApi = {
  seed: async () => {
    const res = await fetch(`${BASE}/api/seed`, {
      method: 'POST',
      headers: authHeaders(),
    });
    return handleResponse(res);
  },
};
