const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Business Unit Schema
 * Represents a canteen or business location
 */
const BusinessUnitSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
    },
    address: {
      street: String,
      city: String,
      postalCode: String,
      country: {
        type: String,
        default: 'Denmark',
      },
    },
    contactPerson: {
      name: String,
      email: String,
      phone: String,
    },
    settings: {
      mealCapacity: {
        type: Number,
        default: 100,
      },
      operatingDays: {
        monday: { type: Boolean, default: true },
        tuesday: { type: Boolean, default: true },
        wednesday: { type: Boolean, default: true },
        thursday: { type: Boolean, default: true },
        friday: { type: Boolean, default: true },
        saturday: { type: Boolean, default: false },
        sunday: { type: Boolean, default: false },
      },
      mealTypes: {
        breakfast: { type: Boolean, default: false },
        lunch: { type: Boolean, default: true },
        dinner: { type: Boolean, default: false },
        snack: { type: Boolean, default: false },
      },
      organicPercentageTarget: {
        type: Number,
        min: 0,
        max: 100,
        default: 30,
      },
      wasteReductionTarget: {
        type: Number,
        min: 0,
        max: 100,
        default: 20,
      },
      co2ReductionTarget: {
        type: Number,
        min: 0,
        max: 100,
        default: 30,
      },
      budgetPerMeal: {
        type: Number,
        default: 35,
      },
      currency: {
        type: String,
        default: 'DKK',
      },
    },
    preferences: {
      popularMealTypes: [String],
      dietaryPreferences: {
        vegetarianPercentage: {
          type: Number,
          min: 0,
          max: 100,
          default: 20,
        },
        veganPercentage: {
          type: Number,
          min: 0,
          max: 100,
          default: 10,
        },
      },
      allergenPrevalence: {
        gluten: { type: Number, min: 0, max: 100, default: 5 },
        lactose: { type: Number, min: 0, max: 100, default: 5 },
        nuts: { type: Number, min: 0, max: 100, default: 3 },
        shellfish: { type: Number, min: 0, max: 100, default: 2 },
        eggs: { type: Number, min: 0, max: 100, default: 3 },
      },
    },
    metrics: {
      averageDailyGuests: {
        type: Number,
        default: 0,
      },
      foodWastePercentage: {
        type: Number,
        default: 0,
      },
      organicPercentage: {
        type: Number,
        default: 0,
      },
      co2FootprintPerMeal: {
        type: Number,
        default: 0,
      },
      guestSatisfactionScore: {
        type: Number,
        min: 0,
        max: 5,
        default: 0,
      },
      complianceScore: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Virtual for full address
BusinessUnitSchema.virtual('fullAddress').get(function () {
  return `${this.address.street}, ${this.address.postalCode} ${this.address.city}, ${this.address.country}`;
});

// Method to check if business unit operates on a specific day
BusinessUnitSchema.methods.operatesOnDay = function (day) {
  return this.settings.operatingDays[day.toLowerCase()];
};

// Method to check if business unit serves a specific meal type
BusinessUnitSchema.methods.servesMealType = function (mealType) {
  return this.settings.mealTypes[mealType.toLowerCase()];
};

// Method to calculate compliance score
BusinessUnitSchema.methods.calculateComplianceScore = function () {
  // This would be a more complex calculation in a real implementation
  // For now, we'll use a simple average of the metrics
  const organicCompliance = (this.metrics.organicPercentage / this.settings.organicPercentageTarget) * 100;
  const wasteCompliance = ((100 - this.metrics.foodWastePercentage) / (100 - this.settings.wasteReductionTarget)) * 100;
  
  // Calculate average compliance score (capped at 100)
  const complianceScore = Math.min(100, (organicCompliance + wasteCompliance) / 2);
  
  return complianceScore;
};

// Method to update metrics
BusinessUnitSchema.methods.updateMetrics = function (metrics) {
  this.metrics = { ...this.metrics, ...metrics };
  
  // Recalculate compliance score
  this.metrics.complianceScore = this.calculateComplianceScore();
  
  return this.save();
};

module.exports = mongoose.model('BusinessUnit', BusinessUnitSchema);
