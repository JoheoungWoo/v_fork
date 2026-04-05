// slices/loginSlice.js
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import apiClient from "../api/core/apiClient"; // 👈 axios 대신 우리가 만든 apiClient 사용!

const STORAGE_KEY = "electric_login";

// 로컬 스토리지에서 초기 상태 불러오기
const loadSaved = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const saved = loadSaved();

// 1. 일반 로그인
export const loginPostAsync = createAsyncThunk(
  "login/loginPost",
  async ({ email, password }, thunkAPI) => {
    try {
      // 👈 주소 앞부분(baseURL)은 apiClient가 알아서 붙여줍니다.
      const res = await apiClient.post(`/member/login`, { email, password });
      return { ...res.data, email, role: res.data.role || "user" };
    } catch (err) {
      console.error("Login Error:", err);
      return thunkAPI.rejectWithValue("LOGIN_FAILED");
    }
  },
);

// 2. 관리자 로그인
export const loginAdminAsync = createAsyncThunk(
  "login/loginAdmin",
  async ({ email, password }, thunkAPI) => {
    try {
      const res = await apiClient.post(`/admin/login`, { email, password });
      console.log("admin login:", res);
      return { ...res.data, email, role: res.data.role || "admin" };
    } catch (err) {
      console.error("Admin Login Error:", err);
      return thunkAPI.rejectWithValue("LOGIN_FAILED");
    }
  },
);

export const loginSlice = createSlice({
  name: "login",
  initialState: saved ?? {
    email: null,
    token: null,
    role: null,
    userId: null,
    isLogin: false,
  },
  reducers: {
    logout(state) {
      state.email = null;
      state.token = null;
      state.role = null;
      state.userId = null;
      state.isLogin = false;
      localStorage.removeItem(STORAGE_KEY);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginPostAsync.fulfilled, (state, action) => {
        state.token = action.payload.access_token;
        state.email = action.payload.email;
        state.role = action.payload.role;
        state.userId = action.payload.user_id;
        state.isLogin = true;
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...state }));
      })
      .addCase(loginAdminAsync.fulfilled, (state, action) => {
        state.token = action.payload.access_token;
        state.email = action.payload.email;
        state.role = action.payload.role;
        state.userId = action.payload.user_id;
        state.isLogin = true;
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...state }));
      });
  },
});

export const { logout } = loginSlice.actions;
export default loginSlice.reducer;
