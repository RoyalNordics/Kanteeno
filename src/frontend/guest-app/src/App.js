import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, CssBaseline } from '@mui/material';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { FavoritesProvider } from './contexts/FavoritesContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { RecommendationsProvider } from './contexts/RecommendationsContext';

// Layouts
import MainLayout from './components/layouts/MainLayout';
import AuthLayout from './components/layouts/AuthLayout';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';

// Main Pages
import HomePage from './pages/home/HomePage';
import MenuPage from './pages/menu/MenuPage';
import MenuDetailPage from './pages/menu/MenuDetailPage';
import ProfilePage from './pages/profile/ProfilePage';
import PreferencesPage from './pages/profile/PreferencesPage';
import OrderHistoryPage from './pages/orders/OrderHistoryPage';
import CartPage from './pages/cart/CartPage';
import CheckoutPage from './pages/cart/CheckoutPage';
import OrderConfirmationPage from './pages/cart/OrderConfirmationPage';
import FavoritesPage from './pages/favorites/FavoritesPage';
import RecommendationsPage from './pages/recommendations/RecommendationsPage';
import NotFoundPage from './pages/errors/NotFoundPage';

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <FavoritesProvider>
          <RecommendationsProvider>
            <ThemeProvider>
              <CssBaseline />
              <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                <Routes>
                  {/* Auth routes */}
                  <Route element={<AuthLayout />}>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                  </Route>
                  
                  {/* Main routes */}
                  <Route element={<MainLayout />}>
                    {/* Public routes */}
                    <Route path="/" element={<HomePage />} />
                    <Route path="/menu" element={<MenuPage />} />
                    <Route path="/menu/:id" element={<MenuDetailPage />} />
                    <Route path="/cart" element={<CartPage />} />
                    <Route path="/favorites" element={<FavoritesPage />} />
                    <Route path="/recommendations" element={<RecommendationsPage />} />
                    
                    {/* Protected routes */}
                    <Route path="/checkout" element={
                      <ProtectedRoute>
                        <CheckoutPage />
                      </ProtectedRoute>
                    } />
                    <Route path="/order-confirmation/:id" element={
                      <ProtectedRoute>
                        <OrderConfirmationPage />
                      </ProtectedRoute>
                    } />
                    <Route path="/profile" element={
                      <ProtectedRoute>
                        <ProfilePage />
                      </ProtectedRoute>
                    } />
                    <Route path="/preferences" element={
                      <ProtectedRoute>
                        <PreferencesPage />
                      </ProtectedRoute>
                    } />
                    <Route path="/orders" element={
                      <ProtectedRoute>
                        <OrderHistoryPage />
                      </ProtectedRoute>
                    } />
                    
                    {/* 404 page */}
                    <Route path="*" element={<NotFoundPage />} />
                  </Route>
                </Routes>
              </Box>
            </ThemeProvider>
          </RecommendationsProvider>
        </FavoritesProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
