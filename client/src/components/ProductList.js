import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ProductCard from './ProductCard';
import { toast } from 'react-toastify';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://shop-hub-backend.onrender.com';

function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/products`)
      .then(res => {
        setProducts(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Products load error:', err);
        toast.error('Failed to load products');
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="text-center py-5"><h3>Loading products...</h3></div>;

  return (
    <div className="container py-5">
      <h1 className="text-center mb-5">All Products</h1>
      <div className="row">
        {products.map(product => (
          <div key={product._id} className="col-md-4 mb-4">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProductList;