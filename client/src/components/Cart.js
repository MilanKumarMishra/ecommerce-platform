import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addToCart, removeFromCart, updateCartItemQuantity, clearCart } from '../redux/cartSlice';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaPlus, FaMinus, FaTrash } from 'react-icons/fa';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function Cart() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const cartItems = useSelector(state => state.cart.items);
  const user = useSelector(state => state.auth.user);
  const token = localStorage.getItem('token');

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Load cart from backend on mount
  useEffect(() => {
    if (user?.id && token) {
      axios.get(`${API_BASE_URL}/api/cart/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => {
          dispatch(clearCart());
          (res.data.items || []).forEach(item => {
            dispatch(addToCart({
              id: item.id || item._id,
              name: item.name,
              price: item.price,
              description: item.description,
              image: item.image,
              quantity: item.quantity
            }));
          });
        })
        .catch(err => {
          if (err.response?.status === 401) {
            localStorage.removeItem('token');
            navigate('/login');
          }
        });
    }
  }, [user, token, dispatch, navigate]);

  // Sync cart to backend on change
  useEffect(() => {
    if (user?.id && token && cartItems.length > 0) {
      const timer = setTimeout(() => {
        axios.post(`${API_BASE_URL}/api/cart/${user.id}`, { items: cartItems }, {
          headers: { Authorization: `Bearer ${token}` }
        })
          .catch(err => console.error('Sync error:', err));
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [cartItems, user, token]);

  const handleQuantityChange = (id, change) => {
    dispatch(updateCartItemQuantity({ id, quantity: Math.max(1, cartItems.find(i => i.id === id)?.quantity + change) }));
  };

  const handleRemove = (id) => {
    dispatch(removeFromCart(id));
    toast.success('Item removed');
  };

  const handleCheckout = () => {
    if (!user) {
      toast.error('Please login to checkout');
      navigate('/login');
      return;
    }
    navigate('/delivery');
  };

  if (!user) {
    return (
      <div className="container mt-4 text-center">
        <h3>Please login to view cart</h3>
        <button className="btn btn-primary" onClick={() => navigate('/login')}>Login</button>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <h2>Your Cart ({cartItems.length} items)</h2>
      {cartItems.length === 0 ? (
        <div className="alert alert-info">Your cart is empty. <Link to="/">Continue shopping</Link></div>
      ) : (
        <>
          <div className="row">
            <div className="col-lg-8">
              {cartItems.map(item => (
                <div key={item.id} className="card mb-3">
                  <div className="card-body">
                    <div className="row">
                      <div className="col-md-2">
                        <img src={item.image} alt={item.name} className="img-fluid" style={{height: '100px'}} />
                      </div>
                      <div className="col-md-10">
                        <h5>{item.name}</h5>
                        <p>${item.price} x {item.quantity} = ${(item.price * item.quantity).toFixed(2)}</p>
                        <div className="btn-group">
                          <button className="btn btn-outline-secondary" onClick={() => handleQuantityChange(item.id, -1)} disabled={item.quantity <= 1}>-</button>
                          <button className="btn btn-light disabled">{item.quantity}</button>
                          <button className="btn btn-outline-secondary" onClick={() => handleQuantityChange(item.id, 1)}>+</button>
                        </div>
                        <button className="btn btn-danger mt-2" onClick={() => handleRemove(item.id)}>
                          <FaTrash />
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
                  <h4>Summary</h4>
                  <p>Total: ${total.toFixed(2)}</p>
                  <button onClick={handleCheckout} className="btn btn-success w-100">Checkout</button>
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