import React, { useState } from 'react';
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
  TextField,
  InputAdornment,
  useTheme,
} from '@mui/material';
import {
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  AccessTime as TimeIcon,
  Eco as EcoIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  RestaurantMenu as MenuIcon,
} from '@mui/icons-material';
import { useFavorites } from '../../contexts/FavoritesContext';
import { useCart } from '../../contexts/CartContext';

const FavoritesPage = () => {
  const { favorites, loading, removeFavorite } = useFavorites();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const theme = useTheme();
  
  const [searchQuery, setSearchQuery] = useState('');
  
  // Handle search input change
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };
  
  // Clear search
  const handleClearSearch = () => {
    setSearchQuery('');
  };
  
  // Filter favorites based on search query
  const getFilteredFavorites = () => {
    if (!favorites) return [];
    
    return favorites.filter(meal => {
      return searchQuery === '' || 
        meal.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        meal.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (meal.tags && meal.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())));
    });
  };
  
  // Handle add to cart
  const handleAddToCart = (meal, event) => {
    event.stopPropagation(); // Prevent navigation to meal details
    addToCart({
      ...meal,
      quantity: 1,
    });
  };
  
  // Handle remove from favorites
  const handleRemoveFavorite = (mealId, event) => {
    event.stopPropagation(); // Prevent navigation to meal details
    removeFavorite(mealId);
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  const filteredFavorites = getFilteredFavorites();
  
  return (
    <Box>
      {/* Header section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          My Favorites
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Your favorite meals in one place
        </Typography>
      </Box>
      
      {/* Search section */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search your favorites"
          value={searchQuery}
          onChange={handleSearchChange}
          variant="outlined"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: searchQuery && (
              <InputAdornment position="end">
                <IconButton
                  aria-label="clear search"
                  onClick={handleClearSearch}
                  edge="end"
                >
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Paper>
      
      {/* Favorites list */}
      {filteredFavorites.length > 0 ? (
        <Grid container spacing={3}>
          {filteredFavorites.map((meal) => (
            <Grid item xs={12} sm={6} md={4} key={meal.id}>
              <Card 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                  },
                }}
              >
                <CardActionArea onClick={() => navigate(`/menu/${meal.id}`)}>
                  <CardMedia
                    component="img"
                    height="140"
                    image={meal.image}
                    alt={meal.name}
                  />
                  <CardContent sx={{ flexGrow: 1, position: 'relative' }}>
                    <IconButton
                      sx={{ 
                        position: 'absolute', 
                        top: -20, 
                        right: 8,
                        backgroundColor: 'background.paper',
                        boxShadow: 1,
                        '&:hover': { backgroundColor: 'background.paper' },
                      }}
                      onClick={(e) => handleRemoveFavorite(meal.id, e)}
                      aria-label="remove from favorites"
                    >
                      <FavoriteIcon color="error" />
                    </IconButton>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Typography variant="h6" component="div" gutterBottom>
                        {meal.name}
                      </Typography>
                      <Chip 
                        label={meal.price} 
                        color="primary" 
                        size="small" 
                        sx={{ fontWeight: 'bold' }}
                      />
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
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
                      {meal.organic && (
                        <Chip 
                          icon={<EcoIcon />} 
                          label="Organic" 
                          size="small" 
                          color="success" 
                        />
                      )}
                    </Stack>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Chip 
                        icon={<TimeIcon />} 
                        label={`Until ${meal.availableUntil || '14:00'}`} 
                        size="small" 
                        variant="outlined" 
                      />
                      <Button
                        size="small"
                        variant="contained"
                        color="primary"
                        onClick={(e) => handleAddToCart(meal, e)}
                      >
                        Add to Cart
                      </Button>
                    </Box>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <FavoriteBorderIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No favorites yet
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Start adding meals to your favorites to see them here.
          </Typography>
          <Button
            variant="contained"
            component="a"
            href="/menu"
            startIcon={<MenuIcon />}
          >
            Browse Menu
          </Button>
        </Paper>
      )}
    </Box>
  );
};

export default FavoritesPage;
