import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useFavorites } from './FavoritesContext';
import { recommendationsAPI } from '../services/api';

// Create the recommendations context
const RecommendationsContext = createContext();

// Custom hook to use the recommendations context
export const useRecommendations = () => {
  return useContext(RecommendationsContext);
};

export const RecommendationsProvider = ({ children }) => {
  const { currentUser, isAuthenticated } = useAuth();
  const { getAllFavorites } = useFavorites();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch recommendations from the API
  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get user favorites for fallback
      const favorites = getAllFavorites();
      
      try {
        // Try to get personalized recommendations from the API
        const response = await recommendationsAPI.getPersonalized();
        setRecommendations(response.data);
      } catch (apiError) {
        // If API call fails, try to get trending recommendations
        try {
          const trendingResponse = await recommendationsAPI.getTrending();
          setRecommendations(trendingResponse.data);
        } catch (trendingError) {
          // If both API calls fail, use fallback data
          console.error('Error fetching trending recommendations:', trendingError);
          
          // Generate fallback recommendations
          const fallbackRecommendations = [
            {
              id: 'rec1',
              name: 'Grilled Salmon Bowl',
              description: 'Fresh grilled salmon with quinoa, avocado, and seasonal vegetables',
              price: '85 DKK',
              image: 'https://source.unsplash.com/random/400x300/?salmon',
              tags: ['Protein-rich', 'Healthy', 'Seafood'],
              organic: true,
              availableUntil: '14:00',
              nutritionalInfo: {
                calories: 450,
                protein: 32,
                carbs: 35,
                fat: 18
              },
              reason: 'Based on your preference for healthy meals'
            },
            {
              id: 'rec2',
              name: 'Mediterranean Wrap',
              description: 'Falafel, hummus, fresh vegetables and tzatziki in a whole grain wrap',
              price: '65 DKK',
              image: 'https://source.unsplash.com/random/400x300/?wrap',
              tags: ['Vegetarian', 'Mediterranean'],
              organic: true,
              availableUntil: '14:00',
              nutritionalInfo: {
                calories: 380,
                protein: 14,
                carbs: 48,
                fat: 16
              },
              reason: 'Popular with users who ordered similar items'
            },
            {
              id: 'rec3',
              name: 'Seasonal Buddha Bowl',
              description: 'Seasonal roasted vegetables, quinoa, chickpeas, and tahini dressing',
              price: '75 DKK',
              image: 'https://source.unsplash.com/random/400x300/?buddha+bowl',
              tags: ['Vegan', 'Gluten-Free'],
              organic: true,
              availableUntil: '14:00',
              nutritionalInfo: {
                calories: 420,
                protein: 16,
                carbs: 52,
                fat: 18
              },
              reason: 'Matches your dietary preferences'
            },
            {
              id: 'rec4',
              name: 'Chicken Pesto Pasta',
              description: 'Whole grain pasta with grilled chicken, homemade pesto, and cherry tomatoes',
              price: '78 DKK',
              image: 'https://source.unsplash.com/random/400x300/?pasta',
              tags: ['Protein-rich', 'Italian'],
              organic: false,
              availableUntil: '14:00',
              nutritionalInfo: {
                calories: 520,
                protein: 28,
                carbs: 60,
                fat: 22
              },
              reason: 'Frequently ordered with your favorite items'
            },
            {
              id: 'rec5',
              name: 'Superfood Salad',
              description: 'Kale, spinach, blueberries, walnuts, and goat cheese with balsamic dressing',
              price: '72 DKK',
              image: 'https://source.unsplash.com/random/400x300/?salad',
              tags: ['Vegetarian', 'Superfood'],
              organic: true,
              availableUntil: '14:00',
              nutritionalInfo: {
                calories: 320,
                protein: 12,
                carbs: 28,
                fat: 20
              },
              reason: 'Trending among users with similar preferences'
            }
          ];
          
          // If user has favorites, add a reason based on their favorites
          if (favorites && favorites.length > 0) {
            // Get random tags from user favorites
            const favoriteTags = favorites.flatMap(fav => fav.tags || []);
            const uniqueTags = [...new Set(favoriteTags)];
            
            if (uniqueTags.length > 0) {
              const randomTag = uniqueTags[Math.floor(Math.random() * uniqueTags.length)];
              fallbackRecommendations[0].reason = `Based on your interest in ${randomTag} meals`;
            }
          }
          
          setRecommendations(fallbackRecommendations);
        }
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      setError('Failed to load recommendations. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Get personalized recommendations for the current user
  useEffect(() => {
    if (isAuthenticated) {
      fetchRecommendations();
    } else {
      setRecommendations([]);
      setLoading(false);
    }
  }, [isAuthenticated, currentUser?.id]);

  // Refresh recommendations
  const refreshRecommendations = () => {
    fetchRecommendations();
  };

  // Value to be provided by the context
  const value = {
    recommendations,
    loading,
    error,
    refreshRecommendations
  };

  return (
    <RecommendationsContext.Provider value={value}>
      {children}
    </RecommendationsContext.Provider>
  );
};

export default RecommendationsContext;
