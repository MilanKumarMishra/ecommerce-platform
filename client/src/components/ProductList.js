import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import ProductCard from './ProductCard';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Skeleton Card Component
const SkeletonCard = () => (
  <div className="col">
    <div className="card h-100">
      <div className="card-img-top bg-light" style={{ height: '220px' }}>
        <div className="skeleton skeleton-image"></div>
      </div>
      <div className="card-body d-flex flex-column">
        <div className="skeleton skeleton-title mb-2"></div>
        <div className="skeleton skeleton-text"></div>
        <div className="skeleton skeleton-text short"></div>
        <div className="mt-auto d-flex justify-content-between align-items-center">
          <div className="skeleton skeleton-price"></div>
          <div className="skeleton skeleton-button"></div>
        </div>
      </div>
    </div>
  </div>
);

function ProductList() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/products`)
      .then(res => {
        const prods = res.data;
        setProducts(prods);
        setFilteredProducts(prods);

        // Extract unique categories
        const uniqueCats = ['All', ...new Set(prods.map(p => p.category).filter(Boolean))];
        setCategories(uniqueCats);
      })
      .catch(err => toast.error('Failed to load products'))
      .finally(() => setLoading(false));
  }, []);

  // Filter by category + search (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      let filtered = products;
      if (selectedCategory !== 'All') {
        filtered = filtered.filter(p => p.category === selectedCategory);
      }
      if (searchTerm) {
        const lowerTerm = searchTerm.toLowerCase();
        filtered = filtered.filter(p =>
          p.name.toLowerCase().includes(lowerTerm) ||
          p.description.toLowerCase().includes(lowerTerm)
        );
      }
      setFilteredProducts(filtered);
    }, 500);

    return () => clearTimeout(timer);
  }, [selectedCategory, searchTerm, products]);

  // Show skeleton during loading
  if (loading) {
    return (
      <>
        <div className="hero">
          <div className="container">
            <h1 className="display-5 display-md-4 fw-bold mb-3">Welcome to ShopHub</h1>
            <p className="lead mb-4">Discover amazing products at unbeatable prices!</p>
            <a href="#products" className="btn btn-light btn-lg">Shop Now</a>
          </div>
        </div>

        <div className="container" id="products">
          <h2 className="text-center mb-5 fw-bold text-primary">Featured Products</h2>

          {/* Filters Skeleton */}
          <div className="row mb-4 justify-content-center">
            <div className="col-md-6 col-lg-4 mb-3 mb-md-0">
              <div className="skeleton skeleton-input"></div>
            </div>
            <div className="col-md-4 col-lg-3">
              <div className="skeleton skeleton-input"></div>
            </div>
          </div>

          {/* Skeleton Grid */}
          <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
            {[...Array(8)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="hero">
        <div className="container">
          <h1 className="display-5 display-md-4 fw-bold mb-3">Welcome to ShopHub</h1>
          <p className="lead mb-4">Discover amazing products at unbeatable prices!</p>
          <a href="#products" className="btn btn-light btn-lg">Shop Now</a>
        </div>
      </div>

      <div className="container" id="products">
        <h2 className="text-center mb-5 fw-bold text-primary">Featured Products</h2>

        {/* Filters: Search + Categories */}
        <div className="row mb-4 justify-content-center">
          <div className="col-md-6 col-lg-4 mb-3 mb-md-0">
            <div className="input-group">
              <span className="input-group-text"><i className="bi bi-search"></i></span>
              <input
                type="text"
                className="form-control"
                placeholder="Search products..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="col-md-4 col-lg-3">
            <select
              className="form-select"
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
          {filteredProducts.map(product => (
            <div key={product._id} className="col">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
        {filteredProducts.length === 0 && (
          <div className="text-center py-5">
            <p className="text-muted lead">No products found. Try a different search or category!</p>
          </div>
        )}
      </div>
    </>
  );
}

export default ProductList;