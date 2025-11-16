// client/src/components/Cart.js
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { removeFromCart, clearCart } from '../redux/cartSlice';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaPlus, FaMinus, FaTrash } from 'react-icons/fa';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function Cart() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const cartItems = useSelector(state => state.cart.items);
  const user = useSelector(state => state.auth.user);  // From authSlice
  const token = localStorage.getItem('token');

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Load cart from backend on mount
  useEffect(() => {
    if (user?.id && token) {
      loadCartFromBackend(user.id);
    }
  }, [user]);

  const loadCartFromBackend = async (id) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/cart/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Clear Redux and add backend items
      dispatch(clearCart());
      res.data.items.forEach(item => {
        dispatch({
          type: 'cart/addItem',
          payload: { ...item, id: item.id || item._id }
        });
      });
    } catch (err) {
      console.error('Failed to load cart:', err);
    }
  };

  // Sync cart to backend on change
  useEffect(() => {
    if (user?.id && token && cartItems.length > 0) {
      const timer = setTimeout(() => {
        saveCartToBackend();
      }, 1000);  // Debounce 1s
      return () => clearTimeout(timer);
    }
  }, [cartItems, user]);

  const saveCartToBackend = async () => {
    try {
      await axios.post(`${API_BASE_URL}/api/cart/${user.id}`, { items: cartItems }, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      toast.error('Failed to save cart');
    }
  };

  const handleQuantityChange = (id, change) => {
    const item = cartItems.find(i => i.id === id);
    if (item) {
      const newQuantity = Math.max(1, item.quantity + change);
      dispatch({
        type: 'cart/updateQuantity',
        payload: { id, quantity: newQuantity }
      });
    }
  };

  const handleRemoveFromCart = (id) => {
    dispatch(removeFromCart(id));
  };

  const handleCheckout = () => {
    if (!user) {
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
    <div className="container mt-4">
      <h2 className="mb-4">Your Cart</h2>

      {cartItems.length === 0 ? (
        <div className="alert alert-info text-center">
          Your cart is empty. <a href="/">Continue shopping</a>
        </div>
      ) : (
        <>
          <div className="row">
            <div className="col-lg-8">
              {cartItems.map(item => (
                <div key={item.id} className="card mb-3">
                  <div className="card-body d-flex justify-content-between align-items-center">
                    <div>
                      <h5 className="card-title">{item.name}</h5>
                      <p className="text-muted mb-1">Price: ${item.price.toFixed(2)}</p>

                      <div className="d-flex align-items-center">
                        <button
                          onClick={() => handleQuantityChange(item.id, -1)}
                          className="btn btn-outline-secondary btn-sm"
                          disabled={item.quantity <= 1}
                        >
                          <FaMinus />
                        </button>
                        <span className="mx-3 fw-bold">{item.quantity}</span>
                        <button
                          onClick={() => handleQuantityChange(item.id, 1)}
                          className="btn btn-outline-secondary btn-sm"
                        >
                          <FaPlus />
                        </button>
                      </div>

                      <p className="mt-2 mb-0 text-success fw-bold">
                        Subtotal: ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>

                    <button
                      onClick={() => handleRemoveFromCart(item.id)}
                      className="btn btn-outline-danger"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="col-lg-4">
              <div className="card">
                <div className="card-body">
                  <h4 className="card-title">Order Summary</h4>
                  <hr />
                  <div className="d-flex justify-content-between mb-2">
                    <span>Subtotal</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-3">
                    <span>Shipping</span>
                    <span>Free</span>
                  </div>
                  <hr />
                  <div className="d-flex justify-content-between fw-bold fs-5">
                    <span>Total</span>
                    <span className="text-success">${total.toFixed(2)}</span>
                  </div>

                  <button onClick={handleCheckout} className="btn btn-success w-100 mt-3">
                    Proceed to Checkout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Cart;