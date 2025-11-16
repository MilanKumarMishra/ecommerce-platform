// client/src/redux/authSlice.js
import { createSlice } from '@reduxjs/toolkit';

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: null
  },
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.token = localStorage.getItem('token');
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem('token');
    }
  }
});

export const { setUser, logout } = authSlice.actions;
export default authSlice.reducer;