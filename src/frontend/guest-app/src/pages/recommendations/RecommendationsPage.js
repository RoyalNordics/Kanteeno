import React, { useState, useEffect } from 'react';
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  Checkbox,
  FormGroup,
  FormControlLabel
} from '@mui/material';
import {
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  AccessTime as TimeIcon,
  Eco as EcoIcon,
  Refresh as RefreshIcon,
  ShoppingCart as ShoppingCartIcon,
  Info as InfoIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
  Clear as ClearIcon
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
  
  // Filter state
  const [filteredRecommendations, setFilteredRecommendations] = useState([]);
  const [filterOpen, setFilterOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDietaryFilters, setSelectedDietaryFilters] = useState([]);
  const [selectedMealTypes, setSelectedMealTypes] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 200]);
  const [sortBy, setSortBy] = useState('recommended');
  
  // Available filter options
  const dietaryOptions = [
    'Vegetarian', 
    'Vegan', 
    'Gluten-Free', 
    'Dairy-Free', 
    'Nut-Free',
    'Organic',
    'Low-Carb',
    'High-Protein'
  ];
  
  const mealTypeOptions = [
    'Main Course',
    'Salad',
    'Sandwich',
    'Soup',
    'Bowl',
    'Pasta',
    'Wrap'
  ];
  
  const sortOptions = [
    { value: 'recommended', label: 'Recommended' },
    { value: 'price-asc', label: 'Price: Low to High' },
    { value: 'price-desc', label: 'Price: High to Low' },
    { value: 'calories-asc', label: 'Calories: Low to High' },
    { value: 'calories-desc', label: 'Calories: High to Low' }
  ];
  
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
  
  // Handle filter toggle
  const toggleFilter = () => {
    setFilterOpen(!filterOpen);
  };
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  // Handle search input change
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };
  
  // Handle dietary filter change
  const handleDietaryFilterChange = (option) => {
    if (selectedDietaryFilters.includes(option)) {
      setSelectedDietaryFilters(selectedDietaryFilters.filter(item => item !== option));
    } else {
      setSelectedDietaryFilters([...selectedDietaryFilters, option]);
    }
  };
  
  // Handle meal type filter change
  const handleMealTypeChange = (option) => {
    if (selectedMealTypes.includes(option)) {
      setSelectedMealTypes(selectedMealTypes.filter(item => item !== option));
    } else {
      setSelectedMealTypes([...selectedMealTypes, option]);
    }
  };
  
  // Handle sort change
  const handleSortChange = (event) => {
    setSortBy(event.target.value);
  };
  
  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedDietaryFilters([]);
    setSelectedMealTypes([]);
    setPriceRange([0, 200]);
    setSortBy('recommended');
  };
  
  // Apply filters and sorting to recommendations
  useEffect(() => {
    if (!recommendations) {
      setFilteredRecommendations([]);
      return;
    }
    
    let filtered = [...recommendations];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(meal => 
        meal.name.toLowerCase().includes(query) || 
        meal.description.toLowerCase().includes(query) ||
        (meal.tags && meal.tags.some(tag => tag.toLowerCase().includes(query)))
      );
    }
    
    // Apply dietary filters
    if (selectedDietaryFilters.length > 0) {
      filtered = filtered.filter(meal => 
        meal.tags && selectedDietaryFilters.some(filter => 
          meal.tags.some(tag => tag.toLowerCase() === filter.toLowerCase())
        )
      );
    }
    
    // Apply meal type filters
    if (selectedMealTypes.length > 0) {
      filtered = filtered.filter(meal => 
        meal.type && selectedMealTypes.includes(meal.type)
      );
    }
    
    // Apply price range filter
    filtered = filtered.filter(meal => {
      const price = parseFloat(meal.price.replace(/[^0-9.]/g, ''));
      return price >= priceRange[0] && price <= priceRange[1];
    });
    
    // Apply sorting
    switch (sortBy) {
      case 'price-asc':
        filtered.sort((a, b) => {
          const priceA = parseFloat(a.price.replace(/[^0-9.]/g, ''));
          const priceB = parseFloat(b.price.replace(/[^0-9.]/g, ''));
          return priceA - priceB;
        });
        break;
      case 'price-desc':
        filtered.sort((a, b) => {
          const priceA = parseFloat(a.price.replace(/[^0-9.]/g, ''));
          const priceB = parseFloat(b.price.replace(/[^0-9.]/g, ''));
          return priceB - priceA;
        });
        break;
      case 'calories-asc':
        filtered.sort((a, b) => {
          const caloriesA = a.nutritionalInfo?.calories || 0;
          const caloriesB = b.nutritionalInfo?.calories || 0;
          return caloriesA - caloriesB;
        });
        break;
      case 'calories-desc':
        filtered.sort((a, b) => {
          const caloriesA = a.nutritionalInfo?.calories || 0;
          const caloriesB = b.nutritionalInfo?.calories || 0;
          return caloriesB - caloriesA;
        });
        break;
      default:
        // Keep original order (recommended)
        break;
    }
    
    setFilteredRecommendations(filtered);
  }, [recommendations, searchQuery, selectedDietaryFilters, selectedMealTypes, priceRange, sortBy]);
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  // Filter panel component
  const FilterPanel = () => (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={activeTab} onChange={handleTabChange} aria-label="filter tabs">
          <Tab label="Search" />
          <Tab label="Dietary" />
          <Tab label="Meal Type" />
          <Tab label="Sort" />
        </Tabs>
      </Box>
      
      {/* Search Tab */}
      {activeTab === 0 && (
        <Box sx={{ p: 1 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search recommendations..."
            value={searchQuery}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: searchQuery && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setSearchQuery('')}>
                    <ClearIcon />
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
        </Box>
      )}
      
      {/* Dietary Tab */}
      {activeTab === 1 && (
        <Box sx={{ p: 1 }}>
          <FormGroup>
            <Grid container spacing={1}>
              {dietaryOptions.map((option) => (
                <Grid item xs={6} key={option}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={selectedDietaryFilters.includes(option)}
                        onChange={() => handleDietaryFilterChange(option)}
                        size="small"
                      />
                    }
                    label={option}
                  />
                </Grid>
              ))}
            </Grid>
          </FormGroup>
        </Box>
      )}
      
      {/* Meal Type Tab */}
      {activeTab === 2 && (
        <Box sx={{ p: 1 }}>
          <FormGroup>
            <Grid container spacing={1}>
              {mealTypeOptions.map((option) => (
                <Grid item xs={6} key={option}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={selectedMealTypes.includes(option)}
                        onChange={() => handleMealTypeChange(option)}
                        size="small"
                      />
                    }
                    label={option}
                  />
                </Grid>
              ))}
            </Grid>
          </FormGroup>
        </Box>
      )}
      
      {/* Sort Tab */}
      {activeTab === 3 && (
        <Box sx={{ p: 1 }}>
          <FormControl fullWidth>
            <InputLabel id="sort-select-label">Sort By</InputLabel>
            <Select
              labelId="sort-select-label"
              id="sort-select"
              value={sortBy}
              label="Sort By"
              onChange={handleSortChange}
            >
              {sortOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      )}
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
        <Button 
          variant="outlined" 
          size="small" 
          startIcon={<ClearIcon />}
          onClick={clearFilters}
        >
          Clear All
        </Button>
        <Typography variant="body2" color="text.secondary">
          {filteredRecommendations.length} results
        </Typography>
      </Box>
    </Paper>
  );
  
  return (
    <Box>
      {/* Header section */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Recommended For You
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Personalized meal suggestions based on your preferences and history
          </Typography>
        </Box>
        <Box>
          <Tooltip title="Filter recommendations">
            <IconButton 
              onClick={toggleFilter} 
              color="primary"
              sx={{ 
                mr: 1,
                backgroundColor: filterOpen ? theme.palette.primary.main : theme.palette.background.paper,
                color: filterOpen ? theme.palette.primary.contrastText : theme.palette.primary.main,
                boxShadow: 1,
                '&:hover': { 
                  backgroundColor: filterOpen ? theme.palette.primary.dark : theme.palette.background.paper 
                },
              }}
            >
              <FilterIcon />
            </IconButton>
          </Tooltip>
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
      </Box>
      
      {/* Filter panel */}
      {filterOpen && <FilterPanel />}
      
      {/* Error message */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {/* Recommendations list */}
      {filteredRecommendations.length > 0 ? (
        <Grid container spacing={3}>
          {filteredRecommendations.map((meal) => (
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
          {recommendations.length > 0 ? (
            <>
              <Typography variant="h6" gutterBottom>
                No matching recommendations
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                Try adjusting your filters to see more recommendations.
              </Typography>
              <Button
                variant="contained"
                onClick={clearFilters}
              >
                Clear Filters
              </Button>
            </>
          ) : (
            <>
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
            </>
          )}
        </Paper>
      )}
    </Box>
  );
};

export default RecommendationsPage;
