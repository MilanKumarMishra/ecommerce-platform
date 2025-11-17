// client/src/components/Cart.js
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { removeFromCart, clearCart } from '../redux/cartSlice';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://shop-hub-backend.onrender.com';

function Cart() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items = [] } = useSelector(state => state.cart);
  const user = useSelector(state => state.auth.user);
  const token = localStorage.getItem('token');

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Load cart from backend
  useEffect(() => {
    if (user?.id && token) {
      loadCartFromBackend();
    }
  }, [user]);

  const loadCartFromBackend = async () => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/cart/${user.id}`,  // FIXED: Added /api
        { headers: { Authorization: `Bearer ${token}` } }
      );
      dispatch(clearCart());
      res.data.items.forEach(item => {
        dispatch({
          type: 'cart/addItem',
          payload: { ...item, id: item.id || item._id }
        });
      });
    } catch (err) {
      if (err.response?.status !== 404) {
        console.error('Failed to load cart:', err);
        toast.error('Failed to load cart');
      }
      // 404 is normal for first-time users → empty cart
    }
  };

  // Save cart to backend (debounced)
  useEffect(() => {
    if (user?.id && token && items.length > 0) {
      const timer = setTimeout(() => {
        saveCartToBackend();
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [items]);

  const saveCartToBackend = async () => {
    try {
      await axios.post(
        `${API_BASE_URL}/api/cart/${user.id}`,  // FIXED: Added /api
        { items },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error('Failed to save cart:', err);
    }
  };

  const handleRemove = (id) => {
    dispatch(removeFromCart(id));
  };

  const handleCheckout = () => {
    navigate('/delivery', { state: { cart: items } });
  };

  if (!user) {
    return (
      <div className="container py-5 text-center">
        <h3>Please login to view your cart</h3>
        <Link to="/login" className="btn btn-primary">Login</Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container py-5 text-center">
        <h3>Your cart is empty</h3>
        <Link to="/" className="btn btn-primary">Continue Shopping</Link>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <h2>Your Cart</h2>
      <div className="row">
        <div className="col-lg-8">
          {items.map(item => (
            <div key={item.id} className="card mb-3">
              <div className="row g-0">
                <div className="col-md-4">
                  <img src={item.image || 'https://placehold.co/200x150'} className="img-fluid rounded-start" alt={item.name} />
                </div>
                <div className="col-md-8">
                  <div className="card-body">
                    <h5>{item.name}</h5>
                    <p>₹{item.price} × {item.quantity}</p>
                    <button onClick={() => handleRemove(item.id)} className="btn btn-danger btn-sm">
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="col-lg-4">
          <div className="card">
            <div className="card-body">
              <h4>Total: ₹{total}</h4>
              <button onClick={handleCheckout} className="btn btn-success w-100">
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cart;