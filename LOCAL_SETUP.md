# 🏺 Mahalaxmi Jwellers — Local Setup Guide

## How the Backend Works

```
┌─────────────────────────────────────────────────────────┐
│                    YOUR COMPUTER                        │
│                                                         │
│  Browser (localhost:8888)                               │
│       │                                                 │
│       ▼                                                 │
│  netlify dev  ◄── runs both frontend + backend locally  │
│  ├── Vite (React frontend)  → port 5173                 │
│  └── Functions server       → port 8888                 │
│          │                                              │
│          ▼                                              │
│  netlify/functions/         ← your backend code         │
│  ├── products.js            ← manages products          │
│  ├── orders.js              ← manages orders            │
│  ├── auth-login.js          ← admin login               │
│  ├── upload.js              ← image uploads             │
│  └── seed.js                ← fill DB with test data    │
└───────────────────┬─────────────────────────────────────┘
                    │ internet
        ┌───────────┴──────────┐
        ▼                      ▼
  MongoDB Atlas          Cloudinary
  (your database)        (image storage)
  FREE 512MB             FREE 25GB
```

### What happens when a customer buys something?

1. Customer fills checkout form → clicks "Place Order"
2. React calls `POST /api/orders` 
3. Netlify runs `netlify/functions/orders.js`
4. That file connects to MongoDB, saves the order
5. Customer sees "Order Successful!" with order ID
6. You open Admin Dashboard → Orders tab → see the order
7. You change status to "Shipped" → saved back to MongoDB

---

## Step-by-Step Local Setup

### Prerequisites
Make sure you have these installed:
```bash
node --version   # Must be v18 or higher
npm --version    # Comes with Node
```
Don't have Node? Download from: https://nodejs.org (choose LTS version)

---

### Step 1 — Extract the Project
Extract the zip file. You'll get a folder called `mahalaxmi-jwellers`.

---

### Step 2 — Open Terminal in the Project Folder

**Windows:** Right-click inside the `mahalaxmi-jwellers` folder → "Open in Terminal"  
**Mac:** Right-click folder → "New Terminal at Folder"

---

### Step 3 — Update Your Credentials

Open `.env.local` in any text editor (Notepad, VS Code, etc.)

Replace `YOUR_NEW_PASSWORD` with your new MongoDB password.
Replace `YOUR_NEW_API_SECRET` with your new Cloudinary API secret.

It should look like:
```

```

---

### Step 4 — Install Packages
```bash
npm install
```
This downloads all the libraries the project needs (~100MB, one time only).

---

### Step 5 — Install Netlify CLI
```bash
npm install -g netlify-cli
```
This installs the `netlify` command globally on your computer.

---

### Step 6 — Login to Netlify
```bash
netlify login
```
This opens a browser window. Click "Authorize". Done.

---

### Step 7 — Link to Your Netlify Site
```bash
netlify link --id 22cf5096-28df-4f1d-9ba4-a4df18e394c1
```
This connects your local project to the site we already created on Netlify.

---

### Step 8 — Start Local Development Server
```bash
npm run dev
```
This runs `netlify dev` which starts BOTH:
- Your React website (frontend)  
- Your backend functions (API)

Open your browser: **http://localhost:8888**

---

### Step 9 — Seed the Database (First Time Only)
Your MongoDB database is empty. Add sample products:

1. Go to http://localhost:8888/admin
2. Login with password: `Mahalaxmi@2024`
3. Click the **"Seed DB"** button on the Dashboard
4. You'll see "Seeded 6 products!" message
5. Go to Products page — your jewellery is now showing!

---

## Testing Each Feature

### Test Product Listing
- Open http://localhost:8888/products
- You should see 6 jewellery products loaded from MongoDB
- Try the search bar and category filters

### Test Shopping Cart
- Click any product → "Add to Cart"
- Go to Cart → change quantity → proceed to checkout

### Test Placing an Order
- Fill checkout form with test details
- Click "Place Order"
- Open Admin → Orders tab → your order should appear

