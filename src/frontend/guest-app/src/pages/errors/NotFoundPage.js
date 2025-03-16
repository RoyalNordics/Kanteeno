import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Typography,
  Container,
  Paper,
} from '@mui/material';
import {
  Home as HomeIcon,
  RestaurantMenu as MenuIcon,
  SentimentDissatisfied as SadIcon,
} from '@mui/icons-material';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="md">
      <Paper
        elevation={3}
        sx={{
          p: 5,
          mt: 10,
          mb: 10,
          borderRadius: 2,
          textAlign: 'center',
          backgroundColor: 'background.paper',
        }}
      >
        <SadIcon sx={{ fontSize: 100, color: 'text.secondary', mb: 2 }} />
        
        <Typography variant="h1" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          404
        </Typography>
        
        <Typography variant="h4" component="h2" gutterBottom>
          Page Not Found
        </Typography>
        
        <Typography variant="body1" color="text.secondary" paragraph sx={{ mb: 4 }}>
          Oops! The page you are looking for doesn't exist or has been moved.
        </Typography>
        
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            startIcon={<HomeIcon />}
            onClick={() => navigate('/')}
            sx={{ minWidth: 200 }}
          >
            Go to Home
          </Button>
          
          <Button
            variant="outlined"
            color="primary"
            size="large"
            startIcon={<MenuIcon />}
            onClick={() => navigate('/menu')}
            sx={{ minWidth: 200 }}
          >
            View Menu
          </Button>
        </Box>
        
        <Typography variant="body2" color="text.secondary" sx={{ mt: 6 }}>
          If you believe this is an error, please contact support.
        </Typography>
      </Paper>
    </Container>
  );
};

export default NotFoundPage;
