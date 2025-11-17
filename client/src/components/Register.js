import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaUser, FaLock, FaEnvelope } from 'react-icons/fa';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post(`${API_BASE_URL}/api/register`, { email, password })
      .then(res => {
        if (res.status === 200) { // Check status for success
          toast.success('Registered successfully! Please login.');
          navigate('/login');
        }
      })
      .catch(err => {
        if (err.response?.status === 400) {
          toast.error('User already exists');
        } else {
          toast.error(err.response?.data?.error || 'Registration failed');
        }
      });
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="card border-0 shadow-lg" style={{ borderRadius: '20px' }}>
            <div className="card-body p-5">
              <h2 className="text-center mb-4 fw-bold text-primary">Create Account</h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="form-label fw-medium">
                    <FaEnvelope className="me-2 text-primary" /> Email
                  </label>
                  <input
                    type="email"
                    className="form-control form-control-lg"
                    placeholder="you@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="form-label fw-medium">
                    <FaLock className="me-2 text-primary" /> Password
                  </label>
                  <input
                    type="password"
                    className="form-control form-control-lg"
                    placeholder="Choose a strong password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary w-100 btn-lg mt-3">
                  Sign Up
                </button>
              </form>
              <p className="text-center mt-4 text-muted">
                Already have an account? <a href="/login" className="text-primary fw-medium">Login</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;