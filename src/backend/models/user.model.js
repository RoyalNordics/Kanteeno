const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * User Schema
 * Defines the structure for user documents in MongoDB
 */
const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['admin', 'manager', 'chef', 'user', 'supplier'],
      default: 'user',
    },
    businessUnitId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BusinessUnit',
      required: function() {
        return this.role === 'chef' || this.role === 'manager';
      },
    },
    supplierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Supplier',
      required: function() {
        return this.role === 'supplier';
      },
    },
    preferences: {
      dietaryRestrictions: [String],
      allergies: [String],
      favoriteCategories: [String],
      mealSize: {
        type: String,
        enum: ['small', 'medium', 'large'],
        default: 'medium',
      },
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    lastLogin: Date,
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Virtual for user's full profile
UserSchema.virtual('profile').get(function () {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    role: this.role,
    preferences: this.preferences,
    createdAt: this.createdAt,
  };
});

// Method to check if user is admin
UserSchema.methods.isAdmin = function () {
  return this.role === 'admin';
};

// Method to check if user is chef
UserSchema.methods.isChef = function () {
  return this.role === 'chef';
};

// Method to check if user is supplier
UserSchema.methods.isSupplier = function () {
  return this.role === 'supplier';
};

module.exports = mongoose.model('User', UserSchema);
