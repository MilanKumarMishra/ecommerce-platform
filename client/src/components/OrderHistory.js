import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function OrderHistory() {
  const user = useSelector(state => state.cart.user);
  const token = localStorage.getItem('token');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id && token) {
      axios.get(`${API_BASE_URL}/api/orders/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => setOrders(res.data))
        .catch(err => toast.error('Failed to load orders'))
        .finally(() => setLoading(false));
    } else {
      toast.error('Please login');
      setLoading(false);
    }
  }, [user, token]);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="container mt-4">
      <h2>Order History</h2>
      {orders.length === 0 ? (
        <p>No orders yet.</p>
      ) : (
        orders.map(order => (
          <div key={order._id} className="card mb-3">
            <div className="card-body">
              <h5>Order Date: {new Date(order.date).toLocaleString()}</h5>
              <p>Total: ${order.total.toFixed(2)}</p>
              <p>Status: {order.status}</p>
              <p>Delivery: {order.delivery.name}, {order.delivery.address}, {order.delivery.city}, {order.delivery.zip}</p>
              <ul>
                {order.items.map(item => (
                  <li key={item.id}>{item.name} x {item.quantity} - ${ (item.price * item.quantity).toFixed(2) }</li>
                ))}
              </ul>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default OrderHistory;