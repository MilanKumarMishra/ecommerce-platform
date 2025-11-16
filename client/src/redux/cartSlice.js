import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],
  user: null,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const item = state.items.find(i => i.id === action.payload.id);
      if (item) {
        item.quantity += action.payload.quantity;
      } else {
        state.items.push(action.payload);
      }
    },
    removeFromCart: (state, action) => {
      state.items = state.items.filter(i => i.id !== action.payload);
    },
    updateCartItemQuantity: (state, action) => {
      const item = state.items.find(i => i.id === action.payload.id);
      if (item) {
        item.quantity = action.payload.quantity;
      }
    },
    setUser: (state, action) => {
      state.user = action.payload;
    },
  },
});

export const { addToCart, removeFromCart, updateCartItemQuantity, setUser } = cartSlice.actions;
export default cartSlice.reducer;