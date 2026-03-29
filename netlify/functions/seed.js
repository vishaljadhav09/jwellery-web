import { connectDB, getDB } from './lib/db.js';
import { requireAuth } from './lib/auth.js';

const SEED_PRODUCTS = [
  {
    name: "Lakshmi Coin Necklace",
    nameMarathi: "लक्ष्मी नाणे हार",
    category: "necklaces",
    metal: "silver",
    price: 4500,
    originalPrice: 5500,
    weight: "45g",
    purity: "92.5% Sterling Silver",
    image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&q=80",
    images: ["https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&q=80"],
    description: "Traditional Lakshmi coin necklace, handcrafted by skilled artisans. Perfect for festivals and weddings.",
    descriptionMarathi: "कुशल कारागिरांनी हस्तनिर्मित पारंपारिक लक्ष्मी नाणे हार.",
    tags: ["bestseller", "festive"],
    inStock: true,
    featured: true,
    rating: 4.8,
    reviews: 124,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: "Kolhapuri Saaj Necklace",
    nameMarathi: "कोल्हापुरी साज",
    category: "necklaces",
    metal: "silver",
    price: 8500,
    originalPrice: 10000,
    weight: "85g",
    purity: "92.5% Sterling Silver",
    image: "https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=500&q=80",
    images: ["https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=500&q=80"],
    description: "Iconic Kolhapuri Saaj, symbol of Maharashtrian culture.",
    descriptionMarathi: "महाराष्ट्रीय संस्कृतीचे प्रतीक कोल्हापुरी साज.",
    tags: ["bridal", "traditional"],
    inStock: true,
    featured: true,
    rating: 4.9,
    reviews: 89,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: "Silver Jhumka Earrings",
    nameMarathi: "चांदीचे झुमके",
    category: "earrings",
    metal: "silver",
    price: 1800,
    originalPrice: 2200,
    weight: "18g",
    purity: "92.5% Sterling Silver",
    image: "https://images.unsplash.com/photo-1573408301185-9519f94bc1f0?w=500&q=80",
    images: ["https://images.unsplash.com/photo-1573408301185-9519f94bc1f0?w=500&q=80"],
    description: "Classic silver jhumka earrings with intricate filigree work.",
    descriptionMarathi: "नाजूक फिलीग्री कामासह क्लासिक चांदीचे झुमके.",
    tags: ["popular", "everyday"],
    inStock: true,
    featured: true,
    rating: 4.7,
    reviews: 203,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: "Panchdhatu Bangle Set",
    nameMarathi: "पंचधातू बांगड्या संच",
    category: "bangles",
    metal: "silver",
    price: 3200,
    originalPrice: 3800,
    weight: "60g",
    purity: "92.5% Sterling Silver",
    image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=500&q=80",
    images: ["https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=500&q=80"],
    description: "Set of 4 traditional silver bangles with beautiful engraved patterns.",
    descriptionMarathi: "सुंदर कोरलेल्या नमुन्यांसह 4 पारंपारिक चांदीच्या बांगड्यांचा संच.",
    tags: ["bestseller", "traditional"],
    inStock: true,
    featured: false,
    rating: 4.6,
    reviews: 156,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: "Mahalaxmi Goddess Pendant",
    nameMarathi: "महालक्ष्मी देवी लॉकेट",
    category: "pendants",
    metal: "silver",
    price: 2500,
    originalPrice: 3000,
    weight: "22g",
    purity: "92.5% Sterling Silver",
    image: "https://images.unsplash.com/photo-1608755728617-aefab37d2edd?w=500&q=80",
    images: ["https://images.unsplash.com/photo-1608755728617-aefab37d2edd?w=500&q=80"],
    description: "Beautifully crafted Goddess Mahalaxmi pendant.",
    descriptionMarathi: "सुंदर कोरलेला महालक्ष्मी देवीचा लॉकेट.",
    tags: ["religious", "festive"],
    inStock: true,
    featured: true,
    rating: 4.9,
    reviews: 341,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: "Anklet Payal Set",
    nameMarathi: "पायल संच",
    category: "anklets",
    metal: "silver",
    price: 2800,
    originalPrice: 3500,
    weight: "40g",
    purity: "92.5% Sterling Silver",
    image: "https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=500&q=80",
    images: ["https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=500&q=80"],
    description: "Traditional payal anklet set with ghungroo bells.",
    descriptionMarathi: "घुंगरू घंटांसह पारंपारिक पायल संच.",
    tags: ["traditional", "bridal"],
    inStock: true,
    featured: false,
    rating: 4.5,
    reviews: 98,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export default async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const user = requireAuth(req);
  if (!user) return json({ error: 'Unauthorized' }, 401);

  try {
    const client = await connectDB();
    const db = getDB(client);
    const col = db.collection('products');

    const existing = await col.countDocuments();
    if (existing > 0) {
      return json({ message: `DB already has ${existing} products. Use force=true to reseed.`, count: existing });
    }

    const result = await col.insertMany(SEED_PRODUCTS);
    return json({ success: true, inserted: result.insertedCount });
  } catch (err) {
    console.error('Seed error:', err);
    return json({ error: err.message }, 500);
  }
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export const config = { path: '/api/seed' };
