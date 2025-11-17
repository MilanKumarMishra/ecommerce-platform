import React from 'react';
import { useDispatch } from 'react-redux';
import { addItem } from '../redux/cartSlice';  // Correct import
import { toast } from 'react-toastify';

function ProductCard({ product }) {
  const dispatch = useDispatch();

  const handleAddToCart = () => {
    dispatch(addItem({
      id: product._id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1
    }));
    toast.success('Added to cart!');
  };

  return (
    <div className="card h-100 shadow-sm">
      <img 
        src={product.image || 'https://placehold.co/300x200'} 
        className="card-img-top" 
        alt={product.name}
        style={{ height: '200px', objectFit: 'cover' }}
      />
      <div className="card-body d-flex flex-column">
        <h5 className="card-title">{product.name}</h5>
        <p className="card-text text-muted flex-grow-1">{product.description}</p>
        <div className="d-flex justify-content-between align-items-center mt-auto">
          <span className="h4 text-success mb-0">₹{product.price}</span>
          <button onClick={handleAddToCart} className="btn btn-primary">
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;