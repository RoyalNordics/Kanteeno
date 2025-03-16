import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import jwt_decode from 'jwt-decode';
import api from '../services/api';

// Create the auth context
const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Check if token is expired
  const isTokenExpired = (token) => {
    if (!token) return true;
    
    try {
      const decoded = jwt_decode(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp < currentTime;
    } catch (error) {
      return true;
    }
  };

  // Set auth token for API requests
  const setAuthToken = (token) => {
    if (token) {
      api.defaults.headers.common['x-auth-token'] = token;
      localStorage.setItem('token', token);
    } else {
      delete api.defaults.headers.common['x-auth-token'];
      localStorage.removeItem('token');
    }
  };

  // Login user
  const login = async (email, password) => {
    try {
      setError('');
      const response = await api.post('/api/auth/login', { email, password });
      const { token } = response.data;
      
      setToken(token);
      setAuthToken(token);
      
      // Decode token to get user data
      const decoded = jwt_decode(token);
      setCurrentUser(decoded.user);
      
      return decoded.user;
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      throw err;
    }
  };

  // Register user
  const register = async (userData) => {
    try {
      setError('');
      const response = await api.post('/api/auth/register', userData);
      const { token } = response.data;
      
      setToken(token);
      setAuthToken(token);
      
      // Decode token to get user data
      const decoded = jwt_decode(token);
      setCurrentUser(decoded.user);
      
      return decoded.user;
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      throw err;
    }
  };

  // Logout user
  const logout = () => {
    setToken(null);
    setCurrentUser(null);
    setAuthToken(null);
    navigate('/login');
  };

  // Load user data
  const loadUser = async () => {
    if (!token || isTokenExpired(token)) {
      setLoading(false);
      return;
    }
    
    try {
      setAuthToken(token);
      const response = await api.get('/api/auth/me');
      setCurrentUser(response.data);
    } catch (err) {
      setToken(null);
      setAuthToken(null);
    } finally {
      setLoading(false);
    }
  };

  // Effect to load user on mount or token change
  useEffect(() => {
    loadUser();
  }, [token]);

  // Value to be provided by the context
  const value = {
    currentUser,
    token,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!currentUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
