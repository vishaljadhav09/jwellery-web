import { connectDB, getDB } from './lib/db.js';
import { requireAuth } from './lib/auth.js';
import { ObjectId } from 'mongodb';

export default async (req) => {
  const url = new URL(req.url);
  const method = req.method;

  try {
    const client = await connectDB();
    const db = getDB(client);
    const col = db.collection('products');

    // GET /api/products  or  /api/products?id=xxx
    if (method === 'GET') {
      const id = url.searchParams.get('id');
      const category = url.searchParams.get('category');
      const featured = url.searchParams.get('featured');
      const search = url.searchParams.get('search');

      if (id) {
        const product = await col.findOne({ _id: new ObjectId(id) });
        if (!product) return json({ error: 'Not found' }, 404);
        return json(product);
      }

      const query = {};
      if (category && category !== 'all') query.category = category;
      if (featured === 'true') query.featured = true;
      if (search) query.name = { $regex: search, $options: 'i' };

      const products = await col.find(query).sort({ createdAt: -1 }).toArray();
      return json(products);
    }

    // AUTH REQUIRED for mutations
    const user = requireAuth(req);
    if (!user) return json({ error: 'Unauthorized' }, 401);

    // POST /api/products
    if (method === 'POST') {
      const body = await req.json();
      const product = { ...body, createdAt: new Date(), updatedAt: new Date() };
      const result = await col.insertOne(product);
      return json({ ...product, _id: result.insertedId }, 201);
    }

    // PUT /api/products?id=xxx
    if (method === 'PUT') {
      const id = url.searchParams.get('id');
      if (!id) return json({ error: 'ID required' }, 400);
      const body = await req.json();
      const { _id, ...updates } = body;
      updates.updatedAt = new Date();
      const result = await col.updateOne({ _id: new ObjectId(id) }, { $set: updates });
      if (result.matchedCount === 0) return json({ error: 'Not found' }, 404);
      return json({ success: true });
    }

    // DELETE /api/products?id=xxx
    if (method === 'DELETE') {
      const id = url.searchParams.get('id');
      if (!id) return json({ error: 'ID required' }, 400);
      const result = await col.deleteOne({ _id: new ObjectId(id) });
      if (result.deletedCount === 0) return json({ error: 'Not found' }, 404);
      return json({ success: true });
    }

    return json({ error: 'Method not allowed' }, 405);
  } catch (err) {
    console.error('Products error:', err);
    return json({ error: 'Server error', detail: err.message }, 500);
  }
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export const config = { path: '/api/products' };
