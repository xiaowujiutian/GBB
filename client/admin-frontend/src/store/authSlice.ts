import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

interface AuthUser {
  id: string;
  username: string;
  email: string;
  role: string;
  permissions: string[];
  avatar?: string;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('admin_token'),
  isAuthenticated: Boolean(localStorage.getItem('admin_token')),
  loading: false,
  error: null,
};

// 异步登录
export const loginAsync = createAsyncThunk(
  'auth/login',
  async (credentials: { username: string; password: string }) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    
    if (!response.ok) {
      throw new Error('登录失败');
    }
    
    return response.json();
  }
);

// 异步获取用户信息
export const fetchUserInfo = createAsyncThunk('auth/fetchUserInfo', async () => {
  const response = await fetch('/api/auth/me', {
    headers: { 
      'Authorization': `Bearer ${localStorage.getItem('admin_token')}` 
    },
  });
  
  if (!response.ok) {
    throw new Error('获取用户信息失败');
  }
  
  return response.json();
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('admin_token');
    },
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action: PayloadAction<AuthUser>) => {
      state.user = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // 登录
      .addCase(loginAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.data.user;
        state.token = action.payload.data.token;
        state.isAuthenticated = true;
        localStorage.setItem('admin_token', action.payload.data.token);
      })
      .addCase(loginAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '登录失败';
      })
      // 获取用户信息
      .addCase(fetchUserInfo.fulfilled, (state, action) => {
        state.user = action.payload.data;
      });
  },
});

export const { logout, clearError, setUser } = authSlice.actions;
export default authSlice.reducer;
