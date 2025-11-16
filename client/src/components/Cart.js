// client/src/components/Cart.js
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { removeFromCart, clearCart } from '../redux/cartSlice';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items = [] } = useSelector((state) => state.cart);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(false);

  // Load user from localStorage (after login)
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setUserId(payload.id);
      // Load cart from backend
      if (payload.id) {
        loadCartFromBackend(payload.id);
      }
    }
  }, []);

  // Load cart from backend
  const loadCartFromBackend = async (id) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/cart/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      // Sync backend cart to Redux
      res.data.items.forEach(item => {
        dispatch({
          type: 'cart/addItem',
          payload: { ...item, id: item.id || item._id }
        });
      });
    } catch (err) {
      console.log('No cart found, starting fresh');
    }
  };

  // Save cart to backend whenever it changes
  useEffect(() => {
    if (userId && items.length > 0) {
      saveCartToBackend();
    }
  }, [items, userId]);

  const saveCartToBackend = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      await axios.post(
        `${API_BASE_URL}/api/cart/${userId}`,
        { items },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
    } catch (err) {
      console.error('Failed to save cart');
    }
    setLoading(false);
  };

  const handleRemove = (id) => {
    dispatch(removeFromCart(id));
    // Backend sync happens via useEffect
  };

  const handleCheckout = () => {
    navigate('/delivery', { state: { cart: items } });
  };

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (items.length === 0) {
    return (
      <div className="container py-5">
        <div className="card">
          <div className="card-body text-center">
            <i className="bi bi-cart-x display-1 text-muted"></i>
            <h3>Your cart is empty</h3>
            <Link to="/" className="btn btn-primary mt-3">Continue Shopping</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <h2 className="mb-4">Shopping Cart</h2>
      <div className="row">
        <div className="col-lg-8">
          {items.map((item) => (
            <div key={item.id} className="card mb-3">
              <div className="row g-0">
                <div className="col-md-3">
                  <img
                    src={item.image || 'https://placehold.co/150x150/6c5ce7/ffffff?text=Item'}
                    className="img-fluid rounded-start"
                    alt={item.name}
                    style={{ height: '150px', objectFit: 'cover' }}
                  />
                </div>
                <div className="col-md-9">
                  <div className="card-body d-flex justify-content-between">
                    <div>
                      <h5 className="card-title">{item.name}</h5>
                      <p className="text-muted">₹{item.price}</p>
                    </div>
                    <div className="d-flex align-items-center gap-3">
                      <span className="badge bg-primary">Qty: {item.quantity}</span>
                      <button
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => handleRemove(item.id)}
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="col-lg-4">
          <div className="card">
            <div className="card-body">
              <h5>Order Summary</h5>
              <hr />
              <div className="d-flex justify-content-between">
                <span>Subtotal</span>
                <strong>₹{total}</strong>
              </div>
              <hr />
              <button
                className="btn btn-success w-100"
                onClick={handleCheckout}
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Proceed to Checkout'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;