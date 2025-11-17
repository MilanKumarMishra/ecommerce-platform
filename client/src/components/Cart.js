import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addToCart, removeFromCart, updateCartItemQuantity, loadCart } from '../redux/cartSlice'; // Added loadCart
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaPlus, FaMinus, FaTrash } from 'react-icons/fa';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function Cart() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const cartItems = useSelector(state => state.cart.items);
  const user = useSelector(state => state.cart.user);
  const token = localStorage.getItem('token');

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Load cart from backend on mount if logged in
  useEffect(() => {
    if (token) {
      axios.get(`${API_BASE_URL}/api/cart/${user?.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => {
          dispatch(loadCart(res.data.items || [])); // Use loadCart reducer
        })
        .catch(err => {
          toast.error('Failed to load cart');
          if (err.response?.status === 401) {
            localStorage.removeItem('token');
            navigate('/login');
          }
        });
    }
  }, [dispatch, navigate, token, user?.id]);

  // Sync cart to backend on change
  useEffect(() => {
    if (token && cartItems.length > 0) {
      const timer = setTimeout(() => {
        axios.post(`${API_BASE_URL}/api/cart/${user?.id}`, { items: cartItems }, {
          headers: { Authorization: `Bearer ${token}` }
        })
          .catch(err => toast.error('Failed to sync cart'));
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [cartItems, token, user?.id]);

  const handleQuantityChange = (id, change) => {
    const item = cartItems.find(i => i.id === id);
    if (item) {
      const newQuantity = Math.max(1, item.quantity + change);
      dispatch(updateCartItemQuantity({ id, quantity: newQuantity }));
    }
  };

  const handleRemoveFromCart = (id) => {
    dispatch(removeFromCart(id));
    if (token) {
      axios.delete(`${API_BASE_URL}/api/cart/${user?.id}/item/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .catch(err => toast.error('Failed to remove item'));
    }
  };

  const handleCheckout = () => {
    if (!token) {
      toast.error('Please login to checkout');
      navigate('/login');
      return;
    }
    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    navigate('/delivery');
  };

  return (
    <div className="container mt-5">
      <h2 className="mb-4 fw-bold text-primary">Your Cart</h2>

      {cartItems.length === 0 ? (
        <div className="text-center py-5">
          <div className="display-1 text-muted mb-3">Empty</div>
          <p className="lead">Your cart is empty. <a href="/" className="text-primary">Continue shopping</a></p>
        </div>
      ) : (
        <div className="row g-4">
          <div className="col-lg-8">
            {cartItems.map(item => (
              <div key={item.id} className="card mb-3 border-0 shadow-sm">
                <div className="card-body d-flex align-items-center p-4">
                  <img
                    src={item.image || 'https://placehold.co/80x80/6c5ce7/ffffff?text=Item'}
                    alt={item.name}
                    className="rounded me-4"
                    style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                  />
                  <div className="flex-grow-1">
                    <h5 className="mb-1 fw-semibold">{item.name}</h5>
                    <p className="text-muted mb-2">${item.price.toFixed(2)} each</p>

                    <div className="d-flex align-items-center gap-2">
                      <button onClick={() => handleQuantityChange(item.id, -1)} className="btn btn-outline-secondary btn-sm" disabled={item.quantity <= 1}>
                        <FaMinus />
                      </button>
                      <span className="fw-bold mx-2" style={{ minWidth: '30px', textAlign: 'center' }}>{item.quantity}</span>
                      <button onClick={() => handleQuantityChange(item.id, 1)} className="btn btn-outline-secondary btn-sm">
                        <FaPlus />
                      </button>
                      <span className="text-success fw-bold ms-3">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  </div>
                  <button onClick={() => handleRemoveFromCart(item.id)} className="btn btn-outline-danger btn-sm ms-3">
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="col-lg-4">
            <div className="card border-0 shadow-sm">
              <div className="card-body p-4">
                <h4 className="fw-bold mb-4">Order Summary</h4>
                <div className="d-flex justify-content-between mb-3">
                  <span>Subtotal</span>
                  <span className="fw-semibold">${total.toFixed(2)}</span>
                </div>
                <div className="d-flex justify-content-between mb-4 text-success">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <hr />
                <div className="d-flex justify-content-between fw-bold fs-5 mb-4">
                  <span>Total</span>
                  <span className="text-success">${total.toFixed(2)}</span>
                </div>
                <button onClick={handleCheckout} className="btn btn-success w-100 btn-lg">
                  Proceed to Checkout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cart;