import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosClient from "./utils/axiosClient";

export const registerUser = createAsyncThunk(
  "auth/register",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post("/user/register", userData);
      // Store token in localStorage if provided
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      return response.data.user;
    } catch (error) {
      // Better error handling
      if (error.response) {
        // Server responded with error status
        return rejectWithValue({
          message: error.response.data?.message || "Registration failed",
          status: error.response.status,
          data: error.response.data,
        });
      } else if (error.request) {
        // Network error
        return rejectWithValue({
          message: "Network error. Please check your connection.",
          type: "network",
        });
      } else {
        // Other error
        return rejectWithValue({
          message: error.message || "An unexpected error occurred",
          type: "unknown",
        });
      }
    }
  }
);

export const loginUser = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post("/user/login", credentials);
      // Store token in localStorage if provided
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      return response.data.user;
    } catch (error) {
      // Better error handling
      if (error.response) {
        // Server responded with error status
        return rejectWithValue({
          message: error.response.data?.message || "Login failed",
          status: error.response.status,
          data: error.response.data,
        });
      } else if (error.request) {
        // Network error
        return rejectWithValue({
          message: "Network error. Please check your connection.",
          type: "network",
        });
      } else {
        // Other error
        return rejectWithValue({
          message: error.message || "An unexpected error occurred",
          type: "unknown",
        });
      }
    }
  }
);

export const checkAuth = createAsyncThunk(
  "auth/check",
  async (_, { rejectWithValue }) => {
    try {
      // Check if token exists in localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        return rejectWithValue(null);
      }
      
      const { data } = await axiosClient.get("/user/check");
      return data.user;
    } catch (error) {
      if (error.response?.status === 401) {
        // Remove invalid token
        localStorage.removeItem('token');
        return rejectWithValue(null); // Special case for no session
      }
      return rejectWithValue(error);
    }
  }
);

export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await axiosClient.post("/user/logout");
      // Remove token from localStorage
      localStorage.removeItem('token');
      return null;
    } catch (error) {
      // Even if logout fails on server, clear local token
      localStorage.removeItem('token');
      return rejectWithValue(error);
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    isAuthenticated: false,
    loading: true,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearAuth: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem('token');
    },
  },
  extraReducers: (builder) => {
    builder
      // Register User Cases
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = !!action.payload;
        state.user = action.payload;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        // Extract error message from improved error structure
        let errorMessage = "Registration failed. Please try again.";
        if (action.payload) {
          if (typeof action.payload === "string") {
            errorMessage = action.payload;
          } else if (action.payload.message) {
            errorMessage = action.payload.message;
          }
        } else if (action.error && action.error.message) {
          errorMessage = action.error.message;
        }
        state.error = errorMessage;
        state.isAuthenticated = false;
        state.user = null;
      })

      // Login User Cases
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = !!action.payload;
        state.user = action.payload;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        // Extract error message from improved error structure
        state.error =
          action.payload?.message ||
          action.error?.message ||
          "Login failed. Please check your credentials.";
        state.isAuthenticated = false;
        state.user = null;
      })

      // Check Auth Cases
      .addCase(checkAuth.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = !!action.payload;
        state.user = action.payload;
      })
      .addCase(checkAuth.rejected, (state, action) => {
        state.loading = false;
        // Only set error if it's not a 401 (unauthorized) - being unauthenticated is normal
        if (action.payload !== null) {
          state.error =
            action.payload?.message ||
            action.error?.message ||
            "Authentication check failed";
        } else {
          state.error = null; // 401 case - no error needed
        }
        state.isAuthenticated = false;
        state.user = null;
      })

      // Logout User Cases
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
        localStorage.removeItem('token');
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Something went wrong";
        state.isAuthenticated = false;
        state.user = null;
        localStorage.removeItem('token');
      });
  },
});

export const { clearError, clearAuth } = authSlice.actions;
export default authSlice.reducer;
