import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { ApiResponse } from '@/types/common';

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    const { data } = response;
    
    if (data.success) {
      return response;
    } else {
      console.error('API Error:', data.message || '请求失败');
      return Promise.reject(new Error(data.message));
    }
  },
  (error) => {
    if (error.response?.status === 401) {
      console.error('登录已过期，请重新登录');
      localStorage.removeItem('admin_token');
      window.location.href = '/login';
    } else if (error.response?.status === 403) {
      console.error('权限不足');
    } else if (error.response?.status >= 500) {
      console.error('服务器错误，请稍后重试');
    } else {
      console.error(error.message || '网络错误');
    }
    return Promise.reject(error);
  }
);

export const request = {
  get: <T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<ApiResponse<T>>> =>
    api.get(url, config),
    
  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<ApiResponse<T>>> =>
    api.post(url, data, config),
    
  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<ApiResponse<T>>> =>
    api.put(url, data, config),
    
  delete: <T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<ApiResponse<T>>> =>
    api.delete(url, config),
    
  patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<ApiResponse<T>>> =>
    api.patch(url, data, config),
};

export default api;
