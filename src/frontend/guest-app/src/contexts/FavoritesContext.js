import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';
import api from '../services/api';

// Create the favorites context
const FavoritesContext = createContext();

// Custom hook to use the favorites context
export const useFavorites = () => {
  return useContext(FavoritesContext);
};

export const FavoritesProvider = ({ children }) => {
  const { currentUser, isAuthenticated } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Fetch favorites from API or localStorage
  useEffect(() => {
    const fetchFavorites = async () => {
      setLoading(true);
      
      try {
        if (isAuthenticated) {
          // If user is authenticated, fetch favorites from API
          const response = await api.get('/api/users/favorites');
          setFavorites(response.data || []);
        } else {
          // If user is not authenticated, get favorites from localStorage
          const savedFavorites = localStorage.getItem('favorites');
          setFavorites(savedFavorites ? JSON.parse(savedFavorites) : []);
        }
      } catch (error) {
        console.error('Error fetching favorites:', error);
        // Fallback to localStorage if API fails
        const savedFavorites = localStorage.getItem('favorites');
        setFavorites(savedFavorites ? JSON.parse(savedFavorites) : []);
      } finally {
        setLoading(false);
      }
    };
    
    fetchFavorites();
  }, [isAuthenticated, currentUser]);
  
  // Save favorites to localStorage whenever they change
  useEffect(() => {
    if (!loading) {
      localStorage.setItem('favorites', JSON.stringify(favorites));
      
      // If user is authenticated, also save to API
      if (isAuthenticated) {
        try {
          api.put('/api/users/favorites', { favorites });
        } catch (error) {
          console.error('Error saving favorites to API:', error);
        }
      }
    }
  }, [favorites, isAuthenticated, loading]);
  
  // Add a meal to favorites
  const addFavorite = async (meal) => {
    // Check if meal is already in favorites
    if (!favorites.some(fav => fav.id === meal.id)) {
      const newFavorites = [...favorites, meal];
      setFavorites(newFavorites);
      
      // If user is authenticated, save to API
      if (isAuthenticated) {
        try {
          await api.post(`/api/users/favorites/${meal.id}`);
        } catch (error) {
          console.error('Error adding favorite to API:', error);
        }
      }
    }
  };
  
  // Remove a meal from favorites
  const removeFavorite = async (mealId) => {
    const newFavorites = favorites.filter(meal => meal.id !== mealId);
    setFavorites(newFavorites);
    
    // If user is authenticated, remove from API
    if (isAuthenticated) {
      try {
        await api.delete(`/api/users/favorites/${mealId}`);
      } catch (error) {
        console.error('Error removing favorite from API:', error);
      }
    }
  };
  
  // Check if a meal is in favorites
  const isFavorite = (mealId) => {
    return favorites.some(meal => meal.id === mealId);
  };
  
  // Get all favorites
  const getAllFavorites = () => {
    return favorites;
  };
  
  // Value to be provided by the context
  const value = {
    favorites,
    loading,
    addFavorite,
    removeFavorite,
    isFavorite,
    getAllFavorites,
  };
  
  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
};

export default FavoritesContext;
