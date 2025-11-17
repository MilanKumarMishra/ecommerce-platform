import React from 'react';
import { useDispatch } from 'react-redux';
import { addToCart } from '../redux/cartSlice';  // CORRECT IMPORT
import { toast } from 'react-toastify';

function ProductCard({ product }) {
  const dispatch = useDispatch();

  const handleAdd = () => {
    dispatch(addToCart({
      id: product._id,
      name: product.name,
      price: product.price,
      image: product.image || 'https://placehold.co/300x200',
      quantity: 1
    }));
    toast.success(`${product.name} added to cart!`);
  };

  return (
    <div className="card h-100 shadow-sm hover-shadow">
      <img
        src={product.image || 'https://placehold.co/300x200'}
        className="card-img-top"
        alt={product.name}
        style={{ height: '220px', objectFit: 'cover' }}
      />
      <div className="card-body d-flex flex-column">
        <h5 className="card-title">{product.name}</h5>
        <p className="card-text text-muted flex-grow-1">
          {product.description?.substring(0, 80)}...
        </p>
        <div className="mt-auto d-flex justify-content-between align-items-center">
          <span className="h4 text-success mb-0">₹{product.price}</span>
          <button onClick={handleAdd} className="btn btn-primary btn-lg">
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;