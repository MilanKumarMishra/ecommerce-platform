import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaPlus, FaBox, FaDollarSign, FaImage, FaTags } from 'react-icons/fa';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function AdminPanel() {
  const user = useSelector(state => state.cart.user);
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    if (!user?.isAdmin) {
      toast.error('Admin access required');
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post(`${API_BASE_URL}/api/products`, { name, price: parseFloat(price), description, image, category }, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(() => {
        toast.success('Product added!');
        setName(''); setPrice(''); setDescription(''); setImage(''); setCategory('');
      })
      .catch(err => toast.error('Failed to add product'));
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card border-0 shadow-lg" style={{ borderRadius: '20px' }}>
            <div className="card-body p-5">
              <h2 className="text-center mb-4 fw-bold text-primary">Add New Product</h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="form-label fw-medium"><FaBox className="me-2" /> Product Name</label>
                  <input type="text" className="form-control form-control-lg" value={name} onChange={e => setName(e.target.value)} required />
                </div>
                <div className="mb-4">
                  <label className="form-label fw-medium"><FaDollarSign className="me-2" /> Price</label>
                  <input type="number" step="0.01" className="form-control form-control-lg" value={price} onChange={e => setPrice(e.target.value)} required />
                </div>
                <div className="mb-4">
                  <label className="form-label fw-medium"><FaPlus className="me-2" /> Description</label>
                  <textarea className="form-control form-control-lg" rows="3" value={description} onChange={e => setDescription(e.target.value)} required />
                </div>
                <div className="mb-4">
                  <label className="form-label fw-medium"><FaImage className="me-2" /> Image URL</label>
                  <input type="url" className="form-control form-control-lg" value={image} onChange={e => setImage(e.target.value)} required />
                </div>
                <div className="mb-4">
                  <label className="form-label fw-medium"><FaTags className="me-2" /> Category</label>
                  <input type="text" className="form-control form-control-lg" value={category} onChange={e => setCategory(e.target.value)} required />
                </div>
                <button type="submit" className="btn btn-primary w-100 btn-lg">
                  Add Product
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminPanel;