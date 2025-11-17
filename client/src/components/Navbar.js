import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { setUser, logout } from '../redux/authSlice';
import { toast } from 'react-toastify';
import { jwtDecode } from 'jwt-decode';
import { FaShoppingCart, FaUser, FaSignOutAlt, FaBoxOpen, FaUserCog } from 'react-icons/fa';

function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(state => state.auth.user);
  const cartItems = useSelector(state => state.cart.items || []);
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

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

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem('token');
    toast.success('Logged out successfully!');
    navigate('/');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light shadow-sm">
      <div className="container">
        <Link className="navbar-brand fw-bold text-primary" to="/">ShopHub</Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-center">
            <li className="nav-item"><Link className="nav-link" to="/">Products</Link></li>
            <li className="nav-item position-relative">
              <Link className="nav-link" to="/cart">
                <FaShoppingCart /> Cart
                {itemCount > 0 && <span className="badge bg-danger rounded-pill position-absolute top-0 start-100 translate-middle">{itemCount}</span>}
              </Link>
            </li>
            {user && <li className="nav-item"><Link className="nav-link" to="/orders"><FaBoxOpen /> Orders</Link></li>}
            {user?.isAdmin && <li className="nav-item"><Link className="nav-link text-danger fw-bold" to="/admin"><FaUserCog /> Admin</Link></li>}
            {user ? (
              <li className="nav-item">
                <button className="nav-link btn btn-link text-danger" onClick={handleLogout}>
                  <FaSignOutAlt /> Logout
                </button>
              </li>
            ) : (
              <>
                <li className="nav-item"><Link className="nav-link" to="/login"><FaUser /> Login</Link></li>
                <li className="nav-item"><Link className="btn btn-primary text-white ms-2 px-4" to="/register">Register</Link></li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;