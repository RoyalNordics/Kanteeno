const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Forecast Item Schema
 * Represents a single forecast item for a specific day and meal type
 */
const ForecastItemSchema = new Schema(
  {
    day: {
      type: Date,
      required: true,
    },
    mealType: {
      type: String,
      enum: ['breakfast', 'lunch', 'dinner', 'snack'],
      required: true,
    },
    predictedQuantity: {
      type: Number,
      required: true,
      min: 0,
    },
    adjustedQuantity: {
      type: Number,
      min: 0,
    },
    actualQuantity: {
      type: Number,
      min: 0,
    },
    confidence: {
      type: Number,
      min: 0,
      max: 100,
      default: 80,
    },
    factors: [
      {
        name: String,
        impact: Number, // Positive or negative impact on quantity
        description: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

/**
 * External Factor Schema
 * Represents an external factor that affects forecasts
 */
const ExternalFactorSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    impact: {
      type: Number,
      required: true, // Percentage impact (positive or negative)
    },
    description: String,
    isRecurring: {
      type: Boolean,
      default: false,
    },
    recurrencePattern: {
      frequency: {
        type: String,
        enum: ['daily', 'weekly', 'monthly', 'yearly'],
      },
      interval: Number, // e.g., every 2 weeks
      endDate: Date,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Forecast Schema
 * Represents a forecast for a business unit over a period of time
 */
const ForecastSchema = new Schema(
  {
    businessUnitId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BusinessUnit',
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    items: [ForecastItemSchema],
    externalFactors: [ExternalFactorSchema],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
    },
    modelVersion: {
      type: String,
      default: '1.0.0',
    },
    modelParameters: {
      algorithm: {
        type: String,
        default: 'lstm',
      },
      features: [String],
      hyperparameters: Object,
    },
    trainingMetrics: {
      accuracy: Number,
      mse: Number, // Mean Squared Error
      mae: Number, // Mean Absolute Error
      trainingDuration: Number, // in seconds
    },
    metadata: {
      totalPredictedGuests: {
        type: Number,
        default: 0,
      },
      averageConfidence: {
        type: Number,
        default: 0,
      },
      forecastAccuracy: {
        type: Number,
        min: 0,
        max: 100,
      },
    },
    notes: String,
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying
ForecastSchema.index({ businessUnitId: 1, startDate: 1, endDate: 1 });

// Virtual for forecast duration in days
ForecastSchema.virtual('durationDays').get(function () {
  const diffTime = Math.abs(this.endDate - this.startDate);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end dates
});

// Method to get forecast items for a specific day
ForecastSchema.methods.getItemsByDay = function (date) {
  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0); // Normalize to start of day
  
  return this.items.filter(item => {
    const itemDate = new Date(item.day);
    itemDate.setHours(0, 0, 0, 0);
    return itemDate.getTime() === targetDate.getTime();
  });
};

// Method to get forecast items by meal type
ForecastSchema.methods.getItemsByMealType = function (mealType) {
  return this.items.filter(item => item.mealType === mealType);
};

// Method to add or update a forecast item
ForecastSchema.methods.addOrUpdateItem = function (item) {
  const existingItemIndex = this.items.findIndex(
    i => i.day.getTime() === new Date(item.day).getTime() && i.mealType === item.mealType
  );
  
  if (existingItemIndex >= 0) {
    // Update existing item
    this.items[existingItemIndex] = {
      ...this.items[existingItemIndex].toObject(),
      ...item,
    };
  } else {
    // Add new item
    this.items.push(item);
  }
  
  return this;
};

// Method to add external factor
ForecastSchema.methods.addExternalFactor = function (factor) {
  this.externalFactors.push(factor);
  return this;
};

// Method to calculate forecast accuracy
ForecastSchema.methods.calculateAccuracy = function () {
  const itemsWithActual = this.items.filter(item => item.actualQuantity !== undefined);
  
  if (itemsWithActual.length === 0) {
    return null; // No actual data to compare
  }
  
  let totalError = 0;
  let totalActual = 0;
  
  itemsWithActual.forEach(item => {
    const predicted = item.adjustedQuantity || item.predictedQuantity;
    const actual = item.actualQuantity;
    
    totalError += Math.abs(predicted - actual);
    totalActual += actual;
  });
  
  // Mean Absolute Percentage Error (MAPE)
  const mape = (totalError / totalActual) * 100;
  
  // Convert to accuracy (100% - MAPE), with a floor of 0
  const accuracy = Math.max(0, 100 - mape);
  
  this.metadata.forecastAccuracy = accuracy;
  return accuracy;
};

// Method to update metadata
ForecastSchema.methods.updateMetadata = function () {
  // Calculate total predicted guests
  let totalPredicted = 0;
  let totalConfidence = 0;
  
  this.items.forEach(item => {
    totalPredicted += item.adjustedQuantity || item.predictedQuantity;
    totalConfidence += item.confidence;
  });
  
  this.metadata.totalPredictedGuests = totalPredicted;
  this.metadata.averageConfidence = this.items.length > 0 ? totalConfidence / this.items.length : 0;
  
  return this;
};

// Method to publish forecast
ForecastSchema.methods.publish = function () {
  this.status = 'published';
  return this.save();
};

// Method to archive forecast
ForecastSchema.methods.archive = function () {
  this.status = 'archived';
  return this.save();
};

module.exports = mongoose.model('Forecast', ForecastSchema);
