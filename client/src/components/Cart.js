import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addToCart, removeFromCart, updateQuantity } from '../redux/cartSlice';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaPlus, FaMinus, FaTrash } from 'react-icons/fa';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://shop-hub-backend.onrender.com';

function Cart() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const items = useSelector(state => state.cart.items || []);
  const user = useSelector(state => state.auth.user);
  const token = localStorage.getItem('token');

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Load cart from backend when logged in
  useEffect(() => {
    if (user?.id && token && items.length === 0) {
      axios.get(`${API_BASE_URL}/api/cart/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => {
        res.data.items?.forEach(item => {
          dispatch(addToCart({
            id: item.productId || item._id,
            name: item.name,
            price: item.price,
            image: item.image,
            quantity: item.quantity
          }));
        });
      })
      .catch(() => {});
    }
  }, [user, token, items.length, dispatch]);

  // Save cart to backend on change
  useEffect(() => {
    if (user?.id && token && items.length > 0) {
      const timeout = setTimeout(() => {
        axios.post(`${API_BASE_URL}/api/cart/${user.id}`, { items }, {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => {});
      }, 800);
      return () => clearTimeout(timeout);
    }
  }, [items, user, token]);

  const changeQuantity = (id, delta) => {
    const item = items.find(i => i.id === id);
    if (item) {
      const newQty = Math.max(1, item.quantity + delta);
      dispatch(updateQuantity({ id, quantity: newQty }));
    }
  };

  if (!user) {
    return (
      <div className="container py-5 text-center">
        <h3>Please login to view your cart</h3>
        <button onClick={() => navigate('/login')} className="btn btn-primary">Login</button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container py-5 text-center">
        <h3>Your cart is empty</h3>
        <a href="/" className="btn btn-primary">Continue Shopping</a>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <h2 className="mb-4">Your Cart ({items.length} items)</h2>
      <div className="row">
        <div className="col-lg-8">
          {items.map(item => (
            <div key={item.id} className="card mb-3">
              <div className="row g-0">
                <div className="col-md-3">
                  <img src={item.image || 'https://placehold.co/200'} className="img-fluid rounded-start" alt={item.name} />
                </div>
                <div className="col-md-9">
                  <div className="card-body">
                    <h5>{item.name}</h5>
                    <p className="text-muted">₹{item.price} each</p>
                    
                    <div className="d-flex align-items-center gap-3">
                      <div className="btn-group">
                        <button className="btn btn-outline-secondary" onClick={() => changeQuantity(item.id, -1)} disabled={item.quantity <= 1}>
                          <FaMinus />
                        </button>
                        <span className="btn btn-light px-4">{item.quantity}</span>
                        <button className="btn btn-outline-secondary" onClick={() => changeQuantity(item.id, 1)}>
                          <FaPlus />
                        </button>
                      </div>
                      <button className="btn btn-danger" onClick={() => dispatch(removeFromCart(item.id))}>
                        <FaTrash /> Remove
                      </button>
                    </div>
                    
                    <p className="mt-3 fw-bold text-success">
                      Subtotal: ₹{(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="col-lg-4">
          <div className="card sticky-top" style={{ top: '1rem' }}>
            <div className="card-body">
              <h4>Order Summary</h4>
              <hr />
              <div className="d-flex justify-content-between">
                <span>Total Items</span>
                <span>{items.reduce((s, i) => s + i.quantity, 0)}</span>
              </div>
              <div className="d-flex justify-content-between mt-2 fw-bold fs-5">
                <span>Total Amount</span>
                <span className="text-success">₹{total.toFixed(2)}</span>
              </div>
              <button 
                onClick={() => navigate('/delivery')} 
                className="btn btn-success btn-lg w-100 mt-4"
              >
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