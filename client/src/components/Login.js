// client/src/components/Login.js
import React, { useState } from 'react';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { setUser } from '../redux/authSlice';  // <-- CORRECT
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { jwtDecode } from 'jwt-decode';
import { FaUser, FaLock } from 'react-icons/fa';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post(`${API_BASE_URL}/api/login`, { email, password })
      .then(res => {
        localStorage.setItem('token', res.data.token);
        const decoded = jwtDecode(res.data.token);
        dispatch(setUser({
          id: decoded.id,
          email: decoded.email,
          isAdmin: decoded.isAdmin
        }));
        toast.success('Welcome back!');
        navigate('/');
      })
      .catch(err => toast.error(err.response?.data?.error || 'Login failed'));
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="card border-0 shadow-lg" style={{ borderRadius: '20px' }}>
            <div className="card-body p-5">
              <h2 className="text-center mb-4 fw-bold text-primary">Login</h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="form-label fw-medium">
                    <FaUser className="me-2 text-primary" /> Email
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
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary w-100 btn-lg mt-3">
                  Login
                </button>
              </form>
              <p className="text-center mt-4 text-muted">
                Don't have an account? <a href="/register" className="text-primary fw-medium">Sign up</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;