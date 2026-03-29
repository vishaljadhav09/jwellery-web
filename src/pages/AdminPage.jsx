import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard, Package, ShoppingCart, BarChart3,
  LogOut, TrendingUp, Eye, Edit, Trash2, Plus, Check, X,
  Loader2, Upload, RefreshCw
} from 'lucide-react';
import { useAdminStore, useProductsStore, useOrdersStore } from '../store';
import { uploadApi, seedApi } from '../api';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
  delivered: 'bg-green-100 text-green-700',
  processing: 'bg-blue-100 text-blue-700',
  pending: 'bg-yellow-100 text-yellow-700',
  shipped: 'bg-purple-100 text-purple-700',
  cancelled: 'bg-red-100 text-red-700',
};

// ── LOGIN ─────────────────────────────────────────────────────────────
function AdminLogin() {
  const { login } = useAdminStore();
  const [pw, setPw] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const ok = await login(pw);
    setLoading(false);
    if (!ok) setError('Invalid password');
  };

  return (
    <div className="min-h-screen bg-festive-gradient flex items-center justify-center">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="bg-white border border-gold-200 p-10 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-maroon-500 rounded-full flex items-center justify-center text-gold-200 text-2xl mx-auto mb-4">✦</div>
          <h1 className="font-display text-2xl text-maroon-700">Admin Login</h1>
          <p className="text-gray-400 text-sm mt-1">Mahalaxmi Jwellers Dashboard</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="password" placeholder="Admin Password" value={pw}
            onChange={e => { setPw(e.target.value); setError(''); }}
            className="w-full border border-gold-200 px-4 py-3 focus:outline-none focus:border-gold-400 bg-cream" />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button type="submit" disabled={loading} className="w-full btn-primary py-4 flex items-center justify-center gap-2">
            {loading ? <Loader2 size={18} className="animate-spin" /> : null}
            {loading ? 'Logging in...' : 'Login →'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

// ── DASHBOARD ─────────────────────────────────────────────────────────
function DashboardTab() {
  const { i18n } = useTranslation();
  const isMarathi = i18n.language === 'mr';
  const { orders, summary, fetchOrders, loading } = useOrdersStore();
  const { products, fetchProducts } = useProductsStore();

  useEffect(() => { fetchOrders(); fetchProducts(); }, []);

  const handleSeed = async () => {
    try {
      const result = await seedApi.seed();
      toast.success(result.message || `Seeded ${result.inserted} products!`);
      fetchProducts();
    } catch (err) {
      toast.error('Seed failed: ' + err.message);
    }
  };

  const stats = [
    { label: isMarathi ? 'एकूण ऑर्डर' : 'Total Orders', value: orders.length, icon: ShoppingCart, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: isMarathi ? 'एकूण महसूल' : 'Total Revenue', value: `₹${(summary?.revenue || 0).toLocaleString('en-IN')}`, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
    { label: isMarathi ? 'एकूण उत्पादने' : 'Total Products', value: products.length, icon: Package, color: 'text-gold-600', bg: 'bg-gold-50' },
    { label: isMarathi ? 'प्रलंबित ऑर्डर' : 'Pending Orders', value: orders.filter(o => o.status === 'pending').length, icon: Eye, color: 'text-maroon-600', bg: 'bg-maroon-50' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl text-maroon-700">{isMarathi ? 'डॅशबोर्ड' : 'Dashboard'}</h2>
        <div className="flex gap-2">
          <button onClick={handleSeed} className="flex items-center gap-2 text-xs border border-gold-300 px-3 py-2 text-maroon-600 hover:bg-gold-50 transition-colors">
            <RefreshCw size={13} /> Seed DB
          </button>
          <button onClick={() => { fetchOrders(); fetchProducts(); }} className="flex items-center gap-2 text-xs border border-gold-300 px-3 py-2 text-maroon-600 hover:bg-gold-50 transition-colors">
            <RefreshCw size={13} /> Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className="bg-white border border-gold-100 p-5 rounded-sm">
            <div className={`w-10 h-10 ${s.bg} rounded-full flex items-center justify-center mb-3`}>
              <s.icon size={18} className={s.color} />
            </div>
            <div className="font-display text-2xl font-bold text-maroon-800">{s.value}</div>
            <div className="text-xs text-gray-400 mt-1">{s.label}</div>
          </motion.div>
        ))}
      </div>

      <h3 className="font-display text-lg text-maroon-700 mb-4">{isMarathi ? 'अलीकडील ऑर्डर' : 'Recent Orders'}</h3>
      {loading ? (
        <div className="flex items-center justify-center py-10 gap-2 text-gold-500"><Loader2 size={20} className="animate-spin" /> Loading...</div>
      ) : (
        <div className="bg-white border border-gold-100 overflow-x-auto rounded-sm">
          <table className="w-full text-sm">
            <thead className="bg-gold-50 border-b border-gold-200">
              <tr>
                {['Order ID', 'Customer', 'Amount', 'Date', 'Status'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-maroon-700 font-semibold text-xs uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gold-50">
              {orders.slice(0, 8).map(order => (
                <tr key={order._id} className="hover:bg-gold-50/50">
                  <td className="px-4 py-3 font-mono text-maroon-600 font-medium text-xs">{order.orderId}</td>
                  <td className="px-4 py-3 text-gray-700">{order.customer?.name || 'N/A'}</td>
                  <td className="px-4 py-3 font-semibold text-maroon-700">₹{(order.total || 0).toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{new Date(order.createdAt).toLocaleDateString('en-IN')}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600'}`}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">No orders yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── PRODUCTS TAB ──────────────────────────────────────────────────────
function ProductsTab() {
  const { i18n } = useTranslation();
  const isMarathi = i18n.language === 'mr';
  const { products, loading, fetchProducts, addProduct, updateProduct, deleteProduct } = useProductsStore();
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingImg, setUploadingImg] = useState(false);
  const [newProd, setNewProd] = useState({
    name: '', nameMarathi: '', price: '', originalPrice: '', category: 'necklaces',
    weight: '', purity: '92.5% Sterling Silver', description: '', descriptionMarathi: '',
    image: '', inStock: true, featured: false, tags: [], rating: 4.5, reviews: 0,
  });

  useEffect(() => { fetchProducts(); }, []);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingImg(true);
    try {
      const result = await uploadApi.uploadImage(file);
      setNewProd(p => ({ ...p, image: result.url, images: [result.url] }));
      toast.success('Image uploaded!');
    } catch (err) {
      toast.error('Upload failed: ' + err.message);
    } finally {
      setUploadingImg(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await addProduct({ ...newProd, price: Number(newProd.price), originalPrice: Number(newProd.originalPrice || newProd.price), images: newProd.image ? [newProd.image] : [] });
      setShowAdd(false);
      setNewProd({ name: '', nameMarathi: '', price: '', originalPrice: '', category: 'necklaces', weight: '', purity: '92.5% Sterling Silver', description: '', descriptionMarathi: '', image: '', inStock: true, featured: false, tags: [], rating: 4.5, reviews: 0 });
      toast.success('Product added!');
    } catch (err) {
      toast.error('Failed: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return;
    try {
      await deleteProduct(id);
      toast.success('Deleted');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const toggleStock = async (prod) => {
    try {
      await updateProduct(prod._id || prod.id, { inStock: !prod.inStock });
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl text-maroon-700">{isMarathi ? 'उत्पादन व्यवस्थापन' : 'Product Management'}</h2>
        <button onClick={() => setShowAdd(!showAdd)} className="btn-primary flex items-center gap-2 !py-2">
          <Plus size={16} /> {isMarathi ? 'नवीन जोडा' : 'Add New'}
        </button>
      </div>

      {showAdd && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
          className="bg-gold-50 border border-gold-200 p-6 mb-6">
          <h3 className="font-semibold text-maroon-700 mb-4">{isMarathi ? 'नवीन उत्पादन' : 'New Product'}</h3>
          <form onSubmit={handleAdd} className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <input type="text" placeholder="Product Name (English)" value={newProd.name} onChange={e => setNewProd(p => ({ ...p, name: e.target.value }))} required className="border border-gold-200 px-3 py-2 text-sm bg-white focus:outline-none focus:border-gold-400" />
            <input type="text" placeholder="उत्पादनाचे नाव (मराठी)" value={newProd.nameMarathi} onChange={e => setNewProd(p => ({ ...p, nameMarathi: e.target.value }))} className="border border-gold-200 px-3 py-2 text-sm bg-white focus:outline-none font-marathi" />
            <input type="number" placeholder="Price (₹)" value={newProd.price} onChange={e => setNewProd(p => ({ ...p, price: e.target.value }))} required className="border border-gold-200 px-3 py-2 text-sm bg-white focus:outline-none focus:border-gold-400" />
            <input type="number" placeholder="Original Price (₹)" value={newProd.originalPrice} onChange={e => setNewProd(p => ({ ...p, originalPrice: e.target.value }))} className="border border-gold-200 px-3 py-2 text-sm bg-white focus:outline-none focus:border-gold-400" />
            <input type="text" placeholder="Weight (e.g. 45g)" value={newProd.weight} onChange={e => setNewProd(p => ({ ...p, weight: e.target.value }))} className="border border-gold-200 px-3 py-2 text-sm bg-white focus:outline-none focus:border-gold-400" />
            <select value={newProd.category} onChange={e => setNewProd(p => ({ ...p, category: e.target.value }))} className="border border-gold-200 px-3 py-2 text-sm bg-white focus:outline-none">
              {['necklaces','earrings','bangles','pendants','anklets','bracelets','nath'].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <textarea placeholder="Description (English)" value={newProd.description} onChange={e => setNewProd(p => ({ ...p, description: e.target.value }))} className="border border-gold-200 px-3 py-2 text-sm bg-white focus:outline-none col-span-2 md:col-span-3 h-20 resize-none" />

            {/* Image upload */}
            <div className="col-span-2 md:col-span-3">
              <label className="text-sm text-maroon-700 font-medium mb-2 block">{isMarathi ? 'उत्पादन फोटो' : 'Product Image'}</label>
              <div className="flex gap-3 items-center">
                <label className="flex items-center gap-2 border border-gold-300 px-4 py-2 cursor-pointer hover:bg-gold-50 text-sm text-maroon-600">
                  {uploadingImg ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                  {uploadingImg ? 'Uploading...' : 'Upload Image'}
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
                {newProd.image && <img src={newProd.image} alt="" className="w-12 h-12 object-cover border border-gold-200" />}
                <input type="text" placeholder="Or paste image URL" value={newProd.image} onChange={e => setNewProd(p => ({ ...p, image: e.target.value }))} className="flex-1 border border-gold-200 px-3 py-2 text-sm bg-white focus:outline-none" />
              </div>
            </div>

            <div className="flex gap-4 items-center col-span-2 md:col-span-3">
              <label className="flex items-center gap-2 text-sm text-maroon-700 cursor-pointer">
                <input type="checkbox" checked={newProd.inStock} onChange={e => setNewProd(p => ({ ...p, inStock: e.target.checked }))} className="accent-maroon-500" />
                In Stock
              </label>
              <label className="flex items-center gap-2 text-sm text-maroon-700 cursor-pointer">
                <input type="checkbox" checked={newProd.featured} onChange={e => setNewProd(p => ({ ...p, featured: e.target.checked }))} className="accent-maroon-500" />
                Featured
              </label>
            </div>

            <div className="flex gap-2 col-span-2 md:col-span-3">
              <button type="submit" disabled={saving} className="btn-primary !py-2 flex items-center gap-1">
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />} Save Product
              </button>
              <button type="button" onClick={() => setShowAdd(false)} className="border border-gray-200 px-4 py-2 text-sm text-gray-500 hover:bg-gray-50 flex items-center gap-1">
                <X size={14} /> Cancel
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-10 gap-2 text-gold-500"><Loader2 size={20} className="animate-spin" /> Loading products...</div>
      ) : (
        <div className="bg-white border border-gold-100 overflow-x-auto rounded-sm">
          <table className="w-full text-sm">
            <thead className="bg-gold-50 border-b border-gold-200">
              <tr>
                {['Image', 'Name', 'Category', 'Price', 'Stock', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-maroon-700 font-semibold text-xs uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gold-50">
              {products.map(prod => (
                <tr key={prod._id || prod.id} className="hover:bg-gold-50/30">
                  <td className="px-4 py-3">
                    <img src={prod.image} alt="" className="w-12 h-12 object-cover border border-gold-100" onError={e => e.target.src = 'https://via.placeholder.com/48?text=✦'} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-maroon-800">{prod.name}</div>
                    <div className="text-xs text-gray-400 font-marathi">{prod.nameMarathi}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-500 capitalize">{prod.category}</td>
                  <td className="px-4 py-3 font-semibold text-maroon-700">₹{prod.price.toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleStock(prod)}
                      className={`text-xs font-semibold px-3 py-1 rounded-full transition-colors ${prod.inStock ? 'bg-green-100 text-green-700 hover:bg-red-100 hover:text-red-700' : 'bg-red-100 text-red-700 hover:bg-green-100 hover:text-green-700'}`}>
                      {prod.inStock ? 'In Stock' : 'Out of Stock'}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button className="w-8 h-8 bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 rounded-sm"><Edit size={14} /></button>
                      <button onClick={() => handleDelete(prod._id || prod.id)} className="w-8 h-8 bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 rounded-sm"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">No products. Click "Seed DB" on Dashboard to add sample products.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── ORDERS TAB ────────────────────────────────────────────────────────
function OrdersTab() {
  const { i18n } = useTranslation();
  const isMarathi = i18n.language === 'mr';
  const { orders, loading, fetchOrders, updateStatus, deleteOrder } = useOrdersStore();

  useEffect(() => { fetchOrders(); }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl text-maroon-700">{isMarathi ? 'ऑर्डर व्यवस्थापन' : 'Order Management'}</h2>
        <button onClick={fetchOrders} className="flex items-center gap-2 text-xs border border-gold-300 px-3 py-2 text-maroon-600 hover:bg-gold-50">
          <RefreshCw size={13} /> Refresh
        </button>
      </div>
      {loading ? (
        <div className="flex items-center justify-center py-10 gap-2 text-gold-500"><Loader2 size={20} className="animate-spin" /> Loading orders...</div>
      ) : (
        <div className="bg-white border border-gold-100 overflow-x-auto rounded-sm">
          <table className="w-full text-sm">
            <thead className="bg-gold-50 border-b border-gold-200">
              <tr>
                {['Order ID', 'Customer', 'Phone', 'Amount', 'Date', 'Status', 'Update', 'Del'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-maroon-700 font-semibold text-xs uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gold-50">
              {orders.map(order => (
                <tr key={order._id} className="hover:bg-gold-50/30">
                  <td className="px-4 py-3 font-mono text-maroon-600 font-medium text-xs">{order.orderId}</td>
                  <td className="px-4 py-3 text-gray-700">{order.customer?.name}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{order.customer?.phone}</td>
                  <td className="px-4 py-3 font-semibold text-maroon-700">₹{(order.total || 0).toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{new Date(order.createdAt).toLocaleDateString('en-IN')}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600'}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <select value={order.status} onChange={e => updateStatus(order._id, e.target.value)}
                      className="border border-gold-200 text-xs px-2 py-1.5 focus:outline-none focus:border-gold-400 bg-cream">
                      {['pending','processing','shipped','delivered','cancelled'].map(s => <option key={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => deleteOrder(order._id)} className="w-7 h-7 bg-red-50 text-red-400 flex items-center justify-center hover:bg-red-100 rounded-sm">
                      <Trash2 size={12} />
                    </button>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400">No orders yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── ANALYTICS ─────────────────────────────────────────────────────────
function AnalyticsTab() {
  const { i18n } = useTranslation();
  const isMarathi = i18n.language === 'mr';
  const { orders, summary, fetchOrders } = useOrdersStore();
  const { products } = useProductsStore();

  useEffect(() => { fetchOrders(); }, []);

  const categoryRevenue = orders.reduce((acc, o) => {
    (o.items || []).forEach(item => {
      const cat = item.category || 'other';
      acc[cat] = (acc[cat] || 0) + item.price * item.quantity;
    });
    return acc;
  }, {});

  const topCategories = Object.entries(categoryRevenue).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const maxRev = topCategories[0]?.[1] || 1;

  return (
    <div>
      <h2 className="font-display text-2xl text-maroon-700 mb-6">{isMarathi ? 'विश्लेषण' : 'Analytics'}</h2>
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total Revenue', val: `₹${(summary?.revenue || 0).toLocaleString('en-IN')}`, color: 'text-green-600' },
          { label: 'Total Orders', val: orders.length, color: 'text-blue-600' },
          { label: 'Avg Order Value', val: orders.length ? `₹${Math.round((summary?.revenue || 0) / orders.length).toLocaleString('en-IN')}` : '₹0', color: 'text-maroon-600' },
        ].map((s, i) => (
          <div key={i} className="bg-white border border-gold-100 p-5">
            <div className={`font-display text-3xl font-bold ${s.color}`}>{s.val}</div>
            <div className="text-xs text-gray-400 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white border border-gold-100 p-6">
          <h3 className="font-semibold text-maroon-700 mb-4">{isMarathi ? 'ऑर्डर स्थिती' : 'Order Status Breakdown'}</h3>
          {['pending','processing','shipped','delivered','cancelled'].map((status) => {
            const count = orders.filter(o => o.status === status).length;
            const pct = orders.length ? Math.round((count / orders.length) * 100) : 0;
            return (
              <div key={status} className="flex items-center justify-between mb-3">
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${STATUS_COLORS[status]}`}>{status}</span>
                <div className="flex items-center gap-3 flex-1 ml-3">
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8 }}
                      className="h-full bg-gradient-to-r from-maroon-500 to-gold-500 rounded-full" />
                  </div>
                  <span className="text-xs text-gray-500 w-8 text-right">{count}</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-white border border-gold-100 p-6">
          <h3 className="font-semibold text-maroon-700 mb-4">{isMarathi ? 'इन्व्हेंटरी स्थिती' : 'Inventory Status'}</h3>
          <div className="space-y-3">
            <div className="flex justify-between text-sm"><span className="text-gray-600">Total Products</span><span className="font-semibold text-maroon-700">{products.length}</span></div>
            <div className="flex justify-between text-sm"><span className="text-gray-600">In Stock</span><span className="font-semibold text-green-600">{products.filter(p => p.inStock).length}</span></div>
            <div className="flex justify-between text-sm"><span className="text-gray-600">Out of Stock</span><span className="font-semibold text-red-500">{products.filter(p => !p.inStock).length}</span></div>
            <div className="flex justify-between text-sm"><span className="text-gray-600">Featured</span><span className="font-semibold text-gold-600">{products.filter(p => p.featured).length}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── MAIN ADMIN ─────────────────────────────────────────────────────────
export default function AdminPage() {
  const { t, i18n } = useTranslation();
  const isMarathi = i18n.language === 'mr';
  const { isLoggedIn, logout } = useAdminStore();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (!isLoggedIn) return <AdminLogin />;

  const tabs = [
    { id: 'dashboard', icon: LayoutDashboard, label: t('dashboard') },
    { id: 'products', icon: Package, label: t('products_mgmt') },
    { id: 'orders', icon: ShoppingCart, label: t('orders') },
    { id: 'analytics', icon: BarChart3, label: t('analytics') },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-56 admin-sidebar text-white flex flex-col shrink-0 sticky top-0 h-screen">
        <div className="p-5 border-b border-maroon-700">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gold-500 rounded-full flex items-center justify-center text-maroon-900 text-sm">✦</div>
            <div>
              <div className="text-xs font-bold text-gold-300 leading-tight">Mahalaxmi</div>
              <div className="text-xs text-gold-600">Admin Panel</div>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all duration-200 rounded-sm ${
                activeTab === tab.id ? 'bg-gold-500/20 text-gold-300 border-l-2 border-gold-400' : 'text-maroon-300 hover:bg-maroon-700/50 hover:text-gold-400'
              }`}>
              <tab.icon size={17} /> {tab.label}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-maroon-700">
          <button onClick={logout} className="w-full flex items-center gap-2 px-4 py-3 text-sm text-maroon-300 hover:text-red-300 transition-colors">
            <LogOut size={16} /> {isMarathi ? 'बाहेर पडा' : 'Logout'}
          </button>
        </div>
      </aside>
      <main className="flex-1 p-8 overflow-y-auto">
        {activeTab === 'dashboard' && <DashboardTab />}
        {activeTab === 'products' && <ProductsTab />}
        {activeTab === 'orders' && <OrdersTab />}
        {activeTab === 'analytics' && <AnalyticsTab />}
      </main>
    </div>
  );
}
