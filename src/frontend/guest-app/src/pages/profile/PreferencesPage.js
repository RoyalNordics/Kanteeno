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
  FormControlLabel,
  Checkbox,
  Switch,
  Chip,
  TextField,
  Autocomplete,
  Snackbar,
  Card,
  CardContent,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  Notifications as NotificationsIcon,
  Restaurant as RestaurantIcon,
  NoFood as NoFoodIcon,
  Eco as EcoIcon,
  LocalOffer as OfferIcon,
  Email as EmailIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  ShoppingBag as ShoppingBagIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { usersAPI } from '../../services/api';

// Common dietary restrictions
const dietaryRestrictions = [
  'Vegetarian',
  'Vegan',
  'Pescatarian',
  'Gluten-Free',
  'Dairy-Free',
  'Nut-Free',
  'Halal',
  'Kosher',
  'Low-Carb',
  'Keto',
  'Paleo',
];

// Common allergens
const commonAllergens = [
  'Peanuts',
  'Tree Nuts',
  'Milk',
  'Eggs',
  'Fish',
  'Shellfish',
  'Soy',
  'Wheat',
  'Gluten',
  'Sesame',
  'Mustard',
  'Celery',
  'Lupin',
  'Molluscs',
  'Sulphites',
];

const PreferencesPage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  // Preferences state
  const [preferences, setPreferences] = useState({
    dietaryRestrictions: [],
    allergies: [],
    favoriteIngredients: [],
    dislikedIngredients: [],
    preferOrganicOnly: false,
    calorieTarget: '',
    notifications: {
      emailNotifications: true,
      menuUpdates: true,
      specialOffers: true,
      orderUpdates: true,
    },
  });
  
  // Fetch user preferences
  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Fetch user preferences from API
        const response = await usersAPI.getPreferences();
        
        // If preferences exist, update state
        if (response.data) {
          setPreferences(response.data);
        }
      } catch (err) {
        console.error('Error fetching preferences:', err);
        setError('Failed to load preferences. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    if (currentUser) {
      fetchPreferences();
    }
  }, [currentUser]);
  
  // Handle dietary restrictions change
  const handleDietaryRestrictionsChange = (event, newValue) => {
    setPreferences({
      ...preferences,
      dietaryRestrictions: newValue,
    });
  };
  
  // Handle allergies change
  const handleAllergiesChange = (event, newValue) => {
    setPreferences({
      ...preferences,
      allergies: newValue,
    });
  };
  
  // Handle favorite ingredients change
  const handleFavoriteIngredientsChange = (event, newValue) => {
    setPreferences({
      ...preferences,
      favoriteIngredients: newValue,
    });
  };
  
  // Handle disliked ingredients change
  const handleDislikedIngredientsChange = (event, newValue) => {
    setPreferences({
      ...preferences,
      dislikedIngredients: newValue,
    });
  };
  
  // Handle organic preference change
  const handleOrganicChange = (event) => {
    setPreferences({
      ...preferences,
      preferOrganicOnly: event.target.checked,
    });
  };
  
  // Handle calorie target change
  const handleCalorieTargetChange = (event) => {
    const value = event.target.value;
    // Only allow numbers
    if (value === '' || /^[0-9]+$/.test(value)) {
      setPreferences({
        ...preferences,
        calorieTarget: value,
      });
    }
  };
  
  // Handle notification preference change
  const handleNotificationChange = (event) => {
    const { name, checked } = event.target;
    setPreferences({
      ...preferences,
      notifications: {
        ...preferences.notifications,
        [name]: checked,
      },
    });
  };
  
  // Save preferences
  const handleSavePreferences = async () => {
    try {
      setSaveLoading(true);
      setError('');
      
      await usersAPI.updatePreferences(preferences);
      
      setSuccess(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err) {
      console.error('Error saving preferences:', err);
      setError('Failed to save preferences. Please try again.');
    } finally {
      setSaveLoading(false);
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
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <IconButton
          onClick={() => navigate('/profile')}
          sx={{ mr: 2 }}
          aria-label="back to profile"
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1">
          Preferences
        </Typography>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Grid container spacing={4}>
        {/* Left column - Navigation */}
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <List component="nav">
              <ListItem
                button
                component={RouterLink}
                to="/profile"
              >
                <ListItemIcon>
                  <PersonIcon />
                </ListItemIcon>
                <ListItemText primary="Account Details" />
              </ListItem>
              
              <ListItem
                button
                selected
              >
                <ListItemIcon>
                  <SettingsIcon />
                </ListItemIcon>
                <ListItemText primary="Preferences" />
              </ListItem>
              
              <ListItem
                button
                component={RouterLink}
                to="/orders"
              >
                <ListItemIcon>
                  <ShoppingBagIcon />
                </ListItemIcon>
                <ListItemText primary="Order History" />
              </ListItem>
            </List>
          </Paper>
        </Grid>
        
        {/* Right column - Preferences */}
        <Grid item xs={12} md={9}>
          {/* Dietary Preferences */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h5" gutterBottom>
              <RestaurantIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Dietary Preferences
            </Typography>
            
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <Autocomplete
                  multiple
                  id="dietary-restrictions"
                  options={dietaryRestrictions}
                  value={preferences.dietaryRestrictions}
                  onChange={handleDietaryRestrictionsChange}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Dietary Restrictions"
                      placeholder="Select or type"
                      helperText="Select any dietary restrictions you follow"
                    />
                  )}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        label={option}
                        {...getTagProps({ index })}
                        color="primary"
                        variant="outlined"
                      />
                    ))
                  }
                  freeSolo
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Autocomplete
                  multiple
                  id="allergies"
                  options={commonAllergens}
                  value={preferences.allergies}
                  onChange={handleAllergiesChange}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Allergies"
                      placeholder="Select or type"
                      helperText="Select any food allergies you have"
                    />
                  )}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        label={option}
                        {...getTagProps({ index })}
                        color="error"
                        variant="outlined"
                        icon={<NoFoodIcon />}
                      />
                    ))
                  }
                  freeSolo
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Autocomplete
                  multiple
                  id="favorite-ingredients"
                  options={[]}
                  value={preferences.favoriteIngredients}
                  onChange={handleFavoriteIngredientsChange}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Favorite Ingredients"
                      placeholder="Type and press enter"
                      helperText="Add ingredients you particularly enjoy"
                    />
                  )}
                  freeSolo
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Autocomplete
                  multiple
                  id="disliked-ingredients"
                  options={[]}
                  value={preferences.dislikedIngredients}
                  onChange={handleDislikedIngredientsChange}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Disliked Ingredients"
                      placeholder="Type and press enter"
                      helperText="Add ingredients you prefer to avoid"
                    />
                  )}
                  freeSolo
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={preferences.preferOrganicOnly}
                      onChange={handleOrganicChange}
                      color="success"
                      icon={<EcoIcon />}
                      checkedIcon={<EcoIcon />}
                    />
                  }
                  label="Prefer organic ingredients when available"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Daily Calorie Target (optional)"
                  value={preferences.calorieTarget}
                  onChange={handleCalorieTargetChange}
                  type="text"
                  InputProps={{
                    endAdornment: <Typography variant="body2">kcal</Typography>,
                  }}
                  helperText="Leave empty if you don't have a specific target"
                />
              </Grid>
            </Grid>
          </Paper>
          
          {/* Notification Preferences */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h5" gutterBottom>
              <NotificationsIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Notification Preferences
            </Typography>
            
            <List>
              <ListItem>
                <ListItemIcon>
                  <EmailIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Email Notifications"
                  secondary="Receive notifications via email"
                />
                <Switch
                  edge="end"
                  name="emailNotifications"
                  checked={preferences.notifications.emailNotifications}
                  onChange={handleNotificationChange}
                />
              </ListItem>
              
              <Divider variant="inset" component="li" />
              
              <ListItem>
                <ListItemIcon>
                  <RestaurantIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Menu Updates"
                  secondary="Get notified when new menus are available"
                />
                <Switch
                  edge="end"
                  name="menuUpdates"
                  checked={preferences.notifications.menuUpdates}
                  onChange={handleNotificationChange}
                  disabled={!preferences.notifications.emailNotifications}
                />
              </ListItem>
              
              <Divider variant="inset" component="li" />
              
              <ListItem>
                <ListItemIcon>
                  <OfferIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Special Offers"
                  secondary="Receive notifications about promotions and special offers"
                />
                <Switch
                  edge="end"
                  name="specialOffers"
                  checked={preferences.notifications.specialOffers}
                  onChange={handleNotificationChange}
                  disabled={!preferences.notifications.emailNotifications}
                />
              </ListItem>
              
              <Divider variant="inset" component="li" />
              
              <ListItem>
                <ListItemIcon>
                  <ShoppingBagIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Order Updates"
                  secondary="Get notified about your order status"
                />
                <Switch
                  edge="end"
                  name="orderUpdates"
                  checked={preferences.notifications.orderUpdates}
                  onChange={handleNotificationChange}
                  disabled={!preferences.notifications.emailNotifications}
                />
              </ListItem>
            </List>
          </Paper>
          
          {/* Save Button */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<SaveIcon />}
              onClick={handleSavePreferences}
              disabled={saveLoading}
              size="large"
            >
              {saveLoading ? <CircularProgress size={24} /> : 'Save Preferences'}
            </Button>
          </Box>
        </Grid>
      </Grid>
      
      <Snackbar
        open={success}
        autoHideDuration={3000}
        onClose={() => setSuccess(false)}
        message="Preferences saved successfully"
      />
    </Box>
  );
};

export default PreferencesPage;
