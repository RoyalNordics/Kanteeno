const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Customer Schema
 * Represents a company or organization that has one or more business units (canteens)
 */
const CustomerSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    cvr: {
      type: String,
      required: true,
      unique: true,
      trim: true,
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
      name: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
      },
      phone: String,
      position: String,
    },
    billingInfo: {
      paymentTerms: {
        type: String,
        default: 'net30',
      },
      ean: String,
      vatNumber: String,
      invoiceEmail: String,
    },
    settings: {
      globalOrganicTarget: {
        type: Number,
        min: 0,
        max: 100,
        default: 30,
      },
      globalWasteReductionTarget: {
        type: Number,
        min: 0,
        max: 100,
        default: 20,
      },
      globalCo2ReductionTarget: {
        type: Number,
        min: 0,
        max: 100,
        default: 30,
      },
      defaultCurrency: {
        type: String,
        default: 'DKK',
      },
      reportingFrequency: {
        type: String,
        enum: ['weekly', 'monthly', 'quarterly'],
        default: 'monthly',
      },
    },
    subscription: {
      plan: {
        type: String,
        enum: ['basic', 'premium', 'enterprise'],
        default: 'basic',
      },
      startDate: Date,
      renewalDate: Date,
      status: {
        type: String,
        enum: ['active', 'pending', 'expired', 'cancelled'],
        default: 'active',
      },
    },
    metrics: {
      totalBusinessUnits: {
        type: Number,
        default: 0,
      },
      averageComplianceScore: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
      },
      totalAnnualSavings: {
        amount: {
          type: Number,
          default: 0,
        },
        currency: {
          type: String,
          default: 'DKK',
        },
      },
      co2Reduction: {
        type: Number,
        default: 0,
      },
      wasteReduction: {
        type: Number,
        default: 0,
      },
    },
    notes: String,
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
CustomerSchema.virtual('fullAddress').get(function () {
  return `${this.address.street}, ${this.address.postalCode} ${this.address.city}, ${this.address.country}`;
});

// Virtual for business units (not stored in the document)
CustomerSchema.virtual('businessUnits', {
  ref: 'BusinessUnit',
  localField: '_id',
  foreignField: 'customerId',
});

// Method to calculate metrics based on business units
CustomerSchema.methods.calculateMetrics = async function () {
  // Populate business units
  await this.populate('businessUnits');
  
  // Update total business units count
  this.metrics.totalBusinessUnits = this.businessUnits.length;
  
  if (this.businessUnits.length > 0) {
    // Calculate average compliance score
    const totalComplianceScore = this.businessUnits.reduce(
      (sum, unit) => sum + unit.metrics.complianceScore,
      0
    );
    this.metrics.averageComplianceScore = totalComplianceScore / this.businessUnits.length;
    
    // Calculate CO2 and waste reduction (simplified)
    // In a real implementation, this would be more complex
    this.metrics.co2Reduction = this.businessUnits.reduce(
      (sum, unit) => sum + unit.metrics.co2FootprintPerMeal,
      0
    ) / this.businessUnits.length;
    
    this.metrics.wasteReduction = this.businessUnits.reduce(
      (sum, unit) => sum + unit.metrics.foodWastePercentage,
      0
    ) / this.businessUnits.length;
  }
  
  return this.save();
};

// Method to check if subscription is active
CustomerSchema.methods.hasActiveSubscription = function () {
  return this.subscription.status === 'active';
};

// Method to check if customer is on enterprise plan
CustomerSchema.methods.isEnterprise = function () {
  return this.subscription.plan === 'enterprise';
};

module.exports = mongoose.model('Customer', CustomerSchema);
