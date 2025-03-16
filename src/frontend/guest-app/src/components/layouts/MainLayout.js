import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useFavorites } from '../../contexts/FavoritesContext';
import { useAppTheme } from '../../contexts/ThemeContext';
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  BottomNavigation,
  BottomNavigationAction,
  Avatar,
  Menu,
  MenuItem,
  Badge,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Home as HomeIcon,
  RestaurantMenu as MenusIcon,
  Person as ProfileIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  History as HistoryIcon,
  ShoppingCart as ShoppingCartIcon,
  Favorite as FavoriteIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  Recommend as RecommendIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const MainLayout = () => {
  const { currentUser, logout } = useAuth();
  const { getCartItemCount } = useCart();
  const { getAllFavorites } = useFavorites();
  const { toggleTheme, isDarkMode } = useAppTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [bottomNavValue, setBottomNavValue] = useState(getActiveNavItem());
  
  // Determine active navigation item based on current path
  function getActiveNavItem() {
    const path = location.pathname;
    if (path === '/') return 0;
    if (path.startsWith('/menu')) return 1;
    if (path.startsWith('/cart')) return 2;
    if (path.startsWith('/favorites')) return 3;
    if (path.startsWith('/profile')) return 4;
    if (path.startsWith('/orders')) return 5;
    return 0;
  }
  
  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };
  
  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };
  
  const handleLogout = () => {
    handleProfileMenuClose();
    logout();
  };
  
  const handleBottomNavChange = (event, newValue) => {
    setBottomNavValue(newValue);
    
    switch (newValue) {
      case 0:
        navigate('/');
        break;
      case 1:
        navigate('/menu');
        break;
      case 2:
        navigate('/cart');
        break;
      case 3:
        navigate('/favorites');
        break;
      case 4:
        navigate('/profile');
        break;
      case 5:
        navigate('/orders');
        break;
      default:
        navigate('/');
    }
  };
  
  const menuItems = [
    { text: 'Home', icon: <HomeIcon />, path: '/' },
    { text: 'Weekly Menu', icon: <MenusIcon />, path: '/menu' },
    { 
      text: 'Cart', 
      icon: (
        <Badge badgeContent={getCartItemCount()} color="primary">
          <ShoppingCartIcon />
        </Badge>
      ), 
      path: '/cart' 
    },
    { text: 'Recommendations', icon: <RecommendIcon color="primary" />, path: '/recommendations' },
    { 
      text: 'Favorites', 
      icon: (
        <Badge badgeContent={getAllFavorites().length} color="error">
          <FavoriteIcon />
        </Badge>
      ), 
      path: '/favorites' 
    },
    { text: 'Profile', icon: <ProfileIcon />, path: '/profile' },
    { text: 'Order History', icon: <HistoryIcon />, path: '/orders' },
    { text: 'Preferences', icon: <SettingsIcon />, path: '/preferences' },
    { 
      text: isDarkMode ? 'Light Mode' : 'Dark Mode', 
      icon: isDarkMode ? <LightModeIcon /> : <DarkModeIcon />, 
      onClick: toggleTheme 
    },
  ];
  
  const drawer = (
    <Box sx={{ width: 250 }}>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          Kanteeno
        </Typography>
      </Box>
      <List>
        {menuItems.map((item) => (
          <ListItem
            button
            key={item.text}
            onClick={() => {
              if (item.onClick) {
                item.onClick();
                setDrawerOpen(false);
              } else {
                navigate(item.path);
                setDrawerOpen(false);
              }
            }}
            selected={location.pathname === item.path}
          >
            <ListItemIcon
              sx={{
                color: location.pathname === item.path ? 'primary.main' : 'inherit',
              }}
            >
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </Box>
  );
  
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* App Bar */}
      <AppBar position="fixed" color="default" elevation={1}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {/* Page title based on current path */}
            {location.pathname === '/' && 'Home'}
            {location.pathname.startsWith('/menu') && 'Weekly Menu'}
            {location.pathname.startsWith('/cart') && 'Your Cart'}
            {location.pathname.startsWith('/checkout') && 'Checkout'}
            {location.pathname.startsWith('/order-confirmation') && 'Order Confirmation'}
            {location.pathname.startsWith('/favorites') && 'My Favorites'}
            {location.pathname.startsWith('/recommendations') && 'Recommended For You'}
            {location.pathname === '/profile' && 'Profile'}
            {location.pathname === '/preferences' && 'Preferences'}
            {location.pathname === '/orders' && 'Order History'}
          </Typography>
          
          {/* Theme toggle */}
          <IconButton 
            color="inherit" 
            aria-label="toggle theme"
            onClick={toggleTheme}
            sx={{ mr: 1 }}
          >
            {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
          
          {/* Recommendations */}
          <IconButton 
            color="inherit" 
            aria-label="recommendations"
            onClick={() => navigate('/recommendations')}
            sx={{ mr: 1 }}
          >
            <RecommendIcon color="primary" />
          </IconButton>
          
          {/* Favorites */}
          <IconButton 
            color="inherit" 
            aria-label="favorites"
            onClick={() => navigate('/favorites')}
            sx={{ mr: 1 }}
          >
            <Badge badgeContent={getAllFavorites().length} color="error">
              <FavoriteIcon />
            </Badge>
          </IconButton>
          
          {/* Cart */}
          <IconButton 
            color="inherit" 
            aria-label="shopping cart"
            onClick={() => navigate('/cart')}
            sx={{ mr: 1 }}
          >
            <Badge badgeContent={getCartItemCount()} color="primary">
              <ShoppingCartIcon />
            </Badge>
          </IconButton>
          
          {/* Notifications */}
          <IconButton color="inherit" aria-label="notifications">
            <Badge badgeContent={3} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
          
          {/* Profile Menu */}
          {currentUser && (
            <>
              <IconButton
                onClick={handleProfileMenuOpen}
                size="small"
                sx={{ ml: 1 }}
                aria-controls="profile-menu"
                aria-haspopup="true"
              >
                <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                  {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                </Avatar>
              </IconButton>
              <Menu
                id="profile-menu"
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleProfileMenuClose}
                PaperProps={{
                  elevation: 0,
                  sx: {
                    overflow: 'visible',
                    filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                    mt: 1.5,
                    '& .MuiAvatar-root': {
                      width: 32,
                      height: 32,
                      ml: -0.5,
                      mr: 1,
                    },
                    '&:before': {
                      content: '""',
                      display: 'block',
                      position: 'absolute',
                      top: 0,
                      right: 14,
                      width: 10,
                      height: 10,
                      bgcolor: 'background.paper',
                      transform: 'translateY(-50%) rotate(45deg)',
                      zIndex: 0,
                    },
                  },
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                <MenuItem onClick={() => { handleProfileMenuClose(); navigate('/profile'); }}>
                  <ListItemIcon>
                    <ProfileIcon fontSize="small" />
                  </ListItemIcon>
                  Profile
                </MenuItem>
                <MenuItem onClick={() => { handleProfileMenuClose(); navigate('/preferences'); }}>
                  <ListItemIcon>
                    <SettingsIcon fontSize="small" />
                  </ListItemIcon>
                  Preferences
                </MenuItem>
                <MenuItem onClick={() => { handleProfileMenuClose(); toggleTheme(); }}>
                  <ListItemIcon>
                    {isDarkMode ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
                  </ListItemIcon>
                  {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                </MenuItem>
                <MenuItem onClick={handleLogout}>
                  <ListItemIcon>
                    <LogoutIcon fontSize="small" />
                  </ListItemIcon>
                  Logout
                </MenuItem>
              </Menu>
            </>
          )}
        </Toolbar>
      </AppBar>
      
      {/* Drawer for mobile */}
      <Drawer
        variant="temporary"
        open={drawerOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile
        }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 250 },
        }}
      >
        {drawer}
      </Drawer>
      
      {/* Drawer for desktop */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 250 },
          width: 250,
          flexShrink: 0,
        }}
        open
      >
        {drawer}
      </Drawer>
      
      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 2,
          width: { sm: `calc(100% - 250px)` },
          ml: { sm: '250px' },
          mt: '56px',
          mb: isMobile ? '56px' : 0,
        }}
      >
        <Outlet />
      </Box>
      
      {/* Bottom navigation for mobile */}
      {isMobile && (
        <BottomNavigation
          value={bottomNavValue}
          onChange={handleBottomNavChange}
          showLabels
          sx={{
            width: '100%',
            position: 'fixed',
            bottom: 0,
            zIndex: 1100,
            borderTop: '1px solid',
            borderColor: 'divider',
          }}
        >
          <BottomNavigationAction label="Home" icon={<HomeIcon />} />
          <BottomNavigationAction label="Menu" icon={<MenusIcon />} />
          <BottomNavigationAction 
            label="Cart" 
            icon={
              <Badge badgeContent={getCartItemCount()} color="primary">
                <ShoppingCartIcon />
              </Badge>
            } 
          />
          <BottomNavigationAction 
            label="Favorites" 
            icon={
              <Badge badgeContent={getAllFavorites().length} color="error">
                <FavoriteIcon />
              </Badge>
            } 
          />
          <BottomNavigationAction label="Profile" icon={<ProfileIcon />} />
        </BottomNavigation>
      )}
    </Box>
  );
};

export default MainLayout;
