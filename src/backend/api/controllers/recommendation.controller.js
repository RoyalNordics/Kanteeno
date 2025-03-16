const User = require('../../models/user.model');
const Order = require('../../models/order.model');
const Menu = require('../../models/menu.model');
const Product = require('../../models/product.model');
const logger = require('../../utils/logger');

/**
 * Get personalized recommendations for a user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getRecommendations = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user preferences
    const user = await User.findById(userId).select('preferences dietaryRestrictions favoriteCategories');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get user's order history
    const orderHistory = await Order.find({ userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('items.productId');
    
    // Get current menu
    const currentMenu = await Menu.findOne({ isActive: true })
      .populate({
        path: 'items.mealId',
        populate: {
          path: 'productId',
        }
      });
    
    if (!currentMenu) {
      return res.status(404).json({ message: 'No active menu found' });
    }
    
    // Extract available meals from current menu
    const availableMeals = currentMenu.items.map(item => item.mealId);
    
    // Generate recommendations based on user preferences and order history
    const recommendations = generateRecommendations(user, orderHistory, availableMeals);
    
    return res.status(200).json(recommendations);
  } catch (error) {
    logger.error(`Error getting recommendations: ${error.message}`);
    return res.status(500).json({ message: 'Error getting recommendations', error: error.message });
  }
};

/**
 * Generate personalized recommendations based on user data
 * @param {Object} user - User object with preferences
 * @param {Array} orderHistory - User's order history
 * @param {Array} availableMeals - Available meals from current menu
 * @returns {Array} - Array of recommended meals with reasons
 */
const generateRecommendations = (user, orderHistory, availableMeals) => {
  // This is a simplified recommendation algorithm
  // In a real-world scenario, this would be more sophisticated
  
  const recommendations = [];
  const recommendationReasons = {};
  
  // 1. Recommend based on dietary preferences
  if (user.preferences && user.preferences.length > 0) {
    const preferenceBased = availableMeals.filter(meal => {
      if (!meal || !meal.tags) return false;
      return meal.tags.some(tag => 
        user.preferences.includes(tag.toLowerCase())
      );
    });
    
    preferenceBased.forEach(meal => {
      if (!recommendationReasons[meal._id]) {
        const matchingPreference = meal.tags.find(tag => 
          user.preferences.includes(tag.toLowerCase())
        );
        recommendationReasons[meal._id] = `Based on your preference for ${matchingPreference} meals`;
      }
    });
    
    recommendations.push(...preferenceBased);
  }
  
  // 2. Recommend based on order history (similar items)
  if (orderHistory && orderHistory.length > 0) {
    // Extract categories from past orders
    const orderedCategories = new Set();
    orderHistory.forEach(order => {
      order.items.forEach(item => {
        if (item.productId && item.productId.category) {
          orderedCategories.add(item.productId.category);
        }
      });
    });
    
    // Find meals in the same categories
    const historyBased = availableMeals.filter(meal => {
      if (!meal || !meal.productId || !meal.productId.category) return false;
      return orderedCategories.has(meal.productId.category);
    });
    
    historyBased.forEach(meal => {
      if (!recommendationReasons[meal._id]) {
        recommendationReasons[meal._id] = 'Based on your order history';
      }
    });
    
    recommendations.push(...historyBased);
  }
  
  // 3. Add some popular items if we don't have enough recommendations
  if (recommendations.length < 5) {
    const popular = availableMeals
      .filter(meal => !recommendations.includes(meal))
      .slice(0, 5 - recommendations.length);
    
    popular.forEach(meal => {
      if (!recommendationReasons[meal._id]) {
        recommendationReasons[meal._id] = 'Popular with other users';
      }
    });
    
    recommendations.push(...popular);
  }
  
  // Remove duplicates and format response
  const uniqueRecommendations = [...new Set(recommendations)];
  
  return uniqueRecommendations.map(meal => {
    // Format the meal object for the response
    return {
      id: meal._id,
      name: meal.name,
      description: meal.description,
      price: `${meal.price} DKK`,
      image: meal.image || `https://source.unsplash.com/random/400x300/?${meal.name.split(' ')[0].toLowerCase()}`,
      tags: meal.tags || [],
      organic: meal.organic || false,
      availableUntil: meal.availableUntil || '14:00',
      nutritionalInfo: meal.nutritionalInfo || {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0
      },
      reason: recommendationReasons[meal._id]
    };
  });
};

/**
 * Get trending meals
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getTrending = async (req, res) => {
  try {
    // Get current menu
    const currentMenu = await Menu.findOne({ isActive: true })
      .populate('items.mealId');
    
    if (!currentMenu) {
      return res.status(404).json({ message: 'No active menu found' });
    }
    
    // Get order counts for meals in the current menu
    const orderCounts = await Order.aggregate([
      { $unwind: '$items' },
      { $group: { _id: '$items.productId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);
    
    // Map product IDs to meal IDs
    const productIds = orderCounts.map(item => item._id);
    const products = await Product.find({ _id: { $in: productIds } });
    
    // Extract available meals from current menu
    const availableMeals = currentMenu.items.map(item => item.mealId);
    
    // Filter trending meals that are available in the current menu
    const trendingMeals = availableMeals.filter(meal => 
      products.some(product => 
        product._id.toString() === (meal.productId ? meal.productId.toString() : '')
      )
    );
    
    // Format response
    const trending = trendingMeals.map(meal => ({
      id: meal._id,
      name: meal.name,
      description: meal.description,
      price: `${meal.price} DKK`,
      image: meal.image || `https://source.unsplash.com/random/400x300/?${meal.name.split(' ')[0].toLowerCase()}`,
      tags: meal.tags || [],
      organic: meal.organic || false,
      availableUntil: meal.availableUntil || '14:00',
      nutritionalInfo: meal.nutritionalInfo || {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0
      },
      reason: 'Trending this week'
    }));
    
    return res.status(200).json(trending);
  } catch (error) {
    logger.error(`Error getting trending meals: ${error.message}`);
    return res.status(500).json({ message: 'Error getting trending meals', error: error.message });
  }
};
