import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Divider,
  Rating,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Chip,
  CircularProgress,
  Alert,
  Button,
  Stack,
  useTheme,
} from '@mui/material';
import {
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  ThumbUp as ThumbUpIcon,
  Sort as SortIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import { useRatings } from '../../contexts/RatingsContext';
import { formatDistanceToNow } from 'date-fns';

const RatingsDisplay = ({ mealId }) => {
  const theme = useTheme();
  const { ratings, loading, error, fetchRatings, getAverageRating } = useRatings();
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'highest', 'lowest'
  const [filterValue, setFilterValue] = useState(0); // 0 = all ratings, 1-5 = specific rating
  
  useEffect(() => {
    fetchRatings(mealId);
  }, [mealId, fetchRatings]);
  
  const mealRatings = ratings[mealId] || [];
  const averageRating = getAverageRating(mealId);
  
  // Get rating distribution
  const getRatingDistribution = () => {
    const distribution = [0, 0, 0, 0, 0]; // 5 stars, 4 stars, 3 stars, 2 stars, 1 star
    
    if (mealRatings.length === 0) {
      return distribution;
    }
    
    mealRatings.forEach(rating => {
      const starIndex = Math.floor(rating.rating) - 1;
      if (starIndex >= 0 && starIndex < 5) {
        distribution[4 - starIndex]++;
      }
    });
    
    return distribution;
  };
  
  // Sort and filter ratings
  const getSortedAndFilteredRatings = () => {
    let filteredRatings = [...mealRatings];
    
    // Apply filter
    if (filterValue > 0) {
      filteredRatings = filteredRatings.filter(rating => {
        const ratingValue = Math.floor(rating.rating);
        return ratingValue === filterValue;
      });
    }
    
    // Apply sort
    switch (sortBy) {
      case 'newest':
        return filteredRatings.sort((a, b) => new Date(b.date) - new Date(a.date));
      case 'highest':
        return filteredRatings.sort((a, b) => b.rating - a.rating);
      case 'lowest':
        return filteredRatings.sort((a, b) => a.rating - b.rating);
      default:
        return filteredRatings;
    }
  };
  
  const distribution = getRatingDistribution();
  const sortedAndFilteredRatings = getSortedAndFilteredRatings();
  
  // Handle sort change
  const handleSortChange = (newSortBy) => {
    setSortBy(newSortBy);
  };
  
  // Handle filter change
  const handleFilterChange = (newFilterValue) => {
    setFilterValue(newFilterValue);
  };
  
  if (loading && !mealRatings.length) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error && !mealRatings.length) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }
  
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Customer Reviews
      </Typography>
      
      {/* Summary section */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mr: 3 }}>
            <Typography variant="h3" color="primary.main">
              {averageRating.toFixed(1)}
            </Typography>
            <Rating 
              value={averageRating} 
              precision={0.5} 
              readOnly 
              size="small"
            />
            <Typography variant="body2" color="text.secondary">
              {mealRatings.length} {mealRatings.length === 1 ? 'review' : 'reviews'}
            </Typography>
          </Box>
          
          <Box sx={{ flexGrow: 1 }}>
            {distribution.map((count, index) => {
              const starCount = 5 - index;
              const percentage = mealRatings.length > 0 
                ? Math.round((count / mealRatings.length) * 100) 
                : 0;
              
              return (
                <Box key={starCount} sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                  <Typography variant="body2" sx={{ minWidth: 40 }}>
                    {starCount} ★
                  </Typography>
                  <Box 
                    sx={{ 
                      flexGrow: 1, 
                      bgcolor: 'background.default',
                      borderRadius: 1,
                      mx: 1,
                      height: 8,
                      overflow: 'hidden',
                    }}
                  >
                    <Box 
                      sx={{ 
                        width: `${percentage}%`, 
                        bgcolor: theme.palette.primary.main,
                        height: '100%',
                      }}
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ minWidth: 30 }}>
                    {count}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        </Box>
      </Box>
      
      <Divider sx={{ my: 2 }} />
      
      {/* Filter and sort controls */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <FilterIcon fontSize="small" color="action" />
          <Typography variant="body2">Filter:</Typography>
          <Chip 
            label="All" 
            onClick={() => handleFilterChange(0)}
            color={filterValue === 0 ? 'primary' : 'default'}
            variant={filterValue === 0 ? 'filled' : 'outlined'}
            size="small"
          />
          {[5, 4, 3, 2, 1].map(value => (
            <Chip 
              key={value}
              label={`${value} ★`}
              onClick={() => handleFilterChange(value)}
              color={filterValue === value ? 'primary' : 'default'}
              variant={filterValue === value ? 'filled' : 'outlined'}
              size="small"
            />
          ))}
        </Stack>
        
        <Stack direction="row" spacing={1} alignItems="center">
          <SortIcon fontSize="small" color="action" />
          <Typography variant="body2">Sort by:</Typography>
          <Chip 
            label="Newest" 
            onClick={() => handleSortChange('newest')}
            color={sortBy === 'newest' ? 'primary' : 'default'}
            variant={sortBy === 'newest' ? 'filled' : 'outlined'}
            size="small"
          />
          <Chip 
            label="Highest rated" 
            onClick={() => handleSortChange('highest')}
            color={sortBy === 'highest' ? 'primary' : 'default'}
            variant={sortBy === 'highest' ? 'filled' : 'outlined'}
            size="small"
          />
          <Chip 
            label="Lowest rated" 
            onClick={() => handleSortChange('lowest')}
            color={sortBy === 'lowest' ? 'primary' : 'default'}
            variant={sortBy === 'lowest' ? 'filled' : 'outlined'}
            size="small"
          />
        </Stack>
      </Box>
      
      {/* Reviews list */}
      {sortedAndFilteredRatings.length > 0 ? (
        <List>
          {sortedAndFilteredRatings.map((review, index) => (
            <React.Fragment key={review.id || index}>
              <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                <ListItemAvatar>
                  <Avatar 
                    src={review.userAvatar} 
                    alt={review.userName || 'Anonymous'}
                  >
                    {(review.userName || 'A')[0]}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box>
                        <Typography variant="subtitle1" component="span">
                          {review.userName || 'Anonymous'}
                        </Typography>
                        <Rating 
                          value={review.rating} 
                          readOnly 
                          size="small" 
                          sx={{ ml: 1 }}
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {review.date ? formatDistanceToNow(new Date(review.date), { addSuffix: true }) : 'Recently'}
                      </Typography>
                    </Box>
                  }
                  secondary={
                    <>
                      <Typography
                        component="span"
                        variant="body2"
                        color="text.primary"
                        sx={{ display: 'block', my: 1 }}
                      >
                        {review.comment || 'No comment provided.'}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        <Button 
                          size="small" 
                          startIcon={<ThumbUpIcon fontSize="small" />}
                          sx={{ mr: 1 }}
                        >
                          Helpful ({review.helpfulCount || 0})
                        </Button>
                        
                        {review.verified && (
                          <Chip 
                            label="Verified Purchase" 
                            size="small" 
                            color="success" 
                            variant="outlined"
                          />
                        )}
                      </Box>
                    </>
                  }
                />
              </ListItem>
              {index < sortedAndFilteredRatings.length - 1 && <Divider component="li" />}
            </React.Fragment>
          ))}
        </List>
      ) : (
        <Box sx={{ py: 3, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            {mealRatings.length > 0 
              ? 'No reviews match your current filter.' 
              : 'No reviews yet. Be the first to leave a review!'}
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default RatingsDisplay;
