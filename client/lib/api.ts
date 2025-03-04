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
      const errorMessage = errorData.message || `Error ${response.status}: ${response.statusText}`;
      
      console.error(`API Error: ${url}`, errorMessage);
      
      if (response.status === 401) {
        // Handle unauthorized access
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
        
        throw new Error("Authentication required");
      }
      
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    console.error(`API Call Failed: ${url}`, error);
    // Only show toast for user-facing errors, not for background data loading
    if (!url.includes('/count')) {
      toast.error(error.message || 'Network error');
    }
    throw error;
  }
}

// Auth methods
export const auth = {
  login: (credentials: { email: string; password: string }) => 
    fetchApi('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  
  register: (userData: { username: string; email: string; password: string }) => 
    fetchApi('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
    
  validateToken: () => fetchApi('/auth/validate'),
  
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }
};

// Users methods
export const users = {
  getProfile: async (username: string) => {
    try {
      const data = await fetchApi(`/users/${username}`);
      // Ensure all expected fields have values even if the backend doesn't provide them
      return {
        ...data,
        name: data.name || data.username,
        cover_pic: data.cover_pic || "/placeholder.svg?height=400&width=1200",
        location: data.location || "",
        website: data.website || "",
        post_count: data.post_count || 0,
        follower_count: data.follower_count || 0,
        following_count: data.following_count || 0
      };
    } catch (error) {
      console.error("Failed to fetch profile:", error);
      throw error;
    }
  },
  updateProfile: (userData: any) => 
    fetchApi('/users/profile', { method: 'PUT', body: JSON.stringify(userData) }),
  followUser: (userId: string) => 
    fetchApi(`/users/${userId}/follow`, { method: 'POST' }),
  unfollowUser: (userId: string) => 
    fetchApi(`/users/${userId}/unfollow`, { method: 'POST' }),
  getFollowers: (username: string) =>
    fetchApi(`/users/${username}/followers`),
  getFollowing: (username: string) =>
    fetchApi(`/users/${username}/following`),
};

// Posts methods
export const posts = {
  getAll: (params?: any) => {
    const queryParams = new URLSearchParams();
    
    // Add each parameter to the query string
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/posts?${queryString}` : '/posts';
    
    return fetchApi(endpoint);
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
  getLikes: (id: string) => fetchApi(`/posts/${id}/likes`),
};

// Search methods
export const search = {
  all: (query: string) => fetchApi(`/search?q=${encodeURIComponent(query)}`),
  users: (query: string) => fetchApi(`/search/users?q=${encodeURIComponent(query)}`),
  posts: (query: string) => fetchApi(`/search/posts?q=${encodeURIComponent(query)}`),
};

// Add notifications service
export const notifications = {
  getCount: () => fetchApi('/notifications/count'),
  getAll: () => fetchApi('/notifications'),
  markAsRead: (id: string) => fetchApi(`/notifications/${id}/read`, { method: 'POST' }),
};

// Add messages service
export const messages = {
  getUnreadCount: () => fetchApi('/messages/count'),
  getChats: () => fetchApi('/messages/chats'),
}; 