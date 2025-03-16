import React, { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Grid,
  Avatar,
  Divider,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  InputAdornment,
  Snackbar,
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Lock as LockIcon,
  Settings as SettingsIcon,
  ShoppingBag as ShoppingBagIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { usersAPI } from '../../services/api';

// TabPanel component for profile tabs
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
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
    id: `profile-tab-${index}`,
    'aria-controls': `profile-tabpanel-${index}`,
  };
}

const ProfilePage = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [currentTab, setCurrentTab] = useState(0);
  
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  
  // Initialize profile data with current user data
  useEffect(() => {
    if (currentUser) {
      setProfileData({
        name: currentUser.name || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
        password: '',
        confirmPassword: '',
      });
    }
  }, [currentUser]);
  
  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData({
      ...profileData,
      [name]: value,
    });
  };
  
  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };
  
  const handleEditToggle = () => {
    if (editMode) {
      // Cancel edit mode - reset form data
      setProfileData({
        name: currentUser.name || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
        password: '',
        confirmPassword: '',
      });
      setError('');
    }
    setEditMode(!editMode);
  };
  
  const validateForm = () => {
    // Name validation
    if (!profileData.name.trim()) {
      setError('Name is required');
      return false;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!profileData.email.trim() || !emailRegex.test(profileData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    
    // Password validation (only if password field is not empty)
    if (profileData.password) {
      if (profileData.password.length < 6) {
        setError('Password must be at least 6 characters long');
        return false;
      }
      
      if (profileData.password !== profileData.confirmPassword) {
        setError('Passwords do not match');
        return false;
      }
    }
    
    return true;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      // Extract the data to send to the API
      const userData = {
        name: profileData.name,
        email: profileData.email,
        phone: profileData.phone || undefined,
      };
      
      // Only include password if it was provided
      if (profileData.password) {
        userData.password = profileData.password;
      }
      
      await usersAPI.updateProfile(userData);
      
      setSuccess(true);
      setEditMode(false);
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  if (!currentUser) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        My Profile
      </Typography>
      
      <Grid container spacing={4}>
        {/* Left column - Profile summary */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
              <Avatar
                sx={{
                  width: 100,
                  height: 100,
                  mb: 2,
                  bgcolor: 'primary.main',
                  fontSize: '2rem',
                }}
              >
                {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : <PersonIcon />}
              </Avatar>
              
              <Typography variant="h5" gutterBottom>
                {currentUser.name}
              </Typography>
              
              <Typography variant="body2" color="text.secondary">
                {currentUser.email}
              </Typography>
              
              {currentUser.phone && (
                <Typography variant="body2" color="text.secondary">
                  {currentUser.phone}
                </Typography>
              )}
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <List>
              <ListItem
                button
                selected={currentTab === 0}
                onClick={() => setCurrentTab(0)}
              >
                <ListItemIcon>
                  <PersonIcon />
                </ListItemIcon>
                <ListItemText primary="Account Details" />
              </ListItem>
              
              <ListItem
                button
                component={RouterLink}
                to="/preferences"
                selected={false}
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
                selected={currentTab === 1}
                onClick={() => setCurrentTab(1)}
              >
                <ListItemIcon>
                  <ShoppingBagIcon />
                </ListItemIcon>
                <ListItemText primary="Order History" />
              </ListItem>
            </List>
            
            <Divider sx={{ my: 2 }} />
            
            <Button
              fullWidth
              variant="outlined"
              color="error"
              onClick={handleLogout}
              sx={{ mt: 2 }}
            >
              Logout
            </Button>
          </Paper>
        </Grid>
        
        {/* Right column - Profile details and tabs */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ mb: 3 }}>
            <Tabs
              value={currentTab}
              onChange={handleTabChange}
              aria-label="profile tabs"
              variant="fullWidth"
            >
              <Tab label="Account Details" {...a11yProps(0)} />
              <Tab label="Order History" {...a11yProps(1)} />
            </Tabs>
            
            {/* Account Details Tab */}
            <TabPanel value={currentTab} index={0}>
              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              )}
              
              <Box component="form" noValidate onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Full Name"
                      name="name"
                      value={profileData.name}
                      onChange={handleChange}
                      disabled={!editMode}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PersonIcon />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Email Address"
                      name="email"
                      value={profileData.email}
                      onChange={handleChange}
                      disabled={!editMode}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <EmailIcon />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Phone Number (Optional)"
                      name="phone"
                      value={profileData.phone}
                      onChange={handleChange}
                      disabled={!editMode}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PhoneIcon />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  
                  {editMode && (
                    <>
                      <Grid item xs={12}>
                        <Divider>
                          <Typography variant="body2" color="text.secondary">
                            Change Password (Optional)
                          </Typography>
                        </Divider>
                      </Grid>
                      
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="New Password"
                          name="password"
                          type={showPassword ? 'text' : 'password'}
                          value={profileData.password}
                          onChange={handleChange}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <LockIcon />
                              </InputAdornment>
                            ),
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton
                                  aria-label="toggle password visibility"
                                  onClick={toggleShowPassword}
                                  edge="end"
                                >
                                  {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                </IconButton>
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Grid>
                      
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Confirm New Password"
                          name="confirmPassword"
                          type={showPassword ? 'text' : 'password'}
                          value={profileData.confirmPassword}
                          onChange={handleChange}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <LockIcon />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Grid>
                    </>
                  )}
                </Grid>
                
                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                  {editMode ? (
                    <>
                      <Button
                        variant="outlined"
                        onClick={handleEditToggle}
                        startIcon={<CancelIcon />}
                        sx={{ mr: 2 }}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        variant="contained"
                        startIcon={<SaveIcon />}
                        disabled={loading}
                      >
                        {loading ? <CircularProgress size={24} /> : 'Save Changes'}
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="contained"
                      onClick={handleEditToggle}
                      startIcon={<EditIcon />}
                    >
                      Edit Profile
                    </Button>
                  )}
                </Box>
              </Box>
            </TabPanel>
            
            {/* Order History Tab */}
            <TabPanel value={currentTab} index={1}>
              <Typography variant="h6" gutterBottom>
                Recent Orders
              </Typography>
              
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <ShoppingBagIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                <Typography variant="body1" color="text.secondary">
                  You haven't placed any orders yet.
                </Typography>
                <Button
                  variant="contained"
                  component={RouterLink}
                  to="/menu"
                  sx={{ mt: 2 }}
                >
                  Browse Menu
                </Button>
              </Box>
            </TabPanel>
          </Paper>
        </Grid>
      </Grid>
      
      <Snackbar
        open={success}
        autoHideDuration={3000}
        onClose={() => setSuccess(false)}
        message="Profile updated successfully"
      />
    </Box>
  );
};

export default ProfilePage;
