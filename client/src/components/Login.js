import React, { useState } from 'react';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { setUser } from '../redux/authSlice';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { jwtDecode } from 'jwt-decode';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://shop-hub-backend.onrender.com';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    axios.post(`${API_BASE_URL}/api/login`, { email, password })
      .then(res => {
        localStorage.setItem('token', res.data.token);
        const decoded = jwtDecode(res.data.token);
        dispatch(setUser({ id: decoded.id, email: decoded.email, isAdmin: decoded.isAdmin }));
        toast.success('Login Successful!');
        navigate('/');
      })
      .catch(err => {
        toast.error(err.response?.data?.error || 'Login failed');
      });
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-5">
          <div className="card shadow">
            <div className="card-body p-5">
              <h2 className="text-center mb-4">Login</h2>
              <form onSubmit={handleLogin}>
                <input
                  type="email"
                  className="form-control mb-3"
                  placeholder="Email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
                <input
                  type="password"
                  className="form-control mb-4"
                  placeholder="Password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
                <button type="submit" className="btn btn-primary w-100">Login</button>
              </form>
              <p className="text-center mt-3">
                No account? <Link to="/register">Register here</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;