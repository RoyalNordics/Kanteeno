import axios from 'axios';

// Create an axios instance with default config
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    
    // If token exists, add it to request headers
    if (token) {
      config.headers['x-auth-token'] = token;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized errors
    if (error.response && error.response.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default api;

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/api/auth/login', credentials),
  register: (userData) => api.post('/api/auth/register', userData),
  getCurrentUser: () => api.get('/api/auth/me'),
  forgotPassword: (email) => api.post('/api/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post('/api/auth/reset-password', { token, password }),
};

// Users API
export const usersAPI = {
  getPreferences: () => api.get('/api/users/preferences'),
  updatePreferences: (preferences) => api.put('/api/users/preferences', preferences),
  updateProfile: (userData) => api.put('/api/users/profile', userData),
};

// Menus API
export const menusAPI = {
  getCurrent: () => api.get('/api/menus/current'),
  getById: (id) => api.get(`/api/menus/${id}`),
};

// Meals API
export const mealsAPI = {
  getById: (id) => api.get(`/api/meals/${id}`),
  getMealTypes: () => api.get('/api/meals/types'),
  addFeedback: (id, feedbackData) => api.post(`/api/meals/${id}/feedback`, feedbackData),
  search: (params) => api.get('/api/meals/search', { params }),
  getByAllergies: (allergies) => api.get('/api/meals/allergies', { params: { allergies } }),
};

// Orders API
export const ordersAPI = {
  getAll: () => api.get('/api/orders'),
  getById: (id) => api.get(`/api/orders/${id}`),
  create: (orderData) => api.post('/api/orders', orderData),
  cancel: (id) => api.delete(`/api/orders/${id}`),
  fileComplaint: (id, complaintData) => api.post(`/api/orders/${id}/complaint`, complaintData),
};

// Recommendations API
export const recommendationsAPI = {
  getPersonalized: () => api.get('/api/recommendations'),
  getTrending: () => api.get('/api/recommendations/trending'),
};
