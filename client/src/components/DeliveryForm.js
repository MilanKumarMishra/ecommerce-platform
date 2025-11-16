import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { removeFromCart } from '../redux/cartSlice';
import { FaMapMarkerAlt, FaUser, FaCity, FaHashtag } from 'react-icons/fa';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function DeliveryForm() {
  const cartItems = useSelector(state => state.cart.items);
  const user = useSelector(state => state.cart.user);
  const token = localStorage.getItem('token');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [zip, setZip] = useState('');

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!user) return toast.error('Please login');
    axios.post(`${API_BASE_URL}/api/orders`, {
      userId: user.id,
      items: cartItems,
      total,
      delivery: { name, address, city, zip }
    }, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(() => {
        toast.success('Order placed successfully!');
        cartItems.forEach(item => dispatch(removeFromCart(item.id)));
        navigate('/thank-you');
      })
      .catch(err => toast.error('Order failed. Try again.'));
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="card border-0 shadow-lg" style={{ borderRadius: '20px' }}>
            <div className="card-body p-5">
              <h2 className="text-center mb-4 fw-bold text-primary">Delivery Address</h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="form-label fw-medium"><FaUser className="me-2" /> Full Name</label>
                  <input type="text" className="form-control form-control-lg" value={name} onChange={e => setName(e.target.value)} required />
                </div>
                <div className="mb-4">
                  <label className="form-label fw-medium"><FaMapMarkerAlt className="me-2" /> Address</label>
                  <input type="text" className="form-control form-control-lg" value={address} onChange={e => setAddress(e.target.value)} required />
                </div>
                <div className="mb-4">
                  <label className="form-label fw-medium"><FaCity className="me-2" /> City</label>
                  <input type="text" className="form-control form-control-lg" value={city} onChange={e => setCity(e.target.value)} required />
                </div>
                <div className="mb-4">
                  <label className="form-label fw-medium"><FaHashtag className="me-2" /> ZIP Code</label>
                  <input type="text" className="form-control form-control-lg" value={zip} onChange={e => setZip(e.target.value)} required />
                </div>
                <div className="d-flex justify-content-between align-items-center mb-4 p-3 bg-light rounded">
                  <span className="fw-bold">Total Amount:</span>
                  <span className="text-success fs-4">${total.toFixed(2)}</span>
                </div>
                <button type="submit" className="btn btn-success w-100 btn-lg">
                  Place Order
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DeliveryForm;