const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Order Item Schema
 * Represents a single item in an order
 */
const OrderItemSchema = new Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    unit: {
      type: String,
      required: true,
    },
    price: {
      amount: {
        type: Number,
        required: true,
      },
      currency: {
        type: String,
        default: 'DKK',
      },
    },
    totalPrice: {
      amount: {
        type: Number,
        required: true,
      },
      currency: {
        type: String,
        default: 'DKK',
      },
    },
    kickbackPercentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    kickbackAmount: {
      type: Number,
      default: 0,
    },
    notes: String,
  },
  {
    timestamps: true,
  }
);

/**
 * Order Complaint Schema
 * Represents a complaint about an order
 */
const OrderComplaintSchema = new Schema(
  {
    reason: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
        },
        quantity: Number,
        reason: String,
      },
    ],
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'resolved', 'rejected'],
      default: 'pending',
    },
    resolution: String,
    resolvedAt: Date,
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Order Schema
 * Represents an order placed by a business unit to a supplier
 */
const OrderSchema = new Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
    },
    businessUnitId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BusinessUnit',
      required: true,
    },
    supplierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Supplier',
      required: true,
    },
    placedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: [
        'draft',
        'pending',
        'confirmed',
        'processing',
        'shipped',
        'delivered',
        'cancelled',
        'returned',
      ],
      default: 'draft',
    },
    items: [OrderItemSchema],
    totalAmount: {
      amount: {
        type: Number,
        required: true,
      },
      currency: {
        type: String,
        default: 'DKK',
      },
    },
    totalKickback: {
      amount: {
        type: Number,
        default: 0,
      },
      currency: {
        type: String,
        default: 'DKK',
      },
    },
    orderDate: {
      type: Date,
      default: Date.now,
    },
    deliveryDate: {
      type: Date,
      required: true,
    },
    actualDeliveryDate: Date,
    deliveryAddress: {
      street: String,
      city: String,
      postalCode: String,
      country: {
        type: String,
        default: 'Denmark',
      },
    },
    deliveryNotes: String,
    paymentTerms: {
      type: String,
      default: 'net30',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'partially-paid', 'overdue', 'cancelled'],
      default: 'pending',
    },
    paymentDueDate: Date,
    paymentDate: Date,
    invoiceNumber: String,
    invoiceUrl: String,
    trackingNumber: String,
    trackingUrl: String,
    complaints: [OrderComplaintSchema],
    notes: String,
    isAutomaticallyGenerated: {
      type: Boolean,
      default: false,
    },
    generatedFromMenuId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Menu',
    },
    metadata: {
      co2Footprint: Number,
      organicPercentage: Number,
      sustainabilityScore: Number,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to generate order number
OrderSchema.pre('save', function (next) {
  if (!this.orderNumber) {
    // Generate a unique order number: ORD-YYYYMMDD-XXXX
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(1000 + Math.random() * 9000); // 4-digit random number
    
    this.orderNumber = `ORD-${year}${month}${day}-${random}`;
  }
  
  next();
});

// Virtual for full delivery address
OrderSchema.virtual('fullDeliveryAddress').get(function () {
  return `${this.deliveryAddress.street}, ${this.deliveryAddress.postalCode} ${this.deliveryAddress.city}, ${this.deliveryAddress.country}`;
});

// Method to calculate total amount
OrderSchema.methods.calculateTotals = function () {
  let totalAmount = 0;
  let totalKickback = 0;
  
  this.items.forEach(item => {
    totalAmount += item.totalPrice.amount;
    totalKickback += item.kickbackAmount;
  });
  
  this.totalAmount.amount = totalAmount;
  this.totalKickback.amount = totalKickback;
  
  return {
    totalAmount,
    totalKickback,
  };
};

// Method to add item to order
OrderSchema.methods.addItem = function (item) {
  // Calculate total price and kickback
  item.totalPrice = {
    amount: item.price.amount * item.quantity,
    currency: item.price.currency,
  };
  
  item.kickbackAmount = (item.totalPrice.amount * item.kickbackPercentage) / 100;
  
  this.items.push(item);
  this.calculateTotals();
  
  return this;
};

// Method to remove item from order
OrderSchema.methods.removeItem = function (itemId) {
  this.items = this.items.filter(item => !item._id.equals(itemId));
  this.calculateTotals();
  
  return this;
};

// Method to update order status
OrderSchema.methods.updateStatus = function (status) {
  this.status = status;
  
  // Update related fields based on status
  if (status === 'delivered') {
    this.actualDeliveryDate = new Date();
  } else if (status === 'confirmed') {
    // Set payment due date based on payment terms
    const dueDate = new Date();
    if (this.paymentTerms === 'net30') {
      dueDate.setDate(dueDate.getDate() + 30);
    } else if (this.paymentTerms === 'net15') {
      dueDate.setDate(dueDate.getDate() + 15);
    } else if (this.paymentTerms === 'net60') {
      dueDate.setDate(dueDate.getDate() + 60);
    }
    this.paymentDueDate = dueDate;
  }
  
  return this;
};

// Method to file a complaint
OrderSchema.methods.fileComplaint = function (complaint) {
  this.complaints.push(complaint);
  return this;
};

// Method to calculate CO2 footprint
OrderSchema.methods.calculateCO2Footprint = async function () {
  // Populate products to get CO2 data
  await this.populate({
    path: 'items.productId',
    select: 'sustainability.co2FootprintPerKg unit',
  });
  
  let totalCO2 = 0;
  
  this.items.forEach(item => {
    if (item.productId && item.productId.sustainability && item.productId.sustainability.co2FootprintPerKg) {
      // Convert quantity to kg based on unit
      let quantityInKg = item.quantity;
      if (item.unit === 'g') {
        quantityInKg = item.quantity / 1000;
      }
      
      totalCO2 += item.productId.sustainability.co2FootprintPerKg * quantityInKg;
    }
  });
  
  this.metadata.co2Footprint = totalCO2;
  return totalCO2;
};

// Method to calculate organic percentage
OrderSchema.methods.calculateOrganicPercentage = async function () {
  // Populate products to get organic data
  await this.populate({
    path: 'items.productId',
    select: 'dietaryInfo.isOrganic',
  });
  
  let totalAmount = 0;
  let organicAmount = 0;
  
  this.items.forEach(item => {
    totalAmount += item.totalPrice.amount;
    
    if (item.productId && item.productId.dietaryInfo && item.productId.dietaryInfo.isOrganic) {
      organicAmount += item.totalPrice.amount;
    }
  });
  
  const organicPercentage = totalAmount > 0 ? (organicAmount / totalAmount) * 100 : 0;
  this.metadata.organicPercentage = organicPercentage;
  
  return organicPercentage;
};

module.exports = mongoose.model('Order', OrderSchema);
