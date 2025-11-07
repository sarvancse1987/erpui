// authSlice.ts
import { createSlice } from "@reduxjs/toolkit";
import { AuthState } from "../models/AuthState";

const initialState: AuthState = {
  email: "",
  password: "",
  token: null,
  user: null,
  loading: false,
  error: null,
};

const authSlices = createSlice({
  name: "auth",
  initialState: initialState,
  reducers: {
    setFormField: (state: any, action) => {
      const { field, value } = action.payload;
      state[field] = value; // Make sure the field exists in the state
    },
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      // Make sure you are updating all required state fields
      state.loading = false;
      state.token = action.payload.token || null; // Ensure default value
      state.user = action.payload.user || null; // Ensure default value
    },
    loginFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload || "An error occurred"; // Ensure default error message
    },
    logout: (state) => {
      state.token = null;
      state.user = null;
      state.error = null;
      state.email = "";
      state.password = "";
    },
  },
  extraReducers: (builder) => {
    builder.addDefaultCase((state) => {
      return state;
    });
  },
});

export const { setFormField, loginStart, loginSuccess, loginFailure, logout } =
  authSlices.actions;

export default authSlices.reducer;
