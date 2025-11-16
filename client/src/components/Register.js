// client/src/components/Register.js
import React, { useState } from 'react';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { setUser } from '../redux/authSlice';  // FIXED
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { jwtDecode } from 'jwt-decode';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post(`${API_BASE_URL}/api/register`, { email, password })
      .then(res => {
        localStorage.setItem('token', res.data.token);
        const decoded = jwtDecode(res.data.token);
        dispatch(setUser({ id: decoded.id, email: decoded.email, isAdmin: decoded.isAdmin }));
        toast.success('Account created!');
        navigate('/');
      })
      .catch(err => toast.error(err.response?.data?.error || 'Registration failed'));
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card">
            <div className="card-body p-5">
              <h2 className="text-center mb-4">Register</h2>
              <form onSubmit={handleSubmit}>
                <input
                  type="email"
                  placeholder="Email"
                  className="form-control mb-3"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
                <input
                  type="password"
                  placeholder="Password"
                  className="form-control mb-3"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
                <button type="submit" className="btn btn-success w-100">Register</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;