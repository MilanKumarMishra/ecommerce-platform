import React from 'react';
import { Link } from 'react-router-dom';

function ThankYou() {
  return (
    <div className="container mt-4 text-center">
      <h2>Thank You!</h2>
      <p>Your order has been placed successfully.</p>
      <Link to="/orders" className="btn btn-primary">View Orders</Link>
      <Link to="/" className="btn btn-secondary ms-2">Continue Shopping</Link>
    </div>
  );
}

export default ThankYou;