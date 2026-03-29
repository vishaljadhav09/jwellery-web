import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi, productsApi, ordersApi, seedApi } from './api.js';

// ── CART STORE ──────────────────────────────────────────────────────
export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product, quantity = 1) => {
        const items = get().items;
        const existing = items.find(item => item._id === product._id || item.id === product.id);
        if (existing) {
          set({
            items: items.map(item =>
              (item._id === product._id || item.id === product.id)
                ? { ...item, quantity: item.quantity + quantity }
                : item
            ),
          });
        } else {
          set({ items: [...items, { ...product, quantity }] });
        }
      },

      removeItem: (id) => {
        set({ items: get().items.filter(item => (item._id || item.id) !== id) });
      },

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) { get().removeItem(id); return; }
        set({
          items: get().items.map(item =>
            (item._id || item.id) === id ? { ...item, quantity } : item
          ),
        });
      },

      clearCart: () => set({ items: [] }),

      get totalItems() { return get().items.reduce((sum, i) => sum + i.quantity, 0); },
      get totalPrice() { return get().items.reduce((sum, i) => sum + i.price * i.quantity, 0); },
    }),
    { name: 'mahalaxmi-cart' }
  )
);

// ── ADMIN STORE ─────────────────────────────────────────────────────
export const useAdminStore = create(
  persist(
    (set, get) => ({
      isLoggedIn: false,
      token: null,

      login: async (password) => {
        try {
          const data = await authApi.login(password);
          if (data.token) {
            set({ isLoggedIn: true, token: data.token });
            localStorage.setItem('mj_admin_token', data.token);
            return true;
          }
          return false;
        } catch {
          return false;
        }
      },

      logout: () => {
        set({ isLoggedIn: false, token: null });
        localStorage.removeItem('mj_admin_token');
      },
    }),
    { name: 'mahalaxmi-admin' }
  )
);

// ── PRODUCTS STORE ──────────────────────────────────────────────────
export const useProductsStore = create((set, get) => ({
  products: [],
  loading: false,
  error: null,

  fetchProducts: async (params = {}) => {
    set({ loading: true, error: null });
    try {
      const data = await productsApi.getAll(params);
      set({ products: data, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  addProduct: async (product) => {
    const data = await productsApi.create(product);
    set(s => ({ products: [data, ...s.products] }));
    return data;
  },

  updateProduct: async (id, updates) => {
    await productsApi.update(id, updates);
    set(s => ({
      products: s.products.map(p => (p._id === id || p.id === id) ? { ...p, ...updates } : p),
    }));
  },

  deleteProduct: async (id) => {
    await productsApi.delete(id);
    set(s => ({ products: s.products.filter(p => (p._id || p.id) !== id) }));
  },

  seedDB: async () => {
    return seedApi.seed();
  },
}));

// ── ORDERS STORE ────────────────────────────────────────────────────
export const useOrdersStore = create((set) => ({
  orders: [],
  summary: null,
  loading: false,

  fetchOrders: async () => {
    set({ loading: true });
    try {
      const data = await ordersApi.getAll();
      set({ orders: data.orders || [], summary: data.summary, loading: false });
    } catch (err) {
      console.error(err);
      set({ loading: false });
    }
  },

  updateStatus: async (id, status) => {
    await ordersApi.updateStatus(id, status);
    set(s => ({
      orders: s.orders.map(o => (o._id === id) ? { ...o, status } : o),
    }));
  },

  deleteOrder: async (id) => {
    await ordersApi.delete(id);
    set(s => ({ orders: s.orders.filter(o => o._id !== id) }));
  },
}));
