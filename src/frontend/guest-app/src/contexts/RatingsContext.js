import React, { createContext, useState, useContext, useEffect } from 'react';
import { mealsAPI } from '../services/api';

// Create the ratings context
const RatingsContext = createContext();

// Custom hook to use the ratings context
export const useRatings = () => {
  return useContext(RatingsContext);
};

export const RatingsProvider = ({ children }) => {
  const [ratings, setRatings] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch ratings for a specific meal
  const fetchRatings = async (mealId) => {
    if (ratings[mealId]) {
      return ratings[mealId];
    }

    try {
      setLoading(true);
      setError(null);
      
      // This would call a new API endpoint to get ratings for a meal
      // For now, we'll simulate it with the existing API
      const response = await mealsAPI.getMealRatings(mealId);
      
      const mealRatings = response.data;
      
      setRatings(prevRatings => ({
        ...prevRatings,
        [mealId]: mealRatings
      }));
      
      return mealRatings;
    } catch (error) {
      console.error('Error fetching ratings:', error);
      setError('Failed to load ratings. Please try again later.');
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Add a new rating
  const addRating = async (mealId, ratingData) => {
    try {
      setLoading(true);
      setError(null);
      
      // Submit the rating using the existing API
      await mealsAPI.addFeedback(mealId, ratingData);
      
      // Refresh the ratings for this meal
      await fetchRatings(mealId);
      
      return true;
    } catch (error) {
      console.error('Error adding rating:', error);
      setError('Failed to submit rating. Please try again later.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Get average rating for a meal
  const getAverageRating = (mealId) => {
    if (!ratings[mealId] || ratings[mealId].length === 0) {
      return 0;
    }
    
    const sum = ratings[mealId].reduce((total, rating) => total + rating.rating, 0);
    return sum / ratings[mealId].length;
  };

  // Value to be provided by the context
  const value = {
    ratings,
    loading,
    error,
    fetchRatings,
    addRating,
    getAverageRating,
  };
  
  return (
    <RatingsContext.Provider value={value}>
      {children}
    </RatingsContext.Provider>
  );
};

export default RatingsContext;
