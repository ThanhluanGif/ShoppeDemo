const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const addressSchema = new mongoose.Schema({
  street: { type: String, required: true },
  city: { type: String, required: true },
  phone: { type: String, required: true },
  isDefault: { type: Boolean, default: false }
});

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters long']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
  },
  password: {
    type: String,
    required: function() {
      // Password is only required if no social ID is present
      return !this.googleId && !this.facebookId;
    },
    minlength: [8, 'Password must be at least 8 characters long'],
    select: false
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true // Allows multiple null values for unique index
  },
  facebookId: {
    type: String,
    unique: true,
    sparse: true
  },
  authMethod: {
    type: String,
    enum: ['local', 'google', 'facebook'],
    default: 'local'
  },
  phone: {
    type: String,
    trim: true
  },
  avatar: {
    type: String,
    default: 'https://cdn-icons-png.flaticon.com/512/149/149071.png'
  },
  role: {
    type: String,
    enum: {
      values: ['admin', 'vendor', 'customer'],
      message: '{VALUE} is not a valid role'
    },
    default: 'customer'
  },
  vendorStatus: {
    type: String,
    enum: ['none', 'pending', 'approved', 'rejected'],
    default: 'none'
  },
  commissionRate: {
    type: Number,
    default: 5 // 5% commission for admin by default
  },
  shopName: {
    type: String,
    trim: true
  },
  shopDescription: {
    type: String,
    trim: true
  },
  shopLogo: {
    type: String,
    default: 'https://ui-avatars.com/api/?name=Shop&background=ee4d2d&color=fff'
  },
  shopBanner: {
    type: String,
    default: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?q=80&w=2071'
  },
  balance: {
    type: Number,
    default: 0
  },
  isVerified: {
  type: Boolean,
  default: false
  },
  verificationToken: String,
  verificationExpire: Date,
  wishlist: [{
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Product'
  }],  addresses: [addressSchema],
  resetPasswordToken: String,
  resetPasswordExpire: Date
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare password for login
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
