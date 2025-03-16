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
  Tabs,
  Tab,
  Chip,
  Divider,
  CircularProgress,
  Paper,
  Stack,
  TextField,
  InputAdornment,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Alert,
  useTheme,
} from '@mui/material';
import {
  RestaurantMenu as MenuIcon,
  AccessTime as TimeIcon,
  Eco as EcoIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  FilterList as FilterIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  ShoppingCart as ShoppingCartIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { useFavorites } from '../../contexts/FavoritesContext';
import { menusAPI, mealsAPI } from '../../services/api';

// TabPanel component for day tabs
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`day-tabpanel-${index}`}
      aria-labelledby={`day-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index) {
  return {
    id: `day-tab-${index}`,
    'aria-controls': `day-tabpanel-${index}`,
  };
}

const MenuPage = () => {
  const { currentUser } = useAuth();
  const { addToCart } = useCart();
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const navigate = useNavigate();
  const theme = useTheme();
  
  const [loading, setLoading] = useState(true);
  const [weeklyMenu, setWeeklyMenu] = useState(null);
  const [mealsByDay, setMealsByDay] = useState({});
  const [currentTab, setCurrentTab] = useState(0);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [mealType, setMealType] = useState('');
  const [mealTypes, setMealTypes] = useState([]);
  const [dietaryFilters, setDietaryFilters] = useState([]);
  const [favoriteSuccess, setFavoriteSuccess] = useState(false);
  const [addToCartSuccess, setAddToCartSuccess] = useState(false);
  const [actionMealName, setActionMealName] = useState('');
  
  // Available dietary filters
  const availableDietaryFilters = [
    { value: 'vegetarian', label: 'Vegetarian', color: 'success' },
    { value: 'vegan', label: 'Vegan', color: 'success' },
    { value: 'glutenFree', label: 'Gluten-Free', color: 'info' },
    { value: 'dairyFree', label: 'Dairy-Free', color: 'info' },
    { value: 'nutFree', label: 'Nut-Free', color: 'warning' },
    { value: 'organic', label: 'Organic', color: 'success' },
    { value: 'lowCalorie', label: 'Low Calorie', color: 'secondary' },
    { value: 'highProtein', label: 'High Protein', color: 'primary' },
  ];

  // Days of the week
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  // Get current day index (0-6, where 0 is Monday in our UI)
  const getCurrentDayIndex = () => {
    const today = new Date().getDay(); // 0 is Sunday in JavaScript
    return today === 0 ? 6 : today - 1; // Convert to our format (0 is Monday)
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  // Handle search input change
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  // Clear search
  const handleClearSearch = () => {
    setSearchQuery('');
  };

  // Handle meal type filter change
  const handleMealTypeChange = (event) => {
    setMealType(event.target.value);
  };
  
  // Handle dietary filter toggle
  const handleDietaryFilterToggle = (filter) => {
    setDietaryFilters(prev => {
      if (prev.includes(filter)) {
        return prev.filter(f => f !== filter);
      } else {
        return [...prev, filter];
      }
    });
  };

  // Filter meals based on search query, meal type, and dietary preferences
  const getFilteredMeals = (meals) => {
    if (!meals) return [];
    
    return meals.filter(meal => {
      // Search query filter
      const matchesSearch = searchQuery === '' || 
        meal.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        meal.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (meal.tags && meal.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())));
      
      // Meal type filter
      const matchesType = mealType === '' || meal.type === mealType;
      
      // Dietary preferences filter
      const matchesDietary = dietaryFilters.length === 0 || dietaryFilters.every(filter => {
        switch (filter) {
          case 'vegetarian':
            return meal.vegetarian === true || (meal.tags && meal.tags.some(tag => tag.toLowerCase() === 'vegetarian'));
          case 'vegan':
            return meal.vegan === true || (meal.tags && meal.tags.some(tag => tag.toLowerCase() === 'vegan'));
          case 'glutenFree':
            return meal.glutenFree === true || (meal.tags && meal.tags.some(tag => tag.toLowerCase() === 'gluten-free' || tag.toLowerCase() === 'gluten free'));
          case 'dairyFree':
            return meal.dairyFree === true || (meal.tags && meal.tags.some(tag => tag.toLowerCase() === 'dairy-free' || tag.toLowerCase() === 'dairy free'));
          case 'nutFree':
            return meal.nutFree === true || (meal.tags && meal.tags.some(tag => tag.toLowerCase() === 'nut-free' || tag.toLowerCase() === 'nut free'));
          case 'organic':
            return meal.organic === true || (meal.tags && meal.tags.some(tag => tag.toLowerCase() === 'organic'));
          case 'lowCalorie':
            return meal.nutritionalInfo && meal.nutritionalInfo.calories && meal.nutritionalInfo.calories < 500;
          case 'highProtein':
            return meal.nutritionalInfo && meal.nutritionalInfo.protein && meal.nutritionalInfo.protein > 20;
          default:
            return true;
        }
      });
      
      return matchesSearch && matchesType && matchesDietary;
    });
  };

  useEffect(() => {
    const fetchMenuData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch current menu
        const menuResponse = await menusAPI.getCurrent();
        const currentMenu = menuResponse.data;
        setWeeklyMenu(currentMenu);
        
        // Fetch meal types for filter
        try {
          const mealTypesResponse = await mealsAPI.getMealTypes();
          setMealTypes(mealTypesResponse.data || []);
        } catch (error) {
          console.error('Error fetching meal types:', error);
          // Non-critical error, don't set main error state
        }
        
        // If there are menu items, organize them by day
        if (currentMenu && currentMenu.items && currentMenu.items.length > 0) {
          // Group menu items by day
          const itemsByDay = {};
          
          // Initialize each day with an empty array
          daysOfWeek.forEach((day, index) => {
            itemsByDay[day.toLowerCase()] = [];
          });
          
          // Group items by day
          currentMenu.items.forEach(item => {
            const day = item.day.toLowerCase();
            if (itemsByDay[day]) {
              itemsByDay[day].push(item);
            }
          });
          
          // Fetch meal details for each day
          const mealDetailsByDay = {};
          
          for (const [day, items] of Object.entries(itemsByDay)) {
            if (items.length > 0) {
              // Fetch meal details for each item
              const mealPromises = items.map(item => 
                mealsAPI.getById(item.mealId)
              );
              
              const mealResponses = await Promise.all(mealPromises);
              const meals = mealResponses.map(response => {
                const meal = response.data;
                // Add default image if none provided
                if (!meal.image) {
                  meal.image = `https://source.unsplash.com/random/400x300/?${meal.name.split(' ')[0].toLowerCase()}`;
                }
                // Format price
                meal.price = `${meal.price || 0} DKK`;
                // Default availableUntil if not provided
                meal.availableUntil = meal.availableUntil || '14:00';
                return meal;
              });
              
              mealDetailsByDay[day] = meals;
            } else {
              mealDetailsByDay[day] = [];
            }
          }
          
          setMealsByDay(mealDetailsByDay);
        } else {
          // If no menu items found, use fallback data
          setError('No menu available for this week. Please check back later.');
        }
        
        // Set the current day tab
        setCurrentTab(getCurrentDayIndex());
      } catch (error) {
        console.error('Error fetching menu data:', error);
        setError('Failed to load the menu. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchMenuData();
  }, []);

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
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Weekly Menu
        </Typography>
        {weeklyMenu && (
          <Typography variant="body1" color="text.secondary">
            Week {weeklyMenu.week}, {weeklyMenu.year}
          </Typography>
        )}
      </Box>
      
      {/* Success alerts */}
      {favoriteSuccess && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {actionMealName} added to favorites!
        </Alert>
      )}
      
      {addToCartSuccess && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {actionMealName} added to cart!
        </Alert>
      )}
      
      {/* Search and filter section */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search meals by name, description, or tags"
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
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControl fullWidth variant="outlined">
              <InputLabel id="meal-type-label">Filter by Meal Type</InputLabel>
              <Select
                labelId="meal-type-label"
                id="meal-type"
                value={mealType}
                onChange={handleMealTypeChange}
                label="Filter by Meal Type"
                startAdornment={
                  <InputAdornment position="start">
                    <FilterIcon />
                  </InputAdornment>
                }
              >
                <MenuItem value="">
                  <em>All Types</em>
                </MenuItem>
                {mealTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          {/* Dietary preferences filter */}
          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom sx={{ mt: 1 }}>
              Dietary Preferences
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {availableDietaryFilters.map((filter) => (
                <Chip
                  key={filter.value}
                  label={filter.label}
                  color={dietaryFilters.includes(filter.value) ? filter.color : 'default'}
                  variant={dietaryFilters.includes(filter.value) ? 'filled' : 'outlined'}
                  onClick={() => handleDietaryFilterToggle(filter.value)}
                  sx={{ m: 0.5 }}
                />
              ))}
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {error ? (
        <Paper sx={{ p: 3, mb: 4, bgcolor: 'error.light' }}>
          <Typography variant="h6" color="error.dark">
            {error}
          </Typography>
        </Paper>
      ) : (
        <>
          {/* Day tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Tabs 
              value={currentTab} 
              onChange={handleTabChange} 
              variant="scrollable"
              scrollButtons="auto"
              aria-label="days of the week tabs"
            >
              {daysOfWeek.map((day, index) => (
                <Tab 
                  key={day} 
                  label={day} 
                  {...a11yProps(index)} 
                  sx={{ 
                    fontWeight: getCurrentDayIndex() === index ? 'bold' : 'normal',
                    color: getCurrentDayIndex() === index ? 'primary.main' : 'inherit',
                  }}
                />
              ))}
            </Tabs>
          </Box>

          {/* Tab panels for each day */}
          {daysOfWeek.map((day, index) => (
            <TabPanel key={day} value={currentTab} index={index}>
              <Typography variant="h5" component="h2" gutterBottom>
                {day}'s Menu
              </Typography>

              {mealsByDay[day.toLowerCase()] && mealsByDay[day.toLowerCase()].length > 0 ? (
                <>
                  {getFilteredMeals(mealsByDay[day.toLowerCase()]).length > 0 ? (
                    <Grid container spacing={3}>
                      {getFilteredMeals(mealsByDay[day.toLowerCase()]).map((meal) => (
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
                            <CardActionArea 
                              onClick={() => navigate(`/menu/${meal.id}`)}
                              sx={{ position: 'relative' }}
                            >
                              <IconButton
                                sx={{ 
                                  position: 'absolute', 
                                  top: 5, 
                                  right: 5,
                                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                  zIndex: 1,
                                  '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.9)' },
                                }}
                                onClick={(e) => {
                                  e.stopPropagation(); // Prevent navigation
                                  if (isFavorite(meal.id)) {
                                    removeFavorite(meal.id);
                                  } else {
                                    addFavorite(meal);
                                    setActionMealName(meal.name);
                                    setFavoriteSuccess(true);
                                    setTimeout(() => setFavoriteSuccess(false), 3000);
                                  }
                                }}
                                size="small"
                              >
                                {isFavorite(meal.id) ? 
                                  <FavoriteIcon color="error" /> : 
                                  <FavoriteBorderIcon color="error" />
                                }
                              </IconButton>
                              <CardMedia
                                component="img"
                                height="140"
                                image={meal.image}
                                alt={meal.name}
                              />
                              <CardContent sx={{ flexGrow: 1 }}>
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
                                
                                <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
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
                                    label={`Until ${meal.availableUntil}`} 
                                    size="small" 
                                    variant="outlined" 
                                  />
                                  <Button
                                    size="small"
                                    variant="outlined"
                                    color="primary"
                                    onClick={(e) => {
                                      e.stopPropagation(); // Prevent navigation
                                      addToCart({
                                        ...meal,
                                        quantity: 1,
                                      });
                                      setActionMealName(meal.name);
                                      setAddToCartSuccess(true);
                                      setTimeout(() => setAddToCartSuccess(false), 3000);
                                    }}
                                    startIcon={<ShoppingCartIcon fontSize="small" />}
                                  >
                                    Add
                                  </Button>
                                </Box>
                              </CardContent>
                            </CardActionArea>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  ) : (
                    <Paper sx={{ p: 3, textAlign: 'center' }}>
                      <Typography variant="body1" color="text.secondary">
                        No meals match your search criteria for {day}.
                      </Typography>
                    </Paper>
                  )}
                </>
              ) : (
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="body1" color="text.secondary">
                    No meals available for {day}.
                  </Typography>
                </Paper>
              )}
            </TabPanel>
          ))}
        </>
      )}
    </Box>
  );
};

export default MenuPage;
