const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

dotenv.config();

const app = express();
app.use(cors({
  origin: (origin, callback) => {
    const allowed = [
      'http://localhost:3000',
      'https://ecommerce-platform-lime.vercel.app'
    ];
    if (!origin || allowed.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  password: String,
  isAdmin: { type: Boolean, default: false }
});
const User = mongoose.model('User', userSchema);

const productSchema = new mongoose.Schema({
  name: String,
  price: Number,
  description: String,
  image: String,
  category: String
});
const Product = mongoose.model('Product', productSchema);

const orderSchema = new mongoose.Schema({
  userId: String,
  items: Array,
  total: Number,
  delivery: Object,
  status: { type: String, default: 'pending' },
  date: { type: Date, default: Date.now }
});
const Order = mongoose.model('Order', orderSchema);

// Middleware
const authMiddleware = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ error: 'Invalid token' });
    req.user = decoded;
    next();
  });
};

const adminMiddleware = (req, res, next) => {
  if (!req.user.isAdmin) return res.status(403).json({ error: 'Admin access required' });
  next();
};

// Routes
app.post('/api/register', async (req, res) => {
  const { email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ email, password: hashedPassword });
  await user.save();
  res.json({ user: { email, isAdmin: user.isAdmin, id: user._id } });
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (user && await bcrypt.compare(password, user.password)) {
    const token = jwt.sign({ id: user._id, email: user.email, isAdmin: user.isAdmin }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

app.get('/api/products', async (req, res) => {
  const products = await Product.find();
  res.json(products);
});

app.post('/api/products', authMiddleware, adminMiddleware, async (req, res) => {
  const product = new Product(req.body);
  await product.save();
  res.json(product);
});

app.get('/api/cart/:userId', authMiddleware, async (req, res) => {
  let cart = await Order.findOne({ userId: req.params.userId, status: 'pending' });
  if (!cart) {
    cart = new Order({ userId: req.params.userId, items: [], total: 0, status: 'pending' });
    await cart.save();
  }
  res.json(cart);
});

app.post('/api/cart/:userId', authMiddleware, async (req, res) => {
  const { items } = req.body;
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  let cart = await Order.findOne({ userId: req.params.userId, status: 'pending' });
  if (cart) {
    cart.items = items;
    cart.total = total;
  } else {
    cart = new Order({ userId: req.params.userId, items, total, status: 'pending' });
  }
  await cart.save();
  res.json(cart);
});

// Added: Delete cart item route
app.delete('/api/cart/:userId/item/:itemId', authMiddleware, async (req, res) => {
  const cart = await Order.findOne({ userId: req.params.userId, status: 'pending' });
  if (cart) {
    cart.items = cart.items.filter(item => item.id !== req.params.itemId);
    cart.total = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    await cart.save();
    res.json(cart);
  } else {
    res.status(404).json({ error: 'Cart not found' });
  }
});

app.post('/api/orders', authMiddleware, async (req, res) => {
  const { userId, items, total, delivery } = req.body;
  const order = new Order({ userId, items, total, delivery, status: 'completed' });
  await order.save();
  await Order.deleteOne({ userId, status: 'pending' });
  res.json(order);
});

app.get('/api/orders/:userId', authMiddleware, async (req, res) => {
  const orders = await Order.find({ userId: req.params.userId, status: 'completed' });
  res.json(orders);
});

// === ROOT / HEALTH CHECK ===
app.get('/', (req, res) => {
  res.json({ 
    message: 'ShopHub Backend API is LIVE!', 
    version: '1.0.0',
    endpoints: {
      products: '/api/products',
      login: '/api/login',
      register: '/api/register'
    }
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', time: new Date().toISOString() });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
