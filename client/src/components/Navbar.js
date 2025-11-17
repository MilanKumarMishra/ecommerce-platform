import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { setUser, logout } from '../redux/authSlice';  // Correct import
import { jwtDecode } from 'jwt-decode';

function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(state => state.auth.user);
  const cartItems = useSelector(state => state.cart.items || []);
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // AUTO LOGIN ON PAGE LOAD IF TOKEN EXISTS
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && !user) {
      try {
        const decoded = jwtDecode(token);
        dispatch(setUser({
          id: decoded.id,
          email: decoded.email,
          isAdmin: decoded.isAdmin || false
        }));
      } catch (err) {
        localStorage.removeItem('token');
      }
    }
  }, [dispatch, user]);

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow">
      <div className="container">
        <Link className="navbar-brand fw-bold fs-4" to="/">ShopHub</Link>
        <div className="collapse navbar-collapse">
          <ul className="navbar-nav ms-auto align-items-center">
            <li className="nav-item">
              <Link className="nav-link text-white" to="/">Products</Link>
            </li>
            <li className="nav-item position-relative mx-3">
              <Link className="nav-link text-white" to="/cart">
                Cart
                {itemCount > 0 && (
                  <span className="badge bg-danger rounded-pill ms-2">{itemCount}</span>
                )}
              </Link>
            </li>

            {user ? (
              <>
                <li className="nav-item dropdown">
                  <a className="nav-link dropdown-toggle text-white" href="#" role="button" data-bs-toggle="dropdown">
                    Hi, {user.email.split('@')[0]}
                  </a>
                  <ul className="dropdown-menu">
                    <li><Link className="dropdown-item" to="/orders">My Orders</Link></li>
                    {user.isAdmin && <li><Link className="dropdown-item text-danger" to="/admin">Admin Panel</Link></li>}
                    <li><hr className="dropdown-divider" /></li>
                    <li><button className="dropdown-item text-danger" onClick={handleLogout}>Logout</button></li>
                  </ul>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="nav-link text-white" to="/login">Login</Link>
                </li>
                <li className="nav-item">
                  <Link className="btn btn-light text-primary ms-3" to="/register">Register</Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;