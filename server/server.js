// server/server.js
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// === CORS ===
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://ecommerce-platform-lime.vercel.app'
  ],
  credentials: true
}));

app.use(express.json());

// === IMPORT MODELS (once!) ===
const User = require('./models/User');
const Product = require('./models/Product');
const Order = require('./models/Order');

// === IMPORT ROUTES ===
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');

// === MOUNT ROUTES ===
app.use('/api', authRoutes);          // /api/login, /api/register
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

// === ROOT & HEALTH ENDPOINTS ===
app.get('/', (req, res) => {
  res.json({
    message: 'ShopHub Backend API is LIVE!',
    version: '1.0.0',
    endpoints: {
      products: '/api/products',
      login: '/api/login',
      register: '/api/register',
      cart: '/api/cart/:userId',
      orders: '/api/orders/:userId'
    }
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', time: new Date().toISOString() });
});

// === MONGODB CONNECTION ===
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// === START SERVER ===
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));