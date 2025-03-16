import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Divider,
  CircularProgress,
  Button,
  Alert,
} from '@mui/material';
import {
  RestaurantMenu as MenuIcon,
  ShoppingCart as OrderIcon,
  Eco as SustainabilityIcon,
  TrendingDown as WasteIcon,
  TrendingUp as ForecastIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { reportsAPI } from '../../services/api';

// Dashboard stat card component
const StatCard = ({ title, value, icon, color, subtitle, onClick }) => (
  <Card 
    sx={{ 
      height: '100%',
      cursor: onClick ? 'pointer' : 'default',
      transition: 'transform 0.2s',
      '&:hover': onClick ? { transform: 'translateY(-4px)', boxShadow: 3 } : {}
    }}
    onClick={onClick}
  >
    <CardContent sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="h6" component="div" gutterBottom>
            {title}
          </Typography>
          <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
            {value}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
        <Box 
          sx={{ 
            bgcolor: `${color}.light`, 
            p: 1.5, 
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {React.cloneElement(icon, { sx: { fontSize: 28, color: `${color}.main` } })}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const DashboardPage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // In a real implementation, this would fetch actual data from the API
        // const response = await reportsAPI.getDashboard();
        // setDashboardData(response.data);
        
        // For now, we'll use mock data
        setTimeout(() => {
          setDashboardData({
            foodWaste: {
              current: '24 kg',
              trend: '-15%',
              period: 'vs. last week'
            },
            sustainability: {
              co2Saved: '156 kg',
              organicPercentage: '42%',
              trend: '+8%'
            },
            menus: {
              active: 3,
              upcoming: 2,
              popularity: '4.2/5'
            },
            orders: {
              pending: 5,
              delivered: 12,
              total: '4,250 DKK'
            },
            forecast: {
              accuracy: '92%',
              nextWeek: '245 meals',
              trend: '+5%'
            }
          });
          setLoading(false);
        }, 1000);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Welcome back, {currentUser?.name || 'User'}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Here's an overview of your canteen operations and key metrics.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Food Waste Stats */}
        <Grid item xs={12} md={6} lg={4}>
          <StatCard
            title="Food Waste"
            value={dashboardData.foodWaste.current}
            subtitle={`${dashboardData.foodWaste.trend} ${dashboardData.foodWaste.period}`}
            icon={<WasteIcon />}
            color="success"
            onClick={() => navigate('/reports/food-waste')}
          />
        </Grid>

        {/* Sustainability Stats */}
        <Grid item xs={12} md={6} lg={4}>
          <StatCard
            title="CO₂ Saved"
            value={dashboardData.sustainability.co2Saved}
            subtitle={`Organic: ${dashboardData.sustainability.organicPercentage}`}
            icon={<SustainabilityIcon />}
            color="primary"
            onClick={() => navigate('/reports/sustainability')}
          />
        </Grid>

        {/* Forecast Stats */}
        <Grid item xs={12} md={6} lg={4}>
          <StatCard
            title="Forecast Accuracy"
            value={dashboardData.forecast.accuracy}
            subtitle={`Next week: ${dashboardData.forecast.nextWeek}`}
            icon={<ForecastIcon />}
            color="info"
            onClick={() => navigate('/forecasts')}
          />
        </Grid>

        {/* Menus Stats */}
        <Grid item xs={12} md={6} lg={6}>
          <StatCard
            title="Active Menus"
            value={dashboardData.menus.active}
            subtitle={`Upcoming: ${dashboardData.menus.upcoming} | Popularity: ${dashboardData.menus.popularity}`}
            icon={<MenuIcon />}
            color="secondary"
            onClick={() => navigate('/menus')}
          />
        </Grid>

        {/* Orders Stats */}
        <Grid item xs={12} md={6} lg={6}>
          <StatCard
            title="Pending Orders"
            value={dashboardData.orders.pending}
            subtitle={`Delivered: ${dashboardData.orders.delivered} | Total: ${dashboardData.orders.total}`}
            icon={<OrderIcon />}
            color="warning"
            onClick={() => navigate('/orders')}
          />
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Quick Actions
        </Typography>
        <Grid container spacing={2}>
          <Grid item>
            <Button 
              variant="contained" 
              color="primary"
              onClick={() => navigate('/menus/create')}
            >
              Create Menu
            </Button>
          </Grid>
          <Grid item>
            <Button 
              variant="contained" 
              color="secondary"
              onClick={() => navigate('/orders/create')}
            >
              Place Order
            </Button>
          </Grid>
          <Grid item>
            <Button 
              variant="outlined" 
              color="primary"
              onClick={() => navigate('/marketplace')}
            >
              Browse Marketplace
            </Button>
          </Grid>
          <Grid item>
            <Button 
              variant="outlined" 
              color="secondary"
              onClick={() => navigate('/reports/food-waste')}
            >
              Record Food Waste
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* Recent Activity - This would be implemented with actual data in a real application */}
      <Box sx={{ mt: 4 }}>
        <Card>
          <CardHeader title="Recent Activity" />
          <Divider />
          <CardContent>
            <Typography variant="body2" color="text.secondary">
              Recent activity will be displayed here in the full implementation.
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default DashboardPage;
