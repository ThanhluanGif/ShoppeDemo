const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  name: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true
  }
}, { timestamps: true });

const variationSchema = new mongoose.Schema({
  size: { type: String },
  color: { type: String },
  extraPrice: { type: Number, default: 0 },
  countInStock: { type: Number, default: 0 }
});

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  brand: {
    type: String,
    required: [true, 'Brand is required'],
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    default: 0
  },
  description: {
    type: String,
    required: [true, 'Product description is required']
  },
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Product category is required']
  },
  image: {
    type: String,
    required: [true, 'Product image is required']
  },
  cloudinary_id: {
    type: String,
  },
  images: [String], // Additional images
  countInStock: {
    type: Number,
    required: [true, 'Stock count is required'],
    default: 0
  },
  variations: [variationSchema],
  reviews: [reviewSchema],
  rating: {
    type: Number,
    required: true,
    default: 0
  },
  numReviews: {
    type: Number,
    required: true,
    default: 0
  },
  isFlashSale: {
    type: Boolean,
    default: false
  },
  flashSalePrice: {
    type: Number,
    default: 0
  },
  flashSaleStartTime: Date,
  flashSaleEndTime: Date
}, {
  timestamps: true
});

// Indexes for optimization
productSchema.index({ name: 'text', description: 'text' }); // Text search
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });
productSchema.index({ createdAt: -1 });

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
