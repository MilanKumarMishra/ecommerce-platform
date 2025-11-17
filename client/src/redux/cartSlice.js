// client/src/redux/cartSlice.js
import { createSlice } from '@reduxjs/toolkit';

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
    user: null,
  },
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
    },
    addToCart: (state, action) => {
      const item = action.payload;
      const existing = state.items.find(i => i.id === item.id);
      if (existing) {
        existing.quantity += 1;
      } else {
        state.items.push({ ...item, quantity: 1 });
      }
    },
    removeFromCart: (state, action) => {
      state.items = state.items.filter(item => item.id !== action.payload);
    },
    updateCartItemQuantity: (state, action) => {
      const { id, quantity } = action.payload;
      const item = state.items.find(i => i.id === id);
      if (item) {
        item.quantity = quantity;
        if (quantity <= 0) {
          state.items = state.items.filter(i => i.id !== id);
        }
      }
    },
    clearCart: (state) => {
      state.items = [];
    },
    loadCart: (state, action) => {
      state.items = action.payload;
    }
  }
});

// Export ALL actions
export const {
  setUser,
  addToCart,
  removeFromCart,
  updateCartItemQuantity,   // ← THIS WAS MISSING
  clearCart,
  loadCart
} = cartSlice.actions;

export default cartSlice.reducer;