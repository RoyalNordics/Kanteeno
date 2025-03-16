import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { menusAPI, mealsAPI } from '../../services/api';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardMedia,
  CardActionArea,
  Grid,
  Button,
  Chip,
  Divider,
  CircularProgress,
  Paper,
  Stack,
  IconButton,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  RestaurantMenu as MenuIcon,
  AccessTime as TimeIcon,
  Eco as EcoIcon,
  LocalOffer as OfferIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  ShoppingCart as ShoppingCartIcon,
  Recommend as RecommendIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useFavorites } from '../../contexts/FavoritesContext';
import { useCart } from '../../contexts/CartContext';
import { useRecommendations } from '../../contexts/RecommendationsContext';


// Mock data for upcoming events
const upcomingEvents = [
  {
    id: 1,
    title: 'Italian Week',
    date: 'Next Week',
    description: 'Enjoy authentic Italian cuisine all week long',
  },
  {
    id: 2,
    title: 'Sustainability Day',
    date: 'March 22',
    description: 'Special menu with locally sourced ingredients',
  },
];

const HomePage = () => {
  const { currentUser } = useAuth();
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const { addToCart } = useCart();
  const { recommendations, loading: recommendationsLoading } = useRecommendations();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [loading, setLoading] = useState(true);
  const [todaysMenu, setTodaysMenu] = useState({
    date: new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }),
    meals: []
  });

  useEffect(() => {
    const fetchMenuData = async () => {
      try {
        setLoading(true);
        // Fetch current menu
        const menuResponse = await menusAPI.getCurrent();
        const currentMenu = menuResponse.data;
        
        // If there are menu items, fetch details for each meal
        if (currentMenu && currentMenu.items && currentMenu.items.length > 0) {
          // Get today's day of the week (0-6, where 0 is Sunday)
          const today = new Date().getDay();
          const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
          const todayString = daysOfWeek[today];
          
          // Filter menu items for today
          const todaysItems = currentMenu.items.filter(item => 
            item.day.toLowerCase() === todayString
          );
          
          // Fetch detailed meal data for each item
          const mealPromises = todaysItems.map(item => 
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
          
          setTodaysMenu({
            date: new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }),
            meals: meals
          });
        } else {
          // If no menu items found, use fallback data
          setTodaysMenu({
            date: new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }),
            meals: [
              {
                id: 1,
                name: 'Grilled Salmon with Roasted Vegetables',
                description: 'Fresh salmon fillet with seasonal vegetables and herb sauce',
                image: 'https://source.unsplash.com/random/400x300/?salmon',
                type: 'Main Course',
                tags: ['Protein-rich', 'Gluten-free'],
                nutritionalInfo: {
                  calories: 420,
                  protein: '32g',
                  carbs: '18g',
                  fat: '22g',
                },
                price: '65 DKK',
                organic: true,
                availableUntil: '14:00',
              },
              {
                id: 2,
                name: 'Vegetarian Buddha Bowl',
                description: 'Quinoa, roasted sweet potatoes, avocado, chickpeas, and tahini dressing',
                image: 'https://source.unsplash.com/random/400x300/?buddha-bowl',
                type: 'Vegetarian',
                tags: ['Vegan', 'High-fiber'],
                nutritionalInfo: {
                  calories: 380,
                  protein: '14g',
                  carbs: '52g',
                  fat: '16g',
                },
                price: '55 DKK',
                organic: true,
                availableUntil: '14:00',
              },
              {
                id: 3,
                name: 'Chicken Caesar Wrap',
                description: 'Grilled chicken, romaine lettuce, parmesan, and caesar dressing in a whole wheat wrap',
                image: 'https://source.unsplash.com/random/400x300/?wrap',
                type: 'Sandwich',
                tags: ['Quick meal', 'To-go'],
                nutritionalInfo: {
                  calories: 340,
                  protein: '28g',
                  carbs: '32g',
                  fat: '12g',
                },
                price: '45 DKK',
                organic: false,
                availableUntil: '15:30',
              },
            ]
          });
        }
      } catch (error) {
        console.error('Error fetching menu data:', error);
        // Use fallback data in case of error
        setTodaysMenu({
          date: new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }),
          meals: [
            {
              id: 1,
              name: 'Grilled Salmon with Roasted Vegetables',
              description: 'Fresh salmon fillet with seasonal vegetables and herb sauce',
              image: 'https://source.unsplash.com/random/400x300/?salmon',
              type: 'Main Course',
              tags: ['Protein-rich', 'Gluten-free'],
              nutritionalInfo: {
                calories: 420,
                protein: '32g',
                carbs: '18g',
                fat: '22g',
              },
              price: '65 DKK',
              organic: true,
              availableUntil: '14:00',
            },
            {
              id: 2,
              name: 'Vegetarian Buddha Bowl',
              description: 'Quinoa, roasted sweet potatoes, avocado, chickpeas, and tahini dressing',
              image: 'https://source.unsplash.com/random/400x300/?buddha-bowl',
              type: 'Vegetarian',
              tags: ['Vegan', 'High-fiber'],
              nutritionalInfo: {
                calories: 380,
                protein: '14g',
                carbs: '52g',
                fat: '16g',
              },
              price: '55 DKK',
              organic: true,
              availableUntil: '14:00',
            },
            {
              id: 3,
              name: 'Chicken Caesar Wrap',
              description: 'Grilled chicken, romaine lettuce, parmesan, and caesar dressing in a whole wheat wrap',
              image: 'https://source.unsplash.com/random/400x300/?wrap',
              type: 'Sandwich',
              tags: ['Quick meal', 'To-go'],
              nutritionalInfo: {
                calories: 340,
                protein: '28g',
                carbs: '32g',
                fat: '12g',
              },
              price: '45 DKK',
              organic: false,
              availableUntil: '15:30',
            },
          ]
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMenuData();
  }, []);

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
      {/* Welcome section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Welcome{currentUser ? `, ${currentUser.name}` : ''}!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Check out today's menu and personalized recommendations at your canteen.
        </Typography>
      </Box>

      {/* Today's menu section */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" component="h2">
            Today's Menu
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            {todaysMenu.date}
          </Typography>
        </Box>

        <Grid container spacing={2}>
          {todaysMenu.meals.map((meal) => (
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
                  <CardMedia
                    component="img"
                    height="140"
                    image={meal.image}
                    alt={meal.name}
                  />
                  <CardContent sx={{ flexGrow: 1, position: 'relative' }}>
                    <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
                      <IconButton
                        onClick={(e) => handleFavoriteToggle(meal, e)}
                        aria-label={isFavorite(meal.id) ? "remove from favorites" : "add to favorites"}
                        size="small"
                        sx={{ 
                          backgroundColor: 'background.paper',
                          boxShadow: 1,
                          mr: 1,
                          '&:hover': { backgroundColor: 'background.paper' },
                        }}
                      >
                        {isFavorite(meal.id) ? 
                          <FavoriteIcon color="error" fontSize="small" /> : 
                          <FavoriteBorderIcon color="error" fontSize="small" />
                        }
                      </IconButton>
                      <IconButton
                        onClick={(e) => handleAddToCart(meal, e)}
                        aria-label="add to cart"
                        size="small"
                        sx={{ 
                          backgroundColor: 'background.paper',
                          boxShadow: 1,
                          '&:hover': { backgroundColor: 'background.paper' },
                        }}
                      >
                        <ShoppingCartIcon color="primary" fontSize="small" />
                      </IconButton>
                    </Box>
                    
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
                        label={`Until ${meal.availableUntil}`} 
                        size="small" 
                        variant="outlined" 
                      />
                      <Typography variant="body2" color="text.secondary">
                        {meal.nutritionalInfo.calories} kcal
                      </Typography>
                    </Box>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
        
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Button 
            variant="outlined" 
            color="primary" 
            onClick={() => navigate('/menu')}
            startIcon={<MenuIcon />}
          >
            View Full Weekly Menu
          </Button>
        </Box>
      </Box>

      <Divider sx={{ my: 4 }} />

      {/* Recommendations section */}
      {currentUser && (
        <>
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h5" component="h2">
                Recommended For You
              </Typography>
              <Button 
                variant="text" 
                color="primary" 
                onClick={() => navigate('/recommendations')}
                endIcon={<ArrowForwardIcon />}
                size="small"
              >
                View All
              </Button>
            </Box>

            {recommendationsLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : recommendations && recommendations.length > 0 ? (
              <Grid container spacing={2}>
                {recommendations.slice(0, 3).map((meal) => (
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
                        <CardMedia
                          component="img"
                          height="140"
                          image={meal.image}
                          alt={meal.name}
                        />
                        <CardContent sx={{ flexGrow: 1, position: 'relative' }}>
                          <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
                            <IconButton
                              onClick={(e) => handleFavoriteToggle(meal, e)}
                              aria-label={isFavorite(meal.id) ? "remove from favorites" : "add to favorites"}
                              size="small"
                              sx={{ 
                                backgroundColor: 'background.paper',
                                boxShadow: 1,
                                mr: 1,
                                '&:hover': { backgroundColor: 'background.paper' },
                              }}
                            >
                              {isFavorite(meal.id) ? 
                                <FavoriteIcon color="error" fontSize="small" /> : 
                                <FavoriteBorderIcon color="error" fontSize="small" />
                              }
                            </IconButton>
                            <IconButton
                              onClick={(e) => handleAddToCart(meal, e)}
                              aria-label="add to cart"
                              size="small"
                              sx={{ 
                                backgroundColor: 'background.paper',
                                boxShadow: 1,
                                '&:hover': { backgroundColor: 'background.paper' },
                              }}
                            >
                              <ShoppingCartIcon color="primary" fontSize="small" />
                            </IconButton>
                          </Box>
                          
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
                          
                          <Chip 
                            icon={<RecommendIcon />} 
                            label={meal.reason} 
                            size="small" 
                            color="secondary"
                            sx={{ mb: 2 }}
                          />
                          
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Chip 
                              icon={<TimeIcon />} 
                              label={`Until ${meal.availableUntil}`} 
                              size="small" 
                              variant="outlined" 
                            />
                            {meal.nutritionalInfo && (
                              <Typography variant="body2" color="text.secondary">
                                {meal.nutritionalInfo.calories} kcal
                              </Typography>
                            )}
                          </Box>
                        </CardContent>
                      </CardActionArea>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <RecommendIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                <Typography variant="h6" gutterBottom>
                  No recommendations yet
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  We'll generate personalized recommendations as you use the app more.
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => navigate('/menu')}
                >
                  Browse Menu
                </Button>
              </Paper>
            )}
          </Box>

          <Divider sx={{ my: 4 }} />
        </>
      )}

      {/* Upcoming events section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Upcoming Events
        </Typography>
        
        <Grid container spacing={2}>
          {upcomingEvents.map((event) => (
            <Grid item xs={12} sm={6} key={event.id}>
              <Paper 
                sx={{ 
                  p: 2, 
                  display: 'flex', 
                  flexDirection: isMobile ? 'column' : 'row',
                  alignItems: isMobile ? 'flex-start' : 'center',
                  gap: 2,
                }}
              >
                <Box 
                  sx={{ 
                    bgcolor: 'secondary.light', 
                    color: 'secondary.contrastText',
                    p: 2,
                    borderRadius: 2,
                    minWidth: 80,
                    textAlign: 'center',
                  }}
                >
                  <Typography variant="subtitle2">{event.date}</Typography>
                </Box>
                <Box>
                  <Typography variant="h6">{event.title}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {event.description}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Quick actions section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Quick Actions
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={6} sm={3}>
            <Card>
              <CardActionArea onClick={() => navigate('/menu')}>
                <Box sx={{ p: 2, textAlign: 'center' }}>
                  <MenuIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                  <Typography variant="body1">Weekly Menu</Typography>
                </Box>
              </CardActionArea>
            </Card>
          </Grid>
          
          <Grid item xs={6} sm={3}>
            <Card>
              <CardActionArea onClick={() => navigate('/orders')}>
                <Box sx={{ p: 2, textAlign: 'center' }}>
                  <TimeIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                  <Typography variant="body1">Order History</Typography>
                </Box>
              </CardActionArea>
            </Card>
          </Grid>
          
          <Grid item xs={6} sm={3}>
            <Card>
              <CardActionArea onClick={() => navigate('/favorites')}>
                <Box sx={{ p: 2, textAlign: 'center' }}>
                  <FavoriteIcon sx={{ fontSize: 40, color: 'error.main', mb: 1 }} />
                  <Typography variant="body1">Favorites</Typography>
                </Box>
              </CardActionArea>
            </Card>
          </Grid>
          
          <Grid item xs={6} sm={3}>
            <Card>
              <CardActionArea onClick={() => navigate('/recommendations')}>
                <Box sx={{ p: 2, textAlign: 'center' }}>
                  <RecommendIcon sx={{ fontSize: 40, color: 'secondary.main', mb: 1 }} />
                  <Typography variant="body1">Recommendations</Typography>
                </Box>
              </CardActionArea>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default HomePage;
