import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Typography,
  Paper,
  Grid,
  Divider,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Alert,
  Container,
  Chip,
  Card,
  CardContent,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  AccessTime as TimeIcon,
  Payment as PaymentIcon,
  Receipt as ReceiptIcon,
  Home as HomeIcon,
  RestaurantMenu as MenuIcon,
  ShoppingBag as ShoppingBagIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { ordersAPI } from '../../services/api';

// Format price
const formatPrice = (price) => {
  return `${price} DKK`;
};

// Format date
const formatDate = (dateString) => {
  const options = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

const OrderConfirmationPage = () => {
  const { id } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');
  
  // Fetch order details
  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        setError('');
        
        const response = await ordersAPI.getById(id);
        setOrder(response.data);
      } catch (err) {
        console.error('Error fetching order details:', err);
        setError('Failed to load order details. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchOrderDetails();
    }
  }, [id]);
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Container maxWidth="md">
        <Alert severity="error" sx={{ mt: 4 }}>
          {error}
        </Alert>
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
          <Button
            variant="contained"
            component={RouterLink}
            to="/orders"
          >
            View Your Orders
          </Button>
        </Box>
      </Container>
    );
  }
  
  if (!order) {
    return (
      <Container maxWidth="md">
        <Alert severity="warning" sx={{ mt: 4 }}>
          Order not found.
        </Alert>
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
          <Button
            variant="contained"
            component={RouterLink}
            to="/orders"
          >
            View Your Orders
          </Button>
        </Box>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="md">
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <CheckCircleIcon sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
        <Typography variant="h4" component="h1" gutterBottom>
          Order Confirmed!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Your order has been placed successfully.
        </Typography>
      </Box>
      
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6">
            Order #{order.id}
          </Typography>
          <Chip
            label={order.status || 'Processing'}
            color="primary"
            variant="outlined"
          />
        </Box>
        
        <Divider sx={{ mb: 3 }} />
        
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" gutterBottom>
              Order Date
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {formatDate(order.createdAt || new Date())}
            </Typography>
            
            <Typography variant="subtitle2" gutterBottom>
              Pickup Time
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Today at {order.pickupTime}
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" gutterBottom>
              Payment Method
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {order.paymentMethod === 'card' ? 'Credit/Debit Card' : 
               order.paymentMethod === 'mobile' ? 'Mobile Payment' : 'Pay at Pickup'}
            </Typography>
            
            <Typography variant="subtitle2" gutterBottom>
              Order Total
            </Typography>
            <Typography variant="body1" fontWeight="bold" sx={{ mb: 2 }}>
              {formatPrice(order.total || 0)}
            </Typography>
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 3 }} />
        
        <Typography variant="h6" gutterBottom>
          Order Items
        </Typography>
        
        <List>
          {(order.items || []).map((item, index) => (
            <ListItem key={index} sx={{ py: 1, px: 0 }}>
              <ListItemText
                primary={`${item.name} x ${item.quantity}`}
                secondary={item.notes}
              />
              <Typography variant="body2">
                {formatPrice(item.price * item.quantity)}
              </Typography>
            </ListItem>
          ))}
        </List>
      </Paper>
      
      <Card sx={{ mb: 4, bgcolor: 'primary.light' }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <TimeIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6" color="primary.main">
              Pickup Instructions
            </Typography>
          </Box>
          
          <Typography variant="body1" paragraph>
            Please arrive at the canteen at your selected pickup time: <strong>{order.pickupTime}</strong>.
          </Typography>
          
          <Typography variant="body1">
            Show your order number <strong>#{order.id}</strong> to the staff at the counter.
          </Typography>
        </CardContent>
      </Card>
      
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Button
            fullWidth
            variant="outlined"
            component={RouterLink}
            to="/"
            startIcon={<HomeIcon />}
          >
            Back to Home
          </Button>
        </Grid>
        
        <Grid item xs={12} sm={4}>
          <Button
            fullWidth
            variant="outlined"
            component={RouterLink}
            to="/menu"
            startIcon={<MenuIcon />}
          >
            Browse Menu
          </Button>
        </Grid>
        
        <Grid item xs={12} sm={4}>
          <Button
            fullWidth
            variant="outlined"
            component={RouterLink}
            to="/orders"
            startIcon={<ShoppingBagIcon />}
          >
            View Orders
          </Button>
        </Grid>
      </Grid>
    </Container>
  );
};

export default OrderConfirmationPage;
