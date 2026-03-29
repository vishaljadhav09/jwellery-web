import { connectDB, getDB } from './lib/db.js';
import { requireAuth } from './lib/auth.js';
import { ObjectId } from 'mongodb';

export default async (req) => {
  const url = new URL(req.url);
  const method = req.method;

  try {
    const client = await connectDB();
    const db = getDB(client);
    const col = db.collection('orders');

    // POST /api/orders — place a new order (public)
    if (method === 'POST') {
      const body = await req.json();
      const order = {
        ...body,
        status: 'pending',
        orderId: `ORD${Date.now().toString().slice(-6)}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const result = await col.insertOne(order);
      return json({ ...order, _id: result.insertedId }, 201);
    }

    // All other operations need admin auth
    const user = requireAuth(req);
    if (!user) return json({ error: 'Unauthorized' }, 401);

    // GET /api/orders — list all orders (admin)
    if (method === 'GET') {
      const id = url.searchParams.get('id');
      const status = url.searchParams.get('status');

      if (id) {
        const order = await col.findOne({ _id: new ObjectId(id) });
        if (!order) return json({ error: 'Not found' }, 404);
        return json(order);
      }

      const query = {};
      if (status) query.status = status;

      const orders = await col.find(query).sort({ createdAt: -1 }).toArray();

      // Analytics summary
      const total = orders.reduce((s, o) => s + (o.total || 0), 0);
      return json({ orders, summary: { count: orders.length, revenue: total } });
    }

    // PUT /api/orders?id=xxx — update order status (admin)
    if (method === 'PUT') {
      const id = url.searchParams.get('id');
      if (!id) return json({ error: 'ID required' }, 400);
      const { status } = await req.json();
      const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
      if (!validStatuses.includes(status)) return json({ error: 'Invalid status' }, 400);
      const result = await col.updateOne(
        { _id: new ObjectId(id) },
        { $set: { status, updatedAt: new Date() } }
      );
      if (result.matchedCount === 0) return json({ error: 'Not found' }, 404);
      return json({ success: true });
    }

    // DELETE /api/orders?id=xxx — delete order (admin)
    if (method === 'DELETE') {
      const id = url.searchParams.get('id');
      if (!id) return json({ error: 'ID required' }, 400);
      await col.deleteOne({ _id: new ObjectId(id) });
      return json({ success: true });
    }

    return json({ error: 'Method not allowed' }, 405);
  } catch (err) {
    console.error('Orders error:', err);
    return json({ error: 'Server error', detail: err.message }, 500);
  }
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export const config = { path: '/api/orders' };