### Test Admin Login
- Go to http://localhost:8888/admin
- Enter password: `Mahalaxmi@2024`
- You'll see the Dashboard with live stats

### Test Adding a Product (Admin)
- Admin → Products tab → "Add New"
- Fill in product name, price, category
- Upload an image (goes to Cloudinary)
- Save → appears in products list

### Test Image Upload
- In Admin → Products → Add New
- Click "Upload Image" → select any photo from your computer
- It uploads to Cloudinary and shows preview

---

## Deploy to Production (After Testing)

When you're happy with local testing, deploy to live:

```bash
# Build the React frontend
npm run build

# Deploy everything to Netlify (your site ID)
netlify deploy --prod --site 22cf5096-28df-4f1d-9ba4-a4df18e394c1
```

Your live site: **https://mahalaxmi-jwellers.netlify.app**

---

## Common Problems & Solutions

### "MongoDB connection failed"
- Check your MONGODB_URI password in `.env.local`
- Go to MongoDB Atlas → Network Access → make sure `0.0.0.0/0` is allowed

### "Products not loading"
- Make sure you clicked "Seed DB" in Admin panel
- Check browser console (F12) for errors

### "Admin login not working"  
- Password is case-sensitive: `Mahalaxmi@2024`
- Make sure `.env.local` has `ADMIN_PASSWORD=`

### "Port already in use"
```bash
# Kill whatever is using port 8888
npx kill-port 8888
npm run dev
```

---

## Project File Structure Explained

```
mahalaxmi-jwellers/
│
├── .env.local              ← Your secret keys (never share/commit this)
├── netlify.toml            ← Netlify configuration
├── package.json            ← Project dependencies
├── vite.config.js          ← Frontend build config
│
├── src/                    ← FRONTEND (React)
│   ├── main.jsx            ← Entry point
│   ├── App.jsx             ← Routes (which URL shows which page)
│   ├── api.js              ← All API calls to backend
│   ├── store.js            ← Cart + Admin state management
│   ├── i18n.js             ← English/Marathi translations
│   │
│   ├── components/
│   │   ├── Navbar.jsx      ← Top navigation bar
│   │   ├── Footer.jsx      ← Bottom footer
│   │   └── ProductCard.jsx ← Individual product card
│   │
│   └── pages/
│       ├── HomePage.jsx        ← Main landing page
│       ├── ProductsPage.jsx    ← All products with filters
│       ├── ProductDetailPage.jsx ← Single product view
│       ├── CartPage.jsx        ← Shopping cart
│       ├── CheckoutPage.jsx    ← Order form (saves to MongoDB)
│       ├── AboutPage.jsx       ← About us
│       ├── ContactPage.jsx     ← Contact form
│       └── AdminPage.jsx       ← Full admin dashboard
│
└── netlify/functions/      ← BACKEND (Node.js API)
    ├── auth-login.js       ← POST /api/auth/login
    ├── products.js         ← GET/POST/PUT/DELETE /api/products
    ├── orders.js           ← GET/POST/PUT/DELETE /api/orders
    ├── upload.js           ← POST /api/upload
    ├── seed.js             ← POST /api/seed
    └── lib/
        ├── db.js           ← MongoDB connection
        └── auth.js         ← JWT token logic
```

---

## API Endpoints Reference

| Method | URL | Who can call | What it does |
|--------|-----|-------------|--------------|
| GET | /api/products | Anyone | Get all products |
| GET | /api/products?id=xxx | Anyone | Get one product |
| POST | /api/products | Admin only | Add new product |
| PUT | /api/products?id=xxx | Admin only | Update product |
| DELETE | /api/products?id=xxx | Admin only | Delete product |
| POST | /api/orders | Anyone | Place an order |
| GET | /api/orders | Admin only | Get all orders |
| PUT | /api/orders?id=xxx | Admin only | Update order status |
| POST | /api/auth/login | Anyone | Admin login |
| POST | /api/upload | Admin only | Upload image |
| POST | /api/seed | Admin only | Seed test products |
