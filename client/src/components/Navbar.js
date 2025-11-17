import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { setUser, logout } from '../redux/authSlice';
import { toast } from 'react-toastify';
import { jwtDecode } from 'jwt-decode';

function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(state => state.auth.user);
  const cartItems = useSelector(state => state.cart.items || []);
  const itemCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        dispatch(setUser({ id: decoded.id, email: decoded.email, isAdmin: decoded.isAdmin }));
      } catch {
        localStorage.removeItem('token');
      }
    }
  }, [dispatch]);

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem('token');
    toast.success('Logged out!');
    navigate('/');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow">
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center" to="/">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="me-2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
          <strong className="fs-4">ShopHub</strong>
        </Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#nav">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="nav">
          <ul className="navbar-nav ms-auto align-items-center">
            <li className="nav-item"><Link className="nav-link text-white" to="/">Products</Link></li>
            <li className="nav-item position-relative">
              <Link className="nav-link text-white" to="/cart">
                Cart ({itemCount})
              </Link>
            </li>
            {user ? (
              <>
                <li className="nav-item"><Link className="nav-link text-white" to="/orders">Orders</Link></li>
                <li className="nav-item dropdown">
                  <span className="nav-link dropdown-toggle text-white" role="button" data-bs-toggle="dropdown">
                    Hi, {user.email}
                  </span>
                  <ul className="dropdown-menu">
                    <li><button className="dropdown-item text-danger" onClick={handleLogout}>Logout</button></li>
                  </ul>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item"><Link className="nav-link text-white" to="/login">Login</Link></li>
                <li className="nav-item"><Link className="btn btn-light ms-2" to="/register">Register</Link></li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;