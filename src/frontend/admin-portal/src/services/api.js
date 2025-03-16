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
  getAll: () => api.get('/api/users'),
  getById: (id) => api.get(`/api/users/${id}`),
  create: (userData) => api.post('/api/users', userData),
  update: (id, userData) => api.put(`/api/users/${id}`, userData),
  delete: (id) => api.delete(`/api/users/${id}`),
  updateProfile: (userData) => api.put('/api/users/profile', userData),
  getPreferences: () => api.get('/api/users/preferences'),
  updatePreferences: (preferences) => api.put('/api/users/preferences', preferences),
};

// Menus API
export const menusAPI = {
  getAll: () => api.get('/api/menus'),
  getCurrent: () => api.get('/api/menus/current'),
  getById: (id) => api.get(`/api/menus/${id}`),
  create: (menuData) => api.post('/api/menus', menuData),
  update: (id, menuData) => api.put(`/api/menus/${id}`, menuData),
  delete: (id) => api.delete(`/api/menus/${id}`),
  addMenuItem: (id, itemData) => api.post(`/api/menus/${id}/items`, itemData),
  updateMenuItem: (id, itemId, itemData) => api.put(`/api/menus/${id}/items/${itemId}`, itemData),
  deleteMenuItem: (id, itemId) => api.delete(`/api/menus/${id}/items/${itemId}`),
  generateMenu: (menuData) => api.post('/api/menus/generate', menuData),
  getMenuFeedback: (id) => api.get(`/api/menus/${id}/feedback`),
};

// Meals API
export const mealsAPI = {
  getAll: () => api.get('/api/meals'),
  getById: (id) => api.get(`/api/meals/${id}`),
  create: (mealData) => api.post('/api/meals', mealData),
  update: (id, mealData) => api.put(`/api/meals/${id}`, mealData),
  delete: (id) => api.delete(`/api/meals/${id}`),
  getMealTypes: () => api.get('/api/meals/types'),
  getPopular: () => api.get('/api/meals/popular'),
  addFeedback: (id, feedbackData) => api.post(`/api/meals/${id}/feedback`, feedbackData),
  getMealFeedback: (id) => api.get(`/api/meals/${id}/feedback`),
  search: (params) => api.get('/api/meals/search', { params }),
  getByAllergies: (allergies) => api.get('/api/meals/allergies', { params: { allergies } }),
};

// Suppliers API
export const suppliersAPI = {
  getAll: () => api.get('/api/suppliers'),
  getById: (id) => api.get(`/api/suppliers/${id}`),
  create: (supplierData) => api.post('/api/suppliers', supplierData),
  update: (id, supplierData) => api.put(`/api/suppliers/${id}`, supplierData),
  delete: (id) => api.delete(`/api/suppliers/${id}`),
  getProducts: (id) => api.get(`/api/suppliers/${id}/products`),
  addProduct: (id, productData) => api.post(`/api/suppliers/${id}/products`, productData),
  updateProduct: (id, productId, productData) => api.put(`/api/suppliers/${id}/products/${productId}`, productData),
  deleteProduct: (id, productId) => api.delete(`/api/suppliers/${id}/products/${productId}`),
  getMarketplace: () => api.get('/api/suppliers/marketplace'),
  getCategories: () => api.get('/api/suppliers/categories'),
  getPerformance: (id) => api.get(`/api/suppliers/${id}/performance`),
};

// Orders API
export const ordersAPI = {
  getAll: () => api.get('/api/orders'),
  getById: (id) => api.get(`/api/orders/${id}`),
  create: (orderData) => api.post('/api/orders', orderData),
  update: (id, orderData) => api.put(`/api/orders/${id}`, orderData),
  cancel: (id) => api.delete(`/api/orders/${id}`),
  getByBusinessUnit: (businessUnitId) => api.get(`/api/orders/business-unit/${businessUnitId}`),
  getByStatus: (status) => api.get(`/api/orders/status/${status}`),
  updateStatus: (id, status) => api.put(`/api/orders/${id}/status`, { status }),
  fileComplaint: (id, complaintData) => api.post(`/api/orders/${id}/complaint`, complaintData),
  getComplaints: () => api.get('/api/orders/complaints'),
  getUpcomingDeliveries: () => api.get('/api/orders/upcoming-deliveries'),
  generateFromMenu: (data) => api.post('/api/orders/generate', data),
};

// Reports API
export const reportsAPI = {
  getDashboard: () => api.get('/api/reports/dashboard'),
  getFoodWaste: () => api.get('/api/reports/food-waste'),
  recordFoodWaste: (wasteData) => api.post('/api/reports/food-waste', wasteData),
  getSustainability: () => api.get('/api/reports/sustainability'),
  getFinancial: () => api.get('/api/reports/financial'),
  getUserActivity: () => api.get('/api/reports/user-activity'),
  getMealPopularity: () => api.get('/api/reports/meal-popularity'),
  getSupplierPerformance: () => api.get('/api/reports/supplier-performance'),
  getCO2: () => api.get('/api/reports/co2'),
  getBusinessUnitReports: (businessUnitId) => api.get(`/api/reports/business-unit/${businessUnitId}`),
  getBenchmarking: () => api.get('/api/reports/benchmarking'),
  exportReport: (reportType) => api.get(`/api/reports/export/${reportType}`),
  getKPI: () => api.get('/api/reports/kpi'),
};

// Forecasts API
export const forecastsAPI = {
  getAll: () => api.get('/api/forecasts'),
  getById: (id) => api.get(`/api/forecasts/${id}`),
  generate: (forecastData) => api.post('/api/forecasts', forecastData),
  update: (id, adjustments) => api.put(`/api/forecasts/${id}`, { adjustments }),
  delete: (id) => api.delete(`/api/forecasts/${id}`),
  getByBusinessUnit: (businessUnitId) => api.get(`/api/forecasts/business-unit/${businessUnitId}`),
  getCurrent: () => api.get('/api/forecasts/current'),
  getAccuracy: () => api.get('/api/forecasts/accuracy'),
  trainModel: (trainingData) => api.post('/api/forecasts/train', trainingData),
  getFactors: () => api.get('/api/forecasts/factors'),
  addFactor: (factorData) => api.post('/api/forecasts/factors', factorData),
  getComparison: () => api.get('/api/forecasts/comparison'),
};
