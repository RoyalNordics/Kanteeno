import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Typography,
  Paper,
  Grid,
  Divider,
  IconButton,
  TextField,
  Card,
  CardMedia,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Alert,
  Snackbar,
  Container,
  Stack,
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Delete as DeleteIcon,
  ShoppingCart as CartIcon,
  ArrowBack as ArrowBackIcon,
  RestaurantMenu as MenuIcon,
  Payment as PaymentIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';

// Format price
const formatPrice = (price) => {
  return `${price} DKK`;
};

const CartPage = () => {
  const { isAuthenticated } = useAuth();
  const { cartItems, cartTotal, updateQuantity, removeFromCart, updateNotes } = useCart();
  const navigate = useNavigate();
  
  const [itemNotes, setItemNotes] = useState({});
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  
  // Handle quantity change
  const handleQuantityChange = (itemId, newQuantity) => {
    updateQuantity(itemId, newQuantity);
  };
  
  // Handle remove item
  const handleRemoveItem = (itemId) => {
    removeFromCart(itemId);
    setSnackbarMessage('Item removed from cart');
    setOpenSnackbar(true);
  };
  
  // Handle notes change
  const handleNotesChange = (itemId, value) => {
    setItemNotes({
      ...itemNotes,
      [itemId]: value,
    });
  };
  
  // Handle notes save
  const handleNotesSave = (itemId) => {
    updateNotes(itemId, itemNotes[itemId]);
    setSnackbarMessage('Notes updated');
    setOpenSnackbar(true);
  };
  
  // Handle checkout
  const handleCheckout = () => {
    if (isAuthenticated) {
      navigate('/checkout');
    } else {
      navigate('/login', { state: { from: '/checkout' } });
    }
  };
  
  // Close snackbar
  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };
  
  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Your Cart
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Review your items before checkout
        </Typography>
      </Box>
      
      {cartItems.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <CartIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Your cart is empty
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Add items from the menu to get started.
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
        <Grid container spacing={4}>
          {/* Cart items */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ mb: { xs: 3, md: 0 } }}>
              <List>
                {cartItems.map((item) => (
                  <React.Fragment key={item.id}>
                    <ListItem
                      alignItems="flex-start"
                      sx={{ py: 2 }}
                    >
                      <Grid container spacing={2}>
                        {/* Item image */}
                        <Grid item xs={4} sm={3}>
                          <Card sx={{ height: '100%' }}>
                            <CardMedia
                              component="img"
                              image={item.image}
                              alt={item.name}
                              sx={{ height: 100, objectFit: 'cover' }}
                            />
                          </Card>
                        </Grid>
                        
                        {/* Item details */}
                        <Grid item xs={8} sm={9}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="h6" component="div">
                              {item.name}
                            </Typography>
                            <Typography variant="subtitle1" fontWeight="bold">
                              {formatPrice(item.price * item.quantity)}
                            </Typography>
                          </Box>
                          
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            {item.description}
                          </Typography>
                          
                          {/* Quantity controls */}
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <IconButton
                              size="small"
                              onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                            >
                              <RemoveIcon fontSize="small" />
                            </IconButton>
                            
                            <Typography sx={{ mx: 1 }}>
                              {item.quantity}
                            </Typography>
                            
                            <IconButton
                              size="small"
                              onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                            >
                              <AddIcon fontSize="small" />
                            </IconButton>
                            
                            <Box sx={{ ml: 'auto' }}>
                              <IconButton
                                color="error"
                                onClick={() => handleRemoveItem(item.id)}
                                aria-label="remove item"
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Box>
                          </Box>
                          
                          {/* Special instructions */}
                          <TextField
                            fullWidth
                            multiline
                            rows={2}
                            label="Special instructions"
                            variant="outlined"
                            size="small"
                            value={itemNotes[item.id] !== undefined ? itemNotes[item.id] : item.notes || ''}
                            onChange={(e) => handleNotesChange(item.id, e.target.value)}
                            onBlur={() => handleNotesSave(item.id)}
                            placeholder="Any special requests?"
                          />
                        </Grid>
                      </Grid>
                    </ListItem>
                    <Divider component="li" />
                  </React.Fragment>
                ))}
              </List>
              
              <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between' }}>
                <Button
                  startIcon={<ArrowBackIcon />}
                  component={RouterLink}
                  to="/menu"
                >
                  Continue Shopping
                </Button>
              </Box>
            </Paper>
          </Grid>
          
          {/* Order summary */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, position: 'sticky', top: 20 }}>
              <Typography variant="h6" gutterBottom>
                Order Summary
              </Typography>
              
              <List>
                <ListItem sx={{ py: 1 }}>
                  <ListItemText primary="Subtotal" />
                  <Typography variant="body1">
                    {formatPrice(cartTotal)}
                  </Typography>
                </ListItem>
                
                <ListItem sx={{ py: 1 }}>
                  <ListItemText primary="Delivery Fee" />
                  <Typography variant="body1">
                    {formatPrice(0)}
                  </Typography>
                </ListItem>
                
                <Divider sx={{ my: 1 }} />
                
                <ListItem sx={{ py: 1 }}>
                  <ListItemText 
                    primary="Total" 
                    primaryTypographyProps={{ fontWeight: 'bold' }}
                  />
                  <Typography variant="h6" fontWeight="bold">
                    {formatPrice(cartTotal)}
                  </Typography>
                </ListItem>
              </List>
              
              <Button
                fullWidth
                variant="contained"
                color="primary"
                size="large"
                startIcon={<PaymentIcon />}
                onClick={handleCheckout}
                sx={{ mt: 2 }}
                disabled={cartItems.length === 0}
              >
                {isAuthenticated ? 'Proceed to Checkout' : 'Sign in to Checkout'}
              </Button>
              
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
                By proceeding, you agree to our terms and conditions.
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      )}
      
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        message={snackbarMessage}
      />
    </Container>
  );
};

export default CartPage;
