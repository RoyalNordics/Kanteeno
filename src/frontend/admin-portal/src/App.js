import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';
import { useAuth } from './contexts/AuthContext';

// Layout components
import MainLayout from './components/layouts/MainLayout';
import AuthLayout from './components/layouts/AuthLayout';

// Auth pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';

// Dashboard pages
import DashboardPage from './pages/dashboard/DashboardPage';

// Menu pages
import MenuListPage from './pages/menus/MenuListPage';
import MenuDetailPage from './pages/menus/MenuDetailPage';
import MenuCreatePage from './pages/menus/MenuCreatePage';
import MenuEditPage from './pages/menus/MenuEditPage';

// Supplier pages
import SupplierListPage from './pages/suppliers/SupplierListPage';
import SupplierDetailPage from './pages/suppliers/SupplierDetailPage';
import SupplierCreatePage from './pages/suppliers/SupplierCreatePage';
import SupplierEditPage from './pages/suppliers/SupplierEditPage';

// Marketplace pages
import MarketplacePage from './pages/marketplace/MarketplacePage';
import ProductDetailPage from './pages/marketplace/ProductDetailPage';

// Order pages
import OrderListPage from './pages/orders/OrderListPage';
import OrderDetailPage from './pages/orders/OrderDetailPage';
import OrderCreatePage from './pages/orders/OrderCreatePage';

// Report pages
import ReportDashboardPage from './pages/reports/ReportDashboardPage';
import FoodWasteReportPage from './pages/reports/FoodWasteReportPage';
import SustainabilityReportPage from './pages/reports/SustainabilityReportPage';
import FinancialReportPage from './pages/reports/FinancialReportPage';

// Forecast pages
import ForecastListPage from './pages/forecasts/ForecastListPage';
import ForecastDetailPage from './pages/forecasts/ForecastDetailPage';
import ForecastCreatePage from './pages/forecasts/ForecastCreatePage';

// User pages
import UserListPage from './pages/users/UserListPage';
import UserDetailPage from './pages/users/UserDetailPage';
import UserCreatePage from './pages/users/UserCreatePage';
import UserEditPage from './pages/users/UserEditPage';
import ProfilePage from './pages/users/ProfilePage';

// Settings pages
import SettingsPage from './pages/settings/SettingsPage';

// Error pages
import NotFoundPage from './pages/errors/NotFoundPage';

// Protected route component
const ProtectedRoute = ({ children, roles = [] }) => {
  const { isAuthenticated, currentUser } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  // Check if user has required role
  if (roles.length > 0 && !roles.includes(currentUser.role)) {
    return <Navigate to="/dashboard" />;
  }
  
  return children;
};

function App() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Routes>
        {/* Auth routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
        </Route>
        
        {/* Protected routes */}
        <Route element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }>
          {/* Dashboard */}
          <Route path="/dashboard" element={<DashboardPage />} />
          
          {/* Menus */}
          <Route path="/menus" element={<MenuListPage />} />
          <Route path="/menus/:id" element={<MenuDetailPage />} />
          <Route path="/menus/create" element={<MenuCreatePage />} />
          <Route path="/menus/:id/edit" element={<MenuEditPage />} />
          
          {/* Suppliers */}
          <Route path="/suppliers" element={<SupplierListPage />} />
          <Route path="/suppliers/:id" element={<SupplierDetailPage />} />
          <Route path="/suppliers/create" element={
            <ProtectedRoute roles={['admin']}>
              <SupplierCreatePage />
            </ProtectedRoute>
          } />
          <Route path="/suppliers/:id/edit" element={
            <ProtectedRoute roles={['admin']}>
              <SupplierEditPage />
            </ProtectedRoute>
          } />
          
          {/* Marketplace */}
          <Route path="/marketplace" element={<MarketplacePage />} />
          <Route path="/marketplace/products/:id" element={<ProductDetailPage />} />
          
          {/* Orders */}
          <Route path="/orders" element={<OrderListPage />} />
          <Route path="/orders/:id" element={<OrderDetailPage />} />
          <Route path="/orders/create" element={<OrderCreatePage />} />
          
          {/* Reports */}
          <Route path="/reports" element={<ReportDashboardPage />} />
          <Route path="/reports/food-waste" element={<FoodWasteReportPage />} />
          <Route path="/reports/sustainability" element={<SustainabilityReportPage />} />
          <Route path="/reports/financial" element={
            <ProtectedRoute roles={['admin', 'manager']}>
              <FinancialReportPage />
            </ProtectedRoute>
          } />
          
          {/* Forecasts */}
          <Route path="/forecasts" element={<ForecastListPage />} />
          <Route path="/forecasts/:id" element={<ForecastDetailPage />} />
          <Route path="/forecasts/create" element={<ForecastCreatePage />} />
          
          {/* Users */}
          <Route path="/users" element={
            <ProtectedRoute roles={['admin']}>
              <UserListPage />
            </ProtectedRoute>
          } />
          <Route path="/users/:id" element={
            <ProtectedRoute roles={['admin']}>
              <UserDetailPage />
            </ProtectedRoute>
          } />
          <Route path="/users/create" element={
            <ProtectedRoute roles={['admin']}>
              <UserCreatePage />
            </ProtectedRoute>
          } />
          <Route path="/users/:id/edit" element={
            <ProtectedRoute roles={['admin']}>
              <UserEditPage />
            </ProtectedRoute>
          } />
          
          {/* Profile */}
          <Route path="/profile" element={<ProfilePage />} />
          
          {/* Settings */}
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
        
        {/* Redirect root to dashboard or login */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        {/* 404 page */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Box>
  );
}

export default App;
