const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Product Schema
 * Represents a product offered by a supplier in the marketplace
 */
const ProductSchema = new Schema(
  {
    supplierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Supplier',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    subCategory: String,
    price: {
      amount: {
        type: Number,
        required: true,
        min: 0,
      },
      currency: {
        type: String,
        default: 'DKK',
      },
    },
    unit: {
      type: String,
      required: true,
    },
    packageSize: {
      value: Number,
      unit: String,
    },
    pricePerUnit: {
      amount: Number,
      unit: String,
    },
    images: [String],
    nutritionalInfo: {
      calories: Number,
      protein: Number,
      carbs: Number,
      fat: Number,
      fiber: Number,
      salt: Number,
      sugar: Number,
    },
    allergens: [String],
    dietaryInfo: {
      isVegetarian: {
        type: Boolean,
        default: false,
      },
      isVegan: {
        type: Boolean,
        default: false,
      },
      isGlutenFree: {
        type: Boolean,
        default: false,
      },
      isDairyFree: {
        type: Boolean,
        default: false,
      },
      isNutFree: {
        type: Boolean,
        default: false,
      },
      isOrganic: {
        type: Boolean,
        default: false,
      },
    },
    sustainability: {
      co2FootprintPerKg: Number,
      isLocallySourced: {
        type: Boolean,
        default: false,
      },
      packagingType: String,
      certifications: [String],
    },
    inventory: {
      inStock: {
        type: Boolean,
        default: true,
      },
      stockLevel: Number,
      minOrderQuantity: {
        type: Number,
        default: 1,
      },
      maxOrderQuantity: Number,
      leadTimeHours: Number,
    },
    kickbackPercentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'discontinued', 'seasonal'],
      default: 'active',
    },
    seasonality: {
      isSeasonalProduct: {
        type: Boolean,
        default: false,
      },
      seasonStart: String, // Month name or month number
      seasonEnd: String,
    },
    metrics: {
      totalOrders: {
        type: Number,
        default: 0,
      },
      totalRevenue: {
        type: Number,
        default: 0,
      },
      averageRating: {
        type: Number,
        min: 0,
        max: 5,
        default: 0,
      },
      viewCount: {
        type: Number,
        default: 0,
      },
    },
    tags: [String],
    isPromoted: {
      type: Boolean,
      default: false,
    },
    promotionEndDate: Date,
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient querying
ProductSchema.index({ supplierId: 1 });
ProductSchema.index({ category: 1 });
ProductSchema.index({ 'price.amount': 1 });
ProductSchema.index({ 'dietaryInfo.isOrganic': 1 });
ProductSchema.index({ 'dietaryInfo.isVegetarian': 1 });
ProductSchema.index({ 'dietaryInfo.isVegan': 1 });
ProductSchema.index({ status: 1 });
ProductSchema.index({ tags: 1 });

// Virtual for full price display
ProductSchema.virtual('priceDisplay').get(function () {
  return `${this.price.amount.toFixed(2)} ${this.price.currency}/${this.unit}`;
});

// Method to check if product is in season
ProductSchema.methods.isInSeason = function () {
  if (!this.seasonality.isSeasonalProduct) return true;
  
  const currentMonth = new Date().getMonth() + 1; // 1-12
  const seasonStart = parseInt(this.seasonality.seasonStart) || 1;
  const seasonEnd = parseInt(this.seasonality.seasonEnd) || 12;
  
  if (seasonStart <= seasonEnd) {
    return currentMonth >= seasonStart && currentMonth <= seasonEnd;
  } else {
    // Season spans across year boundary (e.g., winter: 11-2)
    return currentMonth >= seasonStart || currentMonth <= seasonEnd;
  }
};

// Method to calculate CO2 footprint for a given quantity
ProductSchema.methods.calculateCO2Footprint = function (quantity) {
  if (!this.sustainability.co2FootprintPerKg) return null;
  
  // Convert quantity to kg based on unit
  let quantityInKg = quantity;
  if (this.unit === 'g') {
    quantityInKg = quantity / 1000;
  }
  
  return this.sustainability.co2FootprintPerKg * quantityInKg;
};

// Method to increment view count
ProductSchema.methods.incrementViewCount = function () {
  this.metrics.viewCount += 1;
  return this.save();
};

// Method to update average rating
ProductSchema.methods.updateRating = function (newRating) {
  // Simple moving average
  const oldTotal = this.metrics.averageRating * this.metrics.totalOrders;
  this.metrics.totalOrders += 1;
  this.metrics.averageRating = (oldTotal + newRating) / this.metrics.totalOrders;
  
  return this.save();
};

module.exports = mongoose.model('Product', ProductSchema);
