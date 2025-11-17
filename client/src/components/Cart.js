import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { addToCart, removeFromCart, updateCartItemQuantity, clearCart } from '../redux/cartSlice';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaPlus, FaMinus, FaTrash } from 'react-icons/fa';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://shop-hub-backend.onrender.com';

function Cart() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const cartItems = useSelector(state => state.cart.items || []);
  const user = useSelector(state => state.auth.user);
  const token = localStorage.getItem('token');

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Load cart from backend
  useEffect(() => {
    if (user?.id && token) {
      axios.get(`${API_BASE_URL}/api/cart/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => {
        dispatch(clearCart());
        (res.data.items || []).forEach(item => {
          dispatch(addToCart({
            id: item.productId || item._id,
            name: item.name,
            price: item.price,
            image: item.image,
            quantity: item.quantity || 1
          }));
        });
      })
      .catch(() => {});
    }
  }, [user, token, dispatch]);

  // Save cart to backend
  useEffect(() => {
    if (user?.id && token && cartItems.length > 0) {
      const timer = setTimeout(() => {
        axios.post(`${API_BASE_URL}/api/cart/${user.id}`, { items: cartItems }, {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => {});
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [cartItems, user, token]);

  const changeQty = (id, delta) => {
    const item = cartItems.find(i => i.id === id);
    if (item) {
      dispatch(updateCartItemQuantity({ id, quantity: Math.max(1, item.quantity + delta) }));
    }
  };

  if (!user) return <div className="container py-5 text-center"><h3>Please <Link to="/login">login</Link> to view cart</h3></div>;
  if (cartItems.length === 0) return <div className="container py-5 text-center"><h3>Cart is empty</h3><Link to="/" className="btn btn-primary">Shop Now</Link></div>;

  return (
    <div className="container py-4">
      <h2>Your Cart ({cartItems.length} items)</h2>
      <div className="row">
        <div className="col-lg-8">
          {cartItems.map(item => (
            <div key={item.id} className="card mb-3">
              <div className="card-body d-flex justify-content-between align-items-center">
                <div className="d-flex">
                  <img src={item.image || 'https://placehold.co/100'} alt={item.name} style={{width: '80px', height: '80px', objectFit: 'cover', marginRight: '1rem'}} />
                  <div>
                    <h5>{item.name}</h5>
                    <p>₹{item.price} each</p>
                  </div>
                </div>
                <div className="d-flex align-items-center gap-3">
                  <div className="btn-group">
                    <button className="btn btn-outline-secondary" onClick={() => changeQty(item.id, -1)} disabled={item.quantity <= 1}><FaMinus /></button>
                    <span className="btn btn-light">{item.quantity}</span>
                    <button className="btn btn-outline-secondary" onClick={() => changeQty(item.id, 1)}><FaPlus /></button>
                  </div>
                  <button className="btn btn-danger" onClick={() => dispatch(removeFromCart(item.id))}><FaTrash /></button>
                </div>
                <strong>₹{(item.price * item.quantity).toFixed(2)}</strong>
              </div>
            </div>
          ))}
        </div>
        <div className="col-lg-4">
          <div className="card">
            <div className="card-body">
              <h4>Total: ₹{total.toFixed(2)}</h4>
              <button onClick={() => navigate('/delivery')} className="btn btn-success w-100 mt-3">Proceed to Checkout</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cart;