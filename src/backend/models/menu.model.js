const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Menu Item Schema
 * Represents a single item in a menu for a specific day and meal type
 */
const MenuItemSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    day: {
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      required: true,
    },
    mealType: {
      type: String,
      enum: ['breakfast', 'lunch', 'dinner', 'snack'],
      required: true,
    },
    ingredients: [
      {
        name: String,
        quantity: Number,
        unit: String,
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
        },
      },
    ],
    nutritionalInfo: {
      calories: Number,
      protein: Number,
      carbs: Number,
      fat: Number,
      fiber: Number,
    },
    allergens: [String],
    dietaryTags: [
      {
        type: String,
        enum: ['vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'nut-free', 'low-carb', 'keto', 'paleo'],
      },
    ],
    isSpecial: {
      type: Boolean,
      default: false,
    },
    popularity: {
      type: Number,
      default: 0,
    },
    imageUrl: String,
  },
  {
    timestamps: true,
  }
);

/**
 * Menu Schema
 * Represents a weekly menu for a specific business unit
 */
const MenuSchema = new Schema(
  {
    businessUnitId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BusinessUnit',
      required: true,
    },
    week: {
      type: Number,
      required: true,
      min: 1,
      max: 53,
    },
    year: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
    },
    items: [MenuItemSchema],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    publishedAt: Date,
    isAiGenerated: {
      type: Boolean,
      default: false,
    },
    generationParameters: {
      preferences: Object,
      constraints: Object,
    },
    estimatedCost: {
      total: Number,
      perMeal: Number,
      currency: {
        type: String,
        default: 'DKK',
      },
    },
    estimatedWaste: {
      quantity: Number,
      unit: String,
    },
    feedback: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        rating: {
          type: Number,
          min: 1,
          max: 5,
        },
        comment: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying by business unit, week and year
MenuSchema.index({ businessUnitId: 1, week: 1, year: 1 }, { unique: true });

// Virtual for menu date range
MenuSchema.virtual('dateRange').get(function () {
  // Calculate start and end dates based on week and year
  const startDate = new Date(this.year, 0, 1 + (this.week - 1) * 7);
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 6);
  
  return {
    start: startDate,
    end: endDate,
  };
});

// Method to check if menu is published
MenuSchema.methods.isPublished = function () {
  return this.status === 'published';
};

// Method to calculate average rating
MenuSchema.methods.getAverageRating = function () {
  if (this.feedback.length === 0) return 0;
  
  const sum = this.feedback.reduce((total, item) => total + item.rating, 0);
  return sum / this.feedback.length;
};

// Method to get items for a specific day
MenuSchema.methods.getItemsByDay = function (day) {
  return this.items.filter(item => item.day.toLowerCase() === day.toLowerCase());
};

// Method to get items by meal type
MenuSchema.methods.getItemsByMealType = function (mealType) {
  return this.items.filter(item => item.mealType.toLowerCase() === mealType.toLowerCase());
};

module.exports = mongoose.model('Menu', MenuSchema);
