import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { setUser } from '../redux/cartSlice';
import { jwtDecode } from 'jwt-decode';
import { FaShoppingCart, FaUser, FaSignOutAlt, FaBoxOpen, FaUserCog, FaMoon, FaSun } from 'react-icons/fa';

function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(state => state.cart.user);
  const cartItems = useSelector(state => state.cart.items);
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const [isDark, setIsDark] = useState(
    localStorage.getItem('theme') === 'dark' || 
    (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)
  );

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        dispatch(setUser({ id: decoded.id, email: decoded.email, isAdmin: decoded.isAdmin }));
      } catch (err) {
        localStorage.removeItem('token');
      }
    }
  }, [dispatch]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const toggleTheme = () => setIsDark(prev => !prev);

  const handleLogout = () => {
    localStorage.removeItem('token');
    dispatch(setUser(null));
    navigate('/');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light sticky-top">
      <div className="container">
        {/* SVG Logo + ShopHub */}
        <Link className="navbar-brand d-flex align-items-center fw-bold text-primary" to="/">
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="me-2"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M19.5 7.5L12 3L4.5 7.5V18C4.5 18.8284 5.17157 19.5 6 19.5H18C18.8284 19.5 19.5 18.8284 19.5 18V7.5Z" />
            <path d="M9 12L10.5 13.5L15 9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </svg>
          ShopHub
        </Link>

        <div className="d-flex align-items-center order-lg-2">
          <button onClick={toggleTheme} className="theme-toggle me-3">
            {isDark ? <FaSun style={{ color: '#ffd43b' }} /> : <FaMoon style={{ color: '#74c0fc' }} />}
          </button>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span className="navbar-toggler-icon"></span>
          </button>
        </div>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-center">
            <li className="nav-item"><Link className="nav-link fw-medium" to="/">Home</Link></li>
            <li className="nav-item position-relative">
              <Link className="nav-link fw-medium d-flex align-items-center" to="/cart">
                <FaShoppingCart className="me-1" /> Cart
                {itemCount > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.7rem' }}>
                    {itemCount}
                  </span>
                )}
              </Link>
            </li>
            {user && <li className="nav-item"><Link className="nav-link fw-medium d-flex align-items-center" to="/orders"><FaBoxOpen className="me-1" /> Orders</Link></li>}
            {user?.isAdmin && <li className="nav-item"><Link className="nav-link fw-medium d-flex align-items-center" to="/admin"><FaUserCog className="me-1" /> Admin</Link></li>}
            {user ? (
              <li className="nav-item">
                <button className="nav-link btn btn-link text-danger fw-medium d-flex align-items-center" onClick={handleLogout}>
                  <FaSignOutAlt className="me-1" /> Logout
                </button>
              </li>
            ) : (
              <>
                <li className="nav-item d-lg-none"><Link className="nav-link" to="/login">Login</Link></li>
                <li className="nav-item d-lg-none"><Link className="nav-link" to="/register">Register</Link></li>
                <li className="nav-item d-none d-lg-block"><Link className="nav-link" to="/login">Login</Link></li>
                <li className="nav-item d-none d-lg-block"><Link className="btn btn-primary text-white ms-2" to="/register">Sign Up</Link></li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;