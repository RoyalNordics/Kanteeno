import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardMedia,
  CardActionArea,
  Grid,
  Chip,
  CircularProgress,
  Paper,
  Stack,
  IconButton,
  Button,
  Divider,
  Alert,
  Tooltip,
  useTheme,
} from '@mui/material';
import {
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  AccessTime as TimeIcon,
  Eco as EcoIcon,
  Refresh as RefreshIcon,
  ShoppingCart as ShoppingCartIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { useRecommendations } from '../../contexts/RecommendationsContext';
import { useFavorites } from '../../contexts/FavoritesContext';
import { useCart } from '../../contexts/CartContext';

const RecommendationsPage = () => {
  const { recommendations, loading, error, refreshRecommendations } = useRecommendations();
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const theme = useTheme();
  
  // Handle add to cart
  const handleAddToCart = (meal, event) => {
    event.stopPropagation(); // Prevent navigation to meal details
    addToCart({
      ...meal,
      quantity: 1,
    });
  };
  
  // Handle favorite toggle
  const handleFavoriteToggle = (meal, event) => {
    event.stopPropagation(); // Prevent navigation to meal details
    if (isFavorite(meal.id)) {
      removeFavorite(meal.id);
    } else {
      addFavorite(meal);
    }
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box>
      {/* Header section */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Recommended For You
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Personalized meal suggestions based on your preferences and history
          </Typography>
        </Box>
        <Tooltip title="Refresh recommendations">
          <IconButton 
            onClick={refreshRecommendations} 
            color="primary"
            sx={{ 
              backgroundColor: theme.palette.background.paper,
              boxShadow: 1,
              '&:hover': { backgroundColor: theme.palette.background.paper },
            }}
          >
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>
      
      {/* Error message */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {/* Recommendations list */}
      {recommendations.length > 0 ? (
        <Grid container spacing={3}>
          {recommendations.map((meal) => (
            <Grid item xs={12} key={meal.id}>
              <Card 
                sx={{ 
                  display: 'flex',
                  flexDirection: { xs: 'column', md: 'row' },
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                  },
                }}
              >
                <CardActionArea 
                  onClick={() => navigate(`/menu/${meal.id}`)}
                  sx={{ 
                    display: 'flex', 
                    flexDirection: { xs: 'column', md: 'row' },
                    alignItems: 'stretch',
                    height: '100%',
                  }}
                >
                  <CardMedia
                    component="img"
                    sx={{ 
                      width: { xs: '100%', md: 200 },
                      height: { xs: 200, md: 'auto' },
                    }}
                    image={meal.image}
                    alt={meal.name}
                  />
                  <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                    <CardContent sx={{ flex: '1 0 auto', position: 'relative' }}>
                      <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
                        <IconButton
                          onClick={(e) => handleFavoriteToggle(meal, e)}
                          aria-label={isFavorite(meal.id) ? "remove from favorites" : "add to favorites"}
                          sx={{ 
                            backgroundColor: 'background.paper',
                            boxShadow: 1,
                            mr: 1,
                            '&:hover': { backgroundColor: 'background.paper' },
                          }}
                        >
                          {isFavorite(meal.id) ? 
                            <FavoriteIcon color="error" /> : 
                            <FavoriteBorderIcon color="error" />
                          }
                        </IconButton>
                        <Button
                          variant="contained"
                          color="primary"
                          size="small"
                          startIcon={<ShoppingCartIcon />}
                          onClick={(e) => handleAddToCart(meal, e)}
                        >
                          Add to Cart
                        </Button>
                      </Box>
                      
                      <Typography variant="h5" component="div" gutterBottom>
                        {meal.name}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Chip 
                          label={meal.price} 
                          color="primary" 
                          size="small" 
                          sx={{ fontWeight: 'bold', mr: 1 }}
                        />
                        <Chip 
                          icon={<TimeIcon />} 
                          label={`Until ${meal.availableUntil}`} 
                          size="small" 
                          variant="outlined" 
                        />
                        {meal.organic && (
                          <Chip 
                            icon={<EcoIcon />} 
                            label="Organic" 
                            size="small" 
                            color="success" 
                            sx={{ ml: 1 }}
                          />
                        )}
                      </Box>
                      
                      <Typography variant="body1" paragraph>
                        {meal.description}
                      </Typography>
                      
                      <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
                        {meal.tags && meal.tags.map((tag, index) => (
                          <Chip 
                            key={index} 
                            label={tag} 
                            size="small" 
                            variant="outlined" 
                          />
                        ))}
                      </Stack>
                      
                      <Divider sx={{ my: 1 }} />
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        <InfoIcon color="primary" fontSize="small" sx={{ mr: 1 }} />
                        <Typography variant="body2" color="primary">
                          {meal.reason}
                        </Typography>
                      </Box>
                      
                      {meal.nutritionalInfo && (
                        <Box sx={{ display: 'flex', mt: 2, flexWrap: 'wrap' }}>
                          <Typography variant="body2" color="text.secondary" sx={{ mr: 3 }}>
                            <strong>{meal.nutritionalInfo.calories}</strong> kcal
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mr: 3 }}>
                            <strong>{meal.nutritionalInfo.protein}g</strong> protein
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mr: 3 }}>
                            <strong>{meal.nutritionalInfo.carbs}g</strong> carbs
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            <strong>{meal.nutritionalInfo.fat}g</strong> fat
                          </Typography>
                        </Box>
                      )}
                    </CardContent>
                  </Box>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            No recommendations available
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            We'll generate personalized recommendations as you use the app more.
          </Typography>
          <Button
            variant="contained"
            component="a"
            href="/menu"
          >
            Browse Menu
          </Button>
        </Paper>
      )}
    </Box>
  );
};

export default RecommendationsPage;
