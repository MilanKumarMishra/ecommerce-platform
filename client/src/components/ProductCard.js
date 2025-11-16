// client/src/components/ProductCard.js
import React from 'react';
import { useDispatch } from 'react-redux';
import { addItem } from '../redux/cartSlice';  // Fixed: addItem from cartSlice
import { toast } from 'react-toastify';
import { FaShoppingCart } from 'react-icons/fa';

function ProductCard({ product }) {
  const dispatch = useDispatch();

  const handleAdd = () => {
    dispatch(addItem({
      id: product._id,
      name: product.name,
      price: product.price,
      description: product.description,
      image: product.image,
      quantity: 1
    }));
    toast.success('Added to cart!');
  };

  return (
    <div className="card h-100">
      <img src={product.image || 'https://placehold.co/300x200/6c5ce7/ffffff?text=No+Image'} alt={product.name} className="card-img-top" style={{ height: '220px', objectFit: 'cover' }} />
      <div className="card-body d-flex flex-column">
        <h5 className="card-title fw-bold">{product.name}</h5>
        <p className="card-text text-muted flex-grow-1">{product.description}</p>
        <div className="d-flex justify-content-between align-items-center mt-3">
          <span className="text-success fw-bold fs-4">${product.price}</span>
          <button onClick={handleAdd} className="btn btn-primary d-flex align-items-center">
            <FaShoppingCart className="me-2" /> Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;