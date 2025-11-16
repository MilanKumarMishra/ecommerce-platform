// client/src/redux/store.js
import { configureStore } from '@reduxjs/toolkit';
import cartReducer from './cartSlice';
import authReducer from './authSlice';  // New auth reducer

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    auth: authReducer  // Add auth state
  }
});