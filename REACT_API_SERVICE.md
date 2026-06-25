// src/services/api.js
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
};

export const brandService = {
  getAll: () => api.get('/brands'),
  getById: (id) => api.get(`/brands/${id}`),
  create: (data) => api.post('/brands', data),
  update: (id, data) => api.put(`/brands/${id}`, data),
  delete: (id) => api.delete(`/brands/${id}`),
  follow: (id) => api.post(`/brands/${id}/follow`),
};

export const communityService = {
  getPosts: (page = 1) => api.get(`/community/posts?page=${page}`),
  getPostById: (id) => api.get(`/community/posts/${id}`),
  createPost: (data) => api.post('/community/posts', data),
  updatePost: (id, data) => api.put(`/community/posts/${id}`, data),
  deletePost: (id) => api.delete(`/community/posts/${id}`),
  likePost: (id) => api.post(`/community/posts/${id}/like`),
  unlikePost: (id) => api.post(`/community/posts/${id}/unlike`),
};

export const profileService = {
  getProfile: (userId) => api.get(`/profile/${userId}`),
  updateProfile: (userId, data) => api.put(`/profile/${userId}`, data),
  getActivity: (userId) => api.get(`/profile/${userId}/activity`),
  follow: (userId) => api.post(`/profile/${userId}/follow`),
  unfollow: (userId) => api.post(`/profile/${userId}/unfollow`),
};

export const activityService = {
  getMyActivity: () => api.get('/activity'),
  getUserActivity: (userId) => api.get(`/activity/${userId}`),
  logActivity: (data) => api.post('/activity/log', data),
};

export default api;
