import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addToCart, removeFromCart, updateQuantity } from '../redux/cartSlice';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://shop-hub-backend.onrender.com';

function Cart() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const items = useSelector(state => state.cart.items || []);
  const user = useSelector(state => state.auth.user);
  const token = localStorage.getItem('token');

  const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  // LOAD CART FROM SERVER ON EVERY MOUNT (Fixes disappearing cart)
  useEffect(() => {
    if (user?.id && token) {
      axios.get(`${API_BASE_URL}/api/cart/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => {
        if (res.data.items && res.data.items.length > 0) {
          res.data.items.forEach(item => {
            dispatch(addToCart({
              id: item.productId || item._id,
              name: item.name,
              price: item.price,
              image: item.image,
              quantity: item.quantity
            }));
          });
        }
      })
      .catch(err => console.log("No saved cart or error:", err.response?.status));
    }
  }, [user, token, dispatch]);

  // SAVE CART TO SERVER ON EVERY CHANGE
  useEffect(() => {
    if (user?.id && token && items.length > 0) {
      const timer = setTimeout(() => {
        axios.post(`${API_BASE_URL}/api/cart/${user.id}`, { items }, {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => {});
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [items, user, token]);

  const changeQty = (id, delta) => {
    const item = items.find(i => i.id === id);
    if (item) {
      const newQty = Math.max(1, item.quantity + delta);
      dispatch(updateQuantity({ id, quantity: newQty }));
    }
  };

  if (!user) {
    return (
      <div className="container text-center py-5">
        <h3>Please login to view your cart</h3>
        <button onClick={() => navigate('/login')} className="btn btn-primary">Login Now</button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container text-center py-5">
        <h3>Your cart is empty</h3>
        <a href="/" className="btn btn-primary">Start Shopping</a>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <h2>Your Cart</h2>
      <div className="row">
        <div className="col-lg-8">
          {items.map(item => (
            <div key={item.id} className="card mb-3">
              <div className="row g-0">
                <div className="col-3">
                  <img src={item.image || '/placeholder.jpg'} className="img-fluid rounded-start" alt={item.name} />
                </div>
                <div className="col-9">
                  <div className="card-body">
                    <h5>{item.name}</h5>
                    <div className="d-flex align-items-center gap-3 my-3">
                      <button className="btn btn-outline-secondary" onClick={() => changeQty(item.id, -1)} disabled={item.quantity <= 1}>−</button>
                      <span className="fw-bold fs-5">{item.quantity}</span>
                      <button className="btn btn-outline-secondary" onClick={() => changeQty(item.id, 1)}>+</button>
                      <button className="btn btn-danger ms-4" onClick={() => dispatch(removeFromCart(item.id))}>Remove</button>
                    </div>
                    <p className="h5 text-success">₹{(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="col-lg-4">
          <div className="card">
            <div className="card-body">
              <h4>Total: ₹{total.toFixed(2)}</h4>
              <button onClick={() => navigate('/delivery')} className="btn btn-success w-100 mt-3">
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