// server/routes/orders.js
const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const authMiddleware = require('../middleware/auth');

// GET orders for user
router.get('/:userId', authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId, status: 'completed' });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new order
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { userId, items, total, delivery } = req.body;
    const order = new Order({ userId, items, total, delivery, status: 'completed' });
    await order.save();

    // Clear pending cart
    await Order.deleteOne({ userId, status: 'pending' });

    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;