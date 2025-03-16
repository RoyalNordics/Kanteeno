import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useFavorites } from '../../contexts/FavoritesContext';
import { useRatings } from '../../contexts/RatingsContext';
import {
  Box,
  Typography,
  Card,
  CardMedia,
  Grid,
  Chip,
  Divider,
  CircularProgress,
  Paper,
  Stack,
  Button,
  Rating,
  TextField,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  useTheme,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  AccessTime as TimeIcon,
  Eco as EcoIcon,
  LocalDining as DiningIcon,
  Info as InfoIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Star as StarIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  ShoppingCart as ShoppingCartIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { mealsAPI } from '../../services/api';
import RatingsDisplay from '../../components/ratings/RatingsDisplay';

// Format price
const formatPrice = (price, qty = 1) => {
  if (typeof price === 'string') {
    // Extract the numeric part if price is a string like "65 DKK"
    const numericPrice = parseFloat(price.replace(/[^0-9.]/g, ''));
    return isNaN(numericPrice) ? '0 DKK' : `${numericPrice * qty} DKK`;
  }
  return `${price * qty} DKK`;
};

const MenuDetailPage = () => {
  const { id } = useParams();
  const { currentUser, isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const { addRating } = useRatings();
  const navigate = useNavigate();
  const theme = useTheme();
  
  const [loading, setLoading] = useState(true);
  const [meal, setMeal] = useState(null);
  const [error, setError] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);
  const [feedbackError, setFeedbackError] = useState(null);
  const [addToCartSuccess, setAddToCartSuccess] = useState(false);
  const [favoriteSuccess, setFavoriteSuccess] = useState(false);

  useEffect(() => {
    const fetchMealData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch meal details
        const response = await mealsAPI.getById(id);
        const mealData = response.data;
        
        // Add default image if none provided
        if (!mealData.image) {
          mealData.image = `https://source.unsplash.com/random/800x600/?${mealData.name.split(' ')[0].toLowerCase()}`;
        }
        
        // Format price
        mealData.price = `${mealData.price || 0} DKK`;
        
        setMeal(mealData);
      } catch (error) {
        console.error('Error fetching meal data:', error);
        setError('Failed to load meal details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchMealData();
    }
  }, [id]);

  const handleRatingChange = (event, newValue) => {
    setRating(newValue);
  };

  const handleCommentChange = (event) => {
    setComment(event.target.value);
  };

  const handleSubmitFeedback = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/menu/${id}` } });
      return;
    }

    if (rating === 0) {
      setFeedbackError('Please select a rating before submitting.');
      return;
    }

    try {
      setSubmitting(true);
      setFeedbackError(null);
      
      const success = await addRating(id, {
        rating,
        comment,
        userName: currentUser?.name,
        userAvatar: currentUser?.avatar,
        date: new Date().toISOString(),
        verified: true, // Assuming the user has purchased this meal before
      });
      
      if (success) {
        setFeedbackSuccess(true);
        setRating(0);
        setComment('');
        
        // Hide success message after 5 seconds
        setTimeout(() => {
          setFeedbackSuccess(false);
        }, 5000);
      } else {
        setFeedbackError('Failed to submit feedback. Please try again later.');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setFeedbackError('Failed to submit feedback. Please try again later.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate(-1)} 
          sx={{ mb: 2 }}
        >
          Back to Menu
        </Button>
        <Paper sx={{ p: 3, bgcolor: 'error.light' }}>
          <Typography variant="h6" color="error.dark">
            {error}
          </Typography>
        </Paper>
      </Box>
    );
  }

  if (!meal) {
    return (
      <Box>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate(-1)} 
          sx={{ mb: 2 }}
        >
          Back to Menu
        </Button>
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6">
            Meal not found
          </Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box>
      {/* Back button */}
      <Button 
        startIcon={<ArrowBackIcon />} 
        onClick={() => navigate(-1)} 
        sx={{ mb: 2 }}
      >
        Back to Menu
      </Button>

      {/* Meal details */}
      <Grid container spacing={4}>
        {/* Left column - Image and basic info */}
        <Grid item xs={12} md={6}>
          <Card sx={{ mb: 3 }}>
            <CardMedia
              component="img"
              height="300"
              image={meal.image}
              alt={meal.name}
            />
          </Card>

          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="h4" component="h1">
                  {meal.name}
                </Typography>
                <IconButton
                  onClick={() => {
                    if (isFavorite(meal.id)) {
                      removeFavorite(meal.id);
                    } else {
                      addFavorite(meal);
                      setFavoriteSuccess(true);
                      setTimeout(() => setFavoriteSuccess(false), 3000);
                    }
                  }}
                  color="error"
                  sx={{ ml: 1 }}
                >
                  {isFavorite(meal.id) ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                </IconButton>
              </Box>
              <Chip 
                label={meal.price} 
                color="primary" 
                size="large" 
                sx={{ fontWeight: 'bold' }}
              />
            </Box>

            <Typography variant="body1" paragraph>
              {meal.description}
            </Typography>

            <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
              <Chip 
                icon={<DiningIcon />} 
                label={meal.type} 
                variant="outlined" 
              />
              {meal.tags && meal.tags.map((tag, index) => (
                <Chip 
                  key={index} 
                  label={tag} 
                  variant="outlined" 
                />
              ))}
              {meal.organic && (
                <Chip 
                  icon={<EcoIcon />} 
                  label="Organic" 
                  color="success" 
                />
              )}
              {meal.availableUntil && (
                <Chip 
                  icon={<TimeIcon />} 
                  label={`Available until ${meal.availableUntil}`} 
                  variant="outlined" 
                />
              )}
            </Stack>
            {/* Add to cart section */}
            <Box sx={{ mt: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1, border: 1, borderColor: 'divider' }}>
              <Typography variant="h6" gutterBottom>
                Add to Cart
              </Typography>
              
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={4}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <IconButton
                      size="small"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                    >
                      <RemoveIcon fontSize="small" />
                    </IconButton>
                    
                    <Typography sx={{ mx: 2 }}>
                      {quantity}
                    </Typography>
                    
                    <IconButton
                      size="small"
                      onClick={() => setQuantity(quantity + 1)}
                    >
                      <AddIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={8}>
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    startIcon={<ShoppingCartIcon />}
                    onClick={() => {
                      addToCart({
                        ...meal,
                        quantity,
                        notes
                      });
                      setAddToCartSuccess(true);
                      setTimeout(() => setAddToCartSuccess(false), 3000);
                    }}
                  >
                    Add to Cart - {formatPrice(meal.price, quantity)}
                  </Button>
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    label="Special instructions"
                    variant="outlined"
                    size="small"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any special requests?"
                  />
                </Grid>
              </Grid>
              
              {addToCartSuccess && (
                <Alert severity="success" sx={{ mt: 2 }}>
                  Item added to cart!
                </Alert>
              )}
              
              {favoriteSuccess && (
                <Alert severity="success" sx={{ mt: 2 }}>
                  Added to favorites!
                </Alert>
              )}
            </Box>
          </Paper>

          {/* Customer Reviews Section */}
          <RatingsDisplay mealId={id} />
          
          {/* Leave Feedback section */}
          <Paper sx={{ p: 3, mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Leave Your Review
            </Typography>
            
            {feedbackSuccess && (
              <Alert severity="success" sx={{ mb: 2 }}>
                Thank you for your feedback!
              </Alert>
            )}
            
            {feedbackError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {feedbackError}
              </Alert>
            )}
            
            <Box sx={{ mb: 2 }}>
              <Typography component="legend">Your Rating</Typography>
              <Rating
                name="meal-rating"
                value={rating}
                onChange={handleRatingChange}
                precision={0.5}
                icon={<StarIcon fontSize="inherit" />}
              />
            </Box>
            
            <TextField
              label="Your Review (optional)"
              multiline
              rows={4}
              value={comment}
              onChange={handleCommentChange}
              fullWidth
              sx={{ mb: 2 }}
              placeholder="Share your experience with this meal..."
            />
            
            <Button 
              variant="contained" 
              onClick={handleSubmitFeedback}
              disabled={submitting}
            >
              {submitting ? 'Submitting...' : 'Submit Review'}
            </Button>
          </Paper>
        </Grid>

        {/* Right column - Nutritional info, ingredients, etc. */}
        <Grid item xs={12} md={6}>
          {/* Nutritional information */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Nutritional Information
            </Typography>
            
            <Grid container spacing={2}>
              {meal.nutritionalInfo && (
                <>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ textAlign: 'center', p: 1 }}>
                      <Typography variant="h5" color="primary.main">
                        {meal.nutritionalInfo.calories}
                      </Typography>
                      <Typography variant="body2">Calories</Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ textAlign: 'center', p: 1 }}>
                      <Typography variant="h5" color="primary.main">
                        {meal.nutritionalInfo.protein}
                      </Typography>
                      <Typography variant="body2">Protein</Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ textAlign: 'center', p: 1 }}>
                      <Typography variant="h5" color="primary.main">
                        {meal.nutritionalInfo.carbs}
                      </Typography>
                      <Typography variant="body2">Carbs</Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ textAlign: 'center', p: 1 }}>
                      <Typography variant="h5" color="primary.main">
                        {meal.nutritionalInfo.fat}
                      </Typography>
                      <Typography variant="body2">Fat</Typography>
                    </Box>
                  </Grid>
                </>
              )}
            </Grid>
          </Paper>

          {/* Ingredients */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Ingredients
            </Typography>
            
            {meal.ingredients && meal.ingredients.length > 0 ? (
              <List>
                {meal.ingredients.map((ingredient, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <DiningIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary={ingredient.name} 
                      secondary={ingredient.organic ? 'Organic' : null} 
                    />
                    {ingredient.organic && (
                      <EcoIcon color="success" fontSize="small" />
                    )}
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Ingredient information not available.
              </Typography>
            )}
          </Paper>

          {/* Allergens */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Allergen Information
            </Typography>
            
            {meal.allergens && meal.allergens.length > 0 ? (
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                {meal.allergens.map((allergen, index) => (
                  <Chip 
                    key={index} 
                    label={allergen} 
                    color="warning" 
                    variant="outlined" 
                    icon={<InfoIcon />}
                  />
                ))}
              </Stack>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No allergen information available. Please ask staff for details.
              </Typography>
            )}
          </Paper>

          {/* Sustainability info */}
          {meal.sustainabilityInfo && (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Sustainability
              </Typography>
              
              <Typography variant="body2" paragraph>
                {meal.sustainabilityInfo.description || 'Information not available.'}
              </Typography>
              
              {meal.sustainabilityInfo.co2Footprint && (
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2" sx={{ mr: 1 }}>
                    CO2 Footprint:
                  </Typography>
                  <Chip 
                    label={`${meal.sustainabilityInfo.co2Footprint} kg CO2e`} 
                    size="small" 
                    color={
                      meal.sustainabilityInfo.co2Footprint < 1 ? 'success' : 
                      meal.sustainabilityInfo.co2Footprint < 2 ? 'info' : 'warning'
                    }
                  />
                </Box>
              )}
              
              {meal.sustainabilityInfo.waterUsage && (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ mr: 1 }}>
                    Water Usage:
                  </Typography>
                  <Chip 
                    label={`${meal.sustainabilityInfo.waterUsage} liters`} 
                    size="small" 
                    color="info"
                  />
                </Box>
              )}
            </Paper>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default MenuDetailPage;
