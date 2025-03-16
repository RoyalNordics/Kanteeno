const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Supplier Schema
 * Represents a food supplier that provides products to canteens
 */
const SupplierSchema = new Schema(
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
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'suspended'],
      default: 'pending',
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    approvedAt: Date,
    categories: [String],
    description: String,
    website: String,
    logo: String,
    certifications: [
      {
        name: String,
        issuedBy: String,
        validUntil: Date,
        documentUrl: String,
      },
    ],
    sustainability: {
      organicPercentage: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
      },
      localSourcedPercentage: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
      },
      co2FootprintScore: {
        type: Number,
        min: 0,
        max: 10,
        default: 5,
      },
      sustainabilityDescription: String,
    },
    deliveryOptions: {
      minimumOrderValue: {
        type: Number,
        default: 0,
      },
      deliveryFee: {
        type: Number,
        default: 0,
      },
      freeDeliveryThreshold: Number,
      deliveryDays: {
        monday: { type: Boolean, default: true },
        tuesday: { type: Boolean, default: true },
        wednesday: { type: Boolean, default: true },
        thursday: { type: Boolean, default: true },
        friday: { type: Boolean, default: true },
        saturday: { type: Boolean, default: false },
        sunday: { type: Boolean, default: false },
      },
      leadTimeHours: {
        type: Number,
        default: 24,
      },
    },
    paymentTerms: {
      type: String,
      default: 'net30',
    },
    defaultKickbackPercentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    metrics: {
      totalProducts: {
        type: Number,
        default: 0,
      },
      averageRating: {
        type: Number,
        min: 0,
        max: 5,
        default: 0,
      },
      totalOrders: {
        type: Number,
        default: 0,
      },
      totalRevenue: {
        type: Number,
        default: 0,
      },
      onTimeDeliveryPercentage: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
      },
      complaintRate: {
        type: Number,
        min: 0,
        max: 100,
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
SupplierSchema.virtual('fullAddress').get(function () {
  return `${this.address.street}, ${this.address.postalCode} ${this.address.city}, ${this.address.country}`;
});

// Virtual for products (not stored in the document)
SupplierSchema.virtual('products', {
  ref: 'Product',
  localField: '_id',
  foreignField: 'supplierId',
});

// Method to check if supplier is approved
SupplierSchema.methods.isApproved = function () {
  return this.status === 'approved';
};

// Method to approve supplier
SupplierSchema.methods.approve = function (userId) {
  this.status = 'approved';
  this.approvedBy = userId;
  this.approvedAt = new Date();
  return this.save();
};

// Method to reject supplier
SupplierSchema.methods.reject = function () {
  this.status = 'rejected';
  return this.save();
};

// Method to suspend supplier
SupplierSchema.methods.suspend = function () {
  this.status = 'suspended';
  return this.save();
};

// Method to calculate performance score
SupplierSchema.methods.calculatePerformanceScore = function () {
  // This would be a more complex calculation in a real implementation
  // For now, we'll use a simple weighted average of the metrics
  const weights = {
    averageRating: 0.3,
    onTimeDeliveryPercentage: 0.4,
    complaintRate: 0.3,
  };
  
  const ratingScore = this.metrics.averageRating * 20; // Convert 0-5 to 0-100
  const deliveryScore = this.metrics.onTimeDeliveryPercentage;
  const complaintScore = 100 - this.metrics.complaintRate; // Invert complaint rate
  
  const performanceScore = 
    (ratingScore * weights.averageRating) +
    (deliveryScore * weights.onTimeDeliveryPercentage) +
    (complaintScore * weights.complaintRate);
  
  return Math.min(100, Math.max(0, performanceScore));
};

// Method to update metrics
SupplierSchema.methods.updateMetrics = async function () {
  // Populate products to count them
  await this.populate('products');
  this.metrics.totalProducts = this.products.length;
  
  // Other metrics would be updated based on orders and feedback
  // This is simplified for now
  
  return this.save();
};

module.exports = mongoose.model('Supplier', SupplierSchema);
