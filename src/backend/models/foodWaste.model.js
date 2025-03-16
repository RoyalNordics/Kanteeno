const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Food Waste Schema
 * Represents a record of food waste for a business unit
 */
const FoodWasteSchema = new Schema(
  {
    businessUnitId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BusinessUnit',
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    mealType: {
      type: String,
      enum: ['breakfast', 'lunch', 'dinner', 'snack', 'all'],
      required: true,
    },
    menuItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Menu.items',
    },
    menuItemName: String,
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },
    unit: {
      type: String,
      required: true,
      enum: ['kg', 'g', 'l', 'ml', 'portions'],
    },
    reason: {
      type: String,
      required: true,
      enum: [
        'overproduction',
        'expired',
        'damaged',
        'preparation-waste',
        'plate-waste',
        'quality-issues',
        'other',
      ],
    },
    reasonDetails: String,
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    cost: {
      amount: {
        type: Number,
        min: 0,
      },
      currency: {
        type: String,
        default: 'DKK',
      },
    },
    co2Equivalent: {
      type: Number,
      min: 0,
    },
    preventionActions: [String],
    images: [String],
    isAdjusted: {
      type: Boolean,
      default: false,
    },
    originalQuantity: {
      type: Number,
      min: 0,
    },
    adjustmentReason: String,
    adjustedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    adjustedAt: Date,
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient querying
FoodWasteSchema.index({ businessUnitId: 1, date: 1 });
FoodWasteSchema.index({ date: 1 });
FoodWasteSchema.index({ reason: 1 });
FoodWasteSchema.index({ mealType: 1 });

// Virtual for waste value in DKK
FoodWasteSchema.virtual('wasteValue').get(function () {
  if (!this.cost || !this.cost.amount) return 0;
  return this.cost.amount;
});

// Method to calculate CO2 equivalent if not already set
FoodWasteSchema.methods.calculateCO2Equivalent = function () {
  if (this.co2Equivalent) return this.co2Equivalent;
  
  // CO2 equivalent calculation based on food type
  // This is a simplified calculation and would be more complex in a real implementation
  // Different food types have different CO2 footprints
  
  // Default CO2 equivalent per kg of food waste (average value)
  const defaultCO2PerKg = 2.5; // kg CO2e per kg food waste
  
  // Convert quantity to kg if needed
  let quantityInKg = this.quantity;
  if (this.unit === 'g') {
    quantityInKg = this.quantity / 1000;
  } else if (this.unit === 'portions') {
    // Assume average portion is 0.5 kg
    quantityInKg = this.quantity * 0.5;
  }
  
  this.co2Equivalent = quantityInKg * defaultCO2PerKg;
  return this.co2Equivalent;
};

// Method to adjust waste record
FoodWasteSchema.methods.adjust = function (newQuantity, reason, userId) {
  // Store original quantity if this is the first adjustment
  if (!this.isAdjusted) {
    this.originalQuantity = this.quantity;
  }
  
  this.quantity = newQuantity;
  this.adjustmentReason = reason;
  this.adjustedBy = userId;
  this.adjustedAt = new Date();
  this.isAdjusted = true;
  
  // Recalculate cost and CO2 if they were set
  if (this.cost && this.cost.amount) {
    const unitCost = this.cost.amount / (this.originalQuantity || this.quantity);
    this.cost.amount = unitCost * newQuantity;
  }
  
  if (this.co2Equivalent) {
    const unitCO2 = this.co2Equivalent / (this.originalQuantity || this.quantity);
    this.co2Equivalent = unitCO2 * newQuantity;
  }
  
  return this.save();
};

// Static method to get total waste for a business unit in a date range
FoodWasteSchema.statics.getTotalWaste = async function (businessUnitId, startDate, endDate) {
  const result = await this.aggregate([
    {
      $match: {
        businessUnitId: mongoose.Types.ObjectId(businessUnitId),
        date: {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        },
      },
    },
    {
      $group: {
        _id: null,
        totalQuantity: { $sum: '$quantity' },
        totalCost: { $sum: '$cost.amount' },
        totalCO2: { $sum: '$co2Equivalent' },
        count: { $sum: 1 },
      },
    },
  ]);
  
  return result.length > 0 ? result[0] : { totalQuantity: 0, totalCost: 0, totalCO2: 0, count: 0 };
};

// Static method to get waste by reason
FoodWasteSchema.statics.getWasteByReason = async function (businessUnitId, startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        businessUnitId: mongoose.Types.ObjectId(businessUnitId),
        date: {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        },
      },
    },
    {
      $group: {
        _id: '$reason',
        totalQuantity: { $sum: '$quantity' },
        totalCost: { $sum: '$cost.amount' },
        totalCO2: { $sum: '$co2Equivalent' },
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        reason: '$_id',
        totalQuantity: 1,
        totalCost: 1,
        totalCO2: 1,
        count: 1,
        _id: 0,
      },
    },
  ]);
};

// Static method to get waste by meal type
FoodWasteSchema.statics.getWasteByMealType = async function (businessUnitId, startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        businessUnitId: mongoose.Types.ObjectId(businessUnitId),
        date: {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        },
      },
    },
    {
      $group: {
        _id: '$mealType',
        totalQuantity: { $sum: '$quantity' },
        totalCost: { $sum: '$cost.amount' },
        totalCO2: { $sum: '$co2Equivalent' },
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        mealType: '$_id',
        totalQuantity: 1,
        totalCost: 1,
        totalCO2: 1,
        count: 1,
        _id: 0,
      },
    },
  ]);
};

// Static method to get waste trend over time
FoodWasteSchema.statics.getWasteTrend = async function (businessUnitId, startDate, endDate, interval = 'day') {
  let dateFormat;
  let groupBy;
  
  switch (interval) {
    case 'day':
      dateFormat = { $dateToString: { format: '%Y-%m-%d', date: '$date' } };
      break;
    case 'week':
      dateFormat = {
        $dateToString: {
          format: '%Y-W%V',
          date: '$date',
        },
      };
      break;
    case 'month':
      dateFormat = { $dateToString: { format: '%Y-%m', date: '$date' } };
      break;
    default:
      dateFormat = { $dateToString: { format: '%Y-%m-%d', date: '$date' } };
  }
  
  return this.aggregate([
    {
      $match: {
        businessUnitId: mongoose.Types.ObjectId(businessUnitId),
        date: {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        },
      },
    },
    {
      $group: {
        _id: dateFormat,
        totalQuantity: { $sum: '$quantity' },
        totalCost: { $sum: '$cost.amount' },
        totalCO2: { $sum: '$co2Equivalent' },
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        period: '$_id',
        totalQuantity: 1,
        totalCost: 1,
        totalCO2: 1,
        count: 1,
        _id: 0,
      },
    },
    {
      $sort: { period: 1 },
    },
  ]);
};

module.exports = mongoose.model('FoodWaste', FoodWasteSchema);
