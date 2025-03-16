import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Typography,
  Paper,
  Grid,
  Divider,
  TextField,
  List,
  ListItem,
  ListItemText,
  Stepper,
  Step,
  StepLabel,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  MenuItem,
  Select,
  InputLabel,
  CircularProgress,
  Alert,
  Container,
} from '@mui/material';
import {
  ShoppingCart as CartIcon,
  AccessTime as TimeIcon,
  Payment as PaymentIcon,
  Receipt as ReceiptIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { ordersAPI } from '../../services/api';

// Format price
const formatPrice = (price) => {
  return `${price} DKK`;
};

// Generate pickup time slots
const generateTimeSlots = () => {
  const slots = [];
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  
  // Start from the next 30-minute slot
  let startHour = currentHour;
  let startMinute = currentMinute < 30 ? 30 : 0;
  
  if (currentMinute >= 30) {
    startHour += 1;
  }
  
  // Generate slots for the next 4 hours
  for (let hour = startHour; hour < startHour + 4; hour++) {
    for (let minute of [0, 30]) {
      // Skip the first iteration if we're starting from :30
      if (hour === startHour && minute < startMinute) continue;
      
      const slotHour = hour % 24; // Handle day overflow
      const timeString = `${slotHour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      
      slots.push({
        value: timeString,
        label: timeString,
      });
    }
  }
  
  return slots;
};

const CheckoutPage = () => {
  const { currentUser } = useAuth();
  const { cartItems, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  
  const [activeStep, setActiveStep] = useState(0);
  const [pickupTime, setPickupTime] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const timeSlots = generateTimeSlots();
  
  // Steps for the checkout process
  const steps = ['Pickup Details', 'Payment', 'Review Order'];
  
  // Handle pickup time change
  const handlePickupTimeChange = (event) => {
    setPickupTime(event.target.value);
  };
  
  // Handle payment method change
  const handlePaymentMethodChange = (event) => {
    setPaymentMethod(event.target.value);
  };
  
  // Handle card details change
  const handleCardDetailsChange = (event) => {
    const { name, value } = event.target;
    setCardDetails({
      ...cardDetails,
      [name]: value,
    });
  };
  
  // Handle next step
  const handleNext = () => {
    // Validate current step
    if (activeStep === 0 && !pickupTime) {
      setError('Please select a pickup time');
      return;
    }
    
    if (activeStep === 1 && paymentMethod === 'card') {
      // Validate card details
      if (!cardDetails.cardNumber || !cardDetails.cardName || !cardDetails.expiryDate || !cardDetails.cvv) {
        setError('Please fill in all card details');
        return;
      }
      
      // Basic card number validation
      if (!/^\d{16}$/.test(cardDetails.cardNumber.replace(/\s/g, ''))) {
        setError('Please enter a valid card number');
        return;
      }
      
      // Basic expiry date validation (MM/YY)
      if (!/^\d{2}\/\d{2}$/.test(cardDetails.expiryDate)) {
        setError('Please enter a valid expiry date (MM/YY)');
        return;
      }
      
      // Basic CVV validation
      if (!/^\d{3,4}$/.test(cardDetails.cvv)) {
        setError('Please enter a valid CVV');
        return;
      }
    }
    
    setError('');
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };
  
  // Handle back step
  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };
  
  // Handle place order
  const handlePlaceOrder = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Prepare order data
      const orderData = {
        items: cartItems.map(item => ({
          mealId: item.id,
          quantity: item.quantity,
          notes: item.notes || '',
        })),
        pickupTime,
        paymentMethod,
        total: cartTotal,
      };
      
      // Submit order to API
      const response = await ordersAPI.create(orderData);
      
      // Clear cart
      clearCart();
      
      // Navigate to order confirmation page
      navigate(`/order-confirmation/${response.data.id}`);
    } catch (err) {
      console.error('Error placing order:', err);
      setError('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Render step content
  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Pickup Details
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel id="pickup-time-label">Pickup Time</InputLabel>
                  <Select
                    labelId="pickup-time-label"
                    id="pickup-time"
                    value={pickupTime}
                    onChange={handlePickupTimeChange}
                    label="Pickup Time"
                    startAdornment={<TimeIcon sx={{ mr: 1 }} />}
                  >
                    {timeSlots.map((slot) => (
                      <MenuItem key={slot.value} value={slot.value}>
                        {slot.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        );
      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Payment Method
            </Typography>
            
            <FormControl component="fieldset">
              <RadioGroup
                aria-label="payment-method"
                name="payment-method"
                value={paymentMethod}
                onChange={handlePaymentMethodChange}
              >
                <FormControlLabel value="card" control={<Radio />} label="Credit/Debit Card" />
                <FormControlLabel value="mobile" control={<Radio />} label="Mobile Payment" />
                <FormControlLabel value="cash" control={<Radio />} label="Pay at Pickup" />
              </RadioGroup>
            </FormControl>
            
            {paymentMethod === 'card' && (
              <Grid container spacing={3} sx={{ mt: 2 }}>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    label="Card Number"
                    name="cardNumber"
                    value={cardDetails.cardNumber}
                    onChange={handleCardDetailsChange}
                    placeholder="1234 5678 9012 3456"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    label="Cardholder Name"
                    name="cardName"
                    value={cardDetails.cardName}
                    onChange={handleCardDetailsChange}
                  />
                </Grid>
                
                <Grid item xs={6}>
                  <TextField
                    required
                    fullWidth
                    label="Expiry Date"
                    name="expiryDate"
                    value={cardDetails.expiryDate}
                    onChange={handleCardDetailsChange}
                    placeholder="MM/YY"
                  />
                </Grid>
                
                <Grid item xs={6}>
                  <TextField
                    required
                    fullWidth
                    label="CVV"
                    name="cvv"
                    value={cardDetails.cvv}
                    onChange={handleCardDetailsChange}
                    type="password"
                    placeholder="123"
                  />
                </Grid>
              </Grid>
            )}
            
            {paymentMethod === 'mobile' && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body1">
                  You will receive a payment request on your mobile device.
                </Typography>
              </Box>
            )}
            
            {paymentMethod === 'cash' && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body1">
                  Please pay at the counter when you pick up your order.
                </Typography>
              </Box>
            )}
          </Box>
        );
      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Order Summary
            </Typography>
            
            <List>
              {cartItems.map((item) => (
                <ListItem key={item.id} sx={{ py: 1, px: 0 }}>
                  <ListItemText
                    primary={`${item.name} x ${item.quantity}`}
                    secondary={item.notes}
                  />
                  <Typography variant="body2">
                    {formatPrice(item.price * item.quantity)}
                  </Typography>
                </ListItem>
              ))}
              
              <Divider sx={{ my: 2 }} />
              
              <ListItem sx={{ py: 1, px: 0 }}>
                <ListItemText primary="Total" />
                <Typography variant="subtitle1" fontWeight="bold">
                  {formatPrice(cartTotal)}
                </Typography>
              </ListItem>
            </List>
            
            <Grid container spacing={2} sx={{ mt: 2 }}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Pickup Time
                </Typography>
                <Typography variant="body1">
                  Today at {pickupTime}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Payment Method
                </Typography>
                <Typography variant="body1">
                  {paymentMethod === 'card' ? 'Credit/Debit Card' : 
                   paymentMethod === 'mobile' ? 'Mobile Payment' : 'Pay at Pickup'}
                </Typography>
              </Grid>
            </Grid>
          </Box>
        );
      default:
        return 'Unknown step';
    }
  };
  
  return (
    <Container maxWidth="md">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Checkout
        </Typography>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Paper sx={{ p: 3, mb: 4 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        {getStepContent(activeStep)}
        
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
          {activeStep !== 0 && (
            <Button onClick={handleBack} sx={{ mr: 1 }}>
              Back
            </Button>
          )}
          
          {activeStep === steps.length - 1 ? (
            <Button
              variant="contained"
              color="primary"
              onClick={handlePlaceOrder}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <CheckCircleIcon />}
            >
              Place Order
            </Button>
          ) : (
            <Button
              variant="contained"
              color="primary"
              onClick={handleNext}
            >
              Next
            </Button>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default CheckoutPage;
