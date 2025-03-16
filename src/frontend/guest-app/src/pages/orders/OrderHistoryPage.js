import React, { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Typography,
  Paper,
  Grid,
  Divider,
  Alert,
  CircularProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Tabs,
  Tab,
  Card,
  CardContent,
  CardActions,
  Collapse,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import {
  ShoppingBag as ShoppingBagIcon,
  ArrowBack as ArrowBackIcon,
  Refresh as RefreshIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  LocalShipping as ShippingIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Replay as ReplayIcon,
  Receipt as ReceiptIcon,
  RestaurantMenu as MenuIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { ordersAPI } from '../../services/api';

// Order status chip component
const OrderStatusChip = ({ status }) => {
  const getStatusConfig = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return { color: 'success', icon: <CheckCircleIcon />, label: 'Completed' };
      case 'cancelled':
        return { color: 'error', icon: <CancelIcon />, label: 'Cancelled' };
      case 'processing':
        return { color: 'primary', icon: <RefreshIcon />, label: 'Processing' };
      case 'ready':
        return { color: 'info', icon: <ShippingIcon />, label: 'Ready for Pickup' };
      default:
        return { color: 'default', icon: <ShoppingBagIcon />, label: status || 'Unknown' };
    }
  };

  const { color, icon, label } = getStatusConfig(status);

  return (
    <Chip
      icon={icon}
      label={label}
      color={color}
      size="small"
      variant="outlined"
    />
  );
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

// Format price
const formatPrice = (price) => {
  return `${price} DKK`;
};

const OrderHistoryPage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [currentTab, setCurrentTab] = useState(0);
  
  // Fetch orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError('');
        
        const response = await ordersAPI.getAll();
        setOrders(response.data || []);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Failed to load order history. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    if (currentUser) {
      fetchOrders();
    }
  }, [currentUser]);
  
  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // Handle order expansion
  const handleExpandOrder = (orderId) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };
  
  // Filter orders based on tab
  const getFilteredOrders = () => {
    if (currentTab === 0) {
      return orders; // All orders
    } else if (currentTab === 1) {
      return orders.filter(order => 
        order.status?.toLowerCase() === 'processing' || 
        order.status?.toLowerCase() === 'ready'
      ); // Active orders
    } else {
      return orders.filter(order => 
        order.status?.toLowerCase() === 'completed' || 
        order.status?.toLowerCase() === 'cancelled'
      ); // Completed orders
    }
  };
  
  // Handle reorder
  const handleReorder = async (orderId) => {
    try {
      // Implementation would depend on the API
      alert(`Reordering items from order #${orderId}`);
    } catch (err) {
      console.error('Error reordering:', err);
      setError('Failed to reorder. Please try again.');
    }
  };
  
  // Handle cancel order
  const handleCancelOrder = async (orderId) => {
    try {
      await ordersAPI.cancel(orderId);
      
      // Update the order status in the local state
      setOrders(orders.map(order => 
        order.id === orderId 
          ? { ...order, status: 'cancelled' } 
          : order
      ));
    } catch (err) {
      console.error('Error cancelling order:', err);
      setError('Failed to cancel order. Please try again.');
    }
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  const filteredOrders = getFilteredOrders();
  
  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <IconButton
          onClick={() => navigate('/profile')}
          sx={{ mr: 2 }}
          aria-label="back to profile"
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1">
          Order History
        </Typography>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Paper sx={{ mb: 4 }}>
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          aria-label="order history tabs"
          variant="fullWidth"
        >
          <Tab label="All Orders" />
          <Tab label="Active Orders" />
          <Tab label="Completed Orders" />
        </Tabs>
      </Paper>
      
      {filteredOrders.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <ShoppingBagIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No orders found
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            You haven't placed any orders yet.
          </Typography>
          <Button
            variant="contained"
            component={RouterLink}
            to="/menu"
            startIcon={<MenuIcon />}
          >
            Browse Menu
          </Button>
        </Paper>
      ) : (
        <>
          {filteredOrders
            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            .map((order) => (
              <Card key={order.id} sx={{ mb: 2 }}>
                <CardContent>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={4}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        Order #{order.id}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(order.createdAt || new Date())}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={6} sm={3}>
                      <Typography variant="body2" color="text.secondary">
                        Total
                      </Typography>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {formatPrice(order.total || 0)}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={6} sm={3}>
                      <Typography variant="body2" color="text.secondary">
                        Status
                      </Typography>
                      <OrderStatusChip status={order.status} />
                    </Grid>
                    
                    <Grid item xs={12} sm={2} sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
                      <IconButton
                        onClick={() => handleExpandOrder(order.id)}
                        aria-expanded={expandedOrderId === order.id}
                        aria-label="show more"
                      >
                        {expandedOrderId === order.id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                      </IconButton>
                    </Grid>
                  </Grid>
                </CardContent>
                
                <Collapse in={expandedOrderId === order.id} timeout="auto" unmountOnExit>
                  <Divider />
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Order Items
                    </Typography>
                    
                    <List>
                      {(order.items || []).map((item, index) => (
                        <ListItem key={index} divider={index < (order.items || []).length - 1}>
                          <ListItemText
                            primary={item.name}
                            secondary={
                              <>
                                <Typography component="span" variant="body2" color="text.secondary">
                                  Quantity: {item.quantity}
                                </Typography>
                                {item.notes && (
                                  <Typography component="span" variant="body2" color="text.secondary" sx={{ display: 'block' }}>
                                    Notes: {item.notes}
                                  </Typography>
                                )}
                              </>
                            }
                          />
                          <ListItemSecondaryAction>
                            <Typography variant="subtitle2">
                              {formatPrice(item.price || 0)}
                            </Typography>
                          </ListItemSecondaryAction>
                        </ListItem>
                      ))}
                    </List>
                    
                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="subtitle1">
                        Total: {formatPrice(order.total || 0)}
                      </Typography>
                      
                      <Box>
                        {order.status?.toLowerCase() === 'processing' && (
                          <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            startIcon={<CancelIcon />}
                            onClick={() => handleCancelOrder(order.id)}
                            sx={{ mr: 1 }}
                          >
                            Cancel
                          </Button>
                        )}
                        
                        {(order.status?.toLowerCase() === 'completed' || order.status?.toLowerCase() === 'cancelled') && (
                          <Button
                            variant="outlined"
                            color="primary"
                            size="small"
                            startIcon={<ReplayIcon />}
                            onClick={() => handleReorder(order.id)}
                            sx={{ mr: 1 }}
                          >
                            Reorder
                          </Button>
                        )}
                        
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<ReceiptIcon />}
                        >
                          Receipt
                        </Button>
                      </Box>
                    </Box>
                  </CardContent>
                </Collapse>
              </Card>
            ))}
          
          <TablePagination
            component="div"
            count={filteredOrders.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25]}
          />
        </>
      )}
    </Box>
  );
};

export default OrderHistoryPage;
