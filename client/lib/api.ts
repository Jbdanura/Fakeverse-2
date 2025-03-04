// API client for interacting with the backend

import { toast } from "sonner";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Generic fetch wrapper with error handling
async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const url = `${API_URL}${endpoint}`;
  
  // Get token from localStorage if available
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  // Set default headers
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers,
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || 'Something went wrong';
      
      if (response.status === 401) {
        // Handle unauthorized access
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          // You might want to redirect to login page here
        }
      }
      
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    toast.error(error.message || 'Network error');
    throw error;
  }
}

// Auth methods
export const auth = {
  login: (credentials: { email: string; password: string }) => 
    fetchApi('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  
  register: (userData: { username: string; email: string; password: string }) => 
    fetchApi('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
    
  validateToken: () => fetchApi('/auth/validate')
};

// Users methods
export const users = {
  getProfile: (username: string) => fetchApi(`/users/${username}`),
  updateProfile: (userData: any) => 
    fetchApi('/users/profile', { method: 'PUT', body: JSON.stringify(userData) }),
  followUser: (userId: string) => 
    fetchApi(`/users/${userId}/follow`, { method: 'POST' }),
  unfollowUser: (userId: string) => 
    fetchApi(`/users/${userId}/unfollow`, { method: 'POST' }),
};

// Posts methods
export const posts = {
  getAll: (params?: any) => {
    const queryString = params ? new URLSearchParams(params).toString() : '';
    return fetchApi(`/posts?${queryString}`);
  },
  getById: (id: string) => fetchApi(`/posts/${id}`),
  create: (postData: any) => 
    fetchApi('/posts', { method: 'POST', body: JSON.stringify(postData) }),
  update: (id: string, postData: any) => 
    fetchApi(`/posts/${id}`, { method: 'PUT', body: JSON.stringify(postData) }),
  delete: (id: string) => 
    fetchApi(`/posts/${id}`, { method: 'DELETE' }),
  like: (id: string) => 
    fetchApi(`/posts/${id}/like`, { method: 'POST' }),
  unlike: (id: string) => 
    fetchApi(`/posts/${id}/unlike`, { method: 'POST' }),
  comment: (id: string, content: string) => 
    fetchApi(`/posts/${id}/comments`, { 
      method: 'POST', 
      body: JSON.stringify({ content }) 
    }),
};

// Search methods
export const search = {
  all: (query: string) => fetchApi(`/search?q=${encodeURIComponent(query)}`),
  users: (query: string) => fetchApi(`/search/users?q=${encodeURIComponent(query)}`),
  posts: (query: string) => fetchApi(`/search/posts?q=${encodeURIComponent(query)}`),
}; 